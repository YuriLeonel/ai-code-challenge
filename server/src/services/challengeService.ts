import { Ollama } from 'ollama';
import { validateChallenge } from './validationService.js';
import type { 
  GenerateChallengeRequest, 
  CodeChallengeItem 
} from '../../../shared/types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Ollama client
const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
});

const MODEL = process.env.OLLAMA_MODEL || 'deepseek-coder:6.7b';

// Load the system prompt from example_generator_agent.md
let SYSTEM_PROMPT: string;
try {
  const promptPath = join(__dirname, '../../../example_generator_agent.md');
  SYSTEM_PROMPT = readFileSync(promptPath, 'utf-8');
} catch (error) {
  console.warn('Could not load example_generator_agent.md, using default prompt');
  SYSTEM_PROMPT = `You are CodeChallenge Example Generator, an AI agent specialized in creating high-quality programming challenges.
Generate valid JSON objects that follow the provided schema exactly.`;
}

/**
 * Generate a programming challenge using Ollama with two-phase approach
 */
export async function generateChallenge(
  request: GenerateChallengeRequest
): Promise<CodeChallengeItem> {
  const { prompt, language, level, tags } = request;

  // Build the user prompt
  const userPrompt = buildUserPrompt(prompt, language, level, tags);

  console.log('Calling Ollama with model:', MODEL);

  try {
    // Phase 1: Generate with more freedom (no strict format enforcement)
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT + '\n\nGenerate a programming challenge. You can include explanatory text or context, but ensure a valid JSON object is present in your response that matches the schema.'
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      options: {
        temperature: 0.7, // Higher temperature for better creativity
        top_p: 0.9,
        num_predict: 3072, // More tokens for complete response
      },
      format: 'json'
    });
    const rawContent = response.message.content;
    console.log('=== OLLAMA RAW RESPONSE ===');
    console.log('Raw response length:', rawContent.length);
    console.log('Raw response preview (first 1000 chars):', rawContent.substring(0, 1000));
    console.log('Raw response preview (last 500 chars):', rawContent.substring(Math.max(0, rawContent.length - 500)));
    console.log('===========================');

    // Check if response is empty or too short
    if (!rawContent || rawContent.trim().length < 50) {
      throw new Error(`Ollama returned an empty or too short response (length: ${rawContent?.length || 0}). The model may not be responding properly.`);
    }

    // Phase 2: Extract and sanitize the challenge
    const partialChallenge = extractAndSanitizeChallenge(rawContent);
    
    console.log('=== EXTRACTED CHALLENGE ===');
    console.log('Fields present:', Object.keys(partialChallenge));
    console.log('Has title:', !!partialChallenge.title);
    console.log('Has statement:', !!partialChallenge.statement);
    console.log('Has examples:', partialChallenge.examples?.length || 0);
    console.log('Has test_cases:', partialChallenge.test_cases?.length || 0);
    console.log('===========================');
    
    // Check if the extracted challenge is essentially empty
    const hasMinimalContent = 
      partialChallenge.title || 
      partialChallenge.statement || 
      (partialChallenge.examples && partialChallenge.examples.length > 0) ||
      (partialChallenge.test_cases && partialChallenge.test_cases.length > 0);
    
    if (!hasMinimalContent) {
      console.error('WARNING: Extracted challenge appears to be empty or invalid');
      console.error('Extracted object:', JSON.stringify(partialChallenge, null, 2));
    }
    
    // Apply defaults for missing fields
    let challenge: CodeChallengeItem = applyDefaults(partialChallenge, { language, level, tags });

    // Validate with lenient mode
    const validation = validateChallenge(challenge, 'lenient');
    
    if (validation.warnings && validation.warnings.length > 0) {
      console.warn('Validation warnings:', validation.warnings);
    }
    
    if (!validation.valid) {
      console.warn('Validation errors found, attempting auto-fix:', validation.errors);
      // Try auto-fix instead of throwing immediately
      challenge = autoFixCommonIssues(challenge, validation.errors);
      
      // Re-validate after fixes
      const revalidation = validateChallenge(challenge, 'lenient');
      if (!revalidation.valid) {
        console.error('Critical validation errors after auto-fix:', revalidation.errors);
        throw new Error(`Generated challenge is invalid: ${revalidation.errors?.join(', ')}`);
      }
    }

    console.log('Successfully generated challenge:', challenge.id);
    return challenge;

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        throw new Error(
          'Could not connect to Ollama. Make sure Ollama is running (try: ollama serve)'
        );
      }
      throw error;
    }
    throw new Error('Unknown error generating challenge');
  }
}

/**
 * Build the user prompt with context
 */
function buildUserPrompt(
  prompt: string,
  language: string,
  level: string,
  tags?: string[]
): string {
  let userPrompt = `Generate one ${level} ${language} challenge`;
  
  if (tags && tags.length > 0) {
    userPrompt += ` about ${tags.join(', ')}`;
  }
  
  userPrompt += '.\n\n';
  userPrompt += `User request: ${prompt}\n\n`;
  userPrompt += `REQUIREMENTS:
1. Return a valid JSON object following the schema
2. Include ALL required fields:
   - id, title, language, level, tags, statement
   - input_format, output_format
   - examples: Array with at least 3 items (input, output, explanation optional)
   - test_cases: Array with at least 3 items (input, expected_output)
   - reference_solution: Object with "code" and "complexity" fields
   - feedback: Object with "summary" and "tips" array
   - common_errors: Array (can be empty)
3. Use double quotes for all JSON strings
4. The "complexity" field should indicate time complexity (e.g., "O(n)", "O(n^2)")

You may include explanatory text before or after the JSON, but ensure a valid JSON object is present.

Generate the challenge now:`;
  
  return userPrompt;
}

/**
 * Extract JSON from various formats and sanitize
 */
function extractAndSanitizeChallenge(rawContent: string): Partial<CodeChallengeItem> {
  let challenge: any;
  
  try {
    // Try direct parsing first
    challenge = JSON.parse(rawContent);
    console.log('✓ Parsed JSON directly');
    return challenge;
  } catch (directParseError) {
    console.log('Direct JSON parse failed, trying extraction methods...');
  }
  
  // Try markdown code blocks (```json ... ``` or ``` ... ```)
  const jsonBlockMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    try {
      challenge = JSON.parse(jsonBlockMatch[1]);
      console.log('✓ Extracted JSON from markdown code block');
      return challenge;
    } catch (e) {
      console.log('Failed to parse JSON from code block');
    }
  }
  
  // Try to find the largest JSON object in the text
  const allObjectMatches = [...rawContent.matchAll(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gs)];
  if (allObjectMatches.length > 0) {
    // Sort by length (longest first) as it's likely to be the complete object
    const sortedMatches = allObjectMatches
      .map(m => m[0])
      .sort((a, b) => b.length - a.length);
    
    for (const match of sortedMatches) {
      try {
        challenge = JSON.parse(match);
        console.log('✓ Extracted JSON object from text (length:', match.length, ')');
        return challenge;
      } catch (e) {
        // Continue trying other matches
      }
    }
  }
  
  // If all else fails, try to find JSON with nested objects using a more complex regex
  const nestedObjectMatch = rawContent.match(/\{[\s\S]*?\}/);
  if (nestedObjectMatch) {
    try {
      // Find the matching closing brace for the first opening brace
      let depth = 0;
      let startIndex = rawContent.indexOf('{');
      let endIndex = startIndex;
      
      for (let i = startIndex; i < rawContent.length; i++) {
        if (rawContent[i] === '{') depth++;
        if (rawContent[i] === '}') depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
      
      const jsonString = rawContent.substring(startIndex, endIndex + 1);
      challenge = JSON.parse(jsonString);
      console.log('✓ Extracted nested JSON object');
      return challenge;
    } catch (e) {
      console.error('Failed to parse nested JSON:', (e as Error).message);
    }
  }
  
  // Log detailed error information
  console.error('=== FAILED TO PARSE JSON ===');
  console.error('Response length:', rawContent.length);
  console.error('First 1000 chars:', rawContent.substring(0, 1000));
  console.error('Last 500 chars:', rawContent.substring(Math.max(0, rawContent.length - 500)));
  console.error('===========================');
  
  throw new Error('Failed to parse JSON response from Ollama. Check server logs for details.');
}

/**
 * Apply defaults for missing required fields
 */
function applyDefaults(
  challenge: Partial<CodeChallengeItem>,
  request: { language: string; level: string; tags?: string[] }
): CodeChallengeItem {
  return {
    id: challenge.id || generateId(challenge.title || 'challenge'),
    title: challenge.title || 'Untitled Challenge',
    language: (challenge.language as any) || request.language,
    level: (challenge.level as any) || request.level,
    tags: challenge.tags || request.tags || [],
    statement: challenge.statement || 'No description provided.',
    input_format: challenge.input_format || 'Not specified',
    output_format: challenge.output_format || 'Not specified',
    examples: challenge.examples || [],
    test_cases: challenge.test_cases || [],
    reference_solution: challenge.reference_solution || {
      code: '// No solution provided',
      complexity: 'O(1)'
    },
    feedback: challenge.feedback || {
      summary: 'Complete the challenge by following the requirements.',
      tips: []
    },
    common_errors: challenge.common_errors || [],
    metadata: challenge.metadata || {
      author: 'AI Code Challenge Generator',
      created_at: new Date().toISOString()
    }
  } as CodeChallengeItem;
}

/**
 * Auto-fix common validation issues
 */
function autoFixCommonIssues(
  challenge: any,
  errors?: string[]
): CodeChallengeItem {
  // Fix missing complexity in reference_solution
  if (challenge.reference_solution && !challenge.reference_solution.complexity) {
    console.log('Auto-fixing: Adding missing complexity field');
    challenge.reference_solution.complexity = 'O(n)';
  }
  
  // Ensure reference_solution exists and has required fields
  if (!challenge.reference_solution) {
    console.log('Auto-fixing: Creating missing reference_solution');
    challenge.reference_solution = {
      code: '// Implementation required',
      complexity: 'O(n)'
    };
  }
  
  // Ensure arrays exist
  if (!Array.isArray(challenge.examples)) {
    console.log('Auto-fixing: Creating empty examples array');
    challenge.examples = [];
  }
  if (!Array.isArray(challenge.test_cases)) {
    console.log('Auto-fixing: Creating empty test_cases array');
    challenge.test_cases = [];
  }
  if (!Array.isArray(challenge.tags)) {
    console.log('Auto-fixing: Creating empty tags array');
    challenge.tags = [];
  }
  if (!Array.isArray(challenge.common_errors)) {
    console.log('Auto-fixing: Creating empty common_errors array');
    challenge.common_errors = [];
  }
  
  // Fix feedback structure
  if (!challenge.feedback) {
    console.log('Auto-fixing: Creating missing feedback object');
    challenge.feedback = {
      summary: 'Complete this challenge to improve your skills.',
      tips: []
    };
  } else {
    if (!challenge.feedback.summary) {
      challenge.feedback.summary = 'Complete this challenge to improve your skills.';
    }
    if (!Array.isArray(challenge.feedback.tips)) {
      challenge.feedback.tips = [];
    }
  }
  
  // Fix string fields
  if (!challenge.statement || typeof challenge.statement !== 'string') {
    console.log('Auto-fixing: Setting default statement');
    challenge.statement = 'Problem description not provided.';
  }
  if (!challenge.input_format || typeof challenge.input_format !== 'string') {
    challenge.input_format = 'Not specified';
  }
  if (!challenge.output_format || typeof challenge.output_format !== 'string') {
    challenge.output_format = 'Not specified';
  }
  
  return challenge;
}

/**
 * Generate a slug-style ID from a title
 */
function generateId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}

/**
 * Check if Ollama is available and the model is installed
 */
export async function checkOllamaHealth(): Promise<{
  available: boolean;
  model: string;
  modelInstalled: boolean;
  error?: string;
}> {
  try {
    const models = await ollama.list();
    const modelInstalled = models.models.some(m => m.name === MODEL);
    
    return {
      available: true,
      model: MODEL,
      modelInstalled
    };
  } catch (error) {
    return {
      available: false,
      model: MODEL,
      modelInstalled: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}


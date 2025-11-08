import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { CodeChallengeItem } from '../../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize AJV for JSON schema validation
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Load the base schema
let validate: ValidateFunction;
try {
  const schemaPath = join(__dirname, '../../../base-schema.json');
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  validate = ajv.compile(schema);
} catch (error) {
  console.error('Failed to load base-schema.json:', error);
  throw new Error('Could not initialize validation service');
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  severity: 'strict' | 'lenient';
}

/**
 * Validate a challenge against the JSON schema
 */
export function validateChallenge(
  challenge: any,
  mode: 'strict' | 'lenient' = 'lenient'
): ValidationResult {
  const valid = validate(challenge);
  
  if (!valid && validate.errors) {
    const criticalErrors: string[] = [];
    const warnings: string[] = [];
    
    validate.errors.forEach(err => {
      const message = `${err.instancePath} ${err.message}`;
      
      // Classify errors
      if (isCriticalError(err)) {
        criticalErrors.push(message);
      } else {
        warnings.push(message);
      }
    });
    
    if (mode === 'strict' && criticalErrors.length > 0) {
      return { valid: false, errors: criticalErrors, warnings, severity: mode };
    }
    
    if (mode === 'lenient' && criticalErrors.length === 0) {
      return { valid: true, warnings, severity: mode };
    }
    
    return { valid: false, errors: criticalErrors, warnings, severity: mode };
  }
  
  return { valid: true, severity: mode };
}

/**
 * Check if an error is critical (required fields)
 */
function isCriticalError(error: any): boolean {
  // Define which fields are absolutely critical
  const criticalFields = ['id', 'title', 'language', 'level', 'statement'];
  const instancePath = error.instancePath || '';
  
  // Check if error is about missing required fields
  if (error.keyword === 'required') {
    const missingField = error.params?.missingProperty;
    return criticalFields.includes(missingField);
  }
  
  // Check if error is about a critical field
  return criticalFields.some(field => instancePath.includes(`/${field}`));
}

/**
 * Sanitize and fix common issues in generated challenges
 */
export function sanitizeChallenge(challenge: Partial<CodeChallengeItem>): CodeChallengeItem {
  // Ensure required fields exist
  if (!challenge.id) {
    challenge.id = generateId(challenge.title || 'challenge');
  }
  
  if (!challenge.metadata) {
    challenge.metadata = {
      author: 'AI Code Challenge Generator',
      created_at: new Date().toISOString()
    };
  }
  
  // Ensure tags is an array
  if (!Array.isArray(challenge.tags)) {
    challenge.tags = [];
  }
  
  return challenge as CodeChallengeItem;
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


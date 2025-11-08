import { useState } from 'react';
import type { CodeChallengeItem } from 'shared/types';
import { 
  Download, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  FileJson,
  FileText 
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChallengeDisplayProps {
  challenge: CodeChallengeItem;
}

export default function ChallengeDisplay({ challenge }: ChallengeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(challenge, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(challenge, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${challenge.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const markdown = generateMarkdown(challenge);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${challenge.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLanguageForHighlighter = (lang: string): string => {
    const map: Record<string, string> = {
      'JavaScript': 'javascript',
      'TypeScript': 'typescript',
      'Python': 'python',
      'Java': 'java',
      'C#': 'csharp',
      'Go': 'go',
    };
    return map[lang] || 'javascript';
  };

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {challenge.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                {challenge.language}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                {challenge.level}
              </span>
              {challenge.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Copy JSON"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={handleDownloadJSON}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Download JSON"
            >
              <FileJson className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Download Markdown"
            >
              <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Problem Statement
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
          {challenge.statement}
        </p>
      </div>

      {/* Input/Output Format */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Input Format
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {challenge.input_format}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Output Format
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {challenge.output_format}
          </p>
        </div>
      </div>

      {/* Examples */}
      {challenge.examples && challenge.examples.length > 0 && (
        <div className="px-4 pb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Examples
          </h4>
          {challenge.examples.map((example, idx) => (
            <div
              key={idx}
              className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Input:
                  </span>
                  <code className="block mt-1 text-gray-600 dark:text-gray-400">
                    {example.input}
                  </code>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Output:
                  </span>
                  <code className="block mt-1 text-gray-600 dark:text-gray-400">
                    {example.output}
                  </code>
                </div>
              </div>
              {example.explanation && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {example.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reference Solution */}
      <div className="px-4 pb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Reference Solution
        </h4>
        <SyntaxHighlighter
          language={getLanguageForHighlighter(challenge.language)}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
          }}
        >
          {challenge.reference_solution.code}
        </SyntaxHighlighter>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">Complexity:</span>{' '}
          {challenge.reference_solution.complexity}
        </p>
      </div>

      {/* Toggle Details */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show More Details
            </>
          )}
        </button>
      </div>

      {/* Additional Details */}
      {showDetails && (
        <>
          {/* Test Cases */}
          <div className="px-4 pb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Test Cases
            </h4>
            {challenge.test_cases.map((testCase, idx) => (
              <div
                key={idx}
                className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Input:
                    </span>
                    <code className="block text-gray-600 dark:text-gray-400">
                      {testCase.input}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Expected:
                    </span>
                    <code className="block text-gray-600 dark:text-gray-400">
                      {testCase.expected_output}
                    </code>
                  </div>
                </div>
                {testCase.weight && (
                  <span className="text-gray-500 dark:text-gray-400">
                    Weight: {testCase.weight}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Common Errors */}
          {challenge.common_errors && challenge.common_errors.length > 0 && (
            <div className="px-4 pb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Common Errors
              </h4>
              {challenge.common_errors.map((error, idx) => (
                <div
                  key={idx}
                  className="mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    {error.pattern}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    {error.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Feedback */}
          <div className="px-4 pb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Learning Tips
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {challenge.feedback.summary}
            </p>
            <ul className="list-disc list-inside space-y-1">
              {challenge.feedback.tips.map((tip, idx) => (
                <li
                  key={idx}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to generate Markdown
function generateMarkdown(challenge: CodeChallengeItem): string {
  let md = `# ${challenge.title}\n\n`;
  md += `**Language:** ${challenge.language} | **Level:** ${challenge.level}\n\n`;
  md += `**Tags:** ${challenge.tags.join(', ')}\n\n`;
  md += `## Problem Statement\n\n${challenge.statement}\n\n`;
  md += `## Input Format\n\n${challenge.input_format}\n\n`;
  md += `## Output Format\n\n${challenge.output_format}\n\n`;

  if (challenge.examples && challenge.examples.length > 0) {
    md += `## Examples\n\n`;
    challenge.examples.forEach((ex, idx) => {
      md += `### Example ${idx + 1}\n\n`;
      md += `**Input:** \`${ex.input}\`\n\n`;
      md += `**Output:** \`${ex.output}\`\n\n`;
      if (ex.explanation) {
        md += `**Explanation:** ${ex.explanation}\n\n`;
      }
    });
  }

  md += `## Reference Solution\n\n`;
  md += `\`\`\`${challenge.language.toLowerCase()}\n${challenge.reference_solution.code}\n\`\`\`\n\n`;
  md += `**Complexity:** ${challenge.reference_solution.complexity}\n\n`;

  if (challenge.reference_solution.explanation) {
    md += `**Explanation:** ${challenge.reference_solution.explanation}\n\n`;
  }

  md += `## Learning Tips\n\n${challenge.feedback.summary}\n\n`;
  challenge.feedback.tips.forEach((tip) => {
    md += `- ${tip}\n`;
  });

  return md;
}


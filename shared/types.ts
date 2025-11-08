// Generated TypeScript types from base-schema.json

export interface CodeChallengeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expected_output: string;
  weight?: number;
}

export interface ReferenceSolution {
  code: string;
  complexity: string;
  explanation?: string;
}

export interface CommonError {
  pattern: string;
  explanation: string;
}

export interface Feedback {
  summary: string;
  tips: string[];
}

export interface Metadata {
  source_url?: string;
  license?: string;
  author?: string;
  created_at?: string;
  last_reviewed?: string;
}

export type ProgrammingLanguage = 
  | "JavaScript" 
  | "Python" 
  | "TypeScript" 
  | "C#" 
  | "Java" 
  | "Go";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface CodeChallengeItem {
  id: string;
  title: string;
  language: ProgrammingLanguage;
  level: DifficultyLevel;
  tags: string[];
  statement: string;
  input_format: string;
  output_format: string;
  examples?: CodeChallengeExample[];
  test_cases: TestCase[];
  reference_solution: ReferenceSolution;
  common_errors?: CommonError[];
  feedback: Feedback;
  metadata?: Metadata;
}

// API Request/Response types
export interface GenerateChallengeRequest {
  prompt: string;
  language: ProgrammingLanguage;
  level: DifficultyLevel;
  tags?: string[];
}

export interface GenerateChallengeResponse {
  success: boolean;
  challenge?: CodeChallengeItem;
  error?: string;
}

// Chat message types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  challenge?: CodeChallengeItem;
}

// Export formats
export type ExportFormat = "json" | "markdown";


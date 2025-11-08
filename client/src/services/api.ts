import axios from 'axios';
import type { 
  GenerateChallengeRequest, 
  GenerateChallengeResponse 
} from 'shared/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes timeout for AI generation
});

/**
 * Generate a new programming challenge
 */
export async function generateChallenge(
  request: GenerateChallengeRequest
): Promise<GenerateChallengeResponse> {
  try {
    const response = await api.post<GenerateChallengeResponse>(
      '/api/generate-challenge',
      request
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get available Ollama models
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await api.get<{ success: boolean; models: string[] }>(
      '/api/models'
    );
    return response.data.success ? response.data.models : [];
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return [];
  }
}

/**
 * Health check
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await api.get('/health');
    return response.data.status === 'ok';
  } catch (error) {
    return false;
  }
}


import { Router, Request, Response } from 'express';
import { generateChallenge } from '../services/challengeService.js';
import type { GenerateChallengeRequest } from '../../../shared/types.js';

const router = Router();

router.post('/generate-challenge', async (req: Request, res: Response) => {
  try {
    const requestData: GenerateChallengeRequest = req.body;
    
    // Validate request
    if (!requestData.prompt || !requestData.language || !requestData.level) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: prompt, language, and level are required'
      });
    }

    console.log('Generating challenge:', {
      language: requestData.language,
      level: requestData.level,
      prompt: requestData.prompt.substring(0, 50) + '...'
    });

    const challenge = await generateChallenge(requestData);

    res.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error('Error generating challenge:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate challenge'
    });
  }
});

// Get available models (useful for debugging)
router.get('/models', async (_req: Request, res: Response) => {
  try {
    const { Ollama } = await import('ollama');
    const ollama = new Ollama({
      host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    });
    
    const models = await ollama.list();
    res.json({
      success: true,
      models: models.models.map(m => m.name)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch models. Make sure Ollama is running.'
    });
  }
});

export default router;


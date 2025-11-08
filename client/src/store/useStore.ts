import { create } from 'zustand';
import type { 
  ChatMessage, 
  CodeChallengeItem, 
  ProgrammingLanguage, 
  DifficultyLevel 
} from 'shared/types';

interface AppState {
  // Configuration
  language: ProgrammingLanguage;
  level: DifficultyLevel;
  tags: string[];
  
  // Chat
  messages: ChatMessage[];
  isGenerating: boolean;
  
  // Challenges
  challenges: CodeChallengeItem[];
  currentChallenge: CodeChallengeItem | null;
  
  // Actions
  setLanguage: (language: ProgrammingLanguage) => void;
  setLevel: (level: DifficultyLevel) => void;
  setTags: (tags: string[]) => void;
  addMessage: (message: ChatMessage) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  addChallenge: (challenge: CodeChallengeItem) => void;
  setCurrentChallenge: (challenge: CodeChallengeItem | null) => void;
  clearMessages: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  language: 'JavaScript',
  level: 'intermediate',
  tags: [],
  messages: [],
  isGenerating: false,
  challenges: [],
  currentChallenge: null,
  
  // Actions
  setLanguage: (language) => set({ language }),
  setLevel: (level) => set({ level }),
  setTags: (tags) => set({ tags }),
  addMessage: (message) => 
    set((state) => ({ messages: [...state.messages, message] })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  addChallenge: (challenge) =>
    set((state) => ({ 
      challenges: [...state.challenges, challenge],
      currentChallenge: challenge 
    })),
  setCurrentChallenge: (challenge) => set({ currentChallenge: challenge }),
  clearMessages: () => set({ messages: [], currentChallenge: null }),
}));


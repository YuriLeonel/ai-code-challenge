import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { generateChallenge } from '../services/api';
import ChallengeDisplay from './ChallengeDisplay';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import type { ChatMessage } from 'shared/types';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isGenerating,
    language,
    level,
    tags,
    addMessage,
    setIsGenerating,
    addChallenge,
  } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setError(null);
    setIsGenerating(true);

    try {
      const response = await generateChallenge({
        prompt: input,
        language,
        level,
        tags: tags.length > 0 ? tags : undefined,
      });

      if (response.success && response.challenge) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I have generated a challenge for you:',
          timestamp: new Date(),
          challenge: response.challenge,
        };

        addMessage(assistantMessage);
        addChallenge(response.challenge);
      } else {
        setError(response.error || 'Failed to generate challenge');
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${response.error || 'Failed to generate challenge'}`,
          timestamp: new Date(),
        };
        addMessage(errorMessage);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMsg}`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mb-4 text-4xl">💡</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Generate Your First Challenge
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Describe the type of programming challenge you want to create.
                Configure the language and difficulty on the left panel.
              </p>
              <div className="text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Example prompts:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Create a challenge about array manipulation</li>
                  <li>• Generate a recursion problem</li>
                  <li>• Make a string parsing challenge</li>
                  <li>• Design an algorithm optimization task</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  } rounded-lg px-4 py-3`}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <>
                      {message.content.startsWith('Error:') ? (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {message.content}
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm mb-3">{message.content}</p>
                          {message.challenge && (
                            <ChallengeDisplay challenge={message.challenge} />
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Generating challenge...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && !isGenerating && (
        <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                Make sure Ollama is running and the model is downloaded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the challenge you want to generate..."
            disabled={isGenerating}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {isGenerating ? 'Generating...' : 'Generate'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}


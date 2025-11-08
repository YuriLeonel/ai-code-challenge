import { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import ConfigPanel from './components/ConfigPanel';
import { useStore } from './store/useStore';
import { Sparkles } from 'lucide-react';

function App() {
  const [showConfig, setShowConfig] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 h-screen flex flex-col">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Code Challenge Generator
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate programming challenges with local AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {showConfig ? 'Hide' : 'Show'} Config
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Config Panel */}
          {showConfig && (
            <div className="w-80 flex-shrink-0">
              <ConfigPanel />
            </div>
          )}

          {/* Chat Interface */}
          <div className="flex-1 min-w-0">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


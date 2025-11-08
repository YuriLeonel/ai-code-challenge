import { useStore } from '../store/useStore';
import type { ProgrammingLanguage, DifficultyLevel } from 'shared/types';
import { Settings, Code, Layers } from 'lucide-react';

const LANGUAGES: ProgrammingLanguage[] = [
  'JavaScript',
  'Python',
  'TypeScript',
  'C#',
  'Java',
  'Go',
];

const LEVELS: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];

const COMMON_TAGS = [
  'arrays',
  'strings',
  'recursion',
  'sorting',
  'data-structures',
  'algorithms',
  'loops',
  'conditionals',
  'functions',
  'objects',
  'async',
  'promises',
];

export default function ConfigPanel() {
  const { language, level, tags, setLanguage, setLevel, setTags } = useStore();

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Configuration
        </h2>
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Code className="w-4 h-4" />
          Programming Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as ProgrammingLanguage)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty Level */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Layers className="w-4 h-4" />
          Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                level === lvl
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Topics (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                tags.includes(tag)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {tags.length > 0 && (
          <button
            onClick={() => setTags([])}
            className="mt-3 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear all tags
          </button>
        )}
      </div>

      {/* Current Selection Summary */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Current Settings
        </h3>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <p>
            <span className="font-medium">Language:</span> {language}
          </p>
          <p>
            <span className="font-medium">Level:</span>{' '}
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </p>
          {tags.length > 0 && (
            <p>
              <span className="font-medium">Tags:</span> {tags.join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


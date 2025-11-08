# AI Code Challenge Generator

An AI-powered programming challenge generator using React, Vite, TypeScript, and Ollama for local LLM processing.

## Features

- Generate coding challenges using local AI models (Ollama)
- Support for multiple programming languages (JavaScript, Python, TypeScript)
- Difficulty levels: Beginner, Intermediate, Advanced
- Export challenges as JSON or Markdown
- Modern chat-based interface
- No external API costs - runs completely locally

## Prerequisites

- Node.js 20+ and npm
- [Ollama](https://ollama.ai/) installed locally
- Recommended models: `deepseek-coder:6.7b` or `codellama:13b`

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Setup environment variables:

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

4. Pull Ollama model:

```bash
ollama pull deepseek-coder:6.7b
# or
ollama pull codellama:13b
```

## Development

Run both client and server in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Building for Production

```bash
npm run build
```

## Project Structure

```
ai-code-challenge/
├── client/              # React frontend (Vite + TypeScript)
├── server/              # Express backend (TypeScript + Ollama)
├── shared/              # Shared TypeScript types
├── base-schema.json     # Challenge schema definition
└── example_generator_agent.md  # AI agent instructions
```

## Technology Stack

### Frontend

- React 18
- Vite
- TypeScript
- TailwindCSS
- Zustand (state management)
- Axios (HTTP client)

### Backend

- Node.js
- Express
- TypeScript
- Ollama (Local LLM)
- Ajv (JSON validation)

## Usage

1. Select programming language (JavaScript, Python, TypeScript)
2. Choose difficulty level (Beginner, Intermediate, Advanced)
3. Enter a prompt describing the challenge you want (e.g., "Create a challenge about recursion")
4. Click Generate to create the challenge
5. Export as JSON or Markdown

## Future Enhancements

- Challenge history
- Code editor integration
- Solution validation
- Frontend challenges (HTML/CSS/React)
- Additional LLM provider support
- Database persistence

## License

MIT

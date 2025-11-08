# Setup Guide for AI Code Challenge Generator

This guide will help you set up and run the AI Code Challenge Generator locally.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (version 20 or higher)
   ```bash
   node --version
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **Ollama** - For running local AI models
   - Download from: https://ollama.ai/
   - Or install via command line:
     ```bash
     # macOS/Linux
     curl -fsSL https://ollama.ai/install.sh | sh
     
     # Or check their website for Windows installation
     ```

## Step-by-Step Setup

### 1. Install Dependencies

From the root directory, install all dependencies:

```bash
npm install
```

This will install dependencies for the root, client, and server workspaces.

### 2. Setup Ollama

First, start the Ollama service:

```bash
ollama serve
```

Keep this terminal open. In a new terminal, pull a recommended model:

```bash
# Option 1: DeepSeek Coder (Recommended for coding tasks)
ollama pull deepseek-coder:6.7b

# Option 2: CodeLlama (Alternative)
ollama pull codellama:13b

# Option 3: Smaller/faster model for testing
ollama pull codellama:7b
```

**Note:** The first pull will download several GB of data. Be patient!

### 3. Configure Environment Variables

#### Backend Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` if needed (defaults should work):

```env
PORT=3001
NODE_ENV=development
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-coder:6.7b
CORS_ORIGIN=http://localhost:5173
```

#### Frontend Configuration

Create a `.env` file in the `client` directory:

```bash
cd ../client
cp .env.example .env
```

Edit `client/.env` if needed (defaults should work):

```env
VITE_API_BASE_URL=http://localhost:3001
```

### 4. Run the Application

From the root directory, you can run both client and server together:

```bash
# From root directory
npm run dev
```

Or run them separately in different terminals:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

### 5. Access the Application

Once both servers are running:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## Troubleshooting

### Ollama Connection Issues

If you see "Could not connect to Ollama" errors:

1. **Check if Ollama is running:**
   ```bash
   curl http://localhost:11434/api/version
   ```

2. **Start Ollama if not running:**
   ```bash
   ollama serve
   ```

3. **Verify model is installed:**
   ```bash
   ollama list
   ```

4. **Pull the model if missing:**
   ```bash
   ollama pull deepseek-coder:6.7b
   ```

### Port Already in Use

If port 3001 or 5173 is already in use:

1. **Change backend port** in `server/.env`:
   ```env
   PORT=3002
   ```

2. **Change frontend proxy** in `client/vite.config.ts`:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:3002',
       // ...
     }
   }
   ```

3. **Update frontend env** in `client/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:3002
   ```

### TypeScript Errors

If you see TypeScript errors about shared types:

```bash
# From root directory
npm install
```

Make sure the `shared` workspace is properly set up in the root `package.json`.

### Module Resolution Issues

If imports from `shared` don't work:

1. Restart your IDE/editor
2. Clear TypeScript cache
3. Rebuild:
   ```bash
   npm run build
   ```

## Testing the Application

### 1. Basic Health Check

Visit http://localhost:3001/health to ensure the backend is running.

### 2. Check Available Models

Visit http://localhost:3001/api/models to see installed Ollama models.

### 3. Generate Your First Challenge

1. Open http://localhost:5173
2. Configure language and difficulty in the left panel
3. Enter a prompt like: "Create a challenge about array manipulation"
4. Click "Generate"
5. Wait 10-30 seconds for the AI to generate the challenge

## Performance Tips

### Model Selection

- **deepseek-coder:6.7b** - Best balance of quality and speed
- **codellama:7b** - Faster but slightly lower quality
- **codellama:13b** - Higher quality but slower (requires more RAM)

### Hardware Requirements

- **Minimum:** 8GB RAM, any modern CPU
- **Recommended:** 16GB RAM, M1/M2 Mac or modern x86 CPU
- **GPU:** Not required but can help on supported systems

### Optimization

For faster generation:

1. Use a smaller model (7b instead of 13b)
2. Reduce context in prompts
3. Ensure Ollama has enough system resources

## Development

### Building for Production

```bash
# Build everything
npm run build

# Build client only
npm run build:client

# Build server only
npm run build:server
```

### Code Structure

```
ai-code-challenge/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API client
│   │   ├── store/       # Zustand state management
│   │   └── App.tsx
│   └── package.json
├── server/          # Express backend
│   ├── src/
│   │   ├── services/    # Ollama integration
│   │   ├── routes/      # API routes
│   │   └── index.ts
│   └── package.json
└── shared/          # Shared TypeScript types
    └── types.ts
```

## Next Steps

After successful setup:

1. Experiment with different prompts
2. Try different programming languages
3. Adjust difficulty levels
4. Export challenges as JSON or Markdown
5. Customize the system prompt in `example_generator_agent.md`

## Getting Help

If you encounter issues:

1. Check this setup guide
2. Review the main README.md
3. Check Ollama documentation: https://ollama.ai/
4. Ensure all dependencies are installed correctly

## Resources

- **Ollama:** https://ollama.ai/
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **TailwindCSS:** https://tailwindcss.com/


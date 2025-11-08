# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:

- [ ] Node.js 20+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Ollama installed ([Download here](https://ollama.ai/))

## 5-Minute Setup

### 1. Start Ollama (Terminal 1)

```bash
ollama serve
```

Keep this terminal open.

### 2. Pull AI Model (Terminal 2)

```bash
# Recommended (6.7GB download)
ollama pull deepseek-coder:6.7b

# OR smaller/faster alternative (4GB)
ollama pull codellama:7b
```

Wait for download to complete...

### 3. Start Application (Terminal 2)

```bash
# From project root
./start.sh

# OR manually
npm run dev
```

### 4. Open Browser

Visit: **http://localhost:5173**

## First Challenge

1. **Select Configuration** (left panel):

   - Language: JavaScript
   - Difficulty: Intermediate
   - Tags: arrays (optional)

2. **Enter Prompt** (bottom input):

   ```
   Create a challenge about array manipulation
   ```

3. **Click Generate** and wait 10-30 seconds

4. **View Challenge** - See the generated challenge with:

   - Problem statement
   - Examples
   - Reference solution
   - Test cases

5. **Export** - Use the icons in the header to:
   - 📋 Copy JSON to clipboard
   - 📄 Download as JSON file
   - 📝 Download as Markdown file

## Troubleshooting

### "Could not connect to Ollama"

```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# If not, start it
ollama serve
```

### "Model not found"

```bash
# List installed models
ollama list

# Pull the model
ollama pull deepseek-coder:6.7b
```

### Port Already in Use

Edit `.env` files:

- `server/.env` - Change PORT
- `client/.env` - Update VITE_API_BASE_URL

## File Locations

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Models List**: http://localhost:3001/api/models

## Tips

- First generation takes longer (model initialization)
- Use specific prompts for better results
- Try different tags to guide the AI
- Beginner challenges are simpler and faster to generate
- Advanced challenges are more complex but slower

## Example Prompts

- "Create a challenge about recursion"
- "Generate a string manipulation problem"
- "Make an algorithm optimization task"
- "Design a data structure challenge"
- "Create a sorting algorithm problem"

## Next Steps

Once you've generated your first challenge:

1. Try different languages (Python, TypeScript)
2. Experiment with difficulty levels
3. Use tags to narrow topic focus
4. Export challenges for your use
5. Customize the system prompt in `example_generator_agent.md`

## Need Help?

- Check `SETUP.md` for detailed setup instructions
- See `README.md` for project overview

## Stopping the Application

1. Press `Ctrl+C` in the terminal running npm dev
2. Optionally stop Ollama: `Ctrl+C` in its terminal

## Clean Start

If you encounter issues:

```bash
# Stop all processes
Ctrl+C (in both terminals)

# Clean and reinstall
rm -rf node_modules client/node_modules server/node_modules shared/node_modules
npm install

# Restart
./start.sh
```

---

**That's it!** You're ready to generate programming challenges with AI. 🚀

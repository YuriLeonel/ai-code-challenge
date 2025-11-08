#!/bin/bash

echo "🚀 Starting AI Code Challenge Generator..."
echo ""

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    echo "⚠️  Warning: Ollama doesn't seem to be running!"
    echo "   Please run 'ollama serve' in another terminal."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if model is installed
echo "Checking for AI model..."
if ollama list 2>/dev/null | grep -q "deepseek-coder:6.7b"; then
    echo "✅ deepseek-coder:6.7b found"
elif ollama list 2>/dev/null | grep -q "codellama"; then
    echo "✅ codellama found"
else
    echo "⚠️  No coding model found. Please run:"
    echo "   ollama pull deepseek-coder:6.7b"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Starting development servers..."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
echo ""

npm run dev


#!/bin/bash

# Float MCP Setup Script
echo "🚀 Setting up Float MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 22.x or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ Node.js version 22 or later is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your Float.com API key!"
else
    echo "✅ .env file already exists"
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Check if FLOAT_API_KEY is set
if grep -q "your_float_api_key_here" .env; then
    echo ""
    echo "⚠️  SETUP INCOMPLETE ⚠️"
    echo "Please edit .env and replace 'your_float_api_key_here' with your actual Float.com API key."
    echo ""
    echo "To get your API key:"
    echo "1. Log into Float.com"
    echo "2. Go to Settings → API"
    echo "3. Generate a new API key"
    echo "4. Copy it to your .env file"
    echo ""
    echo "Then run: npm start"
else
    echo ""
    echo "🎉 Setup complete!"
    echo "You can now:"
    echo "  • Test the server: npm start"
    echo "  • Run in development: npm run dev"
    echo "  • Add to Claude Desktop (see README.md)"
fi

echo ""
echo "📖 For Claude Desktop integration instructions, see README.md" 
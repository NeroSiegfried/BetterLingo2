#!/bin/bash

echo "🚀 BetterLingo Production Setup Script"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local and add your:"
    echo "   - GROQ_API_KEY (from https://console.groq.com)"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo ""

# Ask if user wants to push database schema
echo "❓ Do you want to push the database schema now? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "📊 Pushing database schema..."
    npx prisma db push
    echo ""
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env.local with your API keys"
echo "   2. Run 'npm run dev' to start the development server"
echo "   3. Visit http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - LLM_IMPLEMENTATION.md - Implementation details"
echo "   - PRODUCTION_SETUP.md - Deployment guide"
echo ""

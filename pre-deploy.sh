#!/bin/bash

# Pre-deployment checklist script for Disaster Management System

echo "🚀 AWS Amplify Deployment Pre-Flight Checklist"
echo "================================================"
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
node --version

# Check npm version
echo "✓ Checking npm version..."
npm --version

echo ""
echo "📦 Installing dependencies..."
npm ci

echo ""
echo "🔨 Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📊 Build output summary:"
    ls -lh dist/
    echo ""
    echo "🎉 Ready for AWS Amplify deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Push code to your Git repository"
    echo "2. Connect repository to AWS Amplify Console"
    echo "3. Amplify will automatically use amplify.yml configuration"
    echo "4. Monitor build progress in Amplify Console"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

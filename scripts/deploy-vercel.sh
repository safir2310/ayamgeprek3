#!/bin/bash

# Deployment script for Vercel with automatic database configuration
# Set VERCEL_TOKEN environment variable before running this script

set -e

echo "🚀 Starting deployment to Vercel..."

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Error: VERCEL_TOKEN environment variable is not set"
  echo "Please set it with: export VERCEL_TOKEN=your-token"
  exit 1
fi

# Read environment variables from .env file
if [ -f .env ]; then
    echo "📝 Reading environment variables from .env file..."
    DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2-)
    DIRECT_URL=$(grep "^DIRECT_URL=" .env | cut -d '=' -f2-)
    echo "✅ Environment variables loaded"
else
    echo "❌ Error: .env file not found"
    exit 1
fi

# Create .vercelignore to exclude sensitive files
cat > .vercelignore << 'EOF'
.env.local
.env
*.db
*.db-journal
EOF

echo "🔧 Creating deployment..."

# Deploy with environment variables using --yes flag
vercel --prod --yes \
  --env DATABASE_URL="$DATABASE_URL" \
  --env DIRECT_URL="$DIRECT_URL"

echo "✅ Deployment completed!"
echo "🌐 Your app is now live on Vercel with Neon PostgreSQL database connection"

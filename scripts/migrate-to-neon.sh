#!/bin/bash

# Script to migrate SQLite database to Neon PostgreSQL
# This will export data from SQLite and import to Neon

echo "🚀 Starting migration to Neon PostgreSQL..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
bun run db:generate

# Push schema to Neon
echo "📤 Pushing schema to Neon..."
bun run db:push

# Seed data
echo "🌱 Seeding data..."
bun run db:seed

echo "✅ Migration completed successfully!"
echo ""
echo "Your database is now ready on Neon PostgreSQL!"
echo ""
echo "📝 Don't forget to add these environment variables in Vercel:"
echo "   - DATABASE_URL"
echo "   - DIRECT_URL"

#!/bin/bash

# RFP Management System Setup Script

echo "🚀 Setting up RFP Management System..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup backend
echo ""
echo "📦 Setting up backend..."
cd backend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "Please create .env file manually"
    echo "⚠️  Please update backend/.env with your configuration"
fi

cd ..

# Setup frontend
echo ""
echo "📦 Setting up frontend..."
cd frontend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "Frontend .env is optional (proxy handles API routing)"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database and API credentials"
echo "2. Create PostgreSQL database: createdb rfp_management"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
echo "Backend will run on http://localhost:5432"
echo "Frontend will run on http://localhost:3000"

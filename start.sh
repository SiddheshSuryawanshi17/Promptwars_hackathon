#!/bin/bash

# VenueFlow Easy Startup Script
# This script sets up and starts the entire VenueFlow application

set -e  # Exit on error

echo "🏟️  Welcome to VenueFlow!"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found ($(node --version))${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm found ($(npm --version))${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Step 2: Create .env if it doesn't exist
echo -e "${BLUE}⚙️  Step 2: Setting up environment...${NC}"
if [ ! -f ".env" ]; then
    cat > .env << EOF
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi
echo ""

# Step 3: Check ports
echo -e "${BLUE}🔌 Step 3: Checking ports...${NC}"
PORT_5000=$(lsof -Pi :5000 -sTCP:LISTEN -t 2>/dev/null || echo "")
PORT_3000=$(lsof -Pi :3000 -sTCP:LISTEN -t 2>/dev/null || echo "")

if [ ! -z "$PORT_5000" ]; then
    echo -e "${YELLOW}⚠️  Port 5000 is already in use. Killing process...${NC}"
    kill -9 $PORT_5000 2>/dev/null || true
fi

if [ ! -z "$PORT_3000" ]; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Killing process...${NC}"
    kill -9 $PORT_3000 2>/dev/null || true
fi

echo -e "${GREEN}✓ Ports are ready${NC}"
echo ""

# Step 4: Start servers
echo -e "${BLUE}🚀 Step 4: Starting VenueFlow...${NC}"
echo ""
echo -e "${YELLOW}Starting backend on port 5000...${NC}"
node server.js &
BACKEND_PID=$!
sleep 2

echo -e "${YELLOW}Starting frontend on port 3000...${NC}"
npm start &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ VenueFlow is now running!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔗 Backend:  http://localhost:5000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the servers${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

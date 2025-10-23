#!/bin/bash
################################################################################
# LMNH Start Script
# Starts LMNH in a detached screen session
################################################################################

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print messages
success() { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${YELLOW}ℹ️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

echo "🚴‍♂️ Starting LMNH Agent..."
echo "========================================"
echo ""

# Check if screen is installed
if ! command -v screen &> /dev/null; then
    error "screen is not installed!"
    echo "Run: brew install screen"
    exit 1
fi

# Check if already running
if screen -list | grep -q "lmnh"; then
    error "LMNH is already running!"
    echo ""
    echo "To check status:  ./status_lmnh.sh"
    echo "To stop it:       ./stop_lmnh.sh"
    echo "To attach to it:  screen -r lmnh"
    exit 1
fi

# Check if config is set up
if ! [ -f "configs/lmnh.json" ]; then
    error "Config file not found: configs/lmnh.json"
    exit 1
fi

# Check for placeholder values
if grep -q "PASTE_YOUR.*HERE" configs/lmnh.json; then
    error "Config file still has placeholder values!"
    echo "Edit configs/lmnh.json and add your API keys"
    exit 1
fi

# Start LMNH in a screen session
echo "Starting LMNH in screen session..."
screen -dmS lmnh bash -c "cd '$(pwd)' && python3 run_agent.py lmnh"

# Wait a moment for it to start
sleep 2

# Check if it started successfully
if screen -list | grep -q "lmnh"; then
    success "LMNH started successfully!"
    echo ""
    echo "📊 Management commands:"
    echo "  Check status:    ./status_lmnh.sh"
    echo "  View logs:       tail -f logs/lmnh.log"
    echo "  Attach to screen: screen -r lmnh"
    echo "  Stop LMNH:       ./stop_lmnh.sh"
    echo ""
    echo "🚴‍♂️ LMNH is now running with NO HANDS!"
    echo ""
    
    # Show last few log lines
    if [ -f "logs/lmnh.log" ]; then
        echo "Recent activity:"
        tail -5 logs/lmnh.log
    fi
else
    error "Failed to start LMNH"
    echo "Check logs/lmnh.log for errors"
    exit 1
fi




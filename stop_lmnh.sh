#!/bin/bash
################################################################################
# LMNH Stop Script
# Safely stops the LMNH screen session
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

echo "🛑 Stopping LMNH Agent..."
echo "========================================"
echo ""

# Check if screen session exists
if ! screen -list | grep -q "lmnh"; then
    info "LMNH is not running"
    exit 0
fi

# Send Ctrl+C to the screen session to gracefully stop
screen -S lmnh -X stuff $'\003'

# Wait a moment
sleep 1

# If still running, terminate the screen session
if screen -list | grep -q "lmnh"; then
    info "Forcing screen session to quit..."
    screen -S lmnh -X quit
fi

# Wait another moment
sleep 1

# Verify it stopped
if screen -list | grep -q "lmnh"; then
    error "Failed to stop LMNH"
    echo "Try manually: screen -S lmnh -X quit"
    exit 1
else
    success "LMNH stopped successfully"
    echo ""
    echo "To start again: ./start_lmnh.sh"
    echo ""
    echo "🚴‍♂️ LMNH is offline. Goodbye!"
fi




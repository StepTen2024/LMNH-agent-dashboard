#!/bin/bash
################################################################################
# LMNH Status Script
# Shows current status and recent activity
################################################################################

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print messages
success() { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${YELLOW}ℹ️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
header() { echo -e "${BLUE}$1${NC}"; }

echo "🚴‍♂️ LMNH Agent Status"
echo "========================================"
echo ""

# Check if running
header "Status:"
if screen -list | grep -q "lmnh"; then
    success "LMNH is RUNNING 🟢"
    
    # Get process info
    PID=$(screen -list | grep lmnh | awk '{print $1}' | cut -d. -f1)
    echo "   Process ID: $PID"
    echo "   Screen session: lmnh"
else
    error "LMNH is NOT RUNNING 🔴"
    echo ""
    echo "To start: ./start_lmnh.sh"
    exit 0
fi

echo ""

# Show recent logs
header "Recent Activity (last 10 lines):"
echo "----------------------------------------"
if [ -f "logs/lmnh.log" ]; then
    tail -10 logs/lmnh.log | sed 's/^/  /'
else
    info "No log file found yet"
fi

echo ""
echo "========================================"
echo ""
header "Management Commands:"
echo "  View live logs:      tail -f logs/lmnh.log"
echo "  Attach to screen:    screen -r lmnh"
echo "  Detach from screen:  Ctrl+A then D"
echo "  Stop LMNH:           ./stop_lmnh.sh"
echo "  Restart LMNH:        ./stop_lmnh.sh && ./start_lmnh.sh"
echo ""

header "Slack Channel:"
echo "  Go to your Slack #agent-tasks channel to give LMNH tasks!"
echo ""

header "Example Task:"
echo '  @LMNH task: Add a hello world function'
echo '  repo: https://github.com/StepTen2024/your-repo'
echo '  file: hello.py'
echo ""




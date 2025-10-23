#!/bin/bash
################################################################################
# LMNH Mac Setup Script
# This script sets up everything needed to run LMNH on macOS
################################################################################

set -e  # Exit on error

echo "🚴‍♂️ LMNH Mac Setup Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print success messages
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print info messages
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Function to print error messages
error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "Step 1: Checking for Homebrew..."
echo "----------------------------------------"
if command -v brew &> /dev/null; then
    success "Homebrew is already installed"
else
    info "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    success "Homebrew installed"
fi
echo ""

echo "Step 2: Installing VS Code..."
echo "----------------------------------------"
if command -v code &> /dev/null; then
    success "VS Code is already installed"
else
    info "Installing VS Code via Homebrew..."
    brew install --cask visual-studio-code
    success "VS Code installed"
fi
echo ""

echo "Step 3: Installing screen..."
echo "----------------------------------------"
if command -v screen &> /dev/null; then
    success "screen is already installed"
else
    info "Installing screen via Homebrew..."
    brew install screen
    success "screen installed"
fi
echo ""

echo "Step 4: Configuring Git..."
echo "----------------------------------------"
# Check current git config
CURRENT_NAME=$(git config --global user.name 2>/dev/null || echo "")
CURRENT_EMAIL=$(git config --global user.email 2>/dev/null || echo "")

if [ "$CURRENT_NAME" = "LMNH Bot" ] && [ "$CURRENT_EMAIL" = "lmnh@stepten2024.com" ]; then
    success "Git is already configured for LMNH"
else
    if [ -n "$CURRENT_NAME" ]; then
        info "Current git user.name: $CURRENT_NAME"
        info "Current git user.email: $CURRENT_EMAIL"
        read -p "Do you want to change Git config to LMNH Bot? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git config --global user.name "LMNH Bot"
            git config --global user.email "lmnh@stepten2024.com"
            success "Git configured for LMNH Bot"
        else
            info "Keeping existing Git configuration"
        fi
    else
        git config --global user.name "LMNH Bot"
        git config --global user.email "lmnh@stepten2024.com"
        success "Git configured for LMNH Bot"
    fi
fi
echo ""

echo "Step 5: Making scripts executable..."
echo "----------------------------------------"
chmod +x start_lmnh.sh 2>/dev/null || info "start_lmnh.sh not found yet (will be created)"
chmod +x stop_lmnh.sh 2>/dev/null || info "stop_lmnh.sh not found yet (will be created)"
chmod +x status_lmnh.sh 2>/dev/null || info "status_lmnh.sh not found yet (will be created)"
success "Scripts made executable"
echo ""

echo "Step 6: Creating logs directory..."
echo "----------------------------------------"
mkdir -p logs
success "Logs directory ready"
echo ""

echo "Step 7: Energy Settings Reminder..."
echo "----------------------------------------"
info "⚠️  IMPORTANT: To keep LMNH running 24/7, you should:"
echo ""
echo "   1. Open System Preferences/Settings"
echo "   2. Go to Energy/Battery"
echo "   3. For 'Power Adapter':"
echo "      - Turn display off: Never (or a long time)"
echo "      - Prevent Mac from sleeping: ON"
echo "      - Put hard disks to sleep: OFF (optional)"
echo ""
echo "   Or run this command:"
echo "   sudo pmset -c sleep 0 displaysleep 0 disksleep 0"
echo ""
read -p "Press Enter to continue..."
echo ""

echo "========================================"
echo "🎉 Setup Complete!"
echo "========================================"
echo ""
success "LMNH is ready to run!"
echo ""
echo "Next steps:"
echo "  1. Start LMNH:    ./start_lmnh.sh"
echo "  2. Check status:  ./status_lmnh.sh"
echo "  3. Stop LMNH:     ./stop_lmnh.sh"
echo ""
echo "For more help, see: README_MAC_SETUP.md"
echo ""
echo "🚴‍♂️ Look mum, NO HANDS!"




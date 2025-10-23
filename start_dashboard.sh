#!/bin/bash

echo "🚴‍♂️ Starting LMNH Dashboard System..."
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed!"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    exit 1
fi

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install -q -r requirements.txt

# Install dashboard dependencies if needed
cd dashboard
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dashboard dependencies..."
    npm install
fi
cd ..

# Start API server in background
echo "🚀 Starting API server on http://localhost:8000..."
source venv/bin/activate
python -m agent_core.api_server &
API_PID=$!
echo $API_PID > .api.pid

# Wait a bit for API to start
sleep 2

# Start dashboard
echo "🚀 Starting dashboard on http://localhost:4002..."
cd dashboard
npm run dev &
DASH_PID=$!
cd ..
echo $DASH_PID > .dashboard.pid

echo ""
echo "✅ LMNH Dashboard System is running!"
echo "========================================"
echo "📊 Dashboard: http://localhost:4002"
echo "🔌 API: http://localhost:8000"
echo ""
echo "To stop: ./stop_dashboard.sh"
echo ""
echo "LOOK MUM NO HANDS! 🚴‍♂️"

# Wait for user interrupt
wait


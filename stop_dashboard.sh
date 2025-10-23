#!/bin/bash

echo "🛑 Stopping LMNH Dashboard System..."

# Kill API server
if [ -f .api.pid ]; then
    API_PID=$(cat .api.pid)
    echo "Stopping API server (PID: $API_PID)..."
    kill $API_PID 2>/dev/null
    rm .api.pid
fi

# Kill dashboard
if [ -f .dashboard.pid ]; then
    DASH_PID=$(cat .dashboard.pid)
    echo "Stopping dashboard (PID: $DASH_PID)..."
    kill $DASH_PID 2>/dev/null
    rm .dashboard.pid
fi

# Kill any remaining processes
pkill -f "api_server.py" 2>/dev/null
pkill -f "next dev" 2>/dev/null

echo "✅ Dashboard stopped!"
echo "Bye mum! 🚴‍♂️"


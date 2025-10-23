#!/bin/bash
echo "🚴‍♂️ LMNH Dashboard Status"
echo "=========================="
echo ""
if [ -f .api.pid ]; then
    API_PID=$(cat .api.pid)
    if ps -p $API_PID > /dev/null 2>&1; then
        echo "✅ API Server: RUNNING (PID: $API_PID)"
        echo "   🔌 http://localhost:8000"
    else
        echo "❌ API Server: NOT RUNNING"
    fi
else
    echo "❌ API Server: NOT RUNNING"
fi
echo ""
if [ -f .dashboard.pid ]; then
    DASH_PID=$(cat .dashboard.pid)
    if ps -p $DASH_PID > /dev/null 2>&1; then
        echo "✅ Dashboard: RUNNING (PID: $DASH_PID)"
        echo "   📊 http://localhost:4002"
    else
        echo "❌ Dashboard: NOT RUNNING"
    fi
else
    echo "❌ Dashboard: NOT RUNNING"
fi
echo ""
echo "To stop: ./stop_dashboard.sh"

# 🚴‍♂️ LMNH Dashboard

**Real-time dashboard for the LMNH autonomous coding agent!**

Watch LMNH work in real-time with:
- ⚡ Live agent status
- 📋 Task queue with progress
- 📊 Today's statistics
- 📜 Live logs streaming

## 🚀 Quick Start

### Option 1: Automatic Start (Recommended)

From the `coding-agents` directory:

```bash
chmod +x start_dashboard.sh
./start_dashboard.sh
```

This will:
1. Start the API server on `http://localhost:8000`
2. Start the dashboard on `http://localhost:3000`
3. Keep both running

Open your browser to `http://localhost:3000` to see the dashboard!

### Option 2: Manual Start

**Terminal 1 - API Server:**
```bash
cd coding-agents
source venv/bin/activate
python -m agent_core.api_server
```

**Terminal 2 - Dashboard:**
```bash
cd coding-agents/dashboard
npm install
npm run dev
```

## 🎨 Features

### Agent Status Card
- Real-time status (Online/Working/Idle/Offline)
- Current task with progress bar
- Uptime tracking
- Activity indicator

### Task Queue
- All tasks with status (Pending/In Progress/Completed/Failed)
- Timestamps
- Visual status indicators
- Auto-scrolling

### Live Logs
- Real-time log streaming
- Color-coded by level (Info/Success/Warning/Error)
- Auto-scroll to latest
- Terminal-style display

### Statistics
- Tasks completed today
- Tasks failed
- Average task time
- Success rate
- Motivational messages!

## 🎨 Design

- **Colors:** Neon green (`#00ff88`) on dark background
- **Theme:** Cyberpunk/terminal aesthetic
- **Logo:** LMNH robot with arms spread wide (NO HANDS!)
- **Animations:** Glow effects, pulsing, smooth transitions

## 🔧 Configuration

The dashboard automatically connects to:
- API: `http://localhost:8000`
- Polling interval: 2 seconds for status, 1 second for logs

To change these, edit:
- `app/page.tsx` - Change polling intervals
- Dashboard components - Customize display

## 📊 API Endpoints

The dashboard uses these endpoints:

- `GET /api/status` - Agent status, current task, progress
- `GET /api/logs` - Recent logs (last 50)
- `GET /api/tasks` - All tasks
- `GET /api/stats` - Statistics

## 🛑 Stopping

```bash
./stop_dashboard.sh
```

Or press `Ctrl+C` in the terminal running the start script.

## 🐛 Troubleshooting

**Dashboard shows "API not available":**
- Make sure API server is running on port 8000
- Check `python -m agent_core.api_server` output

**"Port 3000 already in use":**
```bash
kill $(lsof -ti:3000)
npm run dev
```

**"Port 8000 already in use":**
```bash
kill $(lsof -ti:8000)
python -m agent_core.api_server
```

## 🎯 Development

**Build for production:**
```bash
npm run build
npm start
```

**Add new components:**
1. Create in `components/`
2. Import in `app/page.tsx`
3. Style with Tailwind classes using `lmnh-green`, `lmnh-dark`, `lmnh-gray`

## 🚀 What's Next?

Potential enhancements:
- [ ] WebSocket for real-time updates (replace polling)
- [ ] Historical task analytics
- [ ] Agent control buttons (pause/resume)
- [ ] Multiple agent support
- [ ] Dark/light theme toggle
- [ ] Export logs feature
- [ ] Task filtering and search

---

**Built with ❤️ and absolutely NO HANDS! 🚴‍♂️**


# 🎯 LMNH Dashboard - Complete Guide

## 📋 What You Just Built

A **real-time web dashboard** that lets you watch LMNH work his magic! 🚴‍♂️

### The Stack
- **Frontend:** Next.js 14 + React + Tailwind CSS
- **Backend:** FastAPI (Python)
- **Architecture:** REST API with polling (upgradeable to WebSocket)
- **Theme:** Neon green cyberpunk with that sick LMNH logo!

---

## 🚀 How to Run It

### Step 1: Start Everything

```bash
cd coding-agents
chmod +x start_dashboard.sh stop_dashboard.sh
./start_dashboard.sh
```

This starts:
1. ✅ API Server → `http://localhost:8000`
2. ✅ Dashboard → `http://localhost:3000`

### Step 2: Open Dashboard

Go to `http://localhost:3000` in your browser

### Step 3: Start LMNH Agent

In another terminal:
```bash
cd coding-agents
source venv/bin/activate
python run_agent.py lmnh
```

### Step 4: Give LMNH a Task!

In Slack:
```
@LMNH task: Add a hello world function
repo: https://github.com/yourusername/your-repo
file: main.py
```

### Step 5: WATCH THE MAGIC! ✨

The dashboard will show:
- 🟢 Status changing to "WORKING"
- 📊 Progress bar filling up (0% → 100%)
- 📜 Live logs streaming
- ✅ Task appearing in queue and completing

---

## 🎨 What's in the Dashboard?

### 1. Agent Status Card
```
┌─────────────────────────────────────┐
│  🚴‍♂️ LMNH                         │
│  Status: 🟢 ONLINE / ⚡ WORKING     │
│                                      │
│  Current Task:                       │
│  "Add hello world function"         │
│  Progress: ████████░░ 80%           │
│                                      │
│  Uptime: 2h 34m                      │
└─────────────────────────────────────┘
```

### 2. Task Queue
Shows all tasks with:
- ✅ Green = Completed
- ⚡ Yellow = In Progress (spinning)
- ⏰ Gray = Pending
- ❌ Red = Failed

### 3. Today's Stats
- Tasks completed
- Tasks failed
- Average time per task
- Success rate %
- **Motivational message based on performance!**

### 4. Live Logs
Terminal-style log display:
```
[14:23:45] 🚴‍♂️ LMNH initialized
[14:24:01] 🚀 Starting task: Add hello world function
[14:24:02] 🤔 Analyzing task with Claude...
[14:24:05] ✅ Task analysis complete
[14:24:06] 📦 Cloning repository...
[14:24:10] ✅ Repository ready
[14:24:11] 💻 Writing code... LOOK MUM NO HANDS!
[14:24:15] 📝 Modifying main.py
[14:24:20] 🚀 Pushing to GitHub...
[14:24:25] 🎉 Task completed!
```

---

## 🔌 How It Works

### The Flow

```
LMNH Agent ──reports to──> API Server ──polled by──> Dashboard
                           (FastAPI)                 (Next.js)
```

### 1. Agent Reports Status

Every step of the task, LMNH calls:
```python
self.dashboard.update_status("working", task, 60)
self.dashboard.add_log("info", "💻 Writing code...")
self.dashboard.update_task(task_id, "completed")
```

### 2. API Server Stores State

FastAPI endpoints:
- `/api/status` - Current agent status
- `/api/logs` - Recent logs
- `/api/tasks` - Task queue
- `/api/stats` - Statistics

### 3. Dashboard Polls API

Every 2 seconds:
```typescript
const response = await fetch('http://localhost:8000/api/status');
const data = await response.json();
setAgentData(data);
```

### 4. UI Updates in Real-Time!

React state updates → Components re-render → You see it live!

---

## 📂 File Structure

```
coding-agents/
├── dashboard/                    # Next.js dashboard
│   ├── app/
│   │   ├── page.tsx             # Main dashboard page
│   │   ├── layout.tsx           # Layout wrapper
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── Logo.tsx             # LMNH logo SVG
│   │   ├── AgentStatus.tsx      # Status card
│   │   ├── TaskQueue.tsx        # Task list
│   │   ├── LiveLogs.tsx         # Log viewer
│   │   └── Stats.tsx            # Statistics
│   ├── package.json
│   └── tailwind.config.js       # Neon green theme!
│
├── agent_core/
│   ├── api_server.py            # FastAPI server
│   ├── dashboard_reporter.py    # Reports to API
│   └── agent.py                 # Updated with reporting
│
├── start_dashboard.sh           # Start everything
├── stop_dashboard.sh            # Stop everything
└── requirements.txt             # Python deps (now with FastAPI)
```

---

## 🎨 Customization

### Change Colors

In `dashboard/tailwind.config.js`:
```javascript
colors: {
  lmnh: {
    green: '#00ff88',  // Change this!
    dark: '#1a1a1a',
    gray: '#333',
  },
}
```

### Change Polling Speed

In `dashboard/app/page.tsx`:
```typescript
// Status updates
const interval = setInterval(fetchStatus, 2000); // 2 seconds

// Logs
const interval = setInterval(fetchLogs, 1000); // 1 second
```

### Add New Components

1. Create `dashboard/components/YourComponent.tsx`
2. Import in `dashboard/app/page.tsx`
3. Add to the grid layout

---

## 🚀 Production Deployment

### Build Dashboard
```bash
cd dashboard
npm run build
npm start
```

### Run API as Service

Create `lmnh-api.service`:
```ini
[Unit]
Description=LMNH API Server

[Service]
ExecStart=/path/to/venv/bin/python -m agent_core.api_server
WorkingDirectory=/path/to/coding-agents
Restart=always

[Install]
WantedBy=multi-user.target
```

### Use Nginx Reverse Proxy
```nginx
server {
    listen 80;
    
    location / {
        proxy_pass http://localhost:3000;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

---

## 🐛 Common Issues

### Dashboard shows "No data"
✅ Make sure API server is running on port 8000
✅ Check browser console for errors
✅ Verify agent is running and reporting

### Logs not updating
✅ Check API server logs for errors
✅ Verify dashboard is polling (check Network tab)
✅ Restart both API and dashboard

### Ports already in use
```bash
# Kill processes on ports
kill $(lsof -ti:3000)
kill $(lsof -ti:8000)
```

---

## 🎯 Next Level Upgrades

### Easy Wins (1-2 hours)
- [ ] Add filtering to task queue
- [ ] Export logs to file
- [ ] Task search functionality
- [ ] Keyboard shortcuts

### Medium (1 day)
- [ ] WebSocket instead of polling
- [ ] Historical analytics graphs
- [ ] Multiple agent support
- [ ] Agent control buttons (pause/resume)

### Advanced (2-3 days)
- [ ] Database for persistence
- [ ] Authentication system
- [ ] Mobile-responsive design
- [ ] Real-time alerts/notifications

---

## 🎉 That's It!

You now have a **SICK** real-time dashboard for LMNH! 

**Key Features:**
✅ Real-time status updates
✅ Live task tracking with progress
✅ Streaming logs
✅ Daily statistics
✅ Neon green cyberpunk theme
✅ That beautiful logo!

**The Flow:**
1. LMNH gets task from Slack
2. Reports progress to API every step
3. Dashboard polls API and updates
4. You watch the magic happen! 🚴‍♂️

---

**Built with ❤️ and absolutely NO HANDS! 🚴‍♂️**

Now go give LMNH some tasks and watch him COOK! 🔥


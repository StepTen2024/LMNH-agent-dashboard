# 🚀 LMNH Dashboard - 5 Minute Quickstart

Get the dashboard running in **5 minutes**! 🚴‍♂️

## Step 1: One Command Start 🎯

```bash
cd /Users/stephenatcheler/Documents/GitHub/LMNH/coding-agents
./start_dashboard.sh
```

That's it! The script will:
- ✅ Install Python dependencies (FastAPI, uvicorn)
- ✅ Install Node.js dependencies (Next.js, React, Tailwind)
- ✅ Start API server on port 8000
- ✅ Start dashboard on port 3000

## Step 2: Open Dashboard 🌐

Go to: **http://localhost:3000**

You should see:
- 🚴‍♂️ The LMNH logo (arms spread wide, no hands!)
- Status card showing "IDLE"
- Empty task queue
- Live logs saying "Waiting for tasks..."

## Step 3: Start LMNH Agent 🤖

In a **NEW terminal**:

```bash
cd /Users/stephenatcheler/Documents/GitHub/LMNH/coding-agents
source venv/bin/activate
python run_agent.py lmnh
```

Watch the dashboard - status should change to **🟢 ONLINE**!

## Step 4: Give LMNH a Task! 📋

In Slack (`#agent-tasks`):

```
@LMNH task: Add a hello world function
repo: https://github.com/yourusername/your-repo
file: main.py
```

## Step 5: Watch the Magic! ✨

The dashboard will show **LIVE**:

1. Status → ⚡ **WORKING**
2. Current Task → "Add a hello world function"
3. Progress bar → 0% → 20% → 40% → 60% → 80% → 100%
4. Live Logs streaming:
   ```
   🚀 Starting task: Add a hello world function
   🤔 Analyzing task with Claude...
   ✅ Task analysis complete
   📦 Cloning repository...
   ✅ Repository ready
   💻 Writing code... LOOK MUM NO HANDS!
   📝 Modifying main.py
   🚀 Pushing to GitHub...
   🎉 Task completed!
   ```
5. Task appears in queue with ✅ status
6. Stats update automatically

## 🎉 You're Done!

**What You Have:**
- Real-time agent status
- Live progress tracking
- Streaming logs
- Daily statistics
- Neon green cyberpunk theme
- That sick logo!

## 🛑 To Stop Everything

```bash
./stop_dashboard.sh
```

Or press `Ctrl+C` in the terminal.

## 📊 URLs

- **Dashboard:** http://localhost:3000
- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (Swagger UI)

## 🐛 Troubleshooting

**"Port already in use":**
```bash
./stop_dashboard.sh
./start_dashboard.sh
```

**Dashboard shows "API not available":**
```bash
# Check if API is running
curl http://localhost:8000
```

**Agent not showing up:**
- Make sure you ran `python run_agent.py lmnh`
- Check agent is reporting: Look for "Connected to dashboard API" in logs

## 🚀 Next Steps

Read the full guide: `DASHBOARD_GUIDE.md`

---

**LOOK MUM NO HANDS! 🚴‍♂️**


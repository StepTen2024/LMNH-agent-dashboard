# 🚴‍♂️ LMNH Mac Setup Guide

Complete guide for running LMNH autonomously on macOS.

---

## 🚀 Quick Start

### 1. Run Setup (First Time Only)

```bash
cd "/Users/stephenatcheler/Desktop/My MCP/coding-agents"
chmod +x setup_mac.sh
./setup_mac.sh
```

This will:
- ✅ Install Homebrew (if needed)
- ✅ Install VS Code (if needed)
- ✅ Install screen (for background running)
- ✅ Configure Git for LMNH
- ✅ Make all scripts executable

### 2. Start LMNH

```bash
./start_lmnh.sh
```

LMNH will start in the background and stay running even if you close Terminal!

### 3. Check Status

```bash
./status_lmnh.sh
```

Shows if LMNH is running and recent activity.

### 4. Stop LMNH

```bash
./stop_lmnh.sh
```

Safely stops LMNH.

---

## 📋 Management Scripts

### `start_lmnh.sh`
**Starts LMNH in background**

```bash
./start_lmnh.sh
```

- ✅ Checks if already running (won't start twice)
- ✅ Starts in detached screen session
- ✅ Shows confirmation and recent logs
- ✅ Runs continuously in background

**What is screen?** It's a terminal multiplexer that keeps processes running even after you close the terminal window.

---

### `status_lmnh.sh`
**Check if LMNH is running**

```bash
./status_lmnh.sh
```

Shows:
- ✅ Running status (ON/OFF)
- ✅ Process ID
- ✅ Last 10 log entries
- ✅ Quick command reference

---

### `stop_lmnh.sh`
**Stop LMNH safely**

```bash
./stop_lmnh.sh
```

- ✅ Sends graceful shutdown signal
- ✅ Waits for clean exit
- ✅ Forces quit if needed
- ✅ Confirms when stopped

---

## 🔍 Viewing Logs

### Live Logs (Follow Mode)

```bash
tail -f logs/lmnh.log
```

Press `Ctrl+C` to stop viewing.

### Last 20 Lines

```bash
tail -20 logs/lmnh.log
```

### Search Logs

```bash
grep "ERROR" logs/lmnh.log
grep "success" logs/lmnh.log
```

---

## 📺 Screen Session Commands

### Attach to Running LMNH

```bash
screen -r lmnh
```

This lets you see LMNH running live!

### Detach (Leave Running)

While attached, press:
```
Ctrl+A then D
```

LMNH keeps running in the background.

### List All Screen Sessions

```bash
screen -list
```

### Kill Screen Session (Force)

```bash
screen -S lmnh -X quit
```

---

## ⚡ Energy Settings (IMPORTANT!)

To keep LMNH running 24/7, prevent your Mac from sleeping:

### Option 1: System Preferences (GUI)

1. Open **System Preferences** (or **System Settings** on newer macOS)
2. Go to **Battery** (or **Energy Saver**)
3. Click **Power Adapter** tab
4. Set these:
   - ✅ **Prevent Mac from sleeping when display is off** (check this)
   - ✅ **Turn display off after:** Never (or 1+ hours)
   - ❌ **Put hard disks to sleep** (uncheck)

### Option 2: Terminal Command (Faster)

```bash
sudo pmset -c sleep 0 displaysleep 60 disksleep 0
```

This sets:
- Computer sleep: Never
- Display sleep: 60 minutes
- Disk sleep: Never

**Note:** Only affects when plugged in (power adapter). Your Mac will still sleep on battery.

---

## 🔄 Auto-Start on Login (Optional)

Want LMNH to start automatically when you log in?

### 1. Create Launch Agent

```bash
mkdir -p ~/Library/LaunchAgents

cat > ~/Library/LaunchAgents/com.stepten.lmnh.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.stepten.lmnh</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/stephenatcheler/Desktop/My MCP/coding-agents/start_lmnh.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>StandardOutPath</key>
    <string>/Users/stephenatcheler/Desktop/My MCP/coding-agents/logs/launch.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/stephenatcheler/Desktop/My MCP/coding-agents/logs/launch_error.log</string>
</dict>
</plist>
EOF
```

### 2. Load Launch Agent

```bash
launchctl load ~/Library/LaunchAgents/com.stepten.lmnh.plist
```

### 3. Unload (To Disable)

```bash
launchctl unload ~/Library/LaunchAgents/com.stepten.lmnh.plist
```

---

## 🐛 Troubleshooting

### LMNH Won't Start

**Check logs:**
```bash
cat logs/lmnh.log
```

**Common issues:**
- ❌ Config file has placeholder values
  - Fix: Edit `configs/lmnh.json` and add real API keys
- ❌ Screen not installed
  - Fix: `brew install screen`
- ❌ Python dependencies missing
  - Fix: `pip3 install -r requirements.txt`

---

### LMNH Stops Unexpectedly

**Check if Mac went to sleep:**
- Fix: Configure energy settings (see above)

**Check for errors in logs:**
```bash
grep "ERROR" logs/lmnh.log | tail -20
```

**Restart LMNH:**
```bash
./stop_lmnh.sh
./start_lmnh.sh
```

---

### Can't Connect to Screen

**Error:** "Cannot open your terminal '/dev/tty'"

**Fix:**
```bash
script /dev/null
screen -r lmnh
```

---

### Multiple Screen Sessions

**List all sessions:**
```bash
screen -list
```

**Kill specific session:**
```bash
screen -S lmnh -X quit
```

**Kill all sessions:**
```bash
killall screen
```

---

## 📊 Monitoring LMNH

### Check if Process is Running

```bash
ps aux | grep "run_agent.py lmnh"
```

### Check Screen Sessions

```bash
screen -list
```

### Watch Logs Live

```bash
watch -n 2 'tail -10 logs/lmnh.log'
```

Updates every 2 seconds. Press `Ctrl+C` to exit.

---

## 🔐 Security Best Practices

### 1. Protect Your Config File

```bash
chmod 600 configs/lmnh.json
```

Makes the config file readable only by you.

### 2. Never Commit API Keys

The `.gitignore` already excludes:
- `configs/lmnh.json` ❌ (never committed)
- `logs/` ❌ (never committed)
- `workspace/` ❌ (never committed)

### 3. Rotate Keys Regularly

Change your API keys every 90 days:
- Slack Bot Token
- Claude API Key
- GitHub Personal Access Token

---

## 📝 Daily Usage

### Morning Routine

```bash
cd "/Users/stephenatcheler/Desktop/My MCP/coding-agents"
./status_lmnh.sh
```

Check if LMNH is running and healthy.

### Give LMNH a Task

In Slack `#agent-tasks` channel:
```
@LMNH task: Add error handling to the login function
repo: https://github.com/StepTen2024/my-project
file: auth/login.py
```

### Check Progress

```bash
tail -f logs/lmnh.log
```

Or just watch Slack - LMNH reports progress there!

### Evening Routine

```bash
./status_lmnh.sh
```

Verify LMNH is still running and handled tasks successfully.

---

## 🆘 Emergency Commands

### Force Stop Everything

```bash
pkill -9 -f "run_agent.py lmnh"
killall screen
```

### Reset Everything

```bash
./stop_lmnh.sh
rm -rf workspace/*
rm logs/lmnh.log
./start_lmnh.sh
```

### Check System Resources

```bash
top | grep python
```

Shows CPU/Memory usage of LMNH.

---

## 📞 Quick Reference Card

```bash
# Start LMNH
./start_lmnh.sh

# Check status
./status_lmnh.sh

# Stop LMNH
./stop_lmnh.sh

# View logs
tail -f logs/lmnh.log

# Attach to screen
screen -r lmnh

# Detach from screen
Ctrl+A then D

# Verify setup
python3 verify_setup.py
```

---

## 🎓 Understanding Screen

**Screen** is a terminal multiplexer that lets processes run in the background.

### Why We Use Screen

- ✅ LMNH keeps running after closing Terminal
- ✅ Survives accidental terminal quits
- ✅ Can attach/detach anytime
- ✅ Built-in on most systems
- ✅ Lightweight and reliable

### Screen Basics

| Command | What It Does |
|---------|-------------|
| `screen -dmS lmnh <command>` | Start detached session named "lmnh" |
| `screen -list` | Show all screen sessions |
| `screen -r lmnh` | Attach to session "lmnh" |
| `Ctrl+A then D` | Detach (leave running) |
| `screen -X -S lmnh quit` | Kill session "lmnh" |

---

## 🎯 Next Steps

1. ✅ Run `./setup_mac.sh` (if not done yet)
2. ✅ Run `./start_lmnh.sh`
3. ✅ Configure energy settings
4. ✅ Give LMNH a test task in Slack
5. ✅ Watch it work! 🚴‍♂️

---

## 📚 Additional Resources

- **Full Documentation:** `README.md`
- **Usage Examples:** `EXAMPLES.md`
- **Quick Start:** `QUICKSTART.md`
- **Setup Instructions:** `SETUP_INSTRUCTIONS.md`
- **Project Overview:** `PROJECT_SUMMARY.md`

---

# 🚴‍♂️ **LOOK MUM, NO HANDS!**

**LMNH is now set up to run autonomously on your Mac!**

Built with ❤️ and NO HANDS!




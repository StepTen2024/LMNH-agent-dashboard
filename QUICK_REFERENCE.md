# 🚴‍♂️ LMNH Quick Reference Card

**Print this out or keep it handy!**

---

## 🚀 Essential Commands

```bash
# Navigate to LMNH directory
cd "/Users/stephenatcheler/Desktop/My MCP/coding-agents"

# Start LMNH
./start_lmnh.sh

# Check if running
./status_lmnh.sh

# Stop LMNH
./stop_lmnh.sh

# View live logs
tail -f logs/lmnh.log
```

---

## 📺 Screen Commands

```bash
# Attach to running LMNH
screen -r lmnh

# Detach (while attached)
Ctrl+A then D

# List all screen sessions
screen -list

# Kill screen session
screen -S lmnh -X quit
```

---

## 💬 Slack Commands

**In #agent-tasks channel:**

```
@LMNH task: Your task description here
repo: https://github.com/StepTen2024/repo-name
file: path/to/file.py
branch: feature-branch (optional)
```

**Example:**
```
@LMNH task: Add error handling to the login function
repo: https://github.com/StepTen2024/my-project
file: auth/login.py
```

---

## 🔍 Log Commands

```bash
# Last 20 lines
tail -20 logs/lmnh.log

# Live follow
tail -f logs/lmnh.log

# Search for errors
grep "ERROR" logs/lmnh.log

# Search for success
grep "success" logs/lmnh.log

# Last hour of logs
grep "$(date '+%Y-%m-%d %H')" logs/lmnh.log
```

---

## 🆘 Emergency Commands

```bash
# Force stop everything
pkill -9 -f "run_agent.py lmnh"
killall screen

# Check if running
ps aux | grep "run_agent.py lmnh"

# Restart LMNH
./stop_lmnh.sh && ./start_lmnh.sh
```

---

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `configs/lmnh.json` | API keys & settings |
| `logs/lmnh.log` | Agent activity log |
| `workspace/` | Cloned repositories |

---

## 📞 Support Files

| File | Description |
|------|-------------|
| `README_MAC_SETUP.md` | Full Mac setup guide |
| `README.md` | Complete documentation |
| `EXAMPLES.md` | Usage examples |
| `QUICKSTART.md` | 5-minute setup |

---

## ✅ Daily Checklist

**Morning:**
- [ ] Run `./status_lmnh.sh`
- [ ] Check Slack for completed tasks
- [ ] Review `tail -20 logs/lmnh.log`

**Evening:**
- [ ] Run `./status_lmnh.sh`
- [ ] Verify tasks completed successfully
- [ ] Check Mac didn't go to sleep

---

## 🔧 First Time Setup

```bash
# 1. Run setup (only once)
./setup_mac.sh

# 2. Configure energy settings
# System Preferences → Battery → Power Adapter
# - Prevent sleep when display off: ON
# - Turn display off: Never

# 3. Start LMNH
./start_lmnh.sh

# 4. Verify it's running
./status_lmnh.sh
```

---

## 🚴‍♂️ LOOK MUM, NO HANDS!

**Project Location:**
`/Users/stephenatcheler/Desktop/My MCP/coding-agents`

**Slack Channel:**
`#agent-tasks`

**GitHub:**
`https://github.com/StepTen2024`

---

*Keep this card handy for quick reference!*




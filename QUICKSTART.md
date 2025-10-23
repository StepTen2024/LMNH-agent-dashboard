# 🚴‍♂️ LMNH Quick Start Guide

Get LMNH up and running in 5 minutes!

## ✅ Quick Start Checklist

### Step 1: Install Dependencies (2 minutes)

```bash
cd "/Users/stephenatcheler/Desktop/My MCP/coding-agents"
pip install -r requirements.txt
```

### Step 2: Get Your API Keys (3 minutes)

#### 🔑 Slack Bot Token
1. Visit: https://api.slack.com/apps
2. Create New App → "From scratch" → Name it "LMNH"
3. OAuth & Permissions → Add scopes:
   - `chat:write`
   - `channels:history`
   - `channels:read`
   - `app_mentions:read`
4. Install to Workspace
5. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

#### 🔑 Claude API Key
1. Visit: https://console.anthropic.com
2. Create API Key
3. Copy it (starts with `sk-ant-`)

#### 🔑 GitHub Token
1. Visit: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo` (all) and `workflow`
4. Copy it (starts with `ghp_`)

### Step 3: Configure LMNH (1 minute)

Edit `configs/lmnh.json`:

```bash
# Open in your favorite editor
code configs/lmnh.json
# or
nano configs/lmnh.json
```

Replace these values:
```json
{
  "slack_bot_token": "xoxb-YOUR-ACTUAL-TOKEN-HERE",
  "claude_api_key": "sk-ant-YOUR-ACTUAL-KEY-HERE",
  "github_token": "ghp_YOUR-ACTUAL-TOKEN-HERE",
  "github_username": "yourgithubusername",
  "slack_channel": "agent-tasks"
}
```

### Step 4: Create Slack Channel (30 seconds)

In Slack:
1. Create channel: `/create #agent-tasks`
2. Invite bot: `/invite @LMNH`

### Step 5: Launch LMNH! (10 seconds)

```bash
python run_agent.py lmnh
```

You should see:
```
🚀 Starting agent: lmnh
📝 Config: configs/lmnh.json
==================================================
🚴‍♂️ LMNH initialized!
🚴‍♂️ LMNH is running...
```

In Slack, LMNH will announce:
> 🟢 🚴‍♂️ LMNH is ONLINE! Look mum, no hands! Ready for tasks!

## 🎯 Test LMNH

In the `#agent-tasks` channel:

```
@LMNH task: Add a hello world function
repo: https://github.com/yourusername/test-repo
file: hello.py
```

LMNH will:
1. 🚴‍♂️ Announce the task
2. 🤔 Think about it
3. 📦 Clone your repo
4. 💻 Write the code
5. 🚀 Push to GitHub
6. ✅ Celebrate success!

## 🐛 Troubleshooting

**Error: "Config file not found"**
- Make sure you're in the `coding-agents` directory
- Check that `configs/lmnh.json` exists

**Error: "Failed to create plan"**
- Verify your Claude API key is correct
- Check you have API credits at console.anthropic.com

**Error: "Error sending message"**
- Verify Slack bot token is correct
- Make sure LMNH is invited to #agent-tasks
- Check bot permissions include `chat:write`

**Error: "Failed to clone repository"**
- Verify GitHub token has `repo` permissions
- Make sure the repository URL is correct
- Check you have access to the repository

## 📊 Monitor LMNH

Watch logs in real-time:
```bash
tail -f logs/lmnh.log
```

## 🛑 Stop LMNH

Press `Ctrl+C` in the terminal

LMNH will announce in Slack:
> 🔴 🚴‍♂️ LMNH is going offline. Bye mum!

## 🚀 Next Steps

- Read the full README.md for advanced features
- Create custom agents with different personalities
- Set up multiple agents for different tasks
- Configure auto-start on system boot

---

**Look Mum, NO HANDS! 🚴‍♂️**




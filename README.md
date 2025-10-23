# LMNH - Look Mum No Hands! 🚴‍♂️

Autonomous coding agent that does your bidding with NO HANDS!

## Meet LMNH

- **Name:** LMNH (Look Mum No Hands)
- **Emoji:** 🚴‍♂️
- **Personality:** Overconfident, eager, occasionally breaks things
- **Specialty:** General coding tasks
- **Catchphrase:** "LOOK MUM, NO HANDS!"

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Get API Keys

You need three API keys:

#### Slack Bot Token
1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name it "LMNH"
4. Select your workspace
5. Go to "OAuth & Permissions"
6. Add Bot Token Scopes:
   - `chat:write`
   - `channels:history`
   - `channels:read`
   - `app_mentions:read`
7. Click "Install to Workspace"
8. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

#### Claude API Key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to API Keys
4. Create a new key
5. Copy it (starts with `sk-ant-`)

#### GitHub Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it "LMNH Agent"
4. Select scopes:
   - ✅ repo (all)
   - ✅ workflow
5. Click "Generate token"
6. Copy it (starts with `ghp_`)

### 3. Configure LMNH

Edit `configs/lmnh.json` and paste your API keys:

```json
{
  "slack_bot_token": "xoxb-YOUR-TOKEN-HERE",
  "claude_api_key": "sk-ant-YOUR-KEY-HERE",
  "github_token": "ghp_YOUR-TOKEN-HERE",
  "github_username": "your-github-username"
}
```

### 4. Create Slack Channel

1. In Slack, create a new channel called `#agent-tasks`
2. Invite LMNH to the channel: `/invite @LMNH`

### 5. Run LMNH

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

## How to Use

In the `#agent-tasks` Slack channel, mention LMNH with a task:

### Simple Task
```
@LMNH task: Add a hello world function
repo: https://github.com/yourusername/your-repo
file: main.py
```

### Complex Task
```
@LMNH task: Fix the authentication bug in the login system
repo: https://github.com/yourusername/auth-service
file: auth/login.py
branch: develop
```

### LMNH's Workflow

1. 🚴‍♂️ "LOOK MUM! Starting task..."
2. 🤔 Thinks about the task using Claude
3. 📦 Clones the repository
4. 💻 Writes the code (no hands!)
5. 🚀 Pushes to GitHub
6. ✅ "DONE! Did you see that, mum?"

## Logs

Check what LMNH is doing:

```bash
tail -f logs/lmnh.log
```

## Troubleshooting

### "Failed to clone repository"
- Check your GitHub token has the right permissions
- Make sure the repo URL is correct
- Verify you have access to the repository

### "Failed to create plan"
- Check your Claude API key is valid
- Ensure you have API credits

### "Error sending message"
- Verify Slack bot token is correct
- Make sure bot is invited to #agent-tasks channel
- Check bot has proper permissions

## Tips

- Be specific in your task descriptions
- Always provide a repo URL
- Optionally specify which file to modify
- LMNH works best with clear, focused tasks
- If LMNH says "uh oh mum", check the logs!

## Next Steps

Want to add more agents? Create new config files:

```bash
cp configs/lmnh.json configs/agent_b.json
# Edit agent_b.json with different personality
python run_agent.py agent_b
```

---

**Built with ❤️ and NO HANDS! 🚴‍♂️**




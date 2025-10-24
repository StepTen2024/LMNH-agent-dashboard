# LMNH - Look Mum No Hands! 🚴‍♂️

Autonomous coding agent that does your bidding with NO HANDS!

## Meet LMNH

- **Name:** LMNH (Look Mum No Hands)
- **Emoji:** 🚴‍♂️
- **Personality:** Overconfident, eager, occasionally breaks things
- **Specialty:** General coding tasks
- **Catchphrase:** "LOOK MUM, NO HANDS!"

## Task Lifecycle Dashboard

### 📊 Understanding Task States

LMNH processes tasks through several states. Here's what each means:

| State | What It Means | What LMNH Is Doing |
|-------|---------------|-------------------|
| 🟡 **RECEIVED** | Task just came in | "Got it mum! Let me read this..." |
| 🔄 **PLANNING** | Thinking about approach | "Hmm, how should I tackle this?" |
| 📦 **CLONING** | Getting your code | "Downloading your repo..." |
| ✏️ **CODING** | Writing the solution | "LOOK MUM, NO HANDS! *typing*" |
| 🚀 **PUSHING** | Saving to GitHub | "Uploading my masterpiece..." |
| ✅ **COMPLETED** | All done! | "DONE! Did you see that, mum?" |
| ❌ **FAILED** | Something went wrong | "Uh oh mum... I made a mess" |

### 🔍 How to Track Your Task

When you send a task, LMNH will show you exactly what's happening:

```
🚴‍♂️ Task received! Let me get to work...
State: RECEIVED → PLANNING
🤔 Planning approach...
State: PLANNING → CLONING
📦 Cloning repository...
State: CLONING → CODING
💻 Writing code (no hands!)...
State: CODING → PUSHING
🚀 Pushing changes...
State: PUSHING → COMPLETED
✅ Task completed successfully!
```

### 🚨 When Things Go Wrong

If LMNH hits a problem, you'll see:

```
❌ State: PLANNING → FAILED
Error: Could not understand the task requirements
💡 Try: Be more specific about what you want me to do
```

Common failure points and fixes:

| When It Fails | Why | How to Fix |
|---------------|-----|------------|
| **PLANNING** | Task unclear | Be more specific about what you want |
| **CLONING** | Can't access repo | Check repo URL and permissions |
| **CODING** | Can't find file | Make sure the file exists or specify creation |
| **PUSHING** | Git issues | Check GitHub token permissions |

### 📈 Task Progress Indicators

LMNH shows progress with emojis:

- 🟡 Starting up
- 🔄 Working on it
- 📦 Getting files
- ✏️ Making changes
- 🚀 Almost done
- ✅ Success!
- ❌ Oops...

### 🎯 Task Success Tips

For best results:

1. **Be Specific**: Instead of "fix the bug" → "fix the login validation error in auth.py"
2. **Provide Context**: Mention what the code should do
3. **Specify Files**: Tell LMNH which file to modify
4. **Check Permissions**: Ensure repo access is granted

### 📊 Live Task Monitoring

Want to see what LMNH is doing right now? Check the logs:

```bash
tail -f logs/lmnh.log
```

You'll see real-time updates like:
```
2024-01-15 10:30:15 - INFO - Task state: RECEIVED → PLANNING
2024-01-15 10:30:20 - INFO - Generated plan for task
2024-01-15 10:30:25 - INFO - Task state: PLANNING → CLONING
2024-01-15 10:30:30 - INFO - Repository cloned successfully
2024-01-15 10:30:35 - INFO - Task state: CLONING → CODING
```

## Task Lifecycle Dashboard Experiment

LMNH created a Django/Flask-based Task Lifecycle Dashboard (see commit b231081) that tracked complete task history with 19 implementation files. This was removed due to architectural conflicts with our Next.js/FastAPI stack:

- **What was built**: Full-stack Django/Flask + React/Material-UI task management system
- **Why removed**: Conflicts with existing Next.js/Tailwind/FastAPI/Prisma architecture
- **Documentation**: See [TASK_LIFECYCLE_IDIOTS_GUIDE.md](./TASK_LIFECYCLE_IDIOTS_GUIDE.md) for complete details
- **Lesson learned**: Be explicit about tech stack constraints when instructing LMNH

---

## Project Status

### Current Features
- ✅ Slack integration with task parsing
- ✅ Claude AI for task planning and code generation
- ✅ GitHub repository cloning and file operations
- ✅ Automated commit and push workflow
- ✅ Comprehensive logging system
- ✅ Error handling and recovery
- ✅ Multi-file task support
- ✅ Real-time task lifecycle tracking

### Recent Updates
- Added comprehensive task lifecycle dashboard
- Enhanced state tracking and user feedback
- Improved error messages with actionable suggestions
- Added real-time progress indicators

### Known Issues
- None currently identified

### Next Milestones
- [ ] Add support for pull request creation
- [ ] Implement code review suggestions
- [ ] Add multi-repository task support
- [ ] Create web dashboard for task monitoring

### Performance Metrics
- **Tasks Completed:** Tracking in progress
- **Success Rate:** Monitoring active
- **Average Response Time:** Measuring
- **Uptime:** Monitoring active

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

1. 🚴‍♂️ "LOOK MUM! Starting task..." (RECEIVED)
2. 🤔 Thinks about the task using Claude (PLANNING)
3. 📦 Clones the repository (CLONING)
4. 💻 Writes the code (no hands!) (CODING)
5. 🚀 Pushes to GitHub (PUSHING)
6. ✅ "DONE! Did you see that, mum?" (COMPLETED)

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
- Watch the state transitions to understand progress
- Failed tasks will show helpful error messages

## Next Steps

Want to add more agents? Create new config files:

```bash
cp configs/lmnh.json configs/agent_b.json
# Edit agent_b.json with different personality
python run_agent.py agent_b
```

---

**Built with ❤️ and NO HANDS! 🚴‍♂️**
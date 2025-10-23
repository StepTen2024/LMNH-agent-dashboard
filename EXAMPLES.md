# 🚴‍♂️ LMNH Usage Examples

Real-world examples of how to use LMNH!

## Basic Examples

### Example 1: Add a Simple Function

**In Slack (#agent-tasks):**
```
@LMNH task: Add a function that calculates the sum of two numbers
repo: https://github.com/myusername/math-utils
file: calculator.py
```

**What LMNH does:**
1. Clones your repo
2. Opens `calculator.py`
3. Adds a `sum()` function
4. Commits with message: `[LMNH] Add a function that calculates the sum of two numbers`
5. Pushes to `main` branch

---

### Example 2: Fix a Bug

**In Slack:**
```
@LMNH task: Fix the bug where users can't login with special characters in password
repo: https://github.com/mycompany/auth-service
file: auth/login.py
branch: develop
```

**What LMNH does:**
1. Clones repo and switches to `develop` branch
2. Reads `auth/login.py`
3. Analyzes the bug
4. Fixes the password encoding issue
5. Commits and pushes to `develop`

---

### Example 3: Add Tests

**In Slack:**
```
@LMNH task: Add unit tests for the User model
repo: https://github.com/myteam/api-server
file: tests/test_user.py
```

**What LMNH does:**
1. Reads existing User model (if it can find it)
2. Creates comprehensive unit tests
3. Adds to `tests/test_user.py`
4. Commits and pushes

---

## Advanced Examples

### Example 4: Refactor Code

**In Slack:**
```
@LMNH task: Refactor the payment processing code to use the new Stripe API
repo: https://github.com/mystore/backend
file: payments/stripe_handler.py
branch: feature/stripe-v2
```

**LMNH will:**
- Analyze current Stripe implementation
- Update to new API patterns
- Maintain backward compatibility where possible
- Push to feature branch

---

### Example 5: Multiple File Changes

**In Slack:**
```
@LMNH task: Add error handling throughout the user registration flow
repo: https://github.com/webapp/backend
file: auth/register.py
```

**Note:** If LMNH's plan identifies multiple files need changes, it will modify all of them automatically!

---

## Task Format Options

### Minimal Format
```
@LMNH task: Do something cool
repo: https://github.com/user/repo
```
LMNH will figure out which files to modify.

### Specific Format
```
@LMNH task: Do something cool
repo: https://github.com/user/repo
file: specific/file.py
```
LMNH will focus on that specific file.

### With Branch
```
@LMNH task: Do something cool
repo: https://github.com/user/repo
file: specific/file.py
branch: feature-branch
```
LMNH will work on a specific branch.

---

## What LMNH Can Do

### ✅ Great Tasks for LMNH

- **Add new functions/methods**
  - `Add a helper function to parse JSON responses`
  
- **Fix bugs**
  - `Fix the memory leak in the WebSocket handler`
  
- **Improve error handling**
  - `Add try-catch blocks to prevent crashes`
  
- **Add tests**
  - `Write unit tests for the authentication module`
  
- **Refactor code**
  - `Simplify the nested if statements in validate_user()`
  
- **Update dependencies**
  - `Update the API calls to use the new v2 endpoints`
  
- **Add documentation**
  - `Add docstrings to all public methods`

### ⚠️ Challenging Tasks for LMNH

- **Large architectural changes**
  - LMNH works best with focused, specific tasks
  
- **Tasks requiring human judgment**
  - "Make it look nicer" (too vague)
  
- **Cross-repo changes**
  - LMNH handles one repo at a time
  
- **Database migrations**
  - Better to do these manually with proper testing

---

## Tips for Best Results

### 1. Be Specific
❌ Bad: `@LMNH fix the app`
✅ Good: `@LMNH fix the 500 error when submitting empty forms`

### 2. Provide Context
❌ Bad: `@LMNH add validation`
✅ Good: `@LMNH add email validation to the registration form`

### 3. One Task at a Time
❌ Bad: `@LMNH fix login, update navbar, add tests, and refactor database`
✅ Good: Four separate messages, one for each task

### 4. Specify the File (if known)
✅ Good: Include `file: auth/login.py` if you know which file needs changes

### 5. Use Feature Branches
✅ Good: Include `branch: feature/my-task` for experimental changes

---

## Monitoring LMNH

### Check Progress in Slack
LMNH updates you at each step:
1. 🚴‍♂️ Starting task...
2. 🤔 Thinking...
3. 📦 Grabbing repo...
4. 💻 Writing code...
5. 🚀 Pushing to GitHub...
6. ✅ Done!

### Check Logs
```bash
tail -f logs/lmnh.log
```

### Check GitHub
LMNH's commits will have the format:
```
[LMNH] Your task description
```

---

## Handling Errors

### LMNH Says "Uh oh mum"
This means something went wrong. Check:
1. The Slack message (LMNH will explain the error)
2. The logs: `tail -f logs/lmnh.log`
3. GitHub permissions
4. Repo accessibility

### Common Issues

**"No repo URL provided"**
- Solution: Include `repo:` in your message

**"Failed to clone repository"**
- Solution: Check GitHub token has access to the repo

**"No files to modify"**
- Solution: Be more specific about what needs to change

---

## Multiple Agents

Want to run multiple LMNH instances?

1. Copy the config:
```bash
cp configs/lmnh.json configs/lmnh-2.json
```

2. Edit `lmnh-2.json`:
```json
{
  "agent_name": "LMNH-2",
  "slack_channel": "agent-tasks-2",
  "workspace_path": "./workspace/lmnh-2"
}
```

3. Run both:
```bash
# Terminal 1
python run_agent.py lmnh

# Terminal 2
python run_agent.py lmnh-2
```

---

## Real-World Scenario

**You:** "We need to add rate limiting to the API"

**Step 1:** Give LMNH the task
```
@LMNH task: Add rate limiting middleware (100 requests per minute per IP)
repo: https://github.com/mycompany/api
file: middleware/rate_limit.py
branch: feature/rate-limiting
```

**Step 2:** LMNH does the work
- Creates/updates `middleware/rate_limit.py`
- Adds rate limiting logic
- Commits and pushes to feature branch

**Step 3:** Review the PR
- Check GitHub for LMNH's commit
- Review the code
- Merge if everything looks good

**Step 4:** Iterate if needed
```
@LMNH task: Update rate limit to 200 requests per minute
repo: https://github.com/mycompany/api
file: middleware/rate_limit.py
branch: feature/rate-limiting
```

---

**Look Mum, NO HANDS! 🚴‍♂️**




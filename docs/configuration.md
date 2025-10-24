# Configuration Guide - Task Lifecycle Dashboard

## Overview
This guide explains how to configure the Task Lifecycle Dashboard in simple terms. No technical background required!

## What is Configuration?
Configuration is like setting up your preferences. Think of it like adjusting the settings on your phone - you're telling the dashboard how you want it to work.

## Basic Setup

### Step 1: Environment File (.env)
This is a special file that stores your personal settings. It's like a recipe card that tells the dashboard what ingredients to use.

Create a file called `.env` in your main folder and add these lines:

```
# Database Settings (where your data lives)
DATABASE_URL=sqlite:///tasks.db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=task_dashboard
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password

# Application Settings
APP_NAME=Task Lifecycle Dashboard
APP_VERSION=1.0.0
DEBUG_MODE=false
LOG_LEVEL=info

# Security Settings (keep these secret!)
SECRET_KEY=your-super-secret-key-here
JWT_SECRET=another-secret-key-for-tokens

# Email Settings (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-email-password

# Dashboard Settings
REFRESH_INTERVAL=30
MAX_TASKS_DISPLAY=100
DEFAULT_VIEW=kanban
```

### Step 2: Configuration File (config.yaml)
This file controls how your dashboard looks and behaves. Think of it as your dashboard's personality settings.

```yaml
# General Application Settings
app:
  name: "Task Lifecycle Dashboard"
  version: "1.0.0"
  timezone: "UTC"
  language: "en"

# Database Configuration
database:
  type: "sqlite"  # Options: sqlite, postgresql, mysql
  backup_enabled: true
  backup_interval: "daily"  # daily, weekly, monthly

# User Interface Settings
ui:
  theme: "light"  # Options: light, dark, auto
  layout: "grid"  # Options: grid, list, kanban
  items_per_page: 20
  show_timestamps: true
  auto_refresh: true
  refresh_seconds: 30

# Task Settings
tasks:
  default_priority: "medium"  # low, medium, high, critical
  auto_archive_days: 30
  status_options:
    - "todo"
    - "in_progress" 
    - "review"
    - "done"
    - "cancelled"

# Notification Settings
notifications:
  email_enabled: true
  browser_enabled: true
  sound_enabled: false
  daily_summary: true
  overdue_alerts: true

# Security Settings
security:
  session_timeout: 3600  # seconds (1 hour)
  password_min_length: 8
  require_2fa: false
  login_attempts: 5

# Integration Settings
integrations:
  slack:
    enabled: false
    webhook_url: ""
  
  teams:
    enabled: false
    webhook_url: ""
  
  jira:
    enabled: false
    server_url: ""
    username: ""
    api_token: ""

# Performance Settings
performance:
  cache_enabled: true
  cache_duration: 300  # seconds (5 minutes)
  max_concurrent_users: 50
  request_timeout: 30
```

## Common Configuration Scenarios

### For Small Teams (1-5 people)
```yaml
ui:
  items_per_page: 10
  refresh_seconds: 60

tasks:
  auto_archive_days: 14

performance:
  max_concurrent_users: 10
```

### For Large Teams (20+ people)
```yaml
ui:
  items_per_page: 50
  refresh_seconds: 15

tasks:
  auto_archive_days: 60

performance:
  max_concurrent_users: 100
  cache_enabled: true
```

### For Personal Use
```yaml
ui:
  items_per_page: 5
  refresh_seconds: 120
  theme: "auto"

notifications:
  email_enabled: false
  browser_enabled: true
  sound_enabled: false

tasks:
  auto_archive_days: 7
```

## Database Options Explained

### SQLite (Recommended for Beginners)
- **What it is**: A simple file-based database
- **Best for**: Small teams, personal use, getting started
- **Setup**: No additional software needed
```
DATABASE_URL=sqlite:///tasks.db
```

### PostgreSQL (For Advanced Users)
- **What it is**: A powerful database server
- **Best for**: Large teams, lots of data
- **Setup**: Requires PostgreSQL server installation
```
DATABASE_URL=postgresql://username:password@localhost:5432/taskdb
```

### MySQL (Alternative Advanced Option)
- **What it is**: Another database server option
- **Best for**: If you're already using MySQL
- **Setup**: Requires MySQL server installation
```
DATABASE_URL=mysql://username:password@localhost:3306/taskdb
```

## Security Settings Explained

### SECRET_KEY
- **What it does**: Protects your data
- **How to create**: Use a random string of letters and numbers
- **Example**: `my-super-secret-key-12345`

### JWT_SECRET
- **What it does**: Secures user login sessions
- **How to create**: Another random string, different from SECRET_KEY
- **Example**: `another-random-string-67890`

## Troubleshooting Common Issues

### Dashboard Won't Start
1. Check your `.env` file exists
2. Make sure DATABASE_URL is correct
3. Verify SECRET_KEY is set

### Can't See Tasks
1. Check DATABASE_URL points to correct file/server
2. Verify database file has read/write permissions
3. Try setting DEBUG_MODE=true to see error messages

### Dashboard is Slow
1. Reduce REFRESH_INTERVAL (increase the number)
2. Lower MAX_TASKS_DISPLAY
3. Enable caching in config.yaml

### Email Notifications Not Working
1. Check SMTP settings in .env file
2. Verify email password is correct
3. Some email providers need "app passwords"

## Environment Variables Quick Reference

| Variable | What It Does | Example |
|----------|-------------|---------|
| DATABASE_URL | Where your data is stored | `sqlite:///tasks.db` |
| SECRET_KEY | Keeps your data secure | `my-secret-123` |
| DEBUG_MODE | Shows detailed errors | `true` or `false` |
| REFRESH_INTERVAL | How often to update (seconds) | `30` |
| APP_NAME | Name shown in browser | `My Task Dashboard` |

## Config File Quick Reference

| Setting | What It Does | Options |
|---------|-------------|---------|
| ui.theme | Dashboard colors | `light`, `dark`, `auto` |
| ui.layout | How tasks are displayed | `grid`, `list`, `kanban` |
| tasks.default_priority | New task importance | `low`, `medium`, `high` |
| notifications.email_enabled | Send email alerts | `true`, `false` |
| performance.cache_enabled | Speed up dashboard | `true`, `false` |

## Getting Help

If you're stuck:
1. Check the error messages in your browser's developer tools (F12)
2. Set `DEBUG_MODE=true` in your .env file
3. Check the log files in the `logs/` folder
4. Make sure all required fields in .env are filled out

Remember: Start simple! Use the basic configuration first, then add advanced features once everything is working.
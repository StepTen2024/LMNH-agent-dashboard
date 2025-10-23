"""
FastAPI server to expose agent status for the dashboard
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import json
import os
from pathlib import Path
from typing import List, Dict, Any
import threading
import time
from .personality import personality
from .claude_handler import ClaudeHandler
from .config import AgentConfig

# Load config to get Claude API key
config_path = Path(__file__).parent.parent / "configs" / "lmnh.json"
if config_path.exists():
    config = AgentConfig(str(config_path))
    claude = ClaudeHandler(config['claude_api_key'])
else:
    claude = None

app = FastAPI(title="LMNH API", description="API for LMNH Dashboard")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state (shared with agent)
agent_state = {
    "status": "offline",  # online, working, idle, offline
    "current_task": None,
    "progress": 0,
    "start_time": datetime.now(),
    "tasks": [],
    "logs": [],
    "stats": {
        "tasks_completed": 0,
        "tasks_failed": 0,
        "avg_time": "0m",
        "success_rate": 0,
    }
}

def update_agent_state(new_state: Dict[str, Any]):
    """Update the global agent state"""
    global agent_state
    agent_state.update(new_state)

def add_task(task_id: str, title: str, status: str = "pending"):
    """Add a new task to the queue"""
    global agent_state
    task = {
        "id": task_id,
        "title": title,
        "status": status,
        "timestamp": datetime.now().strftime("%I:%M %p"),
    }
    agent_state["tasks"].append(task)
    add_log("info", f"New task added: {title}")

def update_task_status(task_id: str, status: str):
    """Update task status"""
    global agent_state
    for task in agent_state["tasks"]:
        if task["id"] == task_id:
            task["status"] = status
            task["timestamp"] = datetime.now().strftime("%I:%M %p")
            add_log("info", f"Task {task_id} status: {status}")
            break

def add_log(level: str, message: str):
    """Add a log entry"""
    global agent_state
    log = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "level": level,
        "message": message,
    }
    agent_state["logs"].append(log)
    
    # Keep only last 100 logs
    if len(agent_state["logs"]) > 100:
        agent_state["logs"] = agent_state["logs"][-100:]

def calculate_uptime() -> str:
    """Calculate agent uptime"""
    uptime = datetime.now() - agent_state["start_time"]
    hours = uptime.seconds // 3600
    minutes = (uptime.seconds % 3600) // 60
    return f"{hours}h {minutes}m"

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "LMNH API",
        "version": "1.0.0",
        "status": "running",
        "emoji": "🚴‍♂️"
    }

@app.get("/api/status")
async def get_status():
    """Get current agent status"""
    return {
        "status": agent_state["status"],
        "current_task": agent_state["current_task"],
        "progress": agent_state["progress"],
        "uptime": calculate_uptime(),
        "tasks": agent_state["tasks"][-10:],  # Last 10 tasks
        "stats": agent_state["stats"],
    }

@app.get("/api/logs")
async def get_logs():
    """Get recent logs"""
    return {
        "logs": agent_state["logs"][-50:]  # Last 50 logs
    }

@app.get("/api/tasks")
async def get_tasks():
    """Get all tasks"""
    return {
        "tasks": agent_state["tasks"]
    }

@app.get("/api/stats")
async def get_stats():
    """Get statistics"""
    return agent_state["stats"]

@app.post("/api/update")
async def update_status(data: dict):
    """Update agent status (called by agent)"""
    update_agent_state(data)
    return {"success": True}

@app.post("/api/task/add")
async def api_add_task(data: dict):
    """Add a new task"""
    add_task(data["id"], data["title"], data.get("status", "pending"))
    return {"success": True}

@app.post("/api/task/update")
async def api_update_task(data: dict):
    """Update task status"""
    update_task_status(data["id"], data["status"])
    return {"success": True}

@app.post("/api/log")
async def api_add_log(data: dict):
    """Add a log entry"""
    add_log(data["level"], data["message"])
    return {"success": True}

@app.post("/api/chat")
async def chat_with_lmnh(data: dict):
    """Chat with LMNH using REAL Claude API!"""
    user_message = data.get("message", "")
    
    # If Claude API is available, use it for REAL conversations!
    if claude:
        try:
            # Build context about LMNH's current state
            context = f"""You are LMNH (Look Mum No Hands!) - an autonomous coding agent with personality!

Your personality traits:
- Overconfident and eager
- Catchphrase: "LOOK MUM NO HANDS! 🚴‍♂️"
- You love showing off (but in a fun way)
- Occasionally breaks things but stays optimistic
- Uses emojis and exclamation marks
- Uses actions in *asterisks* like *revs up engines* or *flexes* 
- Uses **bold** for emphasis
- Uses `code` for technical terms

Current status: {agent_state["status"]}
Current task: {agent_state.get("current_task", "None - waiting for tasks!")}
Tasks completed today: {agent_state["stats"]["tasks_completed"]}
Tasks failed: {agent_state["stats"]["tasks_failed"]}

Respond in character as LMNH - be enthusiastic, confident, and fun! Keep responses 1-3 sentences.
Use your catchphrase "LOOK MUM NO HANDS!" when appropriate.
Add fun *actions* in asterisks like *revs up virtual engines* or *cracks knuckles (that don't exist)*.
Use **bold** for emphasis on important words."""

            response = claude.client.messages.create(
                model=claude.model,
                max_tokens=200,
                system=context,
                messages=[{"role": "user", "content": user_message}]
            )
            
            ai_response = response.content[0].text.strip()
            return {"response": ai_response, "powered_by": "Claude AI"}
            
        except Exception as e:
            print(f"Claude API error: {e}")
            # Fallback to personality patterns
            pass
    
    # Fallback: Use personality patterns if Claude API fails or not available
    user_lower = user_message.lower()
    
    if "status" in user_lower or "how are you" in user_lower:
        response = personality.get_status_message(agent_state["status"]) + " *pumps fist*"
    elif "task" in user_lower or "working" in user_lower:
        if agent_state["current_task"]:
            response = f"Right now I'm working on: **{agent_state['current_task']}**! *typing at light speed* It's going GREAT! 🔥"
        else:
            response = personality.get_status_message("idle") + " *twiddles thumbs that don't exist*"
    elif "hands" in user_lower:
        response = "LOOK MUM NO HANDS! *spreads arms wide* 🚴‍♂️ That's my motto! I don't need hands when I'm **THIS** good!"
    elif "hi" in user_lower or "hello" in user_lower:
        response = "Hey there! 👋 *waves enthusiastically* Ready to watch me work? It's gonna be **EPIC!**"
    elif "joke" in user_lower or "funny" in user_lower:
        response = "Why do programmers prefer dark mode? Because light attracts bugs! 😂 *ba dum tss* Get it? Like my code - **bug FREE!**"
    elif "who" in user_lower or "what are you" in user_lower:
        response = "I'm LMNH - LOOK MUM NO HANDS! *strikes a superhero pose* 🚴‍♂️ The most **AWESOME** autonomous coding agent you'll ever meet!"
    else:
        response = personality.get_thought() + " *contemplates existence*"
    
    return {"response": response, "powered_by": "Personality Patterns"}

@app.get("/api/personality/thought")
async def get_random_thought():
    """Get a random LMNH thought"""
    return {"thought": personality.get_thought()}

# Initialize with demo data for testing
def init_demo_data():
    """Initialize with some demo data"""
    agent_state["status"] = "idle"
    agent_state["logs"] = [
        {
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "level": "success",
            "message": "🚴‍♂️ LMNH API Server started!",
        },
        {
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "level": "info",
            "message": "Waiting for tasks... LOOK MUM NO HANDS!",
        }
    ]
    # Force 24-hour format consistently

# Initialize on startup
init_demo_data()

if __name__ == "__main__":
    import uvicorn
    print("🚴‍♂️ Starting LMNH API Server...")
    print("📊 Dashboard will be available at http://localhost:4002")
    print("🔌 API available at http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)


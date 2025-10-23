"""
Helper module to report agent status to the API server
"""
import requests
from typing import Optional
import logging
from .personality import personality

class DashboardReporter:
    """Reports agent activity to the dashboard API"""
    
    def __init__(self, api_url: str = "http://localhost:8000"):
        self.api_url = api_url
        self.logger = logging.getLogger("DashboardReporter")
        self.enabled = True
        
        # Test connection
        try:
            response = requests.get(f"{api_url}/", timeout=2)
            if response.status_code == 200:
                self.logger.info("✅ Connected to dashboard API")
            else:
                self.logger.warning("Dashboard API not responding, disabling reporting")
                self.enabled = False
        except Exception as e:
            self.logger.warning(f"Dashboard API not available: {e}")
            self.enabled = False
    
    def update_status(self, status: str, current_task: Optional[str] = None, progress: int = 0):
        """Update agent status"""
        if not self.enabled:
            return
        
        try:
            requests.post(
                f"{self.api_url}/api/update",
                json={
                    "status": status,
                    "current_task": current_task,
                    "progress": progress,
                },
                timeout=1
            )
        except Exception as e:
            self.logger.debug(f"Failed to update status: {e}")
    
    def add_task(self, task_id: str, title: str, status: str = "pending"):
        """Add a new task"""
        if not self.enabled:
            return
        
        try:
            requests.post(
                f"{self.api_url}/api/task/add",
                json={
                    "id": task_id,
                    "title": title,
                    "status": status,
                },
                timeout=1
            )
        except Exception as e:
            self.logger.debug(f"Failed to add task: {e}")
    
    def update_task(self, task_id: str, status: str):
        """Update task status"""
        if not self.enabled:
            return
        
        try:
            requests.post(
                f"{self.api_url}/api/task/update",
                json={
                    "id": task_id,
                    "status": status,
                },
                timeout=1
            )
        except Exception as e:
            self.logger.debug(f"Failed to update task: {e}")
    
    def add_log(self, level: str, message: str, add_personality: bool = False):
        """Add a log entry"""
        if not self.enabled:
            return
        
        # Optionally add personality to the message
        if add_personality and level == "info":
            # Add a random reaction
            message = f"{message} {personality.get_thought()}"
        
        try:
            requests.post(
                f"{self.api_url}/api/log",
                json={
                    "level": level,
                    "message": message,
                },
                timeout=1
            )
        except Exception as e:
            self.logger.debug(f"Failed to add log: {e}")
    
    def update_stats(self, stats: dict):
        """Update statistics"""
        if not self.enabled:
            return
        
        try:
            requests.post(
                f"{self.api_url}/api/update",
                json={"stats": stats},
                timeout=1
            )
        except Exception as e:
            self.logger.debug(f"Failed to update stats: {e}")


import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Set, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_async_session
from ..models.task import Task, TaskHistory, TaskDependency
from ..models.user import User

logger = logging.getLogger(__name__)

class TaskUpdateManager:
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}
        self.user_subscriptions: Dict[str, Set[str]] = {}  # user_id -> set of task_ids
        self.task_subscribers: Dict[str, Set[str]] = {}    # task_id -> set of user_ids
        
    async def connect(self, websocket: WebSocket, user_id: str, client_id: str):
        """Connect a user's WebSocket"""
        await websocket.accept()
        connection_key = f"{user_id}:{client_id}"
        self.connections[connection_key] = websocket
        
        if user_id not in self.user_subscriptions:
            self.user_subscriptions[user_id] = set()
            
        logger.info(f"WebSocket connected: {connection_key}")
        
        # Send initial connection confirmation
        await self._send_to_connection(connection_key, {
            "type": "connection_established",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "client_id": client_id
        })
    
    def disconnect(self, user_id: str, client_id: str):
        """Disconnect a user's WebSocket"""
        connection_key = f"{user_id}:{client_id}"
        
        # Remove connection
        if connection_key in self.connections:
            del self.connections[connection_key]
        
        # Clean up subscriptions if no more connections for this user
        user_connections = [key for key in self.connections.keys() if key.startswith(f"{user_id}:")]
        if not user_connections and user_id in self.user_subscriptions:
            # Remove user from all task subscriptions
            for task_id in self.user_subscriptions[user_id]:
                if task_id in self.task_subscribers:
                    self.task_subscribers[task_id].discard(user_id)
                    if not self.task_subscribers[task_id]:
                        del self.task_subscribers[task_id]
            del self.user_subscriptions[user_id]
        
        logger.info(f"WebSocket disconnected: {connection_key}")
    
    async def subscribe_to_task(self, user_id: str, task_id: str):
        """Subscribe user to task updates"""
        if user_id not in self.user_subscriptions:
            self.user_subscriptions[user_id] = set()
        
        self.user_subscriptions[user_id].add(task_id)
        
        if task_id not in self.task_subscribers:
            self.task_subscribers[task_id] = set()
        
        self.task_subscribers[task_id].add(user_id)
        
        # Send current task status
        async for session in get_async_session():
            try:
                task_data = await self._get_task_with_details(session, task_id)
                if task_data:
                    await self._send_to_user(user_id, {
                        "type": "task_subscription_confirmed",
                        "task_id": task_id,
                        "task_data": task_data,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                break
            except Exception as e:
                logger.error(f"Error getting task details for subscription: {e}")
    
    async def unsubscribe_from_task(self, user_id: str, task_id: str):
        """Unsubscribe user from task updates"""
        if user_id in self.user_subscriptions:
            self.user_subscriptions[user_id].discard(task_id)
        
        if task_id in self.task_subscribers:
            self.task_subscribers[task_id].discard(user_id)
            if not self.task_subscribers[task_id]:
                del self.task_subscribers[task_id]
    
    async def broadcast_task_update(self, task_id: str, update_type: str, update_data: Dict[str, Any], 
                                  changed_by_user_id: Optional[str] = None):
        """Broadcast task update to all subscribers"""
        if task_id not in self.task_subscribers:
            return
        
        async for session in get_async_session():
            try:
                # Get full task details
                task_data = await self._get_task_with_details(session, task_id)
                if not task_data:
                    return
                
                # Get task history for this update
                history_data = await self._get_latest_task_history(session, task_id)
                
                # Prepare update message
                message = {
                    "type": "task_updated",
                    "update_type": update_type,
                    "task_id": task_id,
                    "task_data": task_data,
                    "update_data": update_data,
                    "history": history_data,
                    "changed_by": changed_by_user_id,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                
                # Send to all subscribers
                subscribers = self.task_subscribers[task_id].copy()
                for user_id in subscribers:
                    await self._send_to_user(user_id, message)
                
                # Also check for dependent tasks and notify their subscribers
                await self._notify_dependent_tasks(session, task_id, update_type, update_data)
                break
                
            except Exception as e:
                logger.error(f"Error broadcasting task update: {e}")
    
    async def broadcast_task_created(self, task_id: str, created_by_user_id: str):
        """Broadcast new task creation"""
        async for session in get_async_session():
            try:
                task_data = await self._get_task_with_details(session, task_id)
                if not task_data:
                    return
                
                # Notify all active users (you might want to filter this based on project membership)
                message = {
                    "type": "task_created",
                    "task_id": task_id,
                    "task_data": task_data,
                    "created_by": created_by_user_id,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                
                # Send to all connected users (or filter by project)
                await self._broadcast_to_all_users(message)
                break
                
            except Exception as e:
                logger.error(f"Error broadcasting task creation: {e}")
    
    async def broadcast_task_deleted(self, task_id: str, deleted_by_user_id: str, task_title: str):
        """Broadcast task deletion"""
        message = {
            "type": "task_deleted",
            "task_id": task_id,
            "task_title": task_title,
            "deleted_by": deleted_by_user_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Send to all subscribers
        if task_id in self.task_subscribers:
            subscribers = self.task_subscribers[task_id].copy()
            for user_id in subscribers:
                await self._send_to_user(user_id, message)
            
            # Clean up subscriptions
            del self.task_subscribers[task_id]
            for user_id in subscribers:
                if user_id in self.user_subscriptions:
                    self.user_subscriptions[user_id].discard(task_id)
    
    async def send_task_analytics_update(self, user_id: str, analytics_data: Dict[str, Any]):
        """Send task analytics update to specific user"""
        message = {
            "type": "analytics_updated",
            "data": analytics_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await self._send_to_user(user_id, message)
    
    async def broadcast_milestone_update(self, milestone_id: str, update_type: str, 
                                       related_task_ids: List[str], update_data: Dict[str, Any]):
        """Broadcast milestone updates to subscribers of related tasks"""
        message = {
            "type": "milestone_updated",
            "update_type": update_type,
            "milestone_id": milestone_id,
            "related_task_ids": related_task_ids,
            "update_data": update_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Collect all subscribers of related tasks
        all_subscribers = set()
        for task_id in related_task_ids:
            if task_id in self.task_subscribers:
                all_subscribers.update(self.task_subscribers[task_id])
        
        # Send to all relevant subscribers
        for user_id in all_subscribers:
            await self._send_to_user(user_id, message)
    
    async def _get_task_with_details(self, session: AsyncSession, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task with all related details"""
        try:
            stmt = select(Task).options(
                selectinload(Task.assignee),
                selectinload(Task.created_by_user),
                selectinload(Task.dependencies),
                selectinload(Task.dependents)
            ).where(Task.id == task_id)
            
            result = await session.execute(stmt)
            task = result.scalar_one_or_none()
            
            if not task:
                return None
            
            return {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat(),
                "assignee": {
                    "id": task.assignee.id,
                    "username": task.assignee.username,
                    "email": task.assignee.email
                } if task.assignee else None,
                "created_by": {
                    "id": task.created_by_user.id,
                    "username": task.created_by_user.username,
                    "email": task.created_by_user.email
                } if task.created_by_user else None,
                "dependencies": [
                    {
                        "id": dep.dependency_id,
                        "title": dep.dependency.title,
                        "status": dep.dependency.status
                    } for dep in task.dependencies
                ],
                "dependents": [
                    {
                        "id": dep.task_id,
                        "title": dep.task.title,
                        "status": dep.task.status
                    } for dep in task.dependents
                ],
                "progress_percentage": task.progress_percentage,
                "estimated_hours": task.estimated_hours,
                "actual_hours": task.actual_hours,
                "tags": task.tags or []
            }
            
        except Exception as e:
            logger.error(f"Error getting task details: {e}")
            return None
    
    async def _get_latest_task_history(self, session: AsyncSession, task_id: str) -> Optional[Dict[str, Any]]:
        """Get latest task history entry"""
        try:
            stmt = select(TaskHistory).options(
                selectinload(TaskHistory.changed_by_user)
            ).where(
                TaskHistory.task_id == task_id
            ).order_by(TaskHistory.changed_at.desc()).limit(1)
            
            result = await session.execute(stmt)
            history = result.scalar_one_or_none()
            
            if not history:
                return None
            
            return {
                "id": history.id,
                "field_name": history.field_name,
                "old_value": history.old_value,
                "new_value": history.new_value,
                "changed_at": history.changed_at.isoformat(),
                "changed_by": {
                    "id": history.changed_by_user.id,
                    "username": history.changed_by_user.username,
                    "email": history.changed_by_user.email
                } if history.changed_by_user else None
            }
            
        except Exception as e:
            logger.error(f"Error getting task history: {e}")
            return None
    
    async def _notify_dependent_tasks(self, session: AsyncSession, task_id: str, 
                                    update_type: str, update_data: Dict[str, Any]):
        """Notify subscribers of dependent tasks about status changes"""
        try:
            # Get all tasks that depend on this task
            stmt = select(TaskDependency).options(
                selectinload(TaskDependency.task)
            ).where(TaskDependency.dependency_id == task_id)
            
            result = await session.execute(stmt)
            dependencies = result.scalars().all()
            
            for dep in dependencies:
                dependent_task_id = dep.task_id
                
                if dependent_task_id in self.task_subscribers:
                    message = {
                        "type": "dependency_updated",
                        "dependent_task_id": dependent_task_id,
                        "dependency_task_id": task_id,
                        "update_type": update_type,
                        "update_data": update_data,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
                    
                    subscribers = self.task_subscribers[dependent_task_id].copy()
                    for user_id in subscribers:
                        await self._send_to_user(user_id, message)
            
        except Exception as e:
            logger.error(f"Error notifying dependent tasks: {e}")
    
    async def _send_to_user(self, user_id: str, message: Dict[str, Any]):
        """Send message to all connections for a specific user"""
        user_connections = [key for key in self.connections.keys() if key.startswith(f"{user_id}:")]
        
        for connection_key in user_connections:
            await self._send_to_connection(connection_key, message)
    
    async def _send_to_connection(self, connection_key: str, message: Dict[str, Any]):
        """Send message to a specific connection"""
        if connection_key not in self.connections:
            return
        
        try:
            websocket = self.connections[connection_key]
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending message to {connection_key}: {e}")
            # Clean up broken connection
            if connection_key in self.connections:
                del self.connections[connection_key]
    
    async def _broadcast_to_all_users(self, message: Dict[str, Any]):
        """Broadcast message to all connected users"""
        for connection_key in list(self.connections.keys()):
            await self._send_to_connection(connection_key, message)
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get WebSocket connection statistics"""
        return {
            "total_connections": len(self.connections),
            "unique_users": len(self.user_subscriptions),
            "total_subscriptions": sum(len(subs) for subs in self.user_subscriptions.values()),
            "tasks_with_subscribers": len(self.task_subscribers),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

# Global instance
task_update_manager = TaskUpdateManager()

async def handle_websocket_connection(websocket: WebSocket, user_id: str, client_id: str):
    """Handle WebSocket connection lifecycle"""
    await task_update_manager.connect(websocket, user_id, client_id)
    
    try:
        while True:
            # Listen for client messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            if message_type == "subscribe_task":
                task_id = message.get("task_id")
                if task_id:
                    await task_update_manager.subscribe_to_task(user_id, task_id)
            
            elif message_type == "unsubscribe_task":
                task_id = message.get("task_id")
                if task_id:
                    await task_update_manager.unsubscribe_from_task(user_id, task_id)
            
            elif message_type == "ping":
                await websocket.send_text(json.dumps({
                    "type": "pong",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }))
            
            elif message_type == "get_stats":
                stats = task_update_manager.get_connection_stats()
                await websocket.send_text(json.dumps({
                    "type": "stats",
                    "data": stats
                }))
    
    except WebSocketDisconnect:
        task_update_manager.disconnect(user_id, client_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        task_update_manager.disconnect(user_id, client_id)
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict
import uuid
import logging

class TaskStatus(Enum):
    CREATED = "created"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    REVIEW = "review"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class EventType(Enum):
    CREATED = "created"
    STATUS_CHANGED = "status_changed"
    ASSIGNED = "assigned"
    UNASSIGNED = "unassigned"
    PRIORITY_CHANGED = "priority_changed"
    DUE_DATE_CHANGED = "due_date_changed"
    COMMENT_ADDED = "comment_added"
    ATTACHMENT_ADDED = "attachment_added"
    DEPENDENCY_ADDED = "dependency_added"
    DEPENDENCY_REMOVED = "dependency_removed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

@dataclass
class LifecycleEvent:
    id: str
    task_id: str
    event_type: EventType
    timestamp: datetime
    user_id: Optional[str]
    old_value: Optional[Any]
    new_value: Optional[Any]
    metadata: Dict[str, Any]
    
    def to_dict(self):
        data = asdict(self)
        data['event_type'] = self.event_type.value
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class TaskMetrics:
    task_id: str
    total_events: int
    creation_date: datetime
    completion_date: Optional[datetime]
    total_time_spent: Optional[timedelta]
    time_in_status: Dict[str, timedelta]
    assignment_count: int
    status_changes: int
    blocked_time: Optional[timedelta]
    
    def to_dict(self):
        data = asdict(self)
        data['creation_date'] = self.creation_date.isoformat()
        data['completion_date'] = self.completion_date.isoformat() if self.completion_date else None
        data['total_time_spent'] = str(self.total_time_spent) if self.total_time_spent else None
        data['time_in_status'] = {k: str(v) for k, v in self.time_in_status.items()}
        data['blocked_time'] = str(self.blocked_time) if self.blocked_time else None
        return data

class LifecycleService:
    def __init__(self):
        self.events: Dict[str, List[LifecycleEvent]] = {}
        self.task_current_status: Dict[str, TaskStatus] = {}
        self.task_assignments: Dict[str, Optional[str]] = {}
        self.logger = logging.getLogger(__name__)
    
    def record_event(
        self,
        task_id: str,
        event_type: EventType,
        user_id: Optional[str] = None,
        old_value: Optional[Any] = None,
        new_value: Optional[Any] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> LifecycleEvent:
        """Record a lifecycle event for a task"""
        event = LifecycleEvent(
            id=str(uuid.uuid4()),
            task_id=task_id,
            event_type=event_type,
            timestamp=datetime.utcnow(),
            user_id=user_id,
            old_value=old_value,
            new_value=new_value,
            metadata=metadata or {}
        )
        
        if task_id not in self.events:
            self.events[task_id] = []
        
        self.events[task_id].append(event)
        
        # Update current state tracking
        if event_type == EventType.STATUS_CHANGED and new_value:
            self.task_current_status[task_id] = TaskStatus(new_value)
        elif event_type == EventType.ASSIGNED and new_value:
            self.task_assignments[task_id] = new_value
        elif event_type == EventType.UNASSIGNED:
            self.task_assignments[task_id] = None
        
        self.logger.info(f"Recorded event {event_type.value} for task {task_id}")
        return event
    
    def get_task_events(self, task_id: str) -> List[LifecycleEvent]:
        """Get all events for a specific task"""
        return self.events.get(task_id, [])
    
    def get_task_timeline(self, task_id: str) -> List[Dict[str, Any]]:
        """Get formatted timeline for a task"""
        events = self.get_task_events(task_id)
        timeline = []
        
        for event in sorted(events, key=lambda x: x.timestamp):
            timeline_item = {
                'id': event.id,
                'timestamp': event.timestamp.isoformat(),
                'event_type': event.event_type.value,
                'user_id': event.user_id,
                'description': self._generate_event_description(event),
                'metadata': event.metadata
            }
            timeline.append(timeline_item)
        
        return timeline
    
    def get_task_metrics(self, task_id: str) -> Optional[TaskMetrics]:
        """Calculate comprehensive metrics for a task"""
        events = self.get_task_events(task_id)
        if not events:
            return None
        
        events_sorted = sorted(events, key=lambda x: x.timestamp)
        creation_event = next((e for e in events_sorted if e.event_type == EventType.CREATED), None)
        completion_event = next((e for e in events_sorted if e.event_type == EventType.COMPLETED), None)
        
        if not creation_event:
            return None
        
        # Calculate time in each status
        time_in_status = self._calculate_time_in_status(events_sorted)
        
        # Calculate blocked time
        blocked_time = self._calculate_blocked_time(events_sorted)
        
        # Count assignments and status changes
        assignment_count = len([e for e in events if e.event_type == EventType.ASSIGNED])
        status_changes = len([e for e in events if e.event_type == EventType.STATUS_CHANGED])
        
        # Calculate total time spent
        total_time_spent = None
        if completion_event:
            total_time_spent = completion_event.timestamp - creation_event.timestamp
        
        return TaskMetrics(
            task_id=task_id,
            total_events=len(events),
            creation_date=creation_event.timestamp,
            completion_date=completion_event.timestamp if completion_event else None,
            total_time_spent=total_time_spent,
            time_in_status=time_in_status,
            assignment_count=assignment_count,
            status_changes=status_changes,
            blocked_time=blocked_time
        )
    
    def get_user_activity(self, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get user activity across all tasks"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        user_events = []
        
        for task_id, events in self.events.items():
            for event in events:
                if (event.user_id == user_id and 
                    event.timestamp >= cutoff_date):
                    user_events.append({
                        'task_id': task_id,
                        'event': event.to_dict(),
                        'description': self._generate_event_description(event)
                    })
        
        return sorted(user_events, key=lambda x: x['event']['timestamp'], reverse=True)
    
    def get_status_distribution(self, task_ids: List[str]) -> Dict[str, int]:
        """Get current status distribution for given tasks"""
        status_counts = {}
        for status in TaskStatus:
            status_counts[status.value] = 0
        
        for task_id in task_ids:
            current_status = self.task_current_status.get(task_id, TaskStatus.CREATED)
            status_counts[current_status.value] += 1
        
        return status_counts
    
    def get_velocity_metrics(self, days: int = 30) -> Dict[str, Any]:
        """Calculate team velocity metrics"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        completed_tasks = []
        created_tasks = []
        
        for task_id, events in self.events.items():
            for event in events:
                if event.timestamp >= cutoff_date:
                    if event.event_type == EventType.COMPLETED:
                        completed_tasks.append(task_id)
                    elif event.event_type == EventType.CREATED:
                        created_tasks.append(task_id)
        
        return {
            'period_days': days,
            'tasks_completed': len(completed_tasks),
            'tasks_created': len(created_tasks),
            'completion_rate': len(completed_tasks) / max(len(created_tasks), 1),
            'avg_completion_per_day': len(completed_tasks) / days
        }
    
    def get_bottleneck_analysis(self) -> Dict[str, Any]:
        """Analyze bottlenecks in the workflow"""
        status_times = {status.value: [] for status in TaskStatus}
        blocked_tasks = []
        
        for task_id, events in self.events.items():
            metrics = self.get_task_metrics(task_id)
            if metrics:
                for status, time_spent in metrics.time_in_status.items():
                    if status in status_times:
                        status_times[status].append(time_spent.total_seconds())
                
                if metrics.blocked_time and metrics.blocked_time.total_seconds() > 0:
                    blocked_tasks.append({
                        'task_id': task_id,
                        'blocked_time': metrics.blocked_time.total_seconds()
                    })
        
        # Calculate average time in each status
        avg_status_times = {}
        for status, times in status_times.items():
            if times:
                avg_status_times[status] = sum(times) / len(times)
            else:
                avg_status_times[status] = 0
        
        return {
            'avg_time_per_status': avg_status_times,
            'bottleneck_status': max(avg_status_times, key=avg_status_times.get),
            'blocked_tasks_count': len(blocked_tasks),
            'total_blocked_time': sum(t['blocked_time'] for t in blocked_tasks)
        }
    
    def _generate_event_description(self, event: LifecycleEvent) -> str:
        """Generate human-readable description for an event"""
        descriptions = {
            EventType.CREATED: "Task was created",
            EventType.STATUS_CHANGED: f"Status changed from {event.old_value} to {event.new_value}",
            EventType.ASSIGNED: f"Task assigned to user {event.new_value}",
            EventType.UNASSIGNED: "Task was unassigned",
            EventType.PRIORITY_CHANGED: f"Priority changed from {event.old_value} to {event.new_value}",
            EventType.DUE_DATE_CHANGED: f"Due date changed from {event.old_value} to {event.new_value}",
            EventType.COMMENT_ADDED: "Comment was added",
            EventType.ATTACHMENT_ADDED: "Attachment was added",
            EventType.DEPENDENCY_ADDED: f"Dependency added: {event.new_value}",
            EventType.DEPENDENCY_REMOVED: f"Dependency removed: {event.old_value}",
            EventType.COMPLETED: "Task was completed",
            EventType.CANCELLED: "Task was cancelled"
        }
        
        return descriptions.get(event.event_type, f"Unknown event: {event.event_type.value}")
    
    def _calculate_time_in_status(self, events: List[LifecycleEvent]) -> Dict[str, timedelta]:
        """Calculate time spent in each status"""
        time_in_status = {status.value: timedelta() for status in TaskStatus}
        current_status = TaskStatus.CREATED
        status_start_time = events[0].timestamp
        
        for event in events:
            if event.event_type == EventType.STATUS_CHANGED and event.new_value:
                # Add time for previous status
                time_in_status[current_status.value] += event.timestamp - status_start_time
                
                # Update to new status
                current_status = TaskStatus(event.new_value)
                status_start_time = event.timestamp
        
        # Add time for current status (if not completed)
        completion_event = next((e for e in events if e.event_type == EventType.COMPLETED), None)
        end_time = completion_event.timestamp if completion_event else datetime.utcnow()
        time_in_status[current_status.value] += end_time - status_start_time
        
        return time_in_status
    
    def _calculate_blocked_time(self, events: List[LifecycleEvent]) -> Optional[timedelta]:
        """Calculate total time task was blocked"""
        blocked_time = timedelta()
        blocked_start = None
        
        for event in events:
            if (event.event_type == EventType.STATUS_CHANGED and 
                event.new_value == TaskStatus.BLOCKED.value):
                blocked_start = event.timestamp
            elif (blocked_start and event.event_type == EventType.STATUS_CHANGED and 
                  event.new_value != TaskStatus.BLOCKED.value):
                blocked_time += event.timestamp - blocked_start
                blocked_start = None
        
        # If still blocked
        if blocked_start:
            blocked_time += datetime.utcnow() - blocked_start
        
        return blocked_time if blocked_time.total_seconds() > 0 else None
    
    def export_task_history(self, task_id: str) -> Dict[str, Any]:
        """Export complete task history for reporting"""
        events = self.get_task_events(task_id)
        metrics = self.get_task_metrics(task_id)
        timeline = self.get_task_timeline(task_id)
        
        return {
            'task_id': task_id,
            'total_events': len(events),
            'timeline': timeline,
            'metrics': metrics.to_dict() if metrics else None,
            'current_status': self.task_current_status.get(task_id, TaskStatus.CREATED).value,
            'current_assignee': self.task_assignments.get(task_id),
            'export_timestamp': datetime.utcnow().isoformat()
        }
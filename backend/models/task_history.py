from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .base import Base

class TaskActionType(enum.Enum):
    CREATED = "created"
    UPDATED = "updated"
    STATUS_CHANGED = "status_changed"
    ASSIGNED = "assigned"
    UNASSIGNED = "unassigned"
    PRIORITY_CHANGED = "priority_changed"
    DUE_DATE_CHANGED = "due_date_changed"
    DESCRIPTION_CHANGED = "description_changed"
    COMMENT_ADDED = "comment_added"
    FILE_ATTACHED = "file_attached"
    FILE_REMOVED = "file_removed"
    DELETED = "deleted"
    RESTORED = "restored"

class TaskHistory(Base):
    __tablename__ = "task_history"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(Enum(TaskActionType), nullable=False)
    field_name = Column(String(100), nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    # Relationships
    task = relationship("Task", back_populates="history")
    user = relationship("User", back_populates="task_history")

    def __repr__(self):
        return f"<TaskHistory(id={self.id}, task_id={self.task_id}, action={self.action.value}, timestamp={self.timestamp})>"

    @classmethod
    def log_action(cls, task_id, user_id, action, field_name=None, old_value=None, new_value=None, description=None, ip_address=None, user_agent=None):
        """Create a new task history entry"""
        return cls(
            task_id=task_id,
            user_id=user_id,
            action=action,
            field_name=field_name,
            old_value=str(old_value) if old_value is not None else None,
            new_value=str(new_value) if new_value is not None else None,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent
        )

    def to_dict(self):
        """Convert history entry to dictionary"""
        return {
            "id": self.id,
            "task_id": self.task_id,
            "user_id": self.user_id,
            "user_name": self.user.username if self.user else None,
            "action": self.action.value,
            "field_name": self.field_name,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "description": self.description,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent
        }
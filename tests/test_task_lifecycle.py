import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
import json

from task_lifecycle import (
    TaskLifecycleTracker, TaskLifecycleDashboard, 
    TaskState, TaskTransition, LifecycleMetrics,
    TaskCreatedEvent, TaskAssignedEvent, TaskStartedEvent,
    TaskCompletedEvent, TaskCancelledEvent, TaskBlockedEvent
)


class TestTaskLifecycleTracker:
    
    def setup_method(self):
        self.tracker = TaskLifecycleTracker()
    
    def test_create_task(self):
        task_id = self.tracker.create_task(
            title="Test Task",
            description="Test Description",
            assignee="user1",
            priority="high",
            tags=["backend", "urgent"]
        )
        
        assert task_id is not None
        task = self.tracker.get_task(task_id)
        assert task.title == "Test Task"
        assert task.state == TaskState.CREATED
        assert task.assignee == "user1"
        assert task.priority == "high"
        assert "backend" in task.tags
    
    def test_task_state_transitions(self):
        task_id = self.tracker.create_task("Test Task", assignee="user1")
        
        # Test valid transitions
        assert self.tracker.assign_task(task_id, "user2") == True
        task = self.tracker.get_task(task_id)
        assert task.state == TaskState.ASSIGNED
        assert task.assignee == "user2"
        
        assert self.tracker.start_task(task_id) == True
        task = self.tracker.get_task(task_id)
        assert task.state == TaskState.IN_PROGRESS
        
        assert self.tracker.complete_task(task_id) == True
        task = self.tracker.get_task(task_id)
        assert task.state == TaskState.COMPLETED
        assert task.completed_at is not None
    
    def test_invalid_state_transitions(self):
        task_id = self.tracker.create_task("Test Task")
        
        # Try to complete task without starting it
        assert self.tracker.complete_task(task_id) == False
        task = self.tracker.get_task(task_id)
        assert task.state == TaskState.CREATED
    
    def test_block_and_unblock_task(self):
        task_id = self.tracker.create_task("Test Task", assignee="user1")
        self.tracker.start_task(task_id)
        
        # Block task
        assert self.tracker.block_task(task_id, "Waiting for dependency") == True
        task = self.tracker.get_task(task_id)
        assert task.state == TaskState.BLOCKED
        assert task.blocked_reason == "Waiting for dependency"
        
        # Unblock task
        assert self.tracker.unblock_task(task_id) == True
        task = self.tracker.get_task(task_id)
        assert task.state == TaskState.IN_PROGRESS
        assert task.blocked_reason is None
    
    def test_cancel_task(self):
        task_id = self.tracker.create_task("Test Task", assignee="user1")
        self.tracker.start_task(task_id)
        
        assert self.tracker.cancel_task(task_id, "Requirements changed") == True
        task = self.tracker.get_task(task_id)
        assert task.state == TaskState.CANCELLED
        assert task.cancelled_reason == "Requirements changed"
    
    def test_task_history_tracking(self):
        task_id = self.tracker.create_task("Test Task", assignee="user1")
        self.tracker.assign_task(task_id, "user2")
        self.tracker.start_task(task_id)
        self.tracker.complete_task(task_id)
        
        history = self.tracker.get_task_history(task_id)
        assert len(history) == 4
        
        # Check transition types
        transition_types = [t.from_state for t in history]
        expected_types = [None, TaskState.CREATED, TaskState.ASSIGNED, TaskState.IN_PROGRESS]
        assert transition_types == expected_types
    
    def test_add_task_comment(self):
        task_id = self.tracker.create_task("Test Task")
        
        self.tracker.add_comment(task_id, "user1", "This is a test comment")
        self.tracker.add_comment(task_id, "user2", "Another comment")
        
        task = self.tracker.get_task(task_id)
        assert len(task.comments) == 2
        assert task.comments[0].author == "user1"
        assert task.comments[0].content == "This is a test comment"
        assert task.comments[1].author == "user2"
    
    def test_update_task_estimate(self):
        task_id = self.tracker.create_task("Test Task")
        
        self.tracker.update_estimate(task_id, 8.0)  # 8 hours
        task = self.tracker.get_task(task_id)
        assert task.estimated_hours == 8.0
        
        # Update with actual time when completing
        self.tracker.start_task(task_id)
        self.tracker.log_time(task_id, 6.5)  # Actual 6.5 hours
        self.tracker.complete_task(task_id)
        
        task = self.tracker.get_task(task_id)
        assert task.actual_hours == 6.5
    
    def test_task_dependencies(self):
        task1_id = self.tracker.create_task("Task 1")
        task2_id = self.tracker.create_task("Task 2")
        
        self.tracker.add_dependency(task2_id, task1_id)
        
        task2 = self.tracker.get_task(task2_id)
        assert task1_id in task2.dependencies
        
        # Should not be able to start task2 until task1 is complete
        assert self.tracker.start_task(task2_id) == False
        
        # Complete task1, then task2 should be startable
        self.tracker.start_task(task1_id)
        self.tracker.complete_task(task1_id)
        assert self.tracker.start_task(task2_id) == True
    
    def test_task_filtering(self):
        # Create various tasks
        task1_id = self.tracker.create_task("Task 1", assignee="user1", priority="high")
        task2_id = self.tracker.create_task("Task 2", assignee="user2", priority="low")
        task3_id = self.tracker.create_task("Task 3", assignee="user1", priority="medium")
        
        self.tracker.start_task(task1_id)
        self.tracker.complete_task(task2_id)
        
        # Filter by assignee
        user1_tasks = self.tracker.get_tasks_by_assignee("user1")
        assert len(user1_tasks) == 2
        
        # Filter by state
        in_progress_tasks = self.tracker.get_tasks_by_state(TaskState.IN_PROGRESS)
        assert len(in_progress_tasks) == 1
        assert in_progress_tasks[0].id == task1_id
        
        # Filter by priority
        high_priority_tasks = self.tracker.get_tasks_by_priority("high")
        assert len(high_priority_tasks) == 1
        assert high_priority_tasks[0].id == task1_id


class TestTaskLifecycleDashboard:
    
    def setup_method(self):
        self.tracker = TaskLifecycleTracker()
        self.dashboard = TaskLifecycleDashboard(self.tracker)
        self._create_sample_tasks()
    
    def _create_sample_tasks(self):
        """Create sample tasks for testing"""
        # Completed tasks
        for i in range(5):
            task_id = self.tracker.create_task(f"Completed Task {i}", assignee=f"user{i%3}")
            self.tracker.start_task(task_id)
            self.tracker.complete_task(task_id)
        
        # In-progress tasks
        for i in range(3):
            task_id = self.tracker.create_task(f"In Progress Task {i}", assignee=f"user{i%2}")
            self.tracker.start_task(task_id)
        
        # Created tasks
        for i in range(2):
            task_id = self.tracker.create_task(f"Created Task {i}", assignee="user1")
        
        # Blocked task
        task_id = self.tracker.create_task("Blocked Task", assignee="user2")
        self.tracker.start_task(task_id)
        self.tracker.block_task(task_id, "Waiting for review")
        
        # Cancelled task
        task_id = self.tracker.create_task("Cancelled Task", assignee="user1")
        self.tracker.cancel_task(task_id, "No longer needed")
    
    def test_get_overview_metrics(self):
        metrics = self.dashboard.get_overview_metrics()
        
        assert metrics.total_tasks == 12
        assert metrics.completed_tasks == 5
        assert metrics.in_progress_tasks == 3
        assert metrics.blocked_tasks == 1
        assert metrics.cancelled_tasks == 1
        assert abs(metrics.completion_rate - (5/12)) < 0.01
    
    def test_get_state_distribution(self):
        distribution = self.dashboard.get_state_distribution()
        
        assert distribution[TaskState.COMPLETED] == 5
        assert distribution[TaskState.IN_PROGRESS] == 3
        assert distribution[TaskState.CREATED] == 2
        assert distribution[TaskState.BLOCKED] == 1
        assert distribution[TaskState.CANCELLED] == 1
    
    def test_get_assignee_workload(self):
        workload = self.dashboard.get_assignee_workload()
        
        assert "user1" in workload
        assert "user2" in workload
        assert workload["user1"]["total"] >= 4  # At least 4 tasks
        assert workload["user1"]["active"] >= 1  # At least 1 active task
    
    def test_get_velocity_metrics(self):
        # Mock some time data for velocity calculation
        with patch('task_lifecycle.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime.now()
            mock_datetime.side_effect = lambda *args, **kw: datetime(*args, **kw)
            
            velocity = self.dashboard.get_velocity_metrics(days=7)
            
            assert "tasks_completed_last_7_days" in velocity
            assert "average_completion_time" in velocity
            assert "throughput" in velocity
    
    def test_get_bottleneck_analysis(self):
        bottlenecks = self.dashboard.get_bottleneck_analysis()
        
        assert "blocked_tasks" in bottlenecks
        assert "long_running_tasks" in bottlenecks
        assert "overloaded_assignees" in bottlenecks
        
        # Should identify the blocked task
        assert len(bottlenecks["blocked_tasks"]) >= 1
    
    def test_get_trend_analysis(self):
        trends = self.dashboard.get_trend_analysis(days=30)
        
        assert "daily_completions" in trends
        assert "daily_creations" in trends
        assert "completion_trend" in trends
        assert "creation_trend" in trends
    
    def test_export_dashboard_data(self):
        data = self.dashboard.export_dashboard_data()
        
        # Should contain all major sections
        assert "overview" in data
        assert "state_distribution" in data
        assert "assignee_workload" in data
        assert "velocity_metrics" in data
        assert "bottlenecks" in data
        assert "trends" in data
        assert "export_timestamp" in data
    
    def test_generate_report(self):
        report = self.dashboard.generate_report()
        
        assert "Task Lifecycle Dashboard Report" in report
        assert "Overview Metrics" in report
        assert "State Distribution" in report
        assert "Assignee Workload" in report
        
        # Should contain actual data
        assert "Total Tasks: 12" in report
        assert "Completed: 5" in report
    
    def test_get_task_aging_report(self):
        aging = self.dashboard.get_task_aging_report()
        
        assert "overdue_tasks" in aging
        assert "aging_buckets" in aging
        assert "average_age_by_state" in aging
    
    def test_get_performance_metrics(self):
        performance = self.dashboard.get_performance_metrics()
        
        assert "cycle_time" in performance
        assert "lead_time" in performance
        assert "throughput" in performance
        assert "work_in_progress" in performance


class TestTaskEvents:
    
    def test_task_created_event(self):
        event = TaskCreatedEvent("task123", "Test Task", "user1", {"priority": "high"})
        
        assert event.task_id == "task123"
        assert event.title == "Test Task"
        assert event.assignee == "user1"
        assert event.metadata["priority"] == "high"
        assert event.timestamp is not None
    
    def test_task_assigned_event(self):
        event = TaskAssignedEvent("task123", "user1", "user2")
        
        assert event.task_id == "task123"
        assert event.old_assignee == "user1"
        assert event.new_assignee == "user2"
    
    def test_task_started_event(self):
        event = TaskStartedEvent("task123", "user1")
        
        assert event.task_id == "task123"
        assert event.assignee == "user1"
    
    def test_task_completed_event(self):
        event = TaskCompletedEvent("task123", "user1", 8.5)
        
        assert event.task_id == "task123"
        assert event.assignee == "user1"
        assert event.actual_hours == 8.5
    
    def test_task_cancelled_event(self):
        event = TaskCancelledEvent("task123", "Requirements changed", "user1")
        
        assert event.task_id == "task123"
        assert event.reason == "Requirements changed"
        assert event.cancelled_by == "user1"
    
    def test_task_blocked_event(self):
        event = TaskBlockedEvent("task123", "Waiting for dependency", "user1")
        
        assert event.task_id == "task123"
        assert event.reason == "Waiting for dependency"
        assert event.blocked_by == "user1"


class TestLifecycleMetrics:
    
    def test_lifecycle_metrics_creation(self):
        metrics = LifecycleMetrics(
            total_tasks=100,
            completed_tasks=80,
            in_progress_tasks=15,
            blocked_tasks=3,
            cancelled_tasks=2,
            completion_rate=0.8,
            average_cycle_time=5.2,
            average_lead_time=7.8
        )
        
        assert metrics.total_tasks == 100
        assert metrics.completion_rate == 0.8
        assert metrics.average_cycle_time == 5.2
    
    def test_metrics_calculations(self):
        metrics = LifecycleMetrics(
            total_tasks=100,
            completed_tasks=75,
            in_progress_tasks=20,
            blocked_tasks=3,
            cancelled_tasks=2
        )
        
        # Test calculated properties
        assert metrics.active_tasks == 23  # in_progress + blocked
        assert metrics.completion_rate == 0.75
        assert metrics.blocked_rate == 0.03


class TestTaskIntegration:
    
    def setup_method(self):
        self.tracker = TaskLifecycleTracker()
        self.dashboard = TaskLifecycleDashboard(self.tracker)
    
    def test_complete_workflow(self):
        """Test a complete task workflow from creation to completion"""
        
        # Create task
        task_id = self.tracker.create_task(
            title="Complete Workflow Test",
            description="Test the complete workflow",
            assignee="developer1",
            priority="high",
            tags=["test", "integration"]
        )
        
        # Add estimate
        self.tracker.update_estimate(task_id, 10.0)
        
        # Add comments
        self.tracker.add_comment(task_id, "developer1", "Starting work on this task")
        
        # Start task
        assert self.tracker.start_task(task_id) == True
        
        # Log some time
        self.tracker.log_time(task_id, 3.0)
        
        # Block task temporarily
        assert self.tracker.block_task(task_id, "Waiting for code review") == True
        
        # Add comment while blocked
        self.tracker.add_comment(task_id, "reviewer1", "Code review completed")
        
        # Unblock task
        assert self.tracker.unblock_task(task_id) == True
        
        # Log more time
        self.tracker.log_time(task_id, 5.0)
        
        # Complete task
        assert self.tracker.complete_task(task_id) == True
        
        # Verify final state
        task = self.tracker.get_task(task_id)
        assert task.state == TaskState.COMPLETED
        assert task.estimated_hours == 10.0
        assert task.actual_hours == 8.0
        assert len(task.comments) == 2
        
        # Verify history
        history = self.tracker.get_task_history(task_id)
        state_sequence = [t.to_state for t in history]
        expected_sequence = [TaskState.CREATED, TaskState.IN_PROGRESS, TaskState.BLOCKED, TaskState.IN_PROGRESS, TaskState.COMPLETED]
        assert state_sequence == expected_sequence
        
        # Verify dashboard metrics
        metrics = self.dashboard.get_overview_metrics()
        assert metrics.total_tasks == 1
        assert metrics.completed_tasks == 1
        assert metrics.completion_rate == 1.0
    
    def test_bulk_operations(self):
        """Test handling of multiple tasks"""
        
        task_ids = []
        
        # Create multiple tasks
        for i in range(10):
            task_id = self.tracker.create_task(
                title=f"Bulk Task {i}",
                assignee=f"user{i % 3}",
                priority=["low", "medium", "high"][i % 3]
            )
            task_ids.append(task_id)
        
        # Process tasks in various states
        for i, task_id in enumerate(task_ids):
            if i < 5:
                self.tracker.start_task(task_id)
                if i < 3:
                    self.tracker.complete_task(task_id)
            elif i == 8:
                self.tracker.cancel_task(task_id, "Not needed")
            elif i == 9:
                self.tracker.start_task(task_id)
                self.tracker.block_task(task_id, "Blocked")
        
        # Verify metrics
        metrics = self.dashboard.get_overview_metrics()
        assert metrics.total_tasks == 10
        assert metrics.completed_tasks == 3
        assert metrics.in_progress_tasks == 3
        assert metrics.blocked_tasks == 1
        assert metrics.cancelled_tasks == 1
        
        # Test filtering
        user0_tasks = self.tracker.get_tasks_by_assignee("user0")
        assert len(user0_tasks) >= 3
        
        completed_tasks = self.tracker.get_tasks_by_state(TaskState.COMPLETED)
        assert len(completed_tasks) == 3
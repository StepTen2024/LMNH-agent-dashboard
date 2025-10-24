import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
import json
from fastapi.testclient import TestClient
from app.api.dashboard import router
from app.models.task import TaskStatus, Task
from app.models.execution import ExecutionLog
from app.models.metrics import TaskMetrics
from app.services.dashboard import DashboardService
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)
client = TestClient(app)

@pytest.fixture
def mock_dashboard_service():
    with patch('app.api.dashboard.dashboard_service') as mock:
        yield mock

@pytest.fixture
def sample_tasks():
    return [
        {
            "id": "task-1",
            "name": "Test Task 1",
            "status": TaskStatus.COMPLETED,
            "created_at": datetime.now() - timedelta(hours=2),
            "updated_at": datetime.now() - timedelta(minutes=30),
            "priority": "high",
            "tags": ["critical", "production"]
        },
        {
            "id": "task-2", 
            "name": "Test Task 2",
            "status": TaskStatus.RUNNING,
            "created_at": datetime.now() - timedelta(hours=1),
            "updated_at": datetime.now() - timedelta(minutes=10),
            "priority": "medium",
            "tags": ["development"]
        }
    ]

@pytest.fixture
def sample_execution_logs():
    return [
        {
            "id": "log-1",
            "task_id": "task-1",
            "timestamp": datetime.now() - timedelta(minutes=30),
            "level": "INFO",
            "message": "Task completed successfully",
            "metadata": {"duration": 1800}
        },
        {
            "id": "log-2",
            "task_id": "task-2",
            "timestamp": datetime.now() - timedelta(minutes=10),
            "level": "DEBUG",
            "message": "Processing batch 2/5",
            "metadata": {"progress": 40}
        }
    ]

@pytest.fixture
def sample_metrics():
    return {
        "total_tasks": 150,
        "completed_tasks": 120,
        "running_tasks": 25,
        "failed_tasks": 5,
        "average_duration": 1200.5,
        "success_rate": 0.96,
        "throughput": 15.2
    }

class TestDashboardOverview:
    def test_get_dashboard_overview_success(self, mock_dashboard_service, sample_tasks, sample_metrics):
        mock_dashboard_service.get_overview.return_value = {
            "metrics": sample_metrics,
            "recent_tasks": sample_tasks[:5],
            "status_distribution": {
                "completed": 120,
                "running": 25,
                "failed": 5
            }
        }
        
        response = client.get("/dashboard/overview")
        
        assert response.status_code == 200
        data = response.json()
        assert "metrics" in data
        assert "recent_tasks" in data
        assert "status_distribution" in data
        assert data["metrics"]["total_tasks"] == 150

    def test_get_dashboard_overview_with_filters(self, mock_dashboard_service):
        mock_dashboard_service.get_overview.return_value = {"filtered": True}
        
        response = client.get("/dashboard/overview?time_range=24h&status=completed")
        
        assert response.status_code == 200
        mock_dashboard_service.get_overview.assert_called_once_with(
            time_range="24h",
            status="completed",
            tags=None
        )

    def test_get_dashboard_overview_service_error(self, mock_dashboard_service):
        mock_dashboard_service.get_overview.side_effect = Exception("Service error")
        
        response = client.get("/dashboard/overview")
        
        assert response.status_code == 500

class TestTaskLifecycle:
    def test_get_task_lifecycle_success(self, mock_dashboard_service, sample_execution_logs):
        task_id = "task-1"
        mock_dashboard_service.get_task_lifecycle.return_value = {
            "task_id": task_id,
            "lifecycle_events": sample_execution_logs,
            "status_transitions": [
                {"from": "pending", "to": "running", "timestamp": datetime.now() - timedelta(hours=2)},
                {"from": "running", "to": "completed", "timestamp": datetime.now() - timedelta(minutes=30)}
            ],
            "duration_breakdown": {
                "pending": 300,
                "running": 1800,
                "total": 2100
            }
        }
        
        response = client.get(f"/dashboard/tasks/{task_id}/lifecycle")
        
        assert response.status_code == 200
        data = response.json()
        assert data["task_id"] == task_id
        assert "lifecycle_events" in data
        assert "status_transitions" in data
        assert "duration_breakdown" in data

    def test_get_task_lifecycle_not_found(self, mock_dashboard_service):
        task_id = "nonexistent-task"
        mock_dashboard_service.get_task_lifecycle.return_value = None
        
        response = client.get(f"/dashboard/tasks/{task_id}/lifecycle")
        
        assert response.status_code == 404

    def test_get_task_lifecycle_with_details(self, mock_dashboard_service):
        task_id = "task-1"
        mock_dashboard_service.get_task_lifecycle.return_value = {"detailed": True}
        
        response = client.get(f"/dashboard/tasks/{task_id}/lifecycle?include_logs=true&include_metrics=true")
        
        assert response.status_code == 200
        mock_dashboard_service.get_task_lifecycle.assert_called_once_with(
            task_id, 
            include_logs=True, 
            include_metrics=True
        )

class TestTaskMetrics:
    def test_get_task_metrics_success(self, mock_dashboard_service):
        metrics_data = {
            "performance": {
                "avg_duration": 1200,
                "min_duration": 300,
                "max_duration": 3600,
                "throughput": 10.5
            },
            "reliability": {
                "success_rate": 0.95,
                "failure_rate": 0.05,
                "retry_rate": 0.10
            },
            "trends": [
                {"date": "2023-01-01", "completed": 50, "failed": 2},
                {"date": "2023-01-02", "completed": 55, "failed": 1}
            ]
        }
        mock_dashboard_service.get_task_metrics.return_value = metrics_data
        
        response = client.get("/dashboard/metrics")
        
        assert response.status_code == 200
        data = response.json()
        assert "performance" in data
        assert "reliability" in data
        assert "trends" in data

    def test_get_task_metrics_with_grouping(self, mock_dashboard_service):
        mock_dashboard_service.get_task_metrics.return_value = {"grouped": True}
        
        response = client.get("/dashboard/metrics?group_by=priority&time_range=7d")
        
        assert response.status_code == 200
        mock_dashboard_service.get_task_metrics.assert_called_once_with(
            group_by="priority",
            time_range="7d",
            tags=None
        )

    def test_get_specific_task_metrics(self, mock_dashboard_service):
        task_id = "task-1"
        mock_dashboard_service.get_task_specific_metrics.return_value = {
            "task_id": task_id,
            "execution_count": 5,
            "avg_duration": 1500,
            "last_execution": datetime.now().isoformat()
        }
        
        response = client.get(f"/dashboard/tasks/{task_id}/metrics")
        
        assert response.status_code == 200
        data = response.json()
        assert data["task_id"] == task_id
        assert "execution_count" in data

class TestExecutionLogs:
    def test_get_execution_logs_success(self, mock_dashboard_service, sample_execution_logs):
        mock_dashboard_service.get_execution_logs.return_value = {
            "logs": sample_execution_logs,
            "total": 2,
            "page": 1,
            "per_page": 50
        }
        
        response = client.get("/dashboard/logs")
        
        assert response.status_code == 200
        data = response.json()
        assert "logs" in data
        assert data["total"] == 2
        assert len(data["logs"]) == 2

    def test_get_execution_logs_with_filters(self, mock_dashboard_service):
        mock_dashboard_service.get_execution_logs.return_value = {"filtered": True}
        
        response = client.get("/dashboard/logs?task_id=task-1&level=ERROR&page=2")
        
        assert response.status_code == 200
        mock_dashboard_service.get_execution_logs.assert_called_once_with(
            task_id="task-1",
            level="ERROR",
            page=2,
            per_page=50,
            start_time=None,
            end_time=None
        )

    def test_get_execution_logs_with_time_range(self, mock_dashboard_service):
        start_time = "2023-01-01T00:00:00Z"
        end_time = "2023-01-02T00:00:00Z"
        
        response = client.get(f"/dashboard/logs?start_time={start_time}&end_time={end_time}")
        
        assert response.status_code == 200
        mock_dashboard_service.get_execution_logs.assert_called_once()

class TestTraceability:
    def test_get_task_trace_success(self, mock_dashboard_service):
        task_id = "task-1"
        trace_data = {
            "task_id": task_id,
            "trace": [
                {"step": "input_validation", "timestamp": datetime.now() - timedelta(minutes=30), "status": "completed"},
                {"step": "processing", "timestamp": datetime.now() - timedelta(minutes=25), "status": "completed"},
                {"step": "output_generation", "timestamp": datetime.now() - timedelta(minutes=20), "status": "completed"}
            ],
            "dependencies": ["task-0"],
            "dependents": ["task-2", "task-3"]
        }
        mock_dashboard_service.get_task_trace.return_value = trace_data
        
        response = client.get(f"/dashboard/tasks/{task_id}/trace")
        
        assert response.status_code == 200
        data = response.json()
        assert data["task_id"] == task_id
        assert "trace" in data
        assert "dependencies" in data
        assert "dependents" in data

    def test_get_task_trace_not_found(self, mock_dashboard_service):
        task_id = "nonexistent-task"
        mock_dashboard_service.get_task_trace.return_value = None
        
        response = client.get(f"/dashboard/tasks/{task_id}/trace")
        
        assert response.status_code == 404

    def test_get_dependency_graph(self, mock_dashboard_service):
        graph_data = {
            "nodes": [
                {"id": "task-1", "name": "Task 1", "status": "completed"},
                {"id": "task-2", "name": "Task 2", "status": "running"}
            ],
            "edges": [
                {"from": "task-1", "to": "task-2", "type": "dependency"}
            ]
        }
        mock_dashboard_service.get_dependency_graph.return_value = graph_data
        
        response = client.get("/dashboard/dependencies")
        
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert "edges" in data

class TestRealTimeUpdates:
    def test_get_real_time_status(self, mock_dashboard_service):
        status_data = {
            "active_tasks": 15,
            "queued_tasks": 5,
            "system_load": 0.75,
            "memory_usage": 0.60,
            "last_update": datetime.now().isoformat()
        }
        mock_dashboard_service.get_real_time_status.return_value = status_data
        
        response = client.get("/dashboard/status")
        
        assert response.status_code == 200
        data = response.json()
        assert "active_tasks" in data
        assert "system_load" in data

    @patch('app.api.dashboard.WebSocket')
    def test_websocket_updates(self, mock_websocket, mock_dashboard_service):
        mock_dashboard_service.subscribe_to_updates.return_value = iter([
            {"type": "task_update", "data": {"task_id": "task-1", "status": "completed"}},
            {"type": "metrics_update", "data": {"throughput": 12.5}}
        ])
        
        with client.websocket_connect("/dashboard/ws") as websocket:
            data = websocket.receive_json()
            assert data["type"] in ["task_update", "metrics_update"]

class TestDashboardFilters:
    def test_get_available_filters(self, mock_dashboard_service):
        filters_data = {
            "statuses": ["pending", "running", "completed", "failed"],
            "priorities": ["low", "medium", "high", "critical"],
            "tags": ["production", "development", "test"],
            "time_ranges": ["1h", "24h", "7d", "30d"],
            "users": ["user1", "user2", "admin"]
        }
        mock_dashboard_service.get_available_filters.return_value = filters_data
        
        response = client.get("/dashboard/filters")
        
        assert response.status_code == 200
        data = response.json()
        assert "statuses" in data
        assert "priorities" in data
        assert "tags" in data

    def test_save_dashboard_view(self, mock_dashboard_service):
        view_config = {
            "name": "My Custom View",
            "filters": {
                "status": "running",
                "priority": "high",
                "time_range": "24h"
            },
            "layout": {
                "widgets": ["metrics", "recent_tasks", "logs"]
            }
        }
        mock_dashboard_service.save_dashboard_view.return_value = {"id": "view-1"}
        
        response = client.post("/dashboard/views", json=view_config)
        
        assert response.status_code == 201
        data = response.json()
        assert "id" in data

    def test_get_saved_views(self, mock_dashboard_service):
        views = [
            {"id": "view-1", "name": "Production Tasks", "filters": {}},
            {"id": "view-2", "name": "Failed Tasks", "filters": {"status": "failed"}}
        ]
        mock_dashboard_service.get_saved_views.return_value = views
        
        response = client.get("/dashboard/views")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "Production Tasks"

class TestDashboardExports:
    def test_export_dashboard_data(self, mock_dashboard_service):
        export_data = {
            "format": "json",
            "data": {"tasks": [], "metrics": {}, "logs": []},
            "generated_at": datetime.now().isoformat()
        }
        mock_dashboard_service.export_dashboard_data.return_value = export_data
        
        response = client.get("/dashboard/export?format=json&time_range=24h")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"

    def test_export_dashboard_csv(self, mock_dashboard_service):
        csv_data = "task_id,status,duration\ntask-1,completed,1800\n"
        mock_dashboard_service.export_dashboard_data.return_value = csv_data
        
        response = client.get("/dashboard/export?format=csv")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv"

class TestDashboardSecurity:
    def test_unauthorized_access(self):
        with patch('app.api.dashboard.get_current_user') as mock_auth:
            mock_auth.side_effect = Exception("Unauthorized")
            
            response = client.get("/dashboard/overview")
            
            assert response.status_code == 401

    def test_role_based_access(self):
        with patch('app.api.dashboard.require_permission') as mock_perm:
            mock_perm.return_value = True
            
            response = client.get("/dashboard/admin/metrics")
            
            assert response.status_code == 200 or response.status_code == 404

class TestDashboardValidation:
    def test_invalid_time_range(self, mock_dashboard_service):
        response = client.get("/dashboard/overview?time_range=invalid")
        
        assert response.status_code == 400

    def test_invalid_task_id_format(self, mock_dashboard_service):
        response = client.get("/dashboard/tasks/invalid-id-format/lifecycle")
        
        assert response.status_code == 400

    def test_pagination_limits(self, mock_dashboard_service):
        response = client.get("/dashboard/logs?per_page=1000")
        
        # Should limit to maximum allowed page size
        mock_dashboard_service.get_execution_logs.assert_called_once()
        args = mock_dashboard_service.get_execution_logs.call_args
        assert args[1]['per_page'] <= 100
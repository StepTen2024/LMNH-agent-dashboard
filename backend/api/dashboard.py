from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, case, extract
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
from database import get_db
from models import Task, TaskTransition, TaskComment, User, Project
import json

router = APIRouter()

class TaskMetrics(BaseModel):
    total_tasks: int
    active_tasks: int
    completed_tasks: int
    overdue_tasks: int
    avg_completion_time: float
    completion_rate: float

class StatusDistribution(BaseModel):
    status: str
    count: int
    percentage: float

class ProjectMetrics(BaseModel):
    project_id: int
    project_name: str
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    avg_completion_time: float

class UserMetrics(BaseModel):
    user_id: int
    username: str
    assigned_tasks: int
    completed_tasks: int
    completion_rate: float
    avg_completion_time: float

class TaskLifecycleStep(BaseModel):
    status: str
    timestamp: datetime
    duration_in_status: Optional[float]
    user_id: Optional[int]
    username: Optional[str]

class TaskLifecycle(BaseModel):
    task_id: int
    task_title: str
    created_date: datetime
    completion_date: Optional[datetime]
    total_duration: Optional[float]
    lifecycle_steps: List[TaskLifecycleStep]
    comments_count: int

class TimeSeriesData(BaseModel):
    date: str
    created: int
    completed: int
    active: int

class DashboardSummary(BaseModel):
    overview: TaskMetrics
    status_distribution: List[StatusDistribution]
    project_metrics: List[ProjectMetrics]
    user_metrics: List[UserMetrics]
    time_series: List[TimeSeriesData]

@router.get("/dashboard/overview", response_model=TaskMetrics)
def get_dashboard_overview(
    project_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    
    # Apply filters
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if user_id:
        query = query.filter(Task.assigned_to == user_id)
    if start_date:
        query = query.filter(Task.created_date >= start_date)
    if end_date:
        query = query.filter(Task.created_date <= end_date)
    
    tasks = query.all()
    total_tasks = len(tasks)
    
    if total_tasks == 0:
        return TaskMetrics(
            total_tasks=0,
            active_tasks=0,
            completed_tasks=0,
            overdue_tasks=0,
            avg_completion_time=0,
            completion_rate=0
        )
    
    active_tasks = len([t for t in tasks if t.status not in ['completed', 'cancelled']])
    completed_tasks = len([t for t in tasks if t.status == 'completed'])
    
    # Calculate overdue tasks
    now = datetime.utcnow()
    overdue_tasks = len([t for t in tasks if t.due_date and t.due_date < now and t.status not in ['completed', 'cancelled']])
    
    # Calculate average completion time
    completed_with_dates = [t for t in tasks if t.status == 'completed' and t.completed_date]
    avg_completion_time = 0
    if completed_with_dates:
        total_time = sum([(t.completed_date - t.created_date).total_seconds() / 3600 for t in completed_with_dates])
        avg_completion_time = total_time / len(completed_with_dates)
    
    completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    
    return TaskMetrics(
        total_tasks=total_tasks,
        active_tasks=active_tasks,
        completed_tasks=completed_tasks,
        overdue_tasks=overdue_tasks,
        avg_completion_time=avg_completion_time,
        completion_rate=completion_rate
    )

@router.get("/dashboard/status-distribution", response_model=List[StatusDistribution])
def get_status_distribution(
    project_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Task.status, func.count(Task.id).label('count'))
    
    # Apply filters
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if user_id:
        query = query.filter(Task.assigned_to == user_id)
    if start_date:
        query = query.filter(Task.created_date >= start_date)
    if end_date:
        query = query.filter(Task.created_date <= end_date)
    
    results = query.group_by(Task.status).all()
    
    total_count = sum([r.count for r in results])
    
    if total_count == 0:
        return []
    
    return [
        StatusDistribution(
            status=result.status,
            count=result.count,
            percentage=(result.count / total_count) * 100
        )
        for result in results
    ]

@router.get("/dashboard/project-metrics", response_model=List[ProjectMetrics])
def get_project_metrics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(
        Project.id,
        Project.name,
        func.count(Task.id).label('total_tasks'),
        func.sum(case((Task.status == 'completed', 1), else_=0)).label('completed_tasks')
    ).outerjoin(Task).group_by(Project.id, Project.name)
    
    # Apply date filters
    if start_date:
        query = query.filter(Task.created_date >= start_date)
    if end_date:
        query = query.filter(Task.created_date <= end_date)
    
    results = query.all()
    
    metrics = []
    for result in results:
        total_tasks = result.total_tasks or 0
        completed_tasks = result.completed_tasks or 0
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Calculate average completion time for this project
        completed_project_tasks = db.query(Task).filter(
            Task.project_id == result.id,
            Task.status == 'completed',
            Task.completed_date.isnot(None)
        ).all()
        
        avg_completion_time = 0
        if completed_project_tasks:
            total_time = sum([(t.completed_date - t.created_date).total_seconds() / 3600 for t in completed_project_tasks])
            avg_completion_time = total_time / len(completed_project_tasks)
        
        metrics.append(ProjectMetrics(
            project_id=result.id,
            project_name=result.name,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            completion_rate=completion_rate,
            avg_completion_time=avg_completion_time
        ))
    
    return metrics

@router.get("/dashboard/user-metrics", response_model=List[UserMetrics])
def get_user_metrics(
    project_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(
        User.id,
        User.username,
        func.count(Task.id).label('assigned_tasks'),
        func.sum(case((Task.status == 'completed', 1), else_=0)).label('completed_tasks')
    ).outerjoin(Task, User.id == Task.assigned_to).group_by(User.id, User.username)
    
    # Apply filters
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if start_date:
        query = query.filter(Task.created_date >= start_date)
    if end_date:
        query = query.filter(Task.created_date <= end_date)
    
    results = query.all()
    
    metrics = []
    for result in results:
        assigned_tasks = result.assigned_tasks or 0
        completed_tasks = result.completed_tasks or 0
        completion_rate = (completed_tasks / assigned_tasks * 100) if assigned_tasks > 0 else 0
        
        # Calculate average completion time for this user
        completed_user_tasks = db.query(Task).filter(
            Task.assigned_to == result.id,
            Task.status == 'completed',
            Task.completed_date.isnot(None)
        ).all()
        
        avg_completion_time = 0
        if completed_user_tasks:
            total_time = sum([(t.completed_date - t.created_date).total_seconds() / 3600 for t in completed_user_tasks])
            avg_completion_time = total_time / len(completed_user_tasks)
        
        metrics.append(UserMetrics(
            user_id=result.id,
            username=result.username,
            assigned_tasks=assigned_tasks,
            completed_tasks=completed_tasks,
            completion_rate=completion_rate,
            avg_completion_time=avg_completion_time
        ))
    
    return metrics

@router.get("/dashboard/task-lifecycle/{task_id}", response_model=TaskLifecycle)
def get_task_lifecycle(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get all transitions for this task
    transitions = db.query(TaskTransition).join(User, TaskTransition.user_id == User.id)\
        .filter(TaskTransition.task_id == task_id)\
        .order_by(TaskTransition.timestamp)\
        .all()
    
    lifecycle_steps = []
    
    # Add creation step
    creator = db.query(User).filter(User.id == task.created_by).first()
    lifecycle_steps.append(TaskLifecycleStep(
        status="created",
        timestamp=task.created_date,
        duration_in_status=None,
        user_id=task.created_by,
        username=creator.username if creator else None
    ))
    
    # Process transitions
    for i, transition in enumerate(transitions):
        duration_in_status = None
        if i < len(transitions) - 1:
            next_transition = transitions[i + 1]
            duration_in_status = (next_transition.timestamp - transition.timestamp).total_seconds() / 3600
        elif task.status == 'completed' and task.completed_date:
            duration_in_status = (task.completed_date - transition.timestamp).total_seconds() / 3600
        
        user = db.query(User).filter(User.id == transition.user_id).first()
        lifecycle_steps.append(TaskLifecycleStep(
            status=transition.to_status,
            timestamp=transition.timestamp,
            duration_in_status=duration_in_status,
            user_id=transition.user_id,
            username=user.username if user else None
        ))
    
    # Calculate total duration
    total_duration = None
    if task.status == 'completed' and task.completed_date:
        total_duration = (task.completed_date - task.created_date).total_seconds() / 3600
    
    # Count comments
    comments_count = db.query(TaskComment).filter(TaskComment.task_id == task_id).count()
    
    return TaskLifecycle(
        task_id=task.id,
        task_title=task.title,
        created_date=task.created_date,
        completion_date=task.completed_date,
        total_duration=total_duration,
        lifecycle_steps=lifecycle_steps,
        comments_count=comments_count
    )

@router.get("/dashboard/time-series", response_model=List[TimeSeriesData])
def get_time_series_data(
    days: int = Query(30, description="Number of days to look back"),
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days)
    
    # Generate date range
    date_range = []
    current_date = start_date
    while current_date <= end_date:
        date_range.append(current_date)
        current_date += timedelta(days=1)
    
    time_series = []
    
    for date in date_range:
        # Tasks created on this date
        created_query = db.query(func.count(Task.id)).filter(
            func.date(Task.created_date) == date
        )
        if project_id:
            created_query = created_query.filter(Task.project_id == project_id)
        created_count = created_query.scalar() or 0
        
        # Tasks completed on this date
        completed_query = db.query(func.count(Task.id)).filter(
            func.date(Task.completed_date) == date,
            Task.status == 'completed'
        )
        if project_id:
            completed_query = completed_query.filter(Task.project_id == project_id)
        completed_count = completed_query.scalar() or 0
        
        # Active tasks on this date
        active_query = db.query(func.count(Task.id)).filter(
            Task.created_date <= datetime.combine(date, datetime.min.time()),
            or_(
                Task.completed_date.is_(None),
                Task.completed_date > datetime.combine(date, datetime.max.time())
            ),
            Task.status.notin_(['completed', 'cancelled'])
        )
        if project_id:
            active_query = active_query.filter(Task.project_id == project_id)
        active_count = active_query.scalar() or 0
        
        time_series.append(TimeSeriesData(
            date=date.isoformat(),
            created=created_count,
            completed=completed_count,
            active=active_count
        ))
    
    return time_series

@router.get("/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    project_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    overview = get_dashboard_overview(project_id, user_id, start_date, end_date, db)
    status_distribution = get_status_distribution(project_id, user_id, start_date, end_date, db)
    project_metrics = get_project_metrics(start_date, end_date, db)
    user_metrics = get_user_metrics(project_id, start_date, end_date, db)
    time_series = get_time_series_data(30, project_id, db)
    
    return DashboardSummary(
        overview=overview,
        status_distribution=status_distribution,
        project_metrics=project_metrics,
        user_metrics=user_metrics,
        time_series=time_series
    )

@router.get("/dashboard/task-transitions/{task_id}")
def get_task_transitions(task_id: int, db: Session = Depends(get_db)):
    transitions = db.query(TaskTransition).join(User, TaskTransition.user_id == User.id)\
        .filter(TaskTransition.task_id == task_id)\
        .order_by(TaskTransition.timestamp.desc())\
        .all()
    
    return [
        {
            "id": t.id,
            "from_status": t.from_status,
            "to_status": t.to_status,
            "timestamp": t.timestamp,
            "user_id": t.user_id,
            "username": t.user.username,
            "notes": t.notes
        }
        for t in transitions
    ]

@router.get("/dashboard/bottleneck-analysis")
def get_bottleneck_analysis(
    project_id: Optional[int] = Query(None),
    days: int = Query(30),
    db: Session = Depends(get_db)
):
    # Analyze which statuses tasks spend the most time in
    query = db.query(TaskTransition).join(Task)
    
    if project_id:
        query = query.filter(Task.project_id == project_id)
    
    start_date = datetime.utcnow() - timedelta(days=days)
    query = query.filter(TaskTransition.timestamp >= start_date)
    
    transitions = query.order_by(TaskTransition.task_id, TaskTransition.timestamp).all()
    
    status_durations = {}
    task_transitions = {}
    
    for transition in transitions:
        task_id = transition.task_id
        if task_id not in task_transitions:
            task_transitions[task_id] = []
        task_transitions[task_id].append(transition)
    
    for task_id, task_transition_list in task_transitions.items():
        for i in range(len(task_transition_list) - 1):
            current = task_transition_list[i]
            next_transition = task_transition_list[i + 1]
            
            duration = (next_transition.timestamp - current.timestamp).total_seconds() / 3600
            status = current.to_status
            
            if status not in status_durations:
                status_durations[status] = []
            status_durations[status].append(duration)
    
    # Calculate averages and identify bottlenecks
    bottlenecks = []
    for status, durations in status_durations.items():
        avg_duration = sum(durations) / len(durations)
        max_duration = max(durations)
        min_duration = min(durations)
        task_count = len(durations)
        
        bottlenecks.append({
            "status": status,
            "avg_duration_hours": avg_duration,
            "max_duration_hours": max_duration,
            "min_duration_hours": min_duration,
            "task_count": task_count
        })
    
    # Sort by average duration (descending)
    bottlenecks.sort(key=lambda x: x["avg_duration_hours"], reverse=True)
    
    return bottlenecks
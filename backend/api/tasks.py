from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from backend.models.task import Task, TaskStatus, TaskPriority
from backend.models.user import User
from backend.models.activity_log import ActivityLog
from backend.database import db
from sqlalchemy import and_, or_, desc
from sqlalchemy.orm import joinedload

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        priority = request.args.get('priority')
        search = request.args.get('search')
        assigned_to = request.args.get('assigned_to')
        created_by = request.args.get('created_by')
        
        query = Task.query.options(
            joinedload(Task.assigned_to_user),
            joinedload(Task.created_by_user)
        )
        
        # Filter by status
        if status:
            query = query.filter(Task.status == TaskStatus(status))
        
        # Filter by priority
        if priority:
            query = query.filter(Task.priority == TaskPriority(priority))
        
        # Filter by assigned user
        if assigned_to:
            query = query.filter(Task.assigned_to == assigned_to)
        
        # Filter by creator
        if created_by:
            query = query.filter(Task.created_by == created_by)
        
        # Search in title and description
        if search:
            search_filter = or_(
                Task.title.ilike(f'%{search}%'),
                Task.description.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)
        
        # Order by creation date (newest first)
        query = query.order_by(desc(Task.created_at))
        
        # Paginate results
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        tasks = []
        for task in pagination.items:
            task_data = {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'status': task.status.value,
                'priority': task.priority.value,
                'created_at': task.created_at.isoformat(),
                'updated_at': task.updated_at.isoformat(),
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'completed_at': task.completed_at.isoformat() if task.completed_at else None,
                'assigned_to': {
                    'id': task.assigned_to_user.id,
                    'username': task.assigned_to_user.username,
                    'email': task.assigned_to_user.email
                } if task.assigned_to_user else None,
                'created_by': {
                    'id': task.created_by_user.id,
                    'username': task.created_by_user.username,
                    'email': task.created_by_user.email
                } if task.created_by_user else None,
                'tags': task.tags,
                'estimated_hours': task.estimated_hours,
                'actual_hours': task.actual_hours
            }
            tasks.append(task_data)
        
        return jsonify({
            'tasks': tasks,
            'pagination': {
                'page': pagination.page,
                'pages': pagination.pages,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        
        # Parse due_date if provided
        due_date = None
        if data.get('due_date'):
            due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        
        # Create new task
        task = Task(
            title=data['title'],
            description=data.get('description', ''),
            status=TaskStatus(data.get('status', 'todo')),
            priority=TaskPriority(data.get('priority', 'medium')),
            assigned_to=data.get('assigned_to'),
            created_by=user_id,
            due_date=due_date,
            tags=data.get('tags', []),
            estimated_hours=data.get('estimated_hours')
        )
        
        db.session.add(task)
        db.session.flush()  # Get the task ID
        
        # Log activity
        log_entry = ActivityLog(
            user_id=user_id,
            action='task_created',
            entity_type='task',
            entity_id=task.id,
            details={
                'title': task.title,
                'status': task.status.value,
                'priority': task.priority.value,
                'assigned_to': task.assigned_to
            }
        )
        db.session.add(log_entry)
        db.session.commit()
        
        # Load relationships for response
        task = Task.query.options(
            joinedload(Task.assigned_to_user),
            joinedload(Task.created_by_user)
        ).get(task.id)
        
        task_data = {
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'status': task.status.value,
            'priority': task.priority.value,
            'created_at': task.created_at.isoformat(),
            'updated_at': task.updated_at.isoformat(),
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'assigned_to': {
                'id': task.assigned_to_user.id,
                'username': task.assigned_to_user.username,
                'email': task.assigned_to_user.email
            } if task.assigned_to_user else None,
            'created_by': {
                'id': task.created_by_user.id,
                'username': task.created_by_user.username,
                'email': task.created_by_user.email
            } if task.created_by_user else None,
            'tags': task.tags,
            'estimated_hours': task.estimated_hours,
            'actual_hours': task.actual_hours
        }
        
        return jsonify({'task': task_data}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    try:
        task = Task.query.options(
            joinedload(Task.assigned_to_user),
            joinedload(Task.created_by_user)
        ).get_or_404(task_id)
        
        task_data = {
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'status': task.status.value,
            'priority': task.priority.value,
            'created_at': task.created_at.isoformat(),
            'updated_at': task.updated_at.isoformat(),
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'completed_at': task.completed_at.isoformat() if task.completed_at else None,
            'assigned_to': {
                'id': task.assigned_to_user.id,
                'username': task.assigned_to_user.username,
                'email': task.assigned_to_user.email
            } if task.assigned_to_user else None,
            'created_by': {
                'id': task.created_by_user.id,
                'username': task.created_by_user.username,
                'email': task.created_by_user.email
            } if task.created_by_user else None,
            'tags': task.tags,
            'estimated_hours': task.estimated_hours,
            'actual_hours': task.actual_hours
        }
        
        return jsonify({'task': task_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    try:
        user_id = get_jwt_identity()
        task = Task.query.get_or_404(task_id)
        data = request.get_json()
        
        # Store original values for change tracking
        original_values = {
            'title': task.title,
            'description': task.description,
            'status': task.status.value,
            'priority': task.priority.value,
            'assigned_to': task.assigned_to,
            'due_date': task.due_date.isoformat() if task.due_date else None
        }
        
        # Update fields
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'status' in data:
            old_status = task.status
            task.status = TaskStatus(data['status'])
            # Set completed_at if status changed to completed
            if old_status != TaskStatus.completed and task.status == TaskStatus.completed:
                task.completed_at = datetime.now(timezone.utc)
            elif task.status != TaskStatus.completed:
                task.completed_at = None
        if 'priority' in data:
            task.priority = TaskPriority(data['priority'])
        if 'assigned_to' in data:
            task.assigned_to = data['assigned_to']
        if 'due_date' in data:
            task.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00')) if data['due_date'] else None
        if 'tags' in data:
            task.tags = data['tags']
        if 'estimated_hours' in data:
            task.estimated_hours = data['estimated_hours']
        if 'actual_hours' in data:
            task.actual_hours = data['actual_hours']
        
        task.updated_at = datetime.now(timezone.utc)
        
        # Track changes for activity log
        changes = {}
        new_values = {
            'title': task.title,
            'description': task.description,
            'status': task.status.value,
            'priority': task.priority.value,
            'assigned_to': task.assigned_to,
            'due_date': task.due_date.isoformat() if task.due_date else None
        }
        
        for key, new_value in new_values.items():
            if original_values[key] != new_value:
                changes[key] = {
                    'from': original_values[key],
                    'to': new_value
                }
        
        # Log activity if there were changes
        if changes:
            log_entry = ActivityLog(
                user_id=user_id,
                action='task_updated',
                entity_type='task',
                entity_id=task.id,
                details={
                    'title': task.title,
                    'changes': changes
                }
            )
            db.session.add(log_entry)
        
        db.session.commit()
        
        # Load relationships for response
        task = Task.query.options(
            joinedload(Task.assigned_to_user),
            joinedload(Task.created_by_user)
        ).get(task.id)
        
        task_data = {
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'status': task.status.value,
            'priority': task.priority.value,
            'created_at': task.created_at.isoformat(),
            'updated_at': task.updated_at.isoformat(),
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'completed_at': task.completed_at.isoformat() if task.completed_at else None,
            'assigned_to': {
                'id': task.assigned_to_user.id,
                'username': task.assigned_to_user.username,
                'email': task.assigned_to_user.email
            } if task.assigned_to_user else None,
            'created_by': {
                'id': task.created_by_user.id,
                'username': task.created_by_user.username,
                'email': task.created_by_user.email
            } if task.created_by_user else None,
            'tags': task.tags,
            'estimated_hours': task.estimated_hours,
            'actual_hours': task.actual_hours
        }
        
        return jsonify({'task': task_data}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    try:
        user_id = get_jwt_identity()
        task = Task.query.get_or_404(task_id)
        
        # Log activity before deletion
        log_entry = ActivityLog(
            user_id=user_id,
            action='task_deleted',
            entity_type='task',
            entity_id=task.id,
            details={
                'title': task.title,
                'status': task.status.value,
                'priority': task.priority.value
            }
        )
        db.session.add(log_entry)
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': 'Task deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>/activity', methods=['GET'])
@jwt_required()
def get_task_activity(task_id):
    try:
        # Verify task exists
        task = Task.query.get_or_404(task_id)
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Get activity logs for this task
        pagination = ActivityLog.query.filter(
            and_(
                ActivityLog.entity_type == 'task',
                ActivityLog.entity_id == task_id
            )
        ).order_by(desc(ActivityLog.created_at)).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        activities = []
        for log in pagination.items:
            user = User.query.get(log.user_id)
            activity_data = {
                'id': log.id,
                'action': log.action,
                'created_at': log.created_at.isoformat(),
                'details': log.details,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                } if user else None
            }
            activities.append(activity_data)
        
        return jsonify({
            'activities': activities,
            'pagination': {
                'page': pagination.page,
                'pages': pagination.pages,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/analytics', methods=['GET'])
@jwt_required()
def get_task_analytics():
    try:
        user_id = get_jwt_identity()
        
        # Get task counts by status
        status_counts = {}
        for status in TaskStatus:
            count = Task.query.filter(Task.status == status).count()
            status_counts[status.value] = count
        
        # Get task counts by priority
        priority_counts = {}
        for priority in TaskPriority:
            count = Task.query.filter(Task.priority == priority).count()
            priority_counts[priority.value] = count
        
        # Get overdue tasks count
        overdue_count = Task.query.filter(
            and_(
                Task.due_date < datetime.now(timezone.utc),
                Task.status != TaskStatus.completed
            )
        ).count()
        
        # Get completion rate for the current month
        start_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        total_tasks_this_month = Task.query.filter(
            Task.created_at >= start_of_month
        ).count()
        
        completed_tasks_this_month = Task.query.filter(
            and_(
                Task.created_at >= start_of_month,
                Task.status == TaskStatus.completed
            )
        ).count()
        
        completion_rate = (completed_tasks_this_month / total_tasks_this_month * 100) if total_tasks_this_month > 0 else 0
        
        # Get average completion time
        completed_tasks = Task.query.filter(
            and_(
                Task.status == TaskStatus.completed,
                Task.completed_at.isnot(None)
            )
        ).all()
        
        total_completion_time = 0
        for task in completed_tasks:
            completion_time = (task.completed_at - task.created_at).total_seconds() / 3600  # hours
            total_completion_time += completion_time
        
        avg_completion_time = (total_completion_time / len(completed_tasks)) if completed_tasks else 0
        
        # Get task assignment distribution
        assignment_stats = db.session.query(
            User.username,
            db.func.count(Task.id).label('task_count')
        ).join(Task, User.id == Task.assigned_to).group_by(User.id).all()
        
        assignment_distribution = {}
        for username, count in assignment_stats:
            assignment_distribution[username] = count
        
        analytics_data = {
            'status_distribution': status_counts,
            'priority_distribution': priority_counts,
            'overdue_tasks': overdue_count,
            'completion_rate_this_month': round(completion_rate, 2),
            'average_completion_time_hours': round(avg_completion_time, 2),
            'assignment_distribution': assignment_distribution,
            'total_tasks': sum(status_counts.values()),
            'completed_tasks': status_counts.get('completed', 0)
        }
        
        return jsonify({'analytics': analytics_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/bulk-update', methods=['POST'])
@jwt_required()
def bulk_update_tasks():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        task_ids = data.get('task_ids', [])
        updates = data.get('updates', {})
        
        if not task_ids:
            return jsonify({'error': 'No task IDs provided'}), 400
        
        if not updates:
            return jsonify({'error': 'No updates provided'}), 400
        
        # Get tasks to update
        tasks = Task.query.filter(Task.id.in_(task_ids)).all()
        
        if not tasks:
            return jsonify({'error': 'No tasks found'}), 404
        
        updated_tasks = []
        
        for task in tasks:
            # Store original values for change tracking
            original_status = task.status.value
            
            # Apply updates
            if 'status' in updates:
                old_status = task.status
                task.status = TaskStatus(updates['status'])
                # Set completed_at if status changed to completed
                if old_status != TaskStatus.completed and task.status == TaskStatus.completed:
                    task.completed_at = datetime.now(timezone.utc)
                elif task.status != TaskStatus.completed:
                    task.completed_at = None
            
            if 'priority' in updates:
                task.priority = TaskPriority(updates['priority'])
            
            if 'assigned_to' in updates:
                task.assigned_to = updates['assigned_to']
            
            task.updated_at = datetime.now(timezone.utc)
            
            # Log activity
            changes = {}
            if 'status' in updates and original_status != updates['status']:
                changes['status'] = {
                    'from': original_status,
                    'to': updates['status']
                }
            
            if changes:
                log_entry = ActivityLog(
                    user_id=user_id,
                    action='task_bulk_updated',
                    entity_type='task',
                    entity_id=task.id,
                    details={
                        'title': task.title,
                        'changes': changes,
                        'bulk_operation': True
                    }
                )
                db.session.add(log_entry)
            
            updated_tasks.append(task.id)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully updated {len(updated_tasks)} tasks',
            'updated_task_ids': updated_tasks
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
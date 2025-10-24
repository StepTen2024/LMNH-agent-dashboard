CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to INTEGER,
    created_by INTEGER NOT NULL,
    project_id INTEGER,
    parent_task_id INTEGER,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    start_date TIMESTAMP,
    due_date TIMESTAMP,
    completed_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_tasks_project_id FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_tasks_parent_task FOREIGN KEY (parent_task_id) REFERENCES tasks(id),
    
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_assigned_to (assigned_to),
    INDEX idx_tasks_created_by (created_by),
    INDEX idx_tasks_project_id (project_id),
    INDEX idx_tasks_due_date (due_date),
    INDEX idx_tasks_created_at (created_at),
    INDEX idx_tasks_deleted_at (deleted_at)
);

CREATE TABLE IF NOT EXISTS task_status_history (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    CONSTRAINT fk_task_status_history_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_status_history_user FOREIGN KEY (changed_by) REFERENCES users(id),
    
    INDEX idx_task_status_history_task_id (task_id),
    INDEX idx_task_status_history_changed_at (changed_at)
);

CREATE TABLE IF NOT EXISTS task_assignments_history (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    old_assigned_to INTEGER,
    new_assigned_to INTEGER,
    changed_by INTEGER NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    CONSTRAINT fk_task_assignments_history_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_assignments_history_old_user FOREIGN KEY (old_assigned_to) REFERENCES users(id),
    CONSTRAINT fk_task_assignments_history_new_user FOREIGN KEY (new_assigned_to) REFERENCES users(id),
    CONSTRAINT fk_task_assignments_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(id),
    
    INDEX idx_task_assignments_history_task_id (task_id),
    INDEX idx_task_assignments_history_changed_at (changed_at)
);

CREATE TABLE IF NOT EXISTS task_time_logs (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    hours_logged DECIMAL(8,2) NOT NULL,
    log_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_task_time_logs_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_time_logs_user FOREIGN KEY (user_id) REFERENCES users(id),
    
    INDEX idx_task_time_logs_task_id (task_id),
    INDEX idx_task_time_logs_user_id (user_id),
    INDEX idx_task_time_logs_log_date (log_date)
);

CREATE TABLE IF NOT EXISTS task_comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_comments_user FOREIGN KEY (user_id) REFERENCES users(id),
    
    INDEX idx_task_comments_task_id (task_id),
    INDEX idx_task_comments_created_at (created_at),
    INDEX idx_task_comments_deleted_at (deleted_at)
);

CREATE TABLE IF NOT EXISTS task_attachments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    uploaded_by INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT fk_task_attachments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_attachments_user FOREIGN KEY (uploaded_by) REFERENCES users(id),
    
    INDEX idx_task_attachments_task_id (task_id),
    INDEX idx_task_attachments_created_at (created_at),
    INDEX idx_task_attachments_deleted_at (deleted_at)
);

CREATE TABLE IF NOT EXISTS task_dependencies (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    depends_on_task_id INTEGER NOT NULL,
    dependency_type VARCHAR(50) DEFAULT 'finish_to_start',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_task_dependencies_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_dependencies_depends_on FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_task_dependency (task_id, depends_on_task_id),
    INDEX idx_task_dependencies_task_id (task_id),
    INDEX idx_task_dependencies_depends_on (depends_on_task_id)
);

CREATE TABLE IF NOT EXISTS task_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#007bff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_tag_assignments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_task_tag_assignments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_tag_assignments_tag FOREIGN KEY (tag_id) REFERENCES task_tags(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_task_tag (task_id, tag_id),
    INDEX idx_task_tag_assignments_task_id (task_id),
    INDEX idx_task_tag_assignments_tag_id (tag_id)
);
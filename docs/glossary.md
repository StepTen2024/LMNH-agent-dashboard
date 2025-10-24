# Glossary - Task Lifecycle Dashboard

## Core Concepts

### Task
A unit of work that moves through different stages from creation to completion. Each task has a unique identifier, title, description, assignee, priority level, and timestamps for tracking progress.

### Task Lifecycle
The complete journey of a task from its initial creation through various stages until it reaches a final state (completed, cancelled, or archived). The lifecycle includes all state transitions, updates, and interactions.

### Task State
The current status or phase of a task within its lifecycle. Common states include:
- **Draft**: Task is being created but not yet active
- **Open**: Task is ready to be worked on
- **In Progress**: Task is actively being worked on
- **Review**: Task is completed and awaiting review
- **Done**: Task is completed and approved
- **Cancelled**: Task has been cancelled and won't be completed

### Task Priority
The relative importance or urgency of a task. Typical priority levels:
- **Critical**: Must be completed immediately
- **High**: Important task with tight deadline
- **Medium**: Standard priority task
- **Low**: Nice-to-have task with flexible timeline

### Assignee
The person responsible for completing a task. Tasks can be assigned to individuals or teams.

### Dashboard
A visual interface that displays task information, metrics, and analytics in an organized and easy-to-understand format.

## Dashboard Components

### Task Board
A visual representation of tasks organized by their current state, typically displayed in columns (like a Kanban board).

### Task List
A tabular view of tasks showing detailed information like title, assignee, priority, due date, and current state.

### Filters
Tools that allow users to narrow down the displayed tasks based on criteria such as:
- Assignee
- Priority level
- State
- Due date range
- Tags or categories

### Search
Functionality to find specific tasks by searching through task titles, descriptions, or other attributes.

### Metrics Panel
A section displaying key performance indicators (KPIs) such as:
- Total tasks
- Completed tasks
- Overdue tasks
- Average completion time
- Task distribution by state

## User Roles

### Task Creator
A user who creates new tasks by providing title, description, priority, and assignee information.

### Assignee
A user who is responsible for completing assigned tasks and updating their progress.

### Reviewer
A user who reviews completed tasks and approves or requests changes.

### Administrator
A user with elevated permissions who can manage user access, configure dashboard settings, and oversee the entire system.

### Viewer
A user with read-only access who can view tasks and dashboard information but cannot make changes.

## Technical Terms

### API (Application Programming Interface)
The set of protocols and endpoints that allow the dashboard to communicate with the backend system for retrieving and updating task data.

### Real-time Updates
The ability of the dashboard to automatically refresh and display the latest task information without requiring manual page refreshes.

### Webhook
An automated notification sent from the task management system to update the dashboard when task data changes.

### Data Synchronization
The process of ensuring that task information displayed in the dashboard matches the current state in the backend database.

### Responsive Design
A dashboard design that adapts to different screen sizes and devices (desktop, tablet, mobile).

## Time-Related Terms

### Due Date
The deadline by which a task should be completed.

### Created Date
The timestamp when a task was first created in the system.

### Updated Date
The timestamp of the most recent modification to a task.

### Completion Date
The timestamp when a task was marked as completed.

### Cycle Time
The total time it takes for a task to move from one state to another (e.g., from "Open" to "Done").

### Lead Time
The total time from when a task is created until it is completed.

## Workflow Terms

### State Transition
The process of moving a task from one state to another (e.g., from "In Progress" to "Review").

### Workflow Rules
Predefined conditions that govern how tasks can move between states and who can perform specific actions.

### Automation
Automatic actions triggered by specific conditions, such as moving a task to "In Progress" when an assignee starts working on it.

### Notification
Alerts sent to users about task-related events, such as assignments, due date reminders, or state changes.

### Audit Trail
A chronological record of all actions performed on a task, including who made changes and when.

## Performance Metrics

### Throughput
The number of tasks completed within a specific time period.

### Backlog
The collection of tasks that are created but not yet started or completed.

### Burn Rate
The rate at which tasks are being completed over time.

### Bottleneck
A stage in the task lifecycle where tasks accumulate due to limited capacity or resources.

### Velocity
The average number of tasks or amount of work completed by a team during a specific time period.
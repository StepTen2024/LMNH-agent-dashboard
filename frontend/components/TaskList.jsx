import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Tag, AlertCircle, CheckCircle2, XCircle, Play, Pause, RotateCcw } from 'lucide-react';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showLifecycle, setShowLifecycle] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_progress': return <Play className="w-4 h-4 text-blue-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-orange-500" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'updated':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'dueDate':
        return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
      default:
        return 0;
    }
  });

  const TaskLifecycleModal = ({ task, onClose }) => {
    if (!task) return null;

    const lifecycleEvents = task.lifecycle || [];
    const statusTransitions = [
      'pending', 'in_progress', 'paused', 'completed', 'failed', 'cancelled'
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Task Lifecycle: {task.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline View */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Lifecycle Timeline</h3>
              <div className="space-y-4">
                {lifecycleEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium capitalize">{event.status.replace('_', ' ')}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {event.message && (
                        <p className="text-sm text-gray-600 mt-1">{event.message}</p>
                      )}
                      {event.user && (
                        <p className="text-xs text-gray-500 mt-1">by {event.user}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics and Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Task Metrics</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Total Duration</label>
                    <div className="font-medium">{task.metrics?.totalDuration || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Active Time</label>
                    <div className="font-medium">{task.metrics?.activeTime || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Retry Count</label>
                    <div className="font-medium">{task.metrics?.retryCount || 0}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status Changes</label>
                    <div className="font-medium">{lifecycleEvents.length}</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Task Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span>{new Date(task.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Updated:</span>
                      <span>{new Date(task.updatedAt).toLocaleString()}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Due Date:</span>
                        <span>{new Date(task.dueDate).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Priority:</span>
                      <span className="capitalize">{task.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Assigned To:</span>
                      <span>{task.assignedTo || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Transition Controls */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Status Controls</h3>
            <div className="flex flex-wrap gap-2">
              {statusTransitions.map(status => (
                <button
                  key={status}
                  onClick={() => updateTaskStatus(task.id, status)}
                  disabled={task.status === status}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    task.status === status
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {getStatusIcon(status)}
                  <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Lifecycle Dashboard</h1>
        <p className="text-gray-600">Complete traceability and management of all tasks</p>
      </div>

      {/* Controls */}
      <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="created">Sort by Created</option>
              <option value="updated">Sort by Updated</option>
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Showing {sortedTasks.length} of {tasks.length} tasks
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {sortedTasks.map(task => (
          <div
            key={task.id}
            className={`bg-white rounded-lg border-l-4 ${getPriorityColor(task.priority)} p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{task.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {task.assignedTo && (
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{task.assignedTo}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    <Tag className="w-4 h-4" />
                    <span className="capitalize">{task.priority} Priority</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowLifecycle(true);
                  }}
                  className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  View Lifecycle
                </button>
                
                {task.status === 'failed' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'pending')}
                    className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedTasks.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">
            {searchTerm || filter !== 'all' ? 'Try adjusting your filters' : 'No tasks have been created yet'}
          </p>
        </div>
      )}

      {/* Task Lifecycle Modal */}
      {showLifecycle && (
        <TaskLifecycleModal
          task={selectedTask}
          onClose={() => {
            setShowLifecycle(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskList;
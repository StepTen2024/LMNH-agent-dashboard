const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Task CRUD operations
  async getTasks(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/tasks?${queryParams}` : '/tasks';
    return this.request(endpoint);
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: taskData,
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: taskData,
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Task lifecycle operations
  async getTaskLifecycle(taskId) {
    return this.request(`/tasks/${taskId}/lifecycle`);
  }

  async updateTaskStatus(taskId, status, comment = '') {
    return this.request(`/tasks/${taskId}/status`, {
      method: 'PUT',
      body: { status, comment },
    });
  }

  async assignTask(taskId, assigneeId) {
    return this.request(`/tasks/${taskId}/assign`, {
      method: 'PUT',
      body: { assigneeId },
    });
  }

  async addTaskComment(taskId, comment) {
    return this.request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: { comment },
    });
  }

  // Dashboard analytics
  async getDashboardMetrics(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/dashboard/metrics?${queryParams}` : '/dashboard/metrics';
    return this.request(endpoint);
  }

  async getTasksByStatus() {
    return this.request('/dashboard/tasks-by-status');
  }

  async getTasksByPriority() {
    return this.request('/dashboard/tasks-by-priority');
  }

  async getTasksByAssignee() {
    return this.request('/dashboard/tasks-by-assignee');
  }

  async getTaskTimeline(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/dashboard/timeline?${queryParams}` : '/dashboard/timeline';
    return this.request(endpoint);
  }

  async getTaskPerformanceMetrics(taskId) {
    return this.request(`/dashboard/task-performance/${taskId}`);
  }

  // User management
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  // Project management
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async getProjectTasks(projectId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/projects/${projectId}/tasks?${queryParams}` : `/projects/${projectId}/tasks`;
    return this.request(endpoint);
  }

  // Audit and traceability
  async getTaskAuditLog(taskId) {
    return this.request(`/tasks/${taskId}/audit`);
  }

  async getSystemAuditLog(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/audit?${queryParams}` : '/audit';
    return this.request(endpoint);
  }

  async exportTaskData(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/export/tasks?${queryParams}` : '/export/tasks';
    return this.request(endpoint);
  }

  // Real-time updates
  async subscribeToTaskUpdates(taskId, callback) {
    const eventSource = new EventSource(`${this.baseURL}/tasks/${taskId}/subscribe`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    return eventSource;
  }

  async subscribeToDashboardUpdates(callback) {
    const eventSource = new EventSource(`${this.baseURL}/dashboard/subscribe`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    return eventSource;
  }

  // Bulk operations
  async bulkUpdateTasks(taskIds, updates) {
    return this.request('/tasks/bulk-update', {
      method: 'PUT',
      body: { taskIds, updates },
    });
  }

  async bulkDeleteTasks(taskIds) {
    return this.request('/tasks/bulk-delete', {
      method: 'DELETE',
      body: { taskIds },
    });
  }

  // Search and filtering
  async searchTasks(query, filters = {}) {
    const queryParams = new URLSearchParams({ query, ...filters }).toString();
    return this.request(`/tasks/search?${queryParams}`);
  }

  async getTaskFilters() {
    return this.request('/tasks/filters');
  }

  // File attachments
  async uploadTaskAttachment(taskId, file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(`/tasks/${taskId}/attachments`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getTaskAttachments(taskId) {
    return this.request(`/tasks/${taskId}/attachments`);
  }

  async deleteTaskAttachment(taskId, attachmentId) {
    return this.request(`/tasks/${taskId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }
}

const apiService = new ApiService();
export default apiService;
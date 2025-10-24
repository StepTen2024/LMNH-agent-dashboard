import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(url = 'ws://localhost:3001') {
    try {
      this.socket = io(url, {
        transports: ['websocket'],
        upgrade: true,
        rememberUpgrade: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      this.setupEventHandlers();
      return this.socket;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      throw error;
    }
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.connected = false;
      this.emit('connection', { status: 'disconnected', reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connected = false;
      this.reconnectAttempts++;
      this.emit('connection', { 
        status: 'error', 
        error: error.message,
        attempts: this.reconnectAttempts 
      });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'reconnected', attempts: attemptNumber });
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
      this.emit('connection', { 
        status: 'reconnect_error', 
        error: error.message,
        attempts: this.reconnectAttempts 
      });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      this.connected = false;
      this.emit('connection', { 
        status: 'reconnect_failed',
        attempts: this.maxReconnectAttempts 
      });
    });

    // Task lifecycle events
    this.socket.on('task_created', (data) => {
      this.emit('task_created', data);
    });

    this.socket.on('task_updated', (data) => {
      this.emit('task_updated', data);
    });

    this.socket.on('task_status_changed', (data) => {
      this.emit('task_status_changed', data);
    });

    this.socket.on('task_assigned', (data) => {
      this.emit('task_assigned', data);
    });

    this.socket.on('task_completed', (data) => {
      this.emit('task_completed', data);
    });

    this.socket.on('task_deleted', (data) => {
      this.emit('task_deleted', data);
    });

    // Project events
    this.socket.on('project_created', (data) => {
      this.emit('project_created', data);
    });

    this.socket.on('project_updated', (data) => {
      this.emit('project_updated', data);
    });

    this.socket.on('project_deleted', (data) => {
      this.emit('project_deleted', data);
    });

    // User events
    this.socket.on('user_online', (data) => {
      this.emit('user_online', data);
    });

    this.socket.on('user_offline', (data) => {
      this.emit('user_offline', data);
    });

    // Analytics events
    this.socket.on('metrics_updated', (data) => {
      this.emit('metrics_updated', data);
    });

    this.socket.on('dashboard_updated', (data) => {
      this.emit('dashboard_updated', data);
    });

    // Notification events
    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });

    this.socket.on('alert', (data) => {
      this.emit('alert', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event handler:', error);
        }
      });
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.listeners.delete(event);
      }
    }
  }

  send(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected. Cannot send event:', event);
    }
  }

  // Task-specific methods
  joinTaskRoom(taskId) {
    this.send('join_task', { taskId });
  }

  leaveTaskRoom(taskId) {
    this.send('leave_task', { taskId });
  }

  joinProjectRoom(projectId) {
    this.send('join_project', { projectId });
  }

  leaveProjectRoom(projectId) {
    this.send('leave_project', { projectId });
  }

  joinUserRoom(userId) {
    this.send('join_user', { userId });
  }

  leaveUserRoom(userId) {
    this.send('leave_user', { userId });
  }

  // Dashboard subscription methods
  subscribeToDashboard() {
    this.send('subscribe_dashboard');
  }

  unsubscribeFromDashboard() {
    this.send('unsubscribe_dashboard');
  }

  subscribeToMetrics(metricTypes = []) {
    this.send('subscribe_metrics', { types: metricTypes });
  }

  unsubscribeFromMetrics() {
    this.send('unsubscribe_metrics');
  }

  // Utility methods
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  getConnectionStatus() {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      socketId: this.socket ? this.socket.id : null
    };
  }

  setReconnectionConfig(maxAttempts, delay) {
    this.maxReconnectAttempts = maxAttempts;
    this.reconnectDelay = delay;
  }

  // Heartbeat mechanism
  startHeartbeat(interval = 30000) {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, interval);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Error handling
  handleError(error, context = '') {
    console.error(`WebSocket error${context ? ` in ${context}` : ''}:`, error);
    this.emit('error', { error: error.message, context });
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
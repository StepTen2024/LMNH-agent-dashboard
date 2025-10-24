import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar
} from 'lucide-react';

const TaskMetrics = ({ tasks = [] }) => {
  const [metrics, setMetrics] = useState({});
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('completion');

  useEffect(() => {
    calculateMetrics();
  }, [tasks, timeframe]);

  const calculateMetrics = () => {
    const now = new Date();
    const timeframes = {
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    };

    const filteredTasks = tasks.filter(task => 
      new Date(task.created_at) >= timeframes[timeframe]
    );

    // Status distribution
    const statusCounts = filteredTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    // Priority distribution
    const priorityCounts = filteredTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    // Completion rate
    const completed = filteredTasks.filter(task => task.status === 'completed').length;
    const completionRate = filteredTasks.length > 0 ? (completed / filteredTasks.length) * 100 : 0;

    // Average completion time
    const completedTasks = filteredTasks.filter(task => task.status === 'completed');
    const avgCompletionTime = completedTasks.length > 0 
      ? completedTasks.reduce((acc, task) => {
          const created = new Date(task.created_at);
          const completed = new Date(task.updated_at);
          return acc + (completed - created);
        }, 0) / completedTasks.length
      : 0;

    // Overdue tasks
    const overdueTasks = filteredTasks.filter(task => 
      task.due_date && new Date(task.due_date) < now && task.status !== 'completed'
    ).length;

    // Daily completion trend
    const dailyCompletions = {};
    completedTasks.forEach(task => {
      const date = new Date(task.updated_at).toISOString().split('T')[0];
      dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
    });

    // Assignee performance
    const assigneeStats = filteredTasks.reduce((acc, task) => {
      if (!task.assignee_id) return acc;
      
      if (!acc[task.assignee_id]) {
        acc[task.assignee_id] = {
          assignee: task.assignee_name || `User ${task.assignee_id}`,
          total: 0,
          completed: 0,
          overdue: 0
        };
      }
      
      acc[task.assignee_id].total++;
      if (task.status === 'completed') {
        acc[task.assignee_id].completed++;
      }
      if (task.due_date && new Date(task.due_date) < now && task.status !== 'completed') {
        acc[task.assignee_id].overdue++;
      }
      
      return acc;
    }, {});

    setMetrics({
      statusCounts,
      priorityCounts,
      completionRate,
      avgCompletionTime,
      overdueTasks,
      dailyCompletions,
      assigneeStats,
      totalTasks: filteredTasks.length
    });
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: '#6b7280',
      'in-progress': '#3b82f6',
      completed: '#10b981',
      blocked: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626'
    };
    return colors[priority] || '#6b7280';
  };

  const statusData = Object.entries(metrics.statusCounts || {}).map(([status, count]) => ({
    name: status.replace('-', ' ').toUpperCase(),
    value: count,
    color: getStatusColor(status)
  }));

  const priorityData = Object.entries(metrics.priorityCounts || {}).map(([priority, count]) => ({
    name: priority.toUpperCase(),
    value: count,
    color: getPriorityColor(priority)
  }));

  const trendData = Object.entries(metrics.dailyCompletions || {})
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(),
      completions: count
    }));

  const assigneeData = Object.values(metrics.assigneeStats || {}).map(stats => ({
    ...stats,
    completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
  }));

  const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task Metrics Dashboard</h2>
        <div className="flex space-x-2">
          {['24h', '7d', '30d', '90d'].map(period => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeframe === period
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tasks"
          value={metrics.totalTasks || 0}
          icon={Calendar}
          color="text-gray-700"
        />
        <MetricCard
          title="Completion Rate"
          value={`${Math.round(metrics.completionRate || 0)}%`}
          icon={CheckCircle}
          color="text-green-600"
        />
        <MetricCard
          title="Overdue Tasks"
          value={metrics.overdueTasks || 0}
          icon={AlertCircle}
          color="text-red-600"
        />
        <MetricCard
          title="Avg Completion Time"
          value={formatTime(metrics.avgCompletionTime || 0)}
          icon={Clock}
          color="text-blue-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completion Trend */}
      {trendData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completions"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Assignee Performance */}
      {assigneeData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overdue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assigneeData.map((assignee, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {assignee.assignee}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignee.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignee.completed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${assignee.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {Math.round(assignee.completionRate)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assignee.overdue > 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {assignee.overdue}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskMetrics;
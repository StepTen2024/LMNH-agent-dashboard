'use client';

import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp: string;
}

interface TaskQueueProps {
  tasks: Task[];
}

export default function TaskQueue({ tasks }: TaskQueueProps) {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-lmnh-green" size={20} />;
      case 'in_progress':
        return <Loader2 className="text-yellow-400 animate-spin" size={20} />;
      case 'failed':
        return <XCircle className="text-red-400" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'border-lmnh-green/50 bg-lmnh-green/5';
      case 'in_progress':
        return 'border-yellow-400/50 bg-yellow-400/5 animate-glow';
      case 'failed':
        return 'border-red-400/50 bg-red-400/5';
      default:
        return 'border-gray-600/50 bg-gray-800/30';
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="bg-lmnh-gray border-2 border-lmnh-green rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-lmnh-green">Task Queue</h3>
        <div className="text-sm text-gray-400">
          {pendingTasks} pending • {completedTasks} completed
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto terminal-scroll">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks yet!</p>
            <p className="text-sm mt-2">Waiting for some work... 😴</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`border-2 rounded-lg p-4 transition-all ${getStatusColor(task.status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getStatusIcon(task.status)}</div>
                <div className="flex-1">
                  <p className="text-white font-medium">{task.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{task.timestamp}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AgentStatus from '@/components/AgentStatus';
import TaskQueue from '@/components/TaskQueue';
import LiveLogs from '@/components/LiveLogs';
import Stats from '@/components/Stats';
import LMNHThoughts from '@/components/LMNHThoughts';
import ChatModal from '@/components/ChatModal';
import ChatButton from '@/components/ChatButton';

export default function Dashboard() {
  const [chatOpen, setChatOpen] = useState(false);
  
  const [agentData, setAgentData] = useState({
    status: 'idle' as 'online' | 'working' | 'idle' | 'offline',
    currentTask: undefined as string | undefined,
    progress: 0,
    uptime: '0h 0m',
  });

  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Add hello world function',
      status: 'completed' as const,
      timestamp: '2 mins ago',
    },
    {
      id: '2',
      title: 'Fix authentication bug',
      status: 'in_progress' as const,
      timestamp: 'Just now',
    },
    {
      id: '3',
      title: 'Update documentation',
      status: 'pending' as const,
      timestamp: 'Queued',
    },
  ]);

  const [logs, setLogs] = useState([
    {
      timestamp: '00:00:00',
      level: 'info' as const,
      message: 'LMNH Dashboard initialized',
    },
    {
      timestamp: '00:00:00',
      level: 'success' as const,
      message: 'Connected to agent API',
    },
  ]);

  const [stats, setStats] = useState({
    tasksCompleted: 12,
    tasksFailed: 1,
    avgTime: '3.2m',
    successRate: 92,
  });

  // Fetch agent status every 2 seconds
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/status');
        if (response.ok) {
          const data = await response.json();
          setAgentData({
            status: data.status,
            currentTask: data.current_task,
            progress: data.progress || 0,
            uptime: data.uptime || '0h 0m',
          });
          
          // Update tasks if available
          if (data.tasks) {
            setTasks(data.tasks);
          }
          
          // Update stats if available
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (error) {
        // API not available, use demo data
        console.log('API not available, using demo data');
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 2 seconds
    const interval = setInterval(fetchStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  // Fetch logs every 1 second
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/logs');
        if (response.ok) {
          const data = await response.json();
          if (data.logs) {
            setLogs(data.logs);
          }
        }
      } catch (error) {
        // API not available
      }
    };

    const interval = setInterval(fetchLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 pb-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {/* Agent Status - Full Width */}
          <div className="lg:col-span-4">
            <AgentStatus
              status={agentData.status}
              currentTask={agentData.currentTask}
              progress={agentData.progress}
              uptime={agentData.uptime}
            />
          </div>

          {/* LMNH's Thoughts - Full Width */}
          <div className="lg:col-span-4">
            <LMNHThoughts status={agentData.status} />
          </div>

          {/* Task Queue + Stats Row */}
          <div className="lg:col-span-2">
            <TaskQueue tasks={tasks} />
          </div>

          <div className="lg:col-span-2">
            <LiveLogs logs={logs} />
          </div>

          {/* Stats at Bottom */}
          <div className="lg:col-span-4">
            <Stats
              tasksCompleted={stats.tasksCompleted}
              tasksFailed={stats.tasksFailed}
              avgTime={stats.avgTime}
              successRate={stats.successRate}
            />
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      
      {/* Chat Button - Bottom Right (Logo opens chat!) */}
      <ChatButton onClick={() => setChatOpen(true)} />
    </DashboardLayout>
  );
}


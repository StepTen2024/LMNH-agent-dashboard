'use client';

import { Activity, Zap, Clock } from 'lucide-react';
import Logo from './Logo';

interface AgentStatusProps {
  status: 'online' | 'working' | 'idle' | 'offline';
  currentTask?: string;
  progress?: number;
  uptime?: string;
}

export default function AgentStatus({ 
  status, 
  currentTask, 
  progress = 0,
  uptime = '0h 0m'
}: AgentStatusProps) {
  const statusConfig = {
    online: { color: 'text-lmnh-green', bg: 'bg-lmnh-green/20', icon: '🟢', label: 'ONLINE' },
    working: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', icon: '⚡', label: 'WORKING' },
    idle: { color: 'text-blue-400', bg: 'bg-blue-400/20', icon: '😴', label: 'IDLE' },
    offline: { color: 'text-red-400', bg: 'bg-red-400/20', icon: '🔴', label: 'OFFLINE' },
  };

  const config = statusConfig[status];

  return (
    <div className="bg-lmnh-gray border-2 border-lmnh-green rounded-lg p-6 glow-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Logo size={60} />
          <div>
            <h2 className="text-2xl font-bold text-lmnh-green glow-text">LMNH</h2>
            <p className="text-gray-400 text-sm">Look Mum No Hands! 🚴‍♂️</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg ${config.bg} ${config.color} font-bold flex items-center gap-2`}>
          <span className="text-xl">{config.icon}</span>
          {config.label}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-lmnh-dark rounded-lg p-4 border border-lmnh-green/30">
          <div className="flex items-center gap-2 text-lmnh-green mb-2">
            <Activity size={20} />
            <span className="text-sm font-semibold">Status</span>
          </div>
          <p className="text-xl font-bold">{config.label}</p>
        </div>

        <div className="bg-lmnh-dark rounded-lg p-4 border border-lmnh-green/30">
          <div className="flex items-center gap-2 text-lmnh-green mb-2">
            <Zap size={20} />
            <span className="text-sm font-semibold">Activity</span>
          </div>
          <p className="text-xl font-bold">{status === 'working' ? 'Coding' : 'Waiting'}</p>
        </div>

        <div className="bg-lmnh-dark rounded-lg p-4 border border-lmnh-green/30">
          <div className="flex items-center gap-2 text-lmnh-green mb-2">
            <Clock size={20} />
            <span className="text-sm font-semibold">Uptime</span>
          </div>
          <p className="text-xl font-bold">{uptime}</p>
        </div>
      </div>

      {/* Current Task */}
      {currentTask && (
        <div className="mt-6 bg-lmnh-dark rounded-lg p-4 border border-lmnh-green/30">
          <div className="text-lmnh-green font-semibold mb-2">Current Task:</div>
          <p className="text-white mb-3">{currentTask}</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-lmnh-dark rounded-full h-3 border border-lmnh-green/30">
            <div 
              className="bg-lmnh-green h-full rounded-full transition-all duration-500 animate-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right text-sm text-gray-400 mt-1">{progress}%</div>
        </div>
      )}
    </div>
  );
}


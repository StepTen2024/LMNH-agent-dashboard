'use client';

import { TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatsProps {
  tasksCompleted: number;
  tasksFailed: number;
  avgTime: string;
  successRate: number;
}

export default function Stats({ 
  tasksCompleted, 
  tasksFailed, 
  avgTime, 
  successRate 
}: StatsProps) {
  return (
    <div className="bg-lmnh-gray border-2 border-lmnh-green rounded-lg p-6">
      <h3 className="text-xl font-bold text-lmnh-green mb-4">Today's Stats</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Tasks Completed */}
        <div className="bg-lmnh-dark rounded-lg p-4 border border-lmnh-green/30">
          <div className="flex items-center gap-2 text-lmnh-green mb-2">
            <CheckCircle size={20} />
            <span className="text-sm font-semibold">Completed</span>
          </div>
          <p className="text-3xl font-bold text-lmnh-green">{tasksCompleted}</p>
        </div>

        {/* Tasks Failed */}
        <div className="bg-lmnh-dark rounded-lg p-4 border border-red-400/30">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <XCircle size={20} />
            <span className="text-sm font-semibold">Failed</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{tasksFailed}</p>
        </div>

        {/* Average Time */}
        <div className="bg-lmnh-dark rounded-lg p-4 border border-blue-400/30">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Clock size={20} />
            <span className="text-sm font-semibold">Avg Time</span>
          </div>
          <p className="text-3xl font-bold text-blue-400">{avgTime}</p>
        </div>

        {/* Success Rate */}
        <div className="bg-lmnh-dark rounded-lg p-4 border border-yellow-400/30">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm font-semibold">Success Rate</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{successRate}%</p>
        </div>
      </div>

      {/* Motivational message */}
      <div className="mt-4 bg-lmnh-green/10 border border-lmnh-green/30 rounded-lg p-3 text-center">
        <p className="text-lmnh-green font-semibold">
          {successRate >= 90 ? "🔥 CRUSHING IT! LOOK MUM NO HANDS!" :
           successRate >= 70 ? "💪 Keep going! Doing great!" :
           "🚴‍♂️ Every agent has their off days!"}
        </p>
      </div>
    </div>
  );
}


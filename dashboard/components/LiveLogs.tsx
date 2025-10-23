'use client';

import { Terminal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

interface LiveLogsProps {
  logs: LogEntry[];
}

export default function LiveLogs({ logs }: LiveLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-lmnh-green';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-300';
    }
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '🚴‍♂️';
    }
  };

  return (
    <div className="bg-lmnh-gray border-2 border-lmnh-green rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="text-lmnh-green" size={24} />
        <h3 className="text-xl font-bold text-lmnh-green">Live Logs</h3>
        <div className="ml-auto">
          <span className="inline-block w-2 h-2 bg-lmnh-green rounded-full animate-pulse mr-2"></span>
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      <div className="bg-black rounded-lg p-4 font-mono text-sm max-h-[400px] overflow-y-auto terminal-scroll">
        {!mounted ? (
          <p className="text-gray-500">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500">Waiting for activity...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-2 hover:bg-lmnh-green/10 px-2 py-1 rounded transition-colors">
              <span className="text-gray-500">[{log.timestamp}]</span>
              <span className="ml-2">{getLevelIcon(log.level)}</span>
              <span className={`ml-2 ${getLevelColor(log.level)}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}


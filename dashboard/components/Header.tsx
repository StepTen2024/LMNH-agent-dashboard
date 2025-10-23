'use client';

import { Activity, Zap, Terminal, Github } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-lmnh-dark border-b-2 border-lmnh-green shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-lmnh-green to-lmnh-green/80 rounded-lg flex items-center justify-center text-2xl font-bold text-lmnh-dark animate-pulse">
                🚴‍♂️
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-lmnh-green rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-lmnh-green glow-text">
                LMNH Dashboard
              </h1>
              <p className="text-xs text-gray-400">
                Look Mum No Hands! 🚴‍♂️
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-lmnh-green transition-colors group"
            >
              <Activity size={18} className="group-hover:animate-pulse" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            
            <Link 
              href="/tasks"
              className="flex items-center gap-2 text-gray-400 hover:text-lmnh-green transition-colors group"
            >
              <Terminal size={18} className="group-hover:animate-pulse" />
              <span className="text-sm font-medium">Tasks</span>
            </Link>
            
            <Link 
              href="/performance"
              className="flex items-center gap-2 text-gray-400 hover:text-lmnh-green transition-colors group"
            >
              <Zap size={18} className="group-hover:animate-pulse" />
              <span className="text-sm font-medium">Performance</span>
            </Link>

            <a 
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-lmnh-green transition-colors group"
            >
              <Github size={18} className="group-hover:animate-pulse" />
              <span className="text-sm font-medium">GitHub</span>
            </a>
          </nav>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 bg-lmnh-green/10 border border-lmnh-green/30 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-lmnh-green rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-lmnh-green">
              Agent Online
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}


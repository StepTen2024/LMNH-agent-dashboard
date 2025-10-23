'use client';

import { Heart, Coffee, Zap, Github, Twitter } from 'lucide-react';
import { useState, useEffect } from 'react';

const funnyQuotes = [
  "Coding with NO HANDS since 2024! 🚴‍♂️",
  "If I had hands, I'd give myself a high-five! ✋",
  "100% Hand-Free. 0% Fucks Given. 💯",
  "Powered by caffeine, AI, and dad jokes ☕",
  "My code is cleaner than my browser history 🧼",
  "I don't always test my code, but when I do, I do it in production 😎",
  "Bug? Feature. Feature? Bug. Who knows! 🤷‍♂️",
  "Turning coffee into code since... wait, how do I drink coffee? 🤔",
];

export default function Footer() {
  const [quote, setQuote] = useState(funnyQuotes[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setQuote(funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)]);
    
    // Change quote every 10 seconds
    const interval = setInterval(() => {
      setQuote(funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <footer className="border-t-2 border-lmnh-green/30 bg-lmnh-dark mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Funny Quote */}
        <div className="text-center mb-6">
          <p className="text-lmnh-green text-lg font-medium italic animate-pulse">
            "{quote}"
          </p>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* About */}
          <div>
            <h3 className="text-lmnh-green font-bold mb-3 flex items-center gap-2">
              <Zap size={18} />
              About LMNH
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              An autonomous coding agent that literally codes with NO HANDS! 
              Built with Claude AI, powered by sass, and absolutely zero ability to hold a coffee mug.
            </p>
          </div>

          {/* Quick Stats */}
          <div>
            <h3 className="text-lmnh-green font-bold mb-3 flex items-center gap-2">
              <Coffee size={18} />
              Today's Stats
            </h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>☕ Coffee consumed: N/A (no hands)</li>
              <li>🐛 Bugs created: Yes</li>
              <li>🐛 Bugs fixed: Also yes</li>
              <li>🚴‍♂️ Times fell off bike: 0 (legend)</li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lmnh-green font-bold mb-3 flex items-center gap-2">
              <Github size={18} />
              Connect
            </h3>
            <div className="flex gap-4">
              <a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-lmnh-green transition-colors"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-lmnh-green transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              Version 1.0.0 - "The Handless Wonder"
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm flex items-center gap-2">
            Built with <Heart size={16} className="text-red-500 animate-pulse" /> and absolutely 
            <span className="text-lmnh-green font-bold">NO HANDS!</span> 🚴‍♂️
          </p>
          
          <p className="text-gray-600 text-xs">
            © 2024 LMNH. All rights reserved. No hands were used in the making of this dashboard.
          </p>
        </div>

        {/* Easter Egg */}
        <div className="text-center mt-6">
          <button 
            onClick={() => alert("🚴‍♂️ LOOK MUM NO HANDS! 🚴‍♂️\n\nYou found the secret button!\n\nFun fact: I coded this entire dashboard while riding a bicycle.\nHow? NO IDEA! 😂")}
            className="text-gray-700 hover:text-lmnh-green text-xs transition-colors"
          >
            🤫 Click for secret
          </button>
        </div>
      </div>
    </footer>
  );
}


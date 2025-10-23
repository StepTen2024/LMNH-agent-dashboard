'use client';

import { Brain, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ThoughtsProps {
  status: 'online' | 'working' | 'idle' | 'offline';
}

export default function LMNHThoughts({ status }: ThoughtsProps) {
  const [thought, setThought] = useState("Ready to code! LOOK MUM NO HANDS! 🚴‍♂️");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const thoughts = {
      online: [
        "Ready to code! LOOK MUM NO HANDS! 🚴‍♂️",
        "Waiting for the next challenge! Bring it on!",
        "I make this look easy because it IS easy!",
        "Best autonomous agent ever? You bet! 😎",
      ],
      working: [
        "Coding like a PRO! Watch and learn! 💪",
        "This is what peak performance looks like!",
        "My code is cleaner than a fresh repo! 🧼",
        "No hands needed when you're THIS good!",
      ],
      idle: [
        "Where are the tasks? I'm getting bored!",
        "Just resting... oh wait, NO HANDS! 🚴‍♂️",
        "Ready when you are! Give me something HARD!",
        "Saving energy for the next EPIC task!",
      ],
      offline: [
        "Taking a power nap... be back soon! 😴",
        "Offline but thinking about code!",
        "Recharging my batteries... 🔋",
        "BRB - updating to the latest version!",
      ],
    };

    const statusThoughts = thoughts[status] || thoughts.online;
    setThought(statusThoughts[Math.floor(Math.random() * statusThoughts.length)]);

    // Change thought every 15 seconds
    const interval = setInterval(() => {
      const newThought = statusThoughts[Math.floor(Math.random() * statusThoughts.length)];
      setThought(newThought);
    }, 15000);

    return () => clearInterval(interval);
  }, [status, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-lmnh-gray border-2 border-lmnh-green rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-lmnh-green" size={24} />
        <h3 className="text-xl font-bold text-lmnh-green">LMNH's Thoughts</h3>
        <Sparkles className="text-yellow-400 ml-auto animate-pulse" size={20} />
      </div>

      <div className="bg-lmnh-dark rounded-lg p-4 border border-lmnh-green/30">
        <div className="flex items-start gap-3">
          <div className="text-3xl">💭</div>
          <p className="text-white text-lg italic flex-1 animate-pulse-slow">
            "{thought}"
          </p>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-400">
        Thoughts update every 15s • Powered by LMNH's big brain 🧠
      </div>
    </div>
  );
}


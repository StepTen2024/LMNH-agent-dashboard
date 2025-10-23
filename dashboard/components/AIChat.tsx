'use client';

import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm LMNH! 🚴‍♂️ Ask me anything about my tasks, or just chat! NO HANDS!",
      timestamp: '00:00:00',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fix hydration: only update timestamp on client side
  useEffect(() => {
    setMounted(true);
    setMessages([
      {
        role: 'assistant',
        content: "Hey! I'm LMNH! 🚴‍♂️ Ask me anything about my tasks, or just chat! NO HANDS!",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call Claude API through backend
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response + (data.powered_by === 'Claude AI' ? ' 🧠' : ''),
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback personality responses
        const responses = [
          "That's a great question! Let me think about that... 🤔",
          "Interesting! Right now I'm focused on crushing these tasks! 💪",
          "LOOK MUM NO HANDS! Oh sorry, got excited there! 🚴‍♂️",
          "You know what's cool? I'm an AI talking to... probably a human! Wild!",
          "I'd love to chat but I'm in WORK MODE right now! 🔥",
        ];
        const assistantMessage: Message = {
          role: 'assistant',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.log('Chat API not available, using fallback');
      const fallbacks = [
        "Whoops! My chat brain is offline! But I'm still working on tasks! 🚴‍♂️",
        "Chat is being shy right now, but I'm here in spirit! 💚",
        "API timeout! Just like my coding - NO HANDS! 😅",
      ];
      const assistantMessage: Message = {
        role: 'assistant',
        content: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-lmnh-gray border-2 border-lmnh-green rounded-lg p-6 flex flex-col h-[500px]">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="text-lmnh-green" size={24} />
        <h3 className="text-xl font-bold text-lmnh-green">Chat with LMNH</h3>
        <div className="ml-auto">
          <span className="inline-block w-2 h-2 bg-lmnh-green rounded-full animate-pulse mr-2"></span>
          <span className="text-sm text-gray-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-black rounded-lg p-4 overflow-y-auto terminal-scroll mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-lmnh-green/20 border border-lmnh-green/50 text-white'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-60 mt-1">{msg.timestamp}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block bg-lmnh-green/20 border border-lmnh-green/50 px-4 py-2 rounded-lg">
              <Loader2 className="text-lmnh-green animate-spin" size={20} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask LMNH anything... 🚴‍♂️"
          className="flex-1 bg-lmnh-dark border border-lmnh-green/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-lmnh-green"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-lmnh-green text-lmnh-dark px-4 py-2 rounded-lg font-bold hover:bg-lmnh-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
}


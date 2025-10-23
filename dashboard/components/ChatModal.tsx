'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import UserAvatar from './avatars/UserAvatar';
import LMNHAvatar from './avatars/LMNHAvatar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mood?: 'confident' | 'thinking' | 'coding' | 'excited' | 'confused' | 'working';
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm LMNH! 🚴‍♂️ Ask me anything about my tasks, or just chat! NO HANDS!",
      timestamp: '00:00:00',
      mood: 'excited',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine LMNH's mood based on message content
  const detectMood = (content: string): 'confident' | 'thinking' | 'coding' | 'excited' | 'confused' | 'working' => {
    const lower = content.toLowerCase();
    if (lower.includes('!') && (lower.includes('awesome') || lower.includes('amazing') || lower.includes('love') || lower.includes('yes!'))) {
      return 'excited';
    }
    if (lower.includes('thinking') || lower.includes('hmm') || lower.includes('let me')) {
      return 'thinking';
    }
    if (lower.includes('code') || lower.includes('function') || lower.includes('git') || lower.includes('commit')) {
      return 'coding';
    }
    if (lower.includes('working') || lower.includes('building') || lower.includes('fixing')) {
      return 'working';
    }
    if (lower.includes('?') || lower.includes('not sure') || lower.includes('confused')) {
      return 'confused';
    }
    return 'confident';
  };

  // Format message content with special styling
  const formatMessageContent = (content: string) => {
    // Split by different patterns
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let key = 0;

    // Pattern for *actions* (italic text between asterisks)
    const actionRegex = /\*([^*]+)\*/g;
    // Pattern for **bold** text
    const boldRegex = /\*\*([^*]+)\*\*/g;
    // Pattern for `code`
    const codeRegex = /`([^`]+)`/g;

    // Combine all patterns
    const combinedRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|LOOK MUM NO HANDS!)/g;
    
    let match;
    const matches: Array<{index: number, text: string, type: string}> = [];
    
    // Find all matches
    while ((match = combinedRegex.exec(content)) !== null) {
      matches.push({
        index: match.index,
        text: match[0],
        type: match[0].startsWith('**') ? 'bold' :
              match[0].startsWith('*') ? 'action' :
              match[0].startsWith('`') ? 'code' :
              match[0] === 'LOOK MUM NO HANDS!' ? 'special' : 'text'
      });
    }

    // Build formatted output
    matches.forEach((m, i) => {
      // Add text before this match
      if (m.index > lastIndex) {
        parts.push(<span key={key++}>{content.substring(lastIndex, m.index)}</span>);
      }

      // Add formatted match
      if (m.type === 'action') {
        const text = m.text.slice(1, -1); // Remove asterisks
        parts.push(
          <span 
            key={key++} 
            className="italic text-lmnh-green animate-pulse font-medium"
          >
            ✨ {text} ✨
          </span>
        );
      } else if (m.type === 'bold') {
        const text = m.text.slice(2, -2); // Remove double asterisks
        parts.push(
          <span key={key++} className="font-bold text-white">
            {text}
          </span>
        );
      } else if (m.type === 'code') {
        const text = m.text.slice(1, -1); // Remove backticks
        parts.push(
          <code 
            key={key++} 
            className="bg-lmnh-dark border border-lmnh-green/50 px-2 py-0.5 rounded text-lmnh-green font-mono text-sm"
          >
            {text}
          </code>
        );
      } else if (m.type === 'special') {
        parts.push(
          <span 
            key={key++} 
            className="inline-block font-bold text-lmnh-green animate-bounce bg-lmnh-green/20 px-2 py-1 rounded-lg border-2 border-lmnh-green shadow-lg shadow-lmnh-green/50"
          >
            {m.text}
          </span>
        );
      }

      lastIndex = m.index + m.text.length;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(<span key={key++}>{content.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : content;
  };

  // Fix hydration
  useEffect(() => {
    setMounted(true);
    setMessages([
      {
        role: 'assistant',
        content: "Hey! I'm LMNH! 🚴‍♂️ Ask me anything about my tasks, or just chat! NO HANDS!",
        timestamp: new Date().toLocaleTimeString(),
        mood: 'excited',
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toLocaleTimeString(),
          mood: detectMood(data.response),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      console.log('Chat API not available');
      const fallbackMessage: Message = {
        role: 'assistant',
        content: "Whoops! My chat brain is offline right now! But I'm still working on tasks! 🚴‍♂️",
        timestamp: new Date().toLocaleTimeString(),
        mood: 'confused',
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn overflow-hidden">
      {/* Modal Container */}
      <div className="bg-lmnh-dark border-4 border-lmnh-green rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl shadow-lmnh-green/20 animate-scaleIn">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-lmnh-green/20 to-transparent border-b-2 border-lmnh-green/50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <MessageSquare className="text-lmnh-green w-10 h-10" />
              <Sparkles className="absolute -top-1 -right-1 text-lmnh-green w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-lmnh-green glow-text">
                Chat with LMNH
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-lmnh-green rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-400">
                  Powered by Claude AI 🧠 | NO HANDS MODE 🚴‍♂️
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-lmnh-green hover:text-white hover:rotate-90 transition-all duration-300"
          >
            <X size={32} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 terminal-scroll">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp gap-3 items-end`}
            >
              {/* Avatar (show on left for LMNH, right for user) */}
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 mb-1">
                  <LMNHAvatar mood={msg.mood || 'confident'} />
                </div>
              )}
              
              <div
                className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gradient-to-br from-lmnh-green/20 to-lmnh-green/5 border-2 border-lmnh-green/50 text-white shadow-lg shadow-lmnh-green/10'
                }`}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {msg.role === 'assistant' ? formatMessageContent(msg.content) : msg.content}
                </p>
                <p className="text-xs opacity-60 mt-2">{msg.timestamp}</p>
              </div>
              
              {msg.role === 'user' && (
                <div className="flex-shrink-0 mb-1">
                  <UserAvatar />
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-slideUp gap-3 items-end">
              <div className="flex-shrink-0 mb-1">
                <LMNHAvatar mood="thinking" />
              </div>
              <div className="bg-lmnh-green/20 border-2 border-lmnh-green/50 rounded-2xl px-6 py-4 flex items-center gap-3">
                <Loader2 className="text-lmnh-green animate-spin" size={20} />
                <span className="text-lmnh-green font-medium">LMNH is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-lmnh-green/50 bg-gradient-to-t from-lmnh-green/10 to-transparent p-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask LMNH anything... (Press Enter to send) 🚴‍♂️"
                className="w-full bg-lmnh-dark border-2 border-lmnh-green/30 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-lmnh-green focus:shadow-lg focus:shadow-lmnh-green/20 transition-all resize-none"
                rows={3}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-br from-lmnh-green to-lmnh-green/80 text-lmnh-dark px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-lmnh-green/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Send size={24} />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 Tip: Ask about tasks, status, or just have a chat! LMNH loves dad jokes! 😄
          </p>
        </div>
      </div>
    </div>
  );
}


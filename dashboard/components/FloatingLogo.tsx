"use client";

import { useState, useEffect, useRef } from 'react';

export default function FloatingLogo() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [velocity, setVelocity] = useState({ x: 1, y: 1 });
  const [isScared, setIsScared] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setPosition((prev) => {
        const logoSize = 120;
        const detectionRadius = 150; // How far away the mouse triggers escape
        const escapeSpeed = 8; // How fast it runs away
        const normalSpeed = 1;

        // Calculate distance to mouse
        const dx = mouseRef.current.x - prev.x;
        const dy = mouseRef.current.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let newVel = { ...velocity };
        let newX = prev.x;
        let newY = prev.y;

        // If mouse is too close, RUN AWAY!
        if (distance < detectionRadius) {
          setIsScared(true);
          // Run in opposite direction
          const angle = Math.atan2(dy, dx);
          newVel = {
            x: -Math.cos(angle) * escapeSpeed,
            y: -Math.sin(angle) * escapeSpeed,
          };
        } else {
          setIsScared(false);
          // Random gentle floating
          newVel = {
            x: velocity.x + (Math.random() - 0.5) * 0.2,
            y: velocity.y + (Math.random() - 0.5) * 0.2,
          };
          
          // Limit speed when not scared
          const speed = Math.sqrt(newVel.x * newVel.x + newVel.y * newVel.y);
          if (speed > normalSpeed) {
            newVel.x = (newVel.x / speed) * normalSpeed;
            newVel.y = (newVel.y / speed) * normalSpeed;
          }
        }

        setVelocity(newVel);

        // Update position
        newX += newVel.x;
        newY += newVel.y;

        // Bounce off walls
        if (newX <= 0 || newX >= window.innerWidth - logoSize) {
          newVel.x *= -1;
          newX = Math.max(0, Math.min(window.innerWidth - logoSize, newX));
        }
        if (newY <= 0 || newY >= window.innerHeight - logoSize) {
          newVel.y *= -1;
          newY = Math.max(0, Math.min(window.innerHeight - logoSize, newY));
        }

        setVelocity(newVel);
        return { x: newX, y: newY };
      });
    };

    const interval = setInterval(animate, 16); // ~60fps
    return () => clearInterval(interval);
  }, [velocity]);

  return (
    <div
      ref={logoRef}
      className={`fixed z-50 transition-transform cursor-pointer select-none ${
        isScared ? 'scale-90' : 'scale-100 hover:scale-110'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isScared ? 'transform 0.1s ease-out' : 'transform 0.3s ease-in-out',
      }}
      title="Try to catch me! 🚴‍♂️"
    >
      <div className={`relative ${isScared ? 'animate-bounce' : ''}`}>
        {/* The LMNH Logo */}
        <svg 
          width="120" 
          height="120" 
          viewBox="0 0 200 200" 
          className="drop-shadow-2xl animate-pulse"
        >
          <defs>
            <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00ff88', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#00ccff', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#00ff88', stopOpacity: 1 }} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer circle glow */}
          <circle 
            cx="100" 
            cy="100" 
            r="90" 
            fill="none" 
            stroke="url(#neon-gradient)" 
            strokeWidth="4"
            filter="url(#glow)"
            className="animate-spin"
            style={{ animationDuration: '8s' }}
          />
          
          {/* Inner design */}
          <text
            x="100"
            y="120"
            fontSize="80"
            textAnchor="middle"
            fill="url(#neon-gradient)"
            filter="url(#glow)"
            className="font-bold"
          >
            🚴‍♂️
          </text>
          
          {/* Speed lines when scared */}
          {isScared && (
            <>
              <line x1="20" y1="100" x2="50" y2="100" stroke="#00ff88" strokeWidth="2" opacity="0.6" />
              <line x1="20" y1="110" x2="45" y2="110" stroke="#00ff88" strokeWidth="2" opacity="0.4" />
              <line x1="20" y1="90" x2="45" y2="90" stroke="#00ff88" strokeWidth="2" opacity="0.4" />
            </>
          )}
        </svg>

        {/* Scared emoji */}
        {isScared && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce">
            😱
          </div>
        )}
        
        {/* Thought bubble when not scared */}
        {!isScared && Math.random() > 0.98 && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#00ff88] text-black px-3 py-1 rounded-full text-xs whitespace-nowrap animate-ping">
            Can't catch me! 🏃‍♂️
          </div>
        )}
      </div>
    </div>
  );
}


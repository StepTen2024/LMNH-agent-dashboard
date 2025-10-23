export default function Logo({ size = 80 }: { size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 200" 
      width={size} 
      height={size}
      className="animate-pulse-slow"
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="95" fill="#1a1a1a" stroke="#00ff88" strokeWidth="4"/>
      
      {/* Robot head */}
      <circle cx="100" cy="80" r="35" fill="#333" stroke="#00ff88" strokeWidth="2"/>
      
      {/* Eyes */}
      <circle cx="90" cy="75" r="6" fill="#00ff88"/>
      <circle cx="110" cy="75" r="6" fill="#00ff88"/>
      
      {/* Confident smirk */}
      <path d="M 85 90 Q 100 100 115 90" stroke="#00ff88" strokeWidth="3" fill="none" strokeLinecap="round"/>
      
      {/* Robot body */}
      <rect x="75" y="110" width="50" height="40" rx="5" fill="#333" stroke="#00ff88" strokeWidth="2"/>
      
      {/* Arms spread wide (no hands!) */}
      <line x1="75" y1="125" x2="45" y2="115" stroke="#00ff88" strokeWidth="4" strokeLinecap="round"/>
      <line x1="125" y1="125" x2="155" y2="115" stroke="#00ff88" strokeWidth="4" strokeLinecap="round"/>
      
      {/* Code symbols floating around */}
      <text x="40" y="50" fill="#00ff88" fontFamily="monospace" fontSize="14">&lt;/&gt;</text>
      <text x="150" y="60" fill="#00ff88" fontFamily="monospace" fontSize="12">{'{ }'}</text>
      <text x="35" y="170" fill="#00ff88" fontFamily="monospace" fontSize="10">git</text>
      <text x="160" y="160" fill="#00ff88" fontFamily="monospace" fontSize="10">AI</text>
      
      {/* LMNH text */}
      <text x="100" y="180" textAnchor="middle" fill="#00ff88" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16">LMNH</text>
    </svg>
  );
}


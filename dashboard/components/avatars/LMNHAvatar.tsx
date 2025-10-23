interface LMNHAvatarProps {
  mood?: 'confident' | 'thinking' | 'coding' | 'excited' | 'confused' | 'working';
}

export default function LMNHAvatar({ mood = 'confident' }: LMNHAvatarProps) {
  const getMouthPath = () => {
    switch (mood) {
      case 'thinking':
        return "M 25.5 27 L 34.5 27"; // Straight line (neutral)
      case 'excited':
        return "M 24 30 Q 30 35 36 30"; // Big smile
      case 'confused':
        return "M 24 29 Q 27 27 30 28 Q 33 29 36 27"; // Wavy confused
      case 'coding':
      case 'working':
        return "M 25.5 28 Q 30 30 34.5 28"; // Focused smirk
      default:
        return "M 25.5 27 Q 30 30 34.5 27"; // Confident smirk
    }
  };

  const getEyes = () => {
    if (mood === 'thinking') {
      return (
        <>
          <circle cx="27" cy="22.5" r="1.8" fill="#00ff88"/>
          <circle cx="33" cy="22.5" r="1.8" fill="#00ff88"/>
          {/* Thinking lines */}
          <path d="M 38 18 Q 40 16 42 17" stroke="#00ff88" strokeWidth="0.8" fill="none"/>
          <path d="M 40 20 Q 43 19 44 21" stroke="#00ff88" strokeWidth="0.8" fill="none"/>
          <circle cx="45" cy="23" r="0.8" fill="#00ff88"/>
        </>
      );
    }
    if (mood === 'excited') {
      return (
        <>
          <circle cx="27" cy="22.5" r="2.2" fill="#00ff88"/>
          <circle cx="33" cy="22.5" r="2.2" fill="#00ff88"/>
          {/* Sparkles */}
          <text x="24" y="20" fill="#00ff88" fontSize="4">✨</text>
          <text x="35" y="20" fill="#00ff88" fontSize="4">✨</text>
        </>
      );
    }
    if (mood === 'coding' || mood === 'working') {
      return (
        <>
          <rect x="25.5" y="21" width="3" height="3" rx="0.5" fill="none" stroke="#00ff88" strokeWidth="0.6"/>
          <rect x="31.5" y="21" width="3" height="3" rx="0.5" fill="none" stroke="#00ff88" strokeWidth="0.6"/>
          {/* Code symbols in eyes */}
          <text x="26.2" y="23.8" fill="#00ff88" fontSize="2" fontFamily="monospace">&lt;&gt;</text>
          <text x="32.2" y="23.8" fill="#00ff88" fontSize="2.5" fontFamily="monospace">{'{}'}</text>
        </>
      );
    }
    if (mood === 'confused') {
      return (
        <>
          <circle cx="27" cy="22.5" r="1.5" fill="#00ff88"/>
          <circle cx="33" cy="23.5" r="1.8" fill="#00ff88"/>
          {/* Question mark */}
          <text x="37" y="21" fill="#00ff88" fontSize="6" fontWeight="bold">?</text>
        </>
      );
    }
    return (
      <>
        <circle cx="27" cy="22.5" r="1.8" fill="#00ff88"/>
        <circle cx="33" cy="22.5" r="1.8" fill="#00ff88"/>
      </>
    );
  };

  const getCodeSymbols = () => {
    if (mood === 'coding' || mood === 'working') {
      return (
        <>
          <text x="12" y="15" fill="#00ff88" fontFamily="monospace" fontSize="4">&lt;/&gt;</text>
          <text x="45" y="18" fill="#00ff88" fontFamily="monospace" fontSize="3.5">{'{ }'}</text>
          <text x="10" y="51" fill="#00ff88" fontFamily="monospace" fontSize="3">git</text>
          <text x="48" y="48" fill="#00ff88" fontFamily="monospace" fontSize="3">AI</text>
        </>
      );
    }
    return (
      <>
        <text x="12" y="15" fill="#00ff88" fontFamily="monospace" fontSize="4">&lt;/&gt;</text>
        <text x="45" y="18" fill="#00ff88" fontFamily="monospace" fontSize="3.5">{'{ }'}</text>
      </>
    );
  };

  const getArms = () => {
    if (mood === 'excited') {
      // Arms up in celebration!
      return (
        <>
          <line x1="22.5" y1="37.5" x2="15" y2="30" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="37.5" y1="37.5" x2="45" y2="30" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round"/>
        </>
      );
    }
    // Default: Arms spread wide (NO HANDS!)
    return (
      <>
        <line x1="22.5" y1="37.5" x2="13.5" y2="34.5" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="37.5" y1="37.5" x2="46.5" y2="34.5" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round"/>
      </>
    );
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="40" height="40">
      {/* Background circle */}
      <circle cx="30" cy="30" r="28" fill="#1a1a1a" stroke="#00ff88" strokeWidth="1.5"/>
      
      {/* Robot head */}
      <circle cx="30" cy="24" r="10.5" fill="#333" stroke="#00ff88" strokeWidth="0.8"/>
      
      {/* Eyes (dynamic based on mood) */}
      {getEyes()}
      
      {/* Mouth (dynamic based on mood) */}
      <path d={getMouthPath()} stroke="#00ff88" strokeWidth="1" fill="none" strokeLinecap="round"/>
      
      {/* Robot body */}
      <rect x="22.5" y="33" width="15" height="12" rx="1.5" fill="#333" stroke="#00ff88" strokeWidth="0.8"/>
      
      {/* Arms spread wide (NO HANDS!) */}
      {getArms()}
      
      {/* Code symbols floating around */}
      {getCodeSymbols()}
      
      {/* LMNH text */}
      <text x="30" y="54" textAnchor="middle" fill="#00ff88" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="5">LMNH</text>
    </svg>
  );
}


export default function UserAvatar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="40" height="40">
      {/* Background circle */}
      <circle cx="30" cy="30" r="28" fill="#1a1a1a" stroke="#4A90E2" strokeWidth="2"/>
      
      {/* Human head */}
      <circle cx="30" cy="25" r="12" fill="#FFD700" stroke="#4A90E2" strokeWidth="1.5"/>
      
      {/* Eyes */}
      <circle cx="26" cy="23" r="2" fill="#1a1a1a"/>
      <circle cx="34" cy="23" r="2" fill="#1a1a1a"/>
      
      {/* Smile */}
      <path d="M 24 28 Q 30 32 36 28" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      
      {/* Body */}
      <rect x="20" y="35" width="20" height="15" rx="2" fill="#4A90E2" stroke="#4A90E2" strokeWidth="1"/>
      
      {/* Arms WITH HANDS (because user has hands lol) */}
      <line x1="20" y1="40" x2="12" y2="38" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
      <line x1="40" y1="40" x2="48" y2="38" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Hands! */}
      <circle cx="11" cy="37" r="2.5" fill="#FFD700" stroke="#4A90E2" strokeWidth="1"/>
      <circle cx="49" cy="37" r="2.5" fill="#FFD700" stroke="#4A90E2" strokeWidth="1"/>
      
      {/* Human text */}
      <text x="30" y="56" textAnchor="middle" fill="#4A90E2" fontFamily="monospace" fontSize="7" fontWeight="bold">HUMAN</text>
    </svg>
  );
}


'use client';

interface ChatButtonProps {
  onClick: () => void;
}

export default function ChatButton({ onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-24 h-24 bg-lmnh-dark border-4 border-lmnh-green rounded-full shadow-2xl hover:shadow-lmnh-green/80 transition-all animate-pulse z-40 group overflow-hidden flex items-center justify-center p-2 hover:scale-110"
      title="💬 Chat with LMNH"
    >
      {/* Animated Logo - Fills circle */}
      <img 
        src="/lmnh-logo.svg" 
        alt="LMNH" 
        className="w-full h-full object-contain group-hover:animate-flipbook transition-all group-hover:scale-110"
      />
      
      {/* Chat Badge */}
      <span className="absolute -top-2 -right-2 bg-lmnh-green text-lmnh-dark text-sm font-bold px-3 py-1 rounded-full animate-bounce shadow-lg border-2 border-lmnh-dark">
        💬
      </span>
    </button>
  );
}


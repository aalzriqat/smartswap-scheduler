
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MatchCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
  message: string;
}

export const MatchCelebration: React.FC<MatchCelebrationProps> = ({
  isVisible,
  onComplete,
  message
}) => {
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'show' | 'hide'>('initial');

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('show');
      const timer = setTimeout(() => {
        setAnimationPhase('hide');
        setTimeout(onComplete, 500);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setAnimationPhase('initial');
    }
  }, [isVisible, onComplete]);

  if (!isVisible && animationPhase === 'initial') return null;

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        @keyframes bounce-in {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(-90deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
          }
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
          animation: confetti-fall 3s linear forwards;
        }
        
        .celebration-bounce {
          animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .celebration-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
      
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center pointer-events-none",
          animationPhase === 'hide' && "opacity-0 transition-opacity duration-500"
        )}
      >
        {/* Confetti Background */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                backgroundColor: [
                  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', 
                  '#fd79a8', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'
                ][Math.floor(Math.random() * 10)]
              }}
            />
          ))}
        </div>

        {/* Main Celebration Card */}
        <div className={cn(
          "bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md text-center border-4 border-blue-500",
          "celebration-bounce celebration-glow"
        )}>
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 Perfect Match! 🎉
          </h2>
          <p className="text-gray-600 text-lg mb-4">
            {message}
          </p>
          
          {/* Additional celebration elements */}
          <div className="flex justify-center space-x-2 text-2xl">
            <span className="animate-bounce">⭐</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎊</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
            <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🎉</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>⭐</span>
          </div>
        </div>
      </div>
    </>
  );
};

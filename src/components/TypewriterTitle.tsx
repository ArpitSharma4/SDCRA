import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterTitleProps {
  lines: string[];
  className?: string;
  speed?: number;
}

export const TypewriterTitle: React.FC<TypewriterTitleProps> = ({ 
  lines, 
  className = '', 
  speed = 50 
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [restartKey, setRestartKey] = useState(0); // Key to force restart

  useEffect(() => {
    if (currentLineIndex < lines.length) {
      const currentLine = lines[currentLineIndex];
      
      if (currentCharIndex < currentLine.length) {
        const timer = setTimeout(() => {
          setCurrentCharIndex(prev => prev + 1);
        }, speed);
        return () => clearTimeout(timer);
      } else if (currentLineIndex < lines.length - 1) {
        // Move to next line immediately
        const timer = setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        }, 300); // Brief pause between lines
        return () => clearTimeout(timer);
      } else {
        // All lines complete, keep cursor blinking for a bit then restart
        const timer = setTimeout(() => {
          setShowCursor(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentLineIndex, currentCharIndex, lines, speed]);

  // Restart animation after 10 seconds
  useEffect(() => {
    if (currentLineIndex === lines.length - 1 && currentCharIndex === lines[lines.length - 1].length) {
      const restartTimer = setTimeout(() => {
        setRestartKey(prev => prev + 1); // Force component restart
        setCurrentLineIndex(0);
        setCurrentCharIndex(0);
        setShowCursor(true);
      }, 10000); // 10 seconds
      return () => clearTimeout(restartTimer);
    }
  }, [currentLineIndex, currentCharIndex, lines]);

  const getLineColor = (lineIndex: number): string => {
    switch (lineIndex) {
      case 0: return 'text-cyan-400'; // Space Debris - Cyan Glow
      case 1: return 'text-amber-500'; // Collision Risk - Warning Orange
      case 2: return 'text-white'; // Analyser - White
      default: return 'text-white';
    }
  };

  return (
    <div key={restartKey} className={`font-mono ${className}`}>
      {lines.map((line, lineIndex) => (
        <div key={`${lineIndex}-${restartKey}`} className="overflow-hidden flex items-center">
          <motion.h1
            initial={{ width: 0 }}
            animate={{ 
              width: lineIndex < currentLineIndex ? 'auto' : 
                      lineIndex === currentLineIndex ? `${currentCharIndex}ch` : 0
            }}
            transition={{ 
              duration: speed / 1000, 
              ease: 'linear'
            }}
            className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${getLineColor(lineIndex)}`}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              display: 'inline-block'
            }}
          >
            {lineIndex < currentLineIndex ? line : 
             lineIndex === currentLineIndex ? line.slice(0, currentCharIndex) : ''}
          </motion.h1>
          
          {/* Blinking cursor - ONLY on final line, outside animated container */}
          <AnimatePresence>
            {lineIndex === currentLineIndex && 
             lineIndex === lines.length - 1 &&
             currentCharIndex <= line.length && 
             showCursor && (
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 0, 1] }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.8, 
                  repeat: showCursor ? Infinity : 0,
                  ease: 'easeInOut'
                }}
                className="inline-block ml-1 w-0.5 bg-current"
                style={{
                  height: '3.0em', // Increased height for better visibility
                  alignSelf: 'center'
                }}
              />
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

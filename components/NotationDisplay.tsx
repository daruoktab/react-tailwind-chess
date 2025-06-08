
import React, { useEffect, useRef } from 'react';

interface NotationDisplayProps {
  moveHistory: string[];
}

const NotationDisplay: React.FC<NotationDisplayProps> = ({ moveHistory }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [moveHistory]);

  return (
    <div className={`
      bg-gradient-to-br from-slate-800/80 to-slate-700/80
      backdrop-blur-sm rounded-xl shadow-xl
      border border-slate-600/50
      w-full
    `}>
      <h3 className={`
        text-lg font-bold
        text-transparent bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text
        mb-3 border-b border-slate-600/50
        pb-2 px-4 pt-4
      `}>
        📋 Move History
      </h3>
      <div 
        ref={scrollContainerRef}
        className={`
          px-4 pb-4
          max-h-36 md:max-h-44
          overflow-y-auto
          scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800
        `}
        aria-live="polite"
        aria-atomic="true"
      >
        {moveHistory.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No moves recorded yet. Make your first move!</p>
        ) : (
          <ol className="list-none p-0 m-0 space-y-1 text-sm text-slate-200">
            {moveHistory.reduce<React.JSX.Element[]>((acc, notation, index) => {
              if (index % 2 === 0) {
                const moveNumber = Math.floor(index / 2) + 1;
                const blackMove = moveHistory[index + 1] ? ` ${moveHistory[index + 1]}` : '';
                acc.push(
                  <li key={index} className={`
                    flex tabular-nums
                    hover:bg-slate-700/30 rounded-md
                    px-2 py-1
                    transition-colors duration-200
                  `}>
                    <span className="w-8 text-right pr-3 text-sky-400 font-medium">{moveNumber}.</span>
                    <span className="flex-1 font-mono tracking-wide">{notation}{blackMove}</span>
                  </li>
                );
              }
              return acc;
            }, [])}
          </ol>
        )}
      </div>
    </div>
  );
};

export default NotationDisplay;

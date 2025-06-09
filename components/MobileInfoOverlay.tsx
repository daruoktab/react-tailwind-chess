import React from 'react';
import NotationDisplay from './NotationDisplay'; // Assuming NotationDisplay is in the same components folder

interface MobileInfoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  moveHistory: string[];
  gameStatusMessage: string;
  onResetGame: () => void;
  isCheckmate: boolean; // Added to determine button text
  isStalemate: boolean; // Added to determine button text
  isCheck: boolean; // Added for status message styling
}

export const MobileInfoOverlay: React.FC<MobileInfoOverlayProps> = ({
  isOpen,
  onClose,
  moveHistory,
  gameStatusMessage,
  onResetGame,
  isCheckmate,
  isStalemate,
  isCheck,
}) => {
  if (!isOpen) {
    return null;
  }

  // Determine status message styling based on game state
  // Similar to App.tsx, but adapted for the overlay
  let statusMessageClasses = 'px-3 py-2 rounded-md text-sm font-medium text-center ';
  if (isCheckmate) {
    statusMessageClasses += 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
  } else if (isStalemate) {
    statusMessageClasses += 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
  } else if (isCheck) {
    statusMessageClasses += 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse';
  } else {
    statusMessageClasses += 'bg-slate-700/60 text-slate-300 border border-slate-600/40';
  }


  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-sm lg:hidden"
      onClick={onClose} // Close when clicking backdrop
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-x-4 bottom-4 top-16 z-50 flex flex-col gap-4 p-4 bg-slate-800 rounded-lg shadow-xl lg:hidden overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside panel
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Close info panel"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Game Status Message */}
        <div className={statusMessageClasses}>
          {gameStatusMessage}
        </div>

        {/* Move History */}
        <div className="flex-grow flex flex-col min-h-0"> {/* Ensure NotationDisplay can shrink and scroll */}
          <NotationDisplay moveHistory={moveHistory} />
        </div>

        {/* Reset Game Button */}
        <button
          type="button"
          onClick={() => {
            onResetGame();
            onClose(); // Close overlay after resetting
          }}
          className={`
            w-full px-6 py-3 mt-auto
            bg-gradient-to-r from-sky-600 to-blue-600
            hover:from-sky-500 hover:to-blue-500
            text-white font-bold text-base rounded-xl
            shadow-xl transform transition-all duration-200
            hover:scale-105 hover:shadow-2xl
            focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50
            active:scale-95
          `}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isCheckmate || isStalemate ? 'Play Again' : 'Reset Game'}
          </span>
        </button>
      </div>
    </div>
  );
};

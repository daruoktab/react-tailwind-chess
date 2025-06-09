import React from 'react';
import { MobileInfoOverlay } from './MobileInfoOverlay'; // Import MobileInfoOverlay
import { CapturedPiecesDisplay } from './CapturedPiecesDisplay'; // Import CapturedPiecesDisplay
import { Piece } from '../types'; // Assuming Piece type might be needed for new props

export interface AppLayoutProps {
  headerContent: React.ReactNode;
  leftSidebarContent: React.ReactNode; // For desktop
  mainContent: React.ReactNode;
  rightSidebarContent: React.ReactNode; // For desktop
  // Props for MobileInfoOverlay
  isInfoOverlayVisible: boolean;
  toggleInfoOverlay: () => void;
  moveHistory: string[];
  gameStatusMessage: string;
  onResetGame: () => void;
  isCheckmate: boolean;
  isStalemate: boolean;
  isCheck: boolean;
  // Props for mobile captured pieces
  capturedByWhiteData: Piece[];
  capturedByBlackData: Piece[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  headerContent,
  leftSidebarContent,
  mainContent,
  rightSidebarContent,
  isInfoOverlayVisible,
  toggleInfoOverlay,
  moveHistory,
  gameStatusMessage,
  onResetGame,
  isCheckmate,
  isStalemate,
  isCheck,
  capturedByWhiteData,
  capturedByBlackData,
}) => {
  return (
    <div className={`
      min-h-screen
      bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
      text-neutral-100
      flex flex-col items-center justify-center
      p-4 md:p-6
      selection:bg-sky-500 selection:text-white
    `}>
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <header className="w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-6xl xl:max-w-7xl mb-6 md:mb-8 text-center relative z-10 flex items-center justify-between px-1">
        {/* Mobile Info Toggle Button - aligned to the left or start */}
        <button
          onClick={toggleInfoOverlay}
          className="p-2 rounded-md bg-slate-700/80 hover:bg-slate-600/80 text-white lg:hidden shadow-md"
          aria-label="Toggle game info panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Header Content (Title and Desktop Status) - takes remaining space and centers its content */}
        <div className="flex-grow">
          {headerContent}
        </div>

        {/* Spacer to balance the mobile button, hidden on lg screens */}
        <div className="w-9 h-9 lg:hidden" aria-hidden="true"></div>
      </header>

      <div className={`
        flex flex-col lg:flex-row
        gap-2 sm:gap-4 lg:gap-6 items-start
        w-full
        max-w-sm sm:max-w-md md:max-w-xl lg:max-w-6xl xl:max-w-7xl
        relative z-10
      `}>
        {/* Mobile: Captured Black Pieces (Top) - order-1 ensures it's first in flex-col */}
        <div className="w-full order-1 lg:hidden">
          <CapturedPiecesDisplay pieces={capturedByBlackData} title="Black's Captures" />
        </div>

        {/* Main Content (Board) - Order changes for mobile vs desktop */}
        {/* On mobile, order-2. On desktop, it's part of lg:flex-row, effectively order-2 by source order among visible lg items */}
        <div className={`
          flex-grow flex justify-center
          order-2
          w-full lg:w-auto
        `}>
          {mainContent} {/* This is the BoardComponent */}
        </div>

        {/* Mobile: Captured White Pieces (Bottom) - order-3 ensures it's last in flex-col before desktop sidebars */}
        <div className="w-full order-3 lg:hidden">
          <CapturedPiecesDisplay pieces={capturedByWhiteData} title="White's Captures" />
        </div>

        {/* Desktop Left Sidebar (contains both captured displays from App.tsx) */}
        {/* order-1 for lg screens, hidden on smaller screens */}
        <div className={`
          w-full lg:w-64
          order-1
          hidden lg:flex lg:flex-col lg:flex-shrink-0 lg:space-y-4
        `}>
          {leftSidebarContent}
        </div>

        {/* Desktop Right Sidebar (Game Info, Moves, Reset from App.tsx) */}
        {/* order-3 for lg screens, hidden on smaller screens */}
        <div className={`
          w-full lg:w-64
          order-3
          hidden lg:flex lg:flex-col lg:flex-shrink-0 lg:space-y-6
        `}>
          {rightSidebarContent}
        </div>
      </div>

      {isInfoOverlayVisible && (
        <MobileInfoOverlay
          isOpen={isInfoOverlayVisible}
          onClose={toggleInfoOverlay}
          moveHistory={moveHistory}
          gameStatusMessage={gameStatusMessage}
          onResetGame={onResetGame}
          isCheckmate={isCheckmate}
          isStalemate={isStalemate}
          isCheck={isCheck}
        />
      )}
    </div>
  );
};

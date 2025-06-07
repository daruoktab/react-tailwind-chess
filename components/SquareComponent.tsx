
import React from 'react';
import { Piece, SquarePosition } from '../types.ts';
import PieceDisplay from './PieceDisplay.tsx';

interface SquareComponentProps {
  piece: Piece | null;
  position: SquarePosition;
  isLightSquare: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
  onClick: (position: SquarePosition) => void;
  showRank: boolean;
  showFile: boolean;
}

const SquareComponent: React.FC<SquareComponentProps> = ({
  piece,
  position,
  isLightSquare,
  isSelected,
  isPossibleMove,
  onClick,
  showRank,
  showFile,
}) => {
  const lightSquareBg = 'bg-gradient-to-br from-amber-50 to-amber-100'; // Warm light squares
  const darkSquareBg = 'bg-gradient-to-br from-amber-800 to-amber-900';  // Rich dark squares
  const lightSquareHoverBg = 'hover:from-amber-100 hover:to-amber-200';
  const darkSquareHoverBg = 'hover:from-amber-700 hover:to-amber-800';

  const bgColor = isLightSquare ? lightSquareBg : darkSquareBg;
  const hoverBgColor = isLightSquare ? lightSquareHoverBg : darkSquareHoverBg;
  
  let selectionClasses = '';
  if (isSelected) {
    // Modern selection with glow effect
    selectionClasses = 'ring-4 ring-sky-400 ring-opacity-70 shadow-lg shadow-sky-400/50'; 
  }

  const squareBaseSize = "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16";
  const textColor = isLightSquare ? 'text-amber-800' : 'text-amber-200';

  return (
    <div
      className={`${squareBaseSize} flex items-center justify-center cursor-pointer transition-all duration-200 ${bgColor} ${hoverBgColor} ${selectionClasses} relative group hover:shadow-lg`}
      onClick={() => onClick(position)}
      aria-label={`Square ${String.fromCharCode(97 + position.c)}${8 - position.r}${piece ? `, contains ${piece.color} ${piece.type}` : ''}${isSelected ? ', selected' : ''}${isPossibleMove ? ', possible move' : ''}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(position); }}
    >
      {/* Rank Coordinates (1-8 on 'a' file) */}
      {showRank && (
        <span className={`absolute left-1 top-1 text-xs font-bold ${textColor} select-none pointer-events-none drop-shadow-sm`} aria-hidden="true">
          {8 - position.r}
        </span>
      )}
      {/* File Coordinates (a-h on '1' rank) */}
      {showFile && (
        <span className={`absolute bottom-1 right-1 text-xs font-bold ${textColor} select-none pointer-events-none drop-shadow-sm`} aria-hidden="true">
          {String.fromCharCode(97 + position.c)}
        </span>
      )}

      {piece && <PieceDisplay piece={piece} />}
      
      {isPossibleMove && !piece && ( // Modern dot for empty possible move squares
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1/3 h-1/3 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-80 rounded-full shadow-lg animate-pulse"></div>
        </div>
      )}
       {isPossibleMove && piece && ( // Modern highlight for capture moves
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-1 border-3 border-gradient-to-r from-red-400 to-red-600 opacity-80 rounded-md shadow-lg animate-pulse"></div>
          <div className="absolute top-0 left-0 w-3 h-3 bg-red-500 rounded-full shadow-md"></div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full shadow-md"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-red-500 rounded-full shadow-md"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full shadow-md"></div>
        </div>
      )}
    </div>
  );
};

export default SquareComponent;

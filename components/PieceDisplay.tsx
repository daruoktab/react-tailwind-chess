
import React from 'react';
import { Piece, Color } from '../types.ts';
import { PIECE_UNICODE } from '../constants.ts';

interface PieceDisplayProps {
  piece: Piece;
}

const PieceDisplay: React.FC<PieceDisplayProps> = ({ piece }) => {
  const baseClasses = "hover:scale-110 transition-all duration-200 cursor-pointer select-none leading-none text-3xl md:text-4xl lg:text-5xl drop-shadow-xl";
  
  if (piece.color === Color.WHITE) {
    return (
      <span 
        className={`${baseClasses} chess-piece-white`}
        aria-hidden="true"
      >
        {PIECE_UNICODE[piece.color][piece.type]}
      </span>
    );
  } else {
    return (
      <span 
        className={`${baseClasses} chess-piece-black`}
        aria-hidden="true"
      >
        {PIECE_UNICODE[piece.color][piece.type]}
      </span>
    );
  }
};

export default PieceDisplay;

import React from 'react';
import { Piece, Color, PieceType } from '../types'; // Assuming Piece might implicitly require Color/PieceType for its definition or usage here.
import { PIECE_UNICODE } from '../constants';

export interface CapturedPiecesDisplayProps {
  pieces: Piece[];
  title: string;
}

export const CapturedPiecesDisplay: React.FC<CapturedPiecesDisplayProps> = ({ pieces, title }) => (
  <div className={`
    p-1 sm:p-2 md:p-4
    bg-gradient-to-br from-slate-800/80 to-slate-700/80
    backdrop-blur-sm rounded-xl shadow-xl
    border border-slate-600/50
    w-full
  `}>
    <h3 className={`
      text-xs sm:text-sm md:text-md font-bold
      text-transparent bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text
      mb-1 sm:mb-2 md:mb-3 border-b border-slate-600/50 pb-1 sm:pb-1 md:pb-2
    `}>
      {title}
    </h3>
    <div className={`
      flex flex-wrap
      gap-x-1 gap-y-0.5 sm:gap-x-2 sm:gap-y-1
      min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3rem] items-center
    `}>
      {pieces.length === 0 && (
        <span className="text-xs sm:text-sm text-slate-400 italic">No pieces captured</span>
      )}
      {pieces.map((p, i) => (
        <div
          key={`${p.type}-${p.color}-${i}`}
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl drop-shadow-lg hover:scale-110 transition-transform duration-200"
          title={`${p.color} ${p.type}`}
        >
          {/* This usage expects PIECE_UNICODE to be { [color]: { [type]: char } } */}
          {PIECE_UNICODE[p.color][p.type]}
        </div>
      ))}
    </div>
  </div>
);

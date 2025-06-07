
import React from 'react';
import { BoardState, SquarePosition, Piece } from '../types.ts';
import SquareComponent from './SquareComponent.tsx';
import { BOARD_SIZE } from '../constants.ts';

interface BoardComponentProps {
  board: BoardState;
  selectedSquare: SquarePosition | null;
  possibleMoves: SquarePosition[];
  onSquareClick: (position: SquarePosition) => void;
}

const BoardComponent: React.FC<BoardComponentProps> = ({
  board,
  selectedSquare,
  possibleMoves,
  onSquareClick,
}) => {
  return (
    <div className="relative">
      <div className="grid grid-cols-8 border-4 border-amber-900/30 shadow-2xl aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100" aria-label="Chess board">
        {board.map((row: (Piece | null)[], r: number) =>
          row.map((piece: Piece | null, c: number) => {
            const position = { r, c };
            const isLightSquare = (r + c) % 2 === 0;
            const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;
            const isPossibleMove = possibleMoves.some(move => move.r === r && move.c === c);
            
            // Show rank coordinates on the 'a' file (c === 0)
            const showRank = c === 0;
            // Show file coordinates on the 1st rank (r === 7 for 0-indexed board)
            const showFile = r === BOARD_SIZE - 1;

            return (
              <SquareComponent
                key={`${r}-${c}`}
                piece={piece}
                position={position}
                isLightSquare={isLightSquare}
                isSelected={isSelected}
                isPossibleMove={isPossibleMove}
                onClick={onSquareClick}
                showRank={showRank}
                showFile={showFile}
              />
            );
          })
        )}
      </div>
      
      {/* Decorative corner elements */}
      <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full shadow-lg"></div>
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full shadow-lg"></div>
      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full shadow-lg"></div>
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full shadow-lg"></div>
    </div>
  );
};

export default BoardComponent;

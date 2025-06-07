
export enum PieceType {
  PAWN = 'PAWN',
  ROOK = 'ROOK',
  KNIGHT = 'KNIGHT',
  BISHOP = 'BISHOP',
  QUEEN = 'QUEEN',
  KING = 'KING',
}

export enum Color {
  WHITE = 'WHITE',
  BLACK = 'BLACK',
}

export interface Piece {
  type: PieceType;
  color: Color;
}

export interface SquarePosition {
  r: number;
  c: number;
  isCastleKingside?: boolean;
  isCastleQueenside?: boolean;
}

export type BoardState = (Piece | null)[][];

export interface CastlingRights {
  [Color.WHITE]: {
    kingSide: boolean;
    queenSide: boolean;
  };
  [Color.BLACK]: {
    kingSide: boolean;
    queenSide: boolean;
  };
}


import { Piece, PieceType, Color, BoardState } from './types';

export const PIECE_UNICODE: { [key in Color]: { [key_type in PieceType]: string } } = {
  [Color.WHITE]: {
    [PieceType.PAWN]: '♙',
    [PieceType.ROOK]: '♖',
    [PieceType.KNIGHT]: '♘',
    [PieceType.BISHOP]: '♗',
    [PieceType.QUEEN]: '♕',
    [PieceType.KING]: '♔',
  },
  [Color.BLACK]: {
    [PieceType.PAWN]: '♟︎',
    [PieceType.ROOK]: '♜',
    [PieceType.KNIGHT]: '♞',
    [PieceType.BISHOP]: '♝',
    [PieceType.QUEEN]: '♛',
    [PieceType.KING]: '♚',
  },
};

export const INITIAL_BOARD_SETUP: BoardState = [
  [
    { type: PieceType.ROOK, color: Color.BLACK }, { type: PieceType.KNIGHT, color: Color.BLACK }, { type: PieceType.BISHOP, color: Color.BLACK }, { type: PieceType.QUEEN, color: Color.BLACK }, { type: PieceType.KING, color: Color.BLACK }, { type: PieceType.BISHOP, color: Color.BLACK }, { type: PieceType.KNIGHT, color: Color.BLACK }, { type: PieceType.ROOK, color: Color.BLACK },
  ],
  [
    { type: PieceType.PAWN, color: Color.BLACK }, { type: PieceType.PAWN, color: Color.BLACK }, { type: PieceType.PAWN, color: Color.BLACK }, { type: PieceType.PAWN, color: Color.BLACK }, { type: PieceType.PAWN, color: Color.BLACK }, { type: PieceType.PAWN, color: Color.BLACK }, { type: PieceType.PAWN, color: Color.BLACK }, { type: PieceType.PAWN, color: Color.BLACK },
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    { type: PieceType.PAWN, color: Color.WHITE }, { type: PieceType.PAWN, color: Color.WHITE }, { type: PieceType.PAWN, color: Color.WHITE }, { type: PieceType.PAWN, color: Color.WHITE }, { type: PieceType.PAWN, color: Color.WHITE }, { type: PieceType.PAWN, color: Color.WHITE }, { type: PieceType.PAWN, color: Color.WHITE }, { type: PieceType.PAWN, color: Color.WHITE },
  ],
  [
    { type: PieceType.ROOK, color: Color.WHITE }, { type: PieceType.KNIGHT, color: Color.WHITE }, { type: PieceType.BISHOP, color: Color.WHITE }, { type: PieceType.QUEEN, color: Color.WHITE }, { type: PieceType.KING, color: Color.WHITE }, { type: PieceType.BISHOP, color: Color.WHITE }, { type: PieceType.KNIGHT, color: Color.WHITE }, { type: PieceType.ROOK, color: Color.WHITE },
  ],
];

export const BOARD_SIZE = 8;

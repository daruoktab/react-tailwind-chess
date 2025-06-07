
import { BoardState, Piece, PieceType, Color, SquarePosition, CastlingRights } from '../types';
import { INITIAL_BOARD_SETUP, BOARD_SIZE } from '../constants';

export function getInitialBoard(): BoardState {
  return JSON.parse(JSON.stringify(INITIAL_BOARD_SETUP));
}

function isInBounds(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

// Helper function to check if a square is attacked by a given color
export function isSquareAttacked(board: BoardState, r: number, c: number, attackerColor: Color): boolean {
  for (let R = 0; R < BOARD_SIZE; R++) {
    for (let C = 0; C < BOARD_SIZE; C++) {
      const piece = board[R][C];
      if (piece && piece.color === attackerColor) {
        // Get raw moves (potential attacks) for this piece
        // For pawns, only consider diagonal captures for attacks
        const moves = getRawMovesForPiece(board, piece, R, C);
        if (moves.some(move => move.r === r && move.c === c)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Helper function to get raw moves/attacks for a piece (used by isSquareAttacked)
// This is a simplified version of getValidMovesForPiece, focusing on attack patterns
function getRawMovesForPiece(board: BoardState, piece: Piece, r: number, c: number): SquarePosition[] {
  const moves: SquarePosition[] = [];
  const { type, color } = piece;

  switch (type) {
    case PieceType.PAWN:
      const direction = color === Color.WHITE ? -1 : 1;
      [-1, 1].forEach(dc => { // Only diagonal captures
        if (isInBounds(r + direction, c + dc)) {
          moves.push({ r: r + direction, c: c + dc });
        }
      });
      break;
    case PieceType.ROOK:
    case PieceType.BISHOP:
    case PieceType.QUEEN:
      const directions =
        type === PieceType.ROOK ? [[-1, 0], [1, 0], [0, -1], [0, 1]] :
        type === PieceType.BISHOP ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
        [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

      directions.forEach(([dr, dc]) => {
        for (let i = 1; i < BOARD_SIZE; i++) {
          const nr = r + i * dr;
          const nc = c + i * dc;
          if (!isInBounds(nr, nc)) break;
          moves.push({ r: nr, c: nc });
          if (board[nr][nc]) break; // Stops iteration if a piece is encountered
        }
      });
      break;
    case PieceType.KNIGHT:
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      knightMoves.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (isInBounds(nr, nc)) {
          moves.push({ r: nr, c: nc });
        }
      });
      break;
    case PieceType.KING:
      const kingMoves = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1],
      ];
      kingMoves.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (isInBounds(nr, nc)) {
          moves.push({ r: nr, c: nc });
        }
      });
      break;
  }
  return moves;
}


export function getValidMovesForPiece(
  board: BoardState,
  piece: Piece,
  r: number,
  c: number,
  castlingRights: CastlingRights,
  // isSquareAttackedFn: (b: BoardState, r: number, c: number, attackerColor: Color) => boolean
): SquarePosition[] {
  const moves: SquarePosition[] = [];
  const { type, color } = piece;
  const opponentColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;

  switch (type) {
    case PieceType.PAWN:
      const direction = color === Color.WHITE ? -1 : 1;
      const startRow = color === Color.WHITE ? 6 : 1;

      if (isInBounds(r + direction, c) && !board[r + direction][c]) {
        moves.push({ r: r + direction, c });
        if (r === startRow && isInBounds(r + 2 * direction, c) && !board[r + 2 * direction][c]) {
          moves.push({ r: r + 2 * direction, c });
        }
      }
      [-1, 1].forEach(dc => {
        if (isInBounds(r + direction, c + dc) && board[r + direction][c + dc] && board[r + direction][c + dc]?.color !== color) {
          moves.push({ r: r + direction, c: c + dc });
        }
      });
      break;

    case PieceType.ROOK:
    case PieceType.BISHOP:
    case PieceType.QUEEN:
      const lineDirections =
        type === PieceType.ROOK ? [[-1, 0], [1, 0], [0, -1], [0, 1]] :
        type === PieceType.BISHOP ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
        [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

      lineDirections.forEach(([dr, dc]) => {
        for (let i = 1; i < BOARD_SIZE; i++) {
          const nr = r + i * dr;
          const nc = c + i * dc;
          if (!isInBounds(nr, nc)) break;
          if (board[nr][nc]) {
            if (board[nr][nc]?.color !== color) moves.push({ r: nr, c: nc });
            break;
          }
          moves.push({ r: nr, c: nc });
        }
      });
      break;

    case PieceType.KNIGHT:
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      knightMoves.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (isInBounds(nr, nc) && (!board[nr][nc] || board[nr][nc]?.color !== color)) {
          moves.push({ r: nr, c: nc });
        }
      });
      break;

    case PieceType.KING:
      const kingMoves = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1],
      ];
      kingMoves.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (isInBounds(nr, nc) && (!board[nr][nc] || board[nr][nc]?.color !== color)) {
          // Add check: King cannot move into check
          const tempBoard = JSON.parse(JSON.stringify(board));
          tempBoard[nr][nc] = tempBoard[r][c];
          tempBoard[r][c] = null;
          if (!isKingInCheck(tempBoard, color)) {
            moves.push({ r: nr, c: nc });
          }
        }
      });

      // Castling
      if (!isSquareAttacked(board, r, c, opponentColor)) { // King not in check
        // Kingside
        if (castlingRights[color].kingSide) {
          if (!board[r][c + 1] && !board[r][c + 2] &&
              !isSquareAttacked(board, r, c + 1, opponentColor) &&
              !isSquareAttacked(board, r, c + 2, opponentColor)) {
            moves.push({ r: r, c: c + 2, isCastleKingside: true });
          }
        }
        // Queenside
        if (castlingRights[color].queenSide) {
          if (!board[r][c - 1] && !board[r][c - 2] && !board[r][c - 3] &&
              !isSquareAttacked(board, r, c - 1, opponentColor) &&
              !isSquareAttacked(board, r, c - 2, opponentColor)) {
            moves.push({ r: r, c: c - 2, isCastleQueenside: true });
          }
        }
      }
      break;
  }
  return moves;
}

export function isKingInCheck(board: BoardState, kingColor: Color): boolean {
  let kingPos: SquarePosition | null = null;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.type === PieceType.KING && piece.color === kingColor) {
        kingPos = { r, c };
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false; // Should not happen in a normal game

  const opponentColor = kingColor === Color.WHITE ? Color.BLACK : Color.WHITE;
  return isSquareAttacked(board, kingPos.r, kingPos.c, opponentColor);
}

function getPieceChar(type: PieceType): string {
  switch (type) {
    case PieceType.KNIGHT: return 'N';
    case PieceType.BISHOP: return 'B';
    case PieceType.ROOK: return 'R';
    case PieceType.QUEEN: return 'Q';
    case PieceType.KING: return 'K';
    case PieceType.PAWN: return '';
    default: return '';
  }
}

function squareToAlgebraic(r: number, c: number): string {
  return String.fromCharCode(97 + c) + (8 - r).toString();
}

export function generateAlgebraicNotation(
  board: BoardState, // board *before* the move
  movingPiece: Piece,
  from: SquarePosition,
  to: SquarePosition,
  capturedPiece: Piece | null,
  promotedTo: PieceType | null,
  isKingsideCastle: boolean,
  isQueensideCastle: boolean
): string {
  if (isKingsideCastle) return 'O-O';
  if (isQueensideCastle) return 'O-O-O';

  let notation = '';
  notation += getPieceChar(movingPiece.type);

  // TODO: Add disambiguation for pieces if needed (e.g. Rad1 vs Rfd1)
  // For simplicity, this is omitted for now.

  if (capturedPiece) {
    if (movingPiece.type === PieceType.PAWN && notation === '') {
        notation += squareToAlgebraic(from.r, from.c)[0]; // pawn capture: "exd5"
    }
    notation += 'x';
  }

  notation += squareToAlgebraic(to.r, to.c);

  if (promotedTo) {
    notation += '=' + getPieceChar(promotedTo);
  }
  
  // Create a temporary board *after* the move to check for check/checkmate
  const tempBoard = JSON.parse(JSON.stringify(board));
  tempBoard[to.r][to.c] = { ...movingPiece, ...(promotedTo && { type: promotedTo }) };
  tempBoard[from.r][from.c] = null;
  
  const opponentColor = movingPiece.color === Color.WHITE ? Color.BLACK : Color.WHITE;
  if (isKingInCheck(tempBoard, opponentColor)) {
      // Check for checkmate (simplified: if opponent has no valid moves)
      let hasValidMoves = false;
      for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
              const piece = tempBoard[r][c];
              if (piece && piece.color === opponentColor) {
                  // Pass default/current castling rights, doesn't matter much for this check
                  const dummyCastlingRights: CastlingRights = {
                      [Color.WHITE]: { kingSide: false, queenSide: false },
                      [Color.BLACK]: { kingSide: false, queenSide: false }
                  };
                  const moves = getValidMovesForPiece(tempBoard, piece, r, c, dummyCastlingRights);
                  // Further filter moves to ensure they don't leave king in check
                  const legalMoves = moves.filter(move => {
                      const nextBoardState = JSON.parse(JSON.stringify(tempBoard));
                      nextBoardState[move.r][move.c] = nextBoardState[r][c];
                      nextBoardState[r][c] = null;
                      return !isKingInCheck(nextBoardState, opponentColor);
                  });
                  if (legalMoves.length > 0) {
                      hasValidMoves = true;
                      break;
                  }
              }
          }
          if (hasValidMoves) break;
      }
      if (!hasValidMoves) {
          notation += '#'; // Checkmate
      } else {
          notation += '+'; // Check
      }
  }

  return notation;
}

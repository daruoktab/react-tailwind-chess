
import React, { useState, useEffect, useCallback } from 'react';
import { BoardState, Color, Piece, PieceType, SquarePosition, CastlingRights } from './types.ts';
import { getInitialBoard, getValidMovesForPiece, generateAlgebraicNotation, isKingInCheck } from './services/chessEngine.ts';
import BoardComponent from './components/BoardComponent.tsx';
import { BOARD_SIZE, PIECE_UNICODE } from './constants.ts';
import NotationDisplay from './components/NotationDisplay.tsx';

interface CapturedPiecesDisplayProps {
  pieces: Piece[];
  title: string;
}

const CapturedPiecesDisplay: React.FC<CapturedPiecesDisplayProps> = ({ pieces, title }) => (
  <div className="p-4 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/50 w-full">
    <h3 className="text-md font-bold text-transparent bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text mb-3 border-b border-slate-600/50 pb-2">
      {title}
    </h3>
    <div className="flex flex-wrap gap-x-2 gap-y-1 min-h-[3rem] items-center">
      {pieces.length === 0 && (
        <span className="text-sm text-slate-400 italic">No pieces captured</span>
      )}
      {pieces.map((p, i) => (
        <div
          key={`${p.type}-${p.color}-${i}`}
          className="text-3xl drop-shadow-lg hover:scale-110 transition-transform duration-200"
          title={`${p.color} ${p.type}`}
        >
          {PIECE_UNICODE[p.color][p.type]}
        </div>
      ))}
    </div>
  </div>
);

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(getInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Color>(Color.WHITE);
  const [selectedSquare, setSelectedSquare] = useState<SquarePosition | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<SquarePosition[]>([]);
  const [message, setMessage] = useState<string>("White's Turn");
  const [capturedByWhite, setCapturedByWhite] = useState<Piece[]>([]); // Pieces Black lost to White
  const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([]); // Pieces White lost to Black
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [isCheckmate, setIsCheckmate] = useState<boolean>(false);
  const [isStalemate, setIsStalemate] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>({
    [Color.WHITE]: { kingSide: true, queenSide: true },
    [Color.BLACK]: { kingSide: true, queenSide: true },
  });

  const checkGameStatus = useCallback((currentBoard: BoardState, playerWhoseTurnItIs: Color) => {
    const kingInCheck = isKingInCheck(currentBoard, playerWhoseTurnItIs);
    setIsCheck(kingInCheck);
    setIsCheckmate(false);
    setIsStalemate(false);

    let hasAnyValidMove = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.color === playerWhoseTurnItIs) {
          const moves = getValidMovesForPiece(currentBoard, piece, r, c, castlingRights);
          const legalMoves = moves.filter((move: SquarePosition) => {
            const tempBoard = JSON.parse(JSON.stringify(currentBoard));
            const movingPieceTemp = tempBoard[r][c]!;
            tempBoard[move.r][move.c] = movingPieceTemp;
            tempBoard[r][c] = null;
            if (move.isCastleKingside) {
                tempBoard[r][c+1] = tempBoard[r][c+3];
                tempBoard[r][c+3] = null;
            } else if (move.isCastleQueenside) {
                tempBoard[r][c-1] = tempBoard[r][c-4];
                tempBoard[r][c-4] = null;
            }
            return !isKingInCheck(tempBoard, playerWhoseTurnItIs);
          });
          if (legalMoves.length > 0) {
            hasAnyValidMove = true;
            break;
          }
        }
      }
      if (hasAnyValidMove) break;
    }

    if (kingInCheck && !hasAnyValidMove) {
      setIsCheckmate(true);
      setMessage(`Checkmate! ${playerWhoseTurnItIs === Color.WHITE ? 'Black' : 'White'} wins!`);
    } else if (!kingInCheck && !hasAnyValidMove) {
        setIsStalemate(true);
        setMessage(`Stalemate! It's a draw.`);
    } else {
      setMessage(`${playerWhoseTurnItIs === Color.WHITE ? 'White' : 'Black'}'s Turn${kingInCheck ? ' (Check!)' : ''}`);
    }
  }, [castlingRights]);


  useEffect(() => {
    checkGameStatus(board, currentPlayer);
  }, [board, currentPlayer, checkGameStatus]);


  const resetGame = useCallback(() => {
    const initialBoard = getInitialBoard();
    setBoard(initialBoard);
    setCurrentPlayer(Color.WHITE);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setMoveHistory([]);
    setCastlingRights({
      [Color.WHITE]: { kingSide: true, queenSide: true },
      [Color.BLACK]: { kingSide: true, queenSide: true },
    });
    const initialPlayer = Color.WHITE;
    const kingIsInitiallyInCheck = isKingInCheck(initialBoard, initialPlayer);
    setIsCheck(kingIsInitiallyInCheck);
    setIsCheckmate(false);
    setIsStalemate(false);
    setMessage(`${initialPlayer === Color.WHITE ? 'White' : 'Black'}'s Turn${kingIsInitiallyInCheck ? ' (Check!)' : ''}`);
  }, []);

  const handleSquareClick = useCallback((position: SquarePosition) => {
    if (isCheckmate || isStalemate) return;

    const pieceAtClickedSquare = board[position.r][position.c];

    if (selectedSquare) {
      const currentMovingPieceMeta = board[selectedSquare.r][selectedSquare.c];
      if (!currentMovingPieceMeta) {
         setSelectedSquare(null);
         setPossibleMoves([]);
         return;
      }

      const selectedMove = possibleMoves.find((move: SquarePosition) => move.r === position.r && move.c === position.c);

      if (selectedMove) {
        const newBoard = board.map((row: (Piece | null)[]) => [...row]);
        const movingPiece = { ...newBoard[selectedSquare.r][selectedSquare.c]! }; 
        
        let capturedPieceVal: Piece | null = newBoard[position.r][position.c];
        let promotedTo: PieceType | null = null;
        const prevBoardState = JSON.parse(JSON.stringify(board)); 

        if (selectedMove.isCastleKingside) {
          newBoard[selectedSquare.r][selectedSquare.c + 2] = movingPiece;
          newBoard[selectedSquare.r][selectedSquare.c] = null;
          newBoard[selectedSquare.r][selectedSquare.c + 1] = newBoard[selectedSquare.r][selectedSquare.c + 3];
          newBoard[selectedSquare.r][selectedSquare.c + 3] = null;
        } else if (selectedMove.isCastleQueenside) {
          newBoard[selectedSquare.r][selectedSquare.c - 2] = movingPiece;
          newBoard[selectedSquare.r][selectedSquare.c] = null;
          newBoard[selectedSquare.r][selectedSquare.c - 1] = newBoard[selectedSquare.r][selectedSquare.c - 4];
          newBoard[selectedSquare.r][selectedSquare.c - 4] = null;
        } else {
          newBoard[position.r][position.c] = movingPiece;
          newBoard[selectedSquare.r][selectedSquare.c] = null;

          if (movingPiece.type === PieceType.PAWN) {
            if ((movingPiece.color === Color.WHITE && position.r === 0) || 
                (movingPiece.color === Color.BLACK && position.r === BOARD_SIZE - 1)) {
              promotedTo = PieceType.QUEEN; 
              newBoard[position.r][position.c] = { ...movingPiece, type: promotedTo };
            }
          }
        }
        
        const newCastlingRights = JSON.parse(JSON.stringify(castlingRights));
        if (movingPiece.type === PieceType.KING) {
          newCastlingRights[movingPiece.color].kingSide = false;
          newCastlingRights[movingPiece.color].queenSide = false;
        } else if (movingPiece.type === PieceType.ROOK) {
          if (selectedSquare.r === (movingPiece.color === Color.WHITE ? 7 : 0)) {
            if (selectedSquare.c === 0) newCastlingRights[movingPiece.color].queenSide = false;
            if (selectedSquare.c === 7) newCastlingRights[movingPiece.color].kingSide = false;
          }
        }
        if (capturedPieceVal && capturedPieceVal.type === PieceType.ROOK) {
            const capturedColor = capturedPieceVal.color;
            if (position.r === (capturedColor === Color.WHITE ? 7 : 0)) {
                if (position.c === 0 && newCastlingRights[capturedColor].queenSide) newCastlingRights[capturedColor].queenSide = false;
                if (position.c === 7 && newCastlingRights[capturedColor].kingSide) newCastlingRights[capturedColor].kingSide = false;
            }
        }
        setCastlingRights(newCastlingRights);
        
        if (capturedPieceVal && !(selectedMove.isCastleKingside || selectedMove.isCastleQueenside) ) {
          if (movingPiece.color === Color.WHITE) { 
            setCapturedByWhite(prev => [...prev, capturedPieceVal!]);
          } else { 
            setCapturedByBlack(prev => [...prev, capturedPieceVal!]);
          }
        } else if (selectedMove.isCastleKingside || selectedMove.isCastleQueenside) {
            capturedPieceVal = null;
        }

        const notation = generateAlgebraicNotation(
            prevBoardState,
            movingPiece,
            selectedSquare,
            position,
            capturedPieceVal,
            promotedTo,
            !!selectedMove.isCastleKingside,
            !!selectedMove.isCastleQueenside
        );
        setMoveHistory(prev => [...prev, notation]);
        
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE);
        setSelectedSquare(null);
        setPossibleMoves([]);

      } else if (pieceAtClickedSquare && pieceAtClickedSquare.color === currentPlayer) {
        const newSelectedSquare = position;
        setSelectedSquare(newSelectedSquare);
        const currentPiece = board[newSelectedSquare.r][newSelectedSquare.c];
        if (currentPiece) {
           const validMoves = getValidMovesForPiece(board, currentPiece, newSelectedSquare.r, newSelectedSquare.c, castlingRights);
           const legalMoves = validMoves.filter((move: SquarePosition) => {
               const tempBoard = JSON.parse(JSON.stringify(board));
               const movingPieceTemp = tempBoard[newSelectedSquare.r][newSelectedSquare.c]!;
               tempBoard[move.r][move.c] = movingPieceTemp;
               tempBoard[newSelectedSquare.r][newSelectedSquare.c] = null;
                if (move.isCastleKingside) {
                    tempBoard[newSelectedSquare.r][newSelectedSquare.c+1] = tempBoard[newSelectedSquare.r][newSelectedSquare.c+3];
                    tempBoard[newSelectedSquare.r][newSelectedSquare.c+3] = null;
                } else if (move.isCastleQueenside) {
                    tempBoard[newSelectedSquare.r][newSelectedSquare.c-1] = tempBoard[newSelectedSquare.r][newSelectedSquare.c-4];
                    tempBoard[newSelectedSquare.r][newSelectedSquare.c-4] = null;
                }
               return !isKingInCheck(tempBoard, currentPlayer);
           });
           setPossibleMoves(legalMoves);
        } else {
            setPossibleMoves([]);
        }
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else if (pieceAtClickedSquare && pieceAtClickedSquare.color === currentPlayer) {
      setSelectedSquare(position);
      const validMoves = getValidMovesForPiece(board, pieceAtClickedSquare, position.r, position.c, castlingRights);
       const legalMoves = validMoves.filter((move: SquarePosition) => {
           const tempBoard = JSON.parse(JSON.stringify(board));
           const movingPieceTemp = tempBoard[position.r][position.c]!;
           tempBoard[move.r][move.c] = movingPieceTemp;
           tempBoard[position.r][position.c] = null;
            if (move.isCastleKingside) {
                tempBoard[position.r][position.c+1] = tempBoard[position.r][position.c+3];
                tempBoard[position.r][position.c+3] = null;
            } else if (move.isCastleQueenside) {
                tempBoard[position.r][position.c-1] = tempBoard[position.r][position.c-4];
                tempBoard[position.r][position.c-4] = null;
            }
           return !isKingInCheck(tempBoard, currentPlayer);
       });
       setPossibleMoves(legalMoves);
    }
  }, [board, currentPlayer, selectedSquare, possibleMoves, capturedByWhite, capturedByBlack, castlingRights, isCheckmate, isStalemate, checkGameStatus]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-neutral-100 flex flex-col items-center justify-center p-4 md:p-6 selection:bg-sky-500 selection:text-white">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <header className="mb-6 md:mb-8 text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
          React Chess
        </h1>
        <div className="mt-3 md:mt-4">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm md:text-base font-medium shadow-lg backdrop-blur-sm border transition-all duration-300 ${
            isCheckmate 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20' 
              : isStalemate 
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-yellow-500/20' 
                : isCheck 
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse shadow-red-500/20' 
                  : 'bg-slate-700/60 text-slate-300 border-slate-600/40 shadow-slate-500/20'
          }`}>
            {isCheck && !isCheckmate && (
              <svg className="w-4 h-4 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {isCheckmate && (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {isStalemate && (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {message}
          </div>
        </div>
      </header>
      
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-6xl xl:max-w-7xl relative z-10">
        {/* Left Side - Black's Captures & White's Captures */}
        <div className="w-full lg:w-64 order-2 lg:order-1 flex-shrink-0 space-y-4">
           <CapturedPiecesDisplay pieces={capturedByBlack} title="Black's Captures" />
           <CapturedPiecesDisplay pieces={capturedByWhite} title="White's Captures" />
        </div>

        {/* Center - Chess Board */}
        <div className="flex-grow flex justify-center order-1 lg:order-2 w-full lg:w-auto">
          <div className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-600/50">
            <BoardComponent
              board={board}
              selectedSquare={selectedSquare}
              possibleMoves={possibleMoves}
              onSquareClick={handleSquareClick}
            />
          </div>
        </div>
        
        {/* Right Side - Description, Move History, Reset Button */}
        <div className="w-full lg:w-64 order-3 lg:order-3 flex-shrink-0 space-y-6">
          {/* Game Info */}
          <div className="p-4 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50">
            <p className="font-medium mb-2 text-center">🎯 Modern Chess Experience</p>
            <p className="text-xs leading-relaxed text-slate-400">
              Complete chess implementation with castling, pawn promotion, check/checkmate detection, and move history. 
              Click any piece to see available moves, then click a highlighted square to make your move.
            </p>
          </div>
          
          {/* Move History */}
          <NotationDisplay moveHistory={moveHistory} />
          
          {/* Reset Button */}
          <button
            type="button"
            onClick={resetGame}
            className="w-full px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-base rounded-xl shadow-xl transform transition-all duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50 active:scale-95"
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
    </div>
  );
};

export default App;

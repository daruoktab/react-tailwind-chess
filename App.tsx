
import React, { useState, useEffect, useCallback } from 'react';
import { BoardState, Color, Piece, PieceType, SquarePosition, CastlingRights } from './types.ts';
import { getInitialBoard, getValidMovesForPiece, generateAlgebraicNotation, isKingInCheck } from './services/chessEngine.ts';
import BoardComponent from './components/BoardComponent.tsx';
import { BOARD_SIZE } from './constants.ts'; // PIECE_UNICODE removed
import NotationDisplay from './components/NotationDisplay.tsx';
import { CapturedPiecesDisplay } from './components/CapturedPiecesDisplay.tsx'; // Added import
import { AppLayout } from './components/AppLayout.tsx'; // Import AppLayout

const App: React.FC = () => {
  // Board and Player State
  const [board, setBoard] = useState<BoardState>(getInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Color>(Color.WHITE);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>({
    [Color.WHITE]: { kingSide: true, queenSide: true },
    [Color.BLACK]: { kingSide: true, queenSide: true },
  });

  // Game Status Flags
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [isCheckmate, setIsCheckmate] = useState<boolean>(false);
  const [isStalemate, setIsStalemate] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("White's Turn");

  // UI Interaction State
  const [selectedSquare, setSelectedSquare] = useState<SquarePosition | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<SquarePosition[]>([]);

  // History and Captured Pieces
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedByWhite, setCapturedByWhite] = useState<Piece[]>([]); // Pieces Black lost to White
  const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([]); // Pieces White lost to Black

  // Mobile Overlay State
  const [isInfoOverlayVisible, setIsInfoOverlayVisible] = useState(false);

  const toggleInfoOverlay = useCallback(() => {
    setIsInfoOverlayVisible(prev => !prev);
  }, []);

  // Helper function to get legal moves (filters out moves that leave king in check)
  const getLegalMoves = useCallback((
    currentBoard: BoardState,
    piece: Piece,
    r: number,
    c: number,
    currentCastlingRights: CastlingRights, // Renamed for clarity vs state variable
    playerColor: Color
  ): SquarePosition[] => {
    const moves = getValidMovesForPiece(currentBoard, piece, r, c, currentCastlingRights);
    return moves.filter((move: SquarePosition) => {
      const tempBoard = JSON.parse(JSON.stringify(currentBoard));
      const movingPieceTemp = tempBoard[r][c]!;
      tempBoard[move.r][move.c] = movingPieceTemp;
      tempBoard[r][c] = null;
      if (move.isCastleKingside) {
        tempBoard[r][c + 1] = tempBoard[r][c + 3];
        tempBoard[r][c + 3] = null;
      } else if (move.isCastleQueenside) {
        tempBoard[r][c - 1] = tempBoard[r][c - 4];
        tempBoard[r][c - 4] = null;
      }
      return !isKingInCheck(tempBoard, playerColor);
    });
  }, []); // Depends only on imported functions

  // Helper function to apply a move to the board and handle promotions
  interface PerformMoveResult {
    newBoard: BoardState;
    promotedPieceType: PieceType | null; // Renamed for clarity
  }
  const performMoveOnBoard = useCallback((
    currentBoard: BoardState,
    pieceToMove: Piece,
    from: SquarePosition,
    to: SquarePosition,
    moveDetails: SquarePosition // Contains castling flags from possibleMoves
  ): PerformMoveResult => {
    const newBoardState = currentBoard.map(row => [...row]);
    let finalPromotedPieceType: PieceType | null = null;

    if (moveDetails.isCastleKingside) {
      newBoardState[from.r][from.c + 2] = { ...pieceToMove };
      newBoardState[from.r][from.c] = null;
      newBoardState[from.r][from.c + 1] = newBoardState[from.r][from.c + 3];
      newBoardState[from.r][from.c + 3] = null;
    } else if (moveDetails.isCastleQueenside) {
      newBoardState[from.r][from.c - 2] = { ...pieceToMove };
      newBoardState[from.r][from.c] = null;
      newBoardState[from.r][from.c - 1] = newBoardState[from.r][from.c - 4];
      newBoardState[from.r][from.c - 4] = null;
    } else {
      const movedPieceCopy = { ...pieceToMove };
      newBoardState[to.r][to.c] = movedPieceCopy;
      newBoardState[from.r][from.c] = null;

      if (movedPieceCopy.type === PieceType.PAWN) {
        if ((movedPieceCopy.color === Color.WHITE && to.r === 0) ||
            (movedPieceCopy.color === Color.BLACK && to.r === BOARD_SIZE - 1)) {
          finalPromotedPieceType = PieceType.QUEEN; // Default promotion
          newBoardState[to.r][to.c] = { ...movedPieceCopy, type: finalPromotedPieceType };
        }
      }
    }
    return { newBoard: newBoardState, promotedPieceType: finalPromotedPieceType };
  }, []); // Depends on BOARD_SIZE (constant)

  // Helper function to calculate new castling rights
  const calculateNewCastlingRights = useCallback((
    movedPiece: Piece,
    fromSquare: SquarePosition,
    pieceCaptured: Piece | null,
    toSquare: SquarePosition,
    currentCastlingRights: CastlingRights
  ): CastlingRights => {
    const newRights = JSON.parse(JSON.stringify(currentCastlingRights));
    // King move
    if (movedPiece.type === PieceType.KING) {
      newRights[movedPiece.color].kingSide = false;
      newRights[movedPiece.color].queenSide = false;
    }
    // Rook move
    else if (movedPiece.type === PieceType.ROOK) {
      const originalRank = movedPiece.color === Color.WHITE ? 7 : 0;
      if (fromSquare.r === originalRank) {
        if (fromSquare.c === 0) newRights[movedPiece.color].queenSide = false;
        if (fromSquare.c === 7) newRights[movedPiece.color].kingSide = false;
      }
    }
    // Rook capture
    if (pieceCaptured && pieceCaptured.type === PieceType.ROOK) {
      const capturedSideColor = pieceCaptured.color;
      const originalRank = capturedSideColor === Color.WHITE ? 7 : 0;
      // If rook captured on its starting rank and corner
      if (toSquare.r === originalRank) {
        if (toSquare.c === 0) newRights[capturedSideColor].queenSide = false;
        if (toSquare.c === 7) newRights[capturedSideColor].kingSide = false;
      }
    }
    return newRights;
  }, []);


  const checkGameStatus = useCallback((currentBoard: BoardState, playerWhoseTurnItIs: Color, currentCastlingRights: CastlingRights) => {
    const kingInCheck = isKingInCheck(currentBoard, playerWhoseTurnItIs);
    setIsCheck(kingInCheck);
    setIsCheckmate(false);
    setIsStalemate(false);

    let hasAnyValidMove = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.color === playerWhoseTurnItIs) {
          // Use the new getLegalMoves helper
          const legalMoves = getLegalMoves(currentBoard, piece, r, c, currentCastlingRights, playerWhoseTurnItIs);
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
      setMessage("Stalemate! It's a draw.");
    } else {
      setMessage(`${playerWhoseTurnItIs === Color.WHITE ? 'White' : 'Black'}'s Turn${kingInCheck ? ' (Check!)' : ''}`);
    }
  }, [getLegalMoves]); // Added getLegalMoves to dependency array


  useEffect(() => {
    // Pass current castlingRights to checkGameStatus
    checkGameStatus(board, currentPlayer, castlingRights);
  }, [board, currentPlayer, castlingRights, checkGameStatus]);


  const resetGame = useCallback(() => {
    const initialBoard = getInitialBoard();
    setBoard(initialBoard);
    setCurrentPlayer(Color.WHITE);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setMoveHistory([]);
    const newCastlingRights = {
      [Color.WHITE]: { kingSide: true, queenSide: true },
      [Color.BLACK]: { kingSide: true, queenSide: true },
    };
    setCastlingRights(newCastlingRights);

    const initialPlayer = Color.WHITE;
    // Initial check status call needs the fresh castling rights
    checkGameStatus(initialBoard, initialPlayer, newCastlingRights);
  }, [checkGameStatus]); // Added checkGameStatus to dependency array

  const handleSquareClick = useCallback((position: SquarePosition) => {
    if (isCheckmate || isStalemate) return;

    const pieceAtClickedSquare = board[position.r][position.c];

    if (selectedSquare) {
      const pieceOnSelectedSquare = board[selectedSquare.r][selectedSquare.c];
      if (!pieceOnSelectedSquare) {
         setSelectedSquare(null);
         setPossibleMoves([]);
         return;
      }

      const selectedMoveDetails = possibleMoves.find((move: SquarePosition) => move.r === position.r && move.c === position.c);

      if (selectedMoveDetails) {
        const prevBoardState = JSON.parse(JSON.stringify(board)); // For notation
        const pieceToMove = { ...pieceOnSelectedSquare };
        
        const capturedPieceVal: Piece | null = board[position.r][position.c] ? { ...board[position.r][position.c]! } : null;

        // Perform the move on a temporary board
        const { newBoard: nextBoardState, promotedPieceType } = performMoveOnBoard(
          board,
          pieceToMove,
          selectedSquare,
          position,
          selectedMoveDetails
        );
        
        const newRights = calculateNewCastlingRights(
          pieceToMove,
          selectedSquare,
          capturedPieceVal, // Original piece at target, before it's overwritten
          position,
          castlingRights
        );
        setCastlingRights(newRights);
        
        // Update captured pieces list
        // Note: performMoveOnBoard doesn't return the captured piece, we got it from the original board
        let actualCapturedPieceForList: Piece | null = capturedPieceVal;
        if (selectedMoveDetails.isCastleKingside || selectedMoveDetails.isCastleQueenside) {
            actualCapturedPieceForList = null; // No capture in castling
        }

        if (actualCapturedPieceForList) {
          if (pieceToMove.color === Color.WHITE) {
            setCapturedByWhite(prev => [...prev, actualCapturedPieceForList!]);
          } else { 
            setCapturedByBlack(prev => [...prev, actualCapturedPieceForList!]);
          }
        }

        const notation = generateAlgebraicNotation(
            prevBoardState, // Board before the move
            pieceToMove,    // The piece that moved
            selectedSquare, // Origin square
            position,       // Target square
            actualCapturedPieceForList, // Piece that was captured (if any)
            promotedPieceType, // Type of piece if promotion occurred
            !!selectedMoveDetails.isCastleKingside,
            !!selectedMoveDetails.isCastleQueenside
        );
        setMoveHistory(prev => [...prev, notation]);
        
        setBoard(nextBoardState);
        setCurrentPlayer(currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE);
        setSelectedSquare(null);
        setPossibleMoves([]);
        // Game status will be checked by useEffect

      } else if (pieceAtClickedSquare && pieceAtClickedSquare.color === currentPlayer) {
        // Clicked on another of current player's pieces - change selection
        setSelectedSquare(position);
        const legalMoves = getLegalMoves(board, pieceAtClickedSquare, position.r, position.c, castlingRights, currentPlayer);
        setPossibleMoves(legalMoves);
      } else {
        // Clicked on an empty square or opponent's piece not in possible moves
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else if (pieceAtClickedSquare && pieceAtClickedSquare.color === currentPlayer) {
      // No piece selected yet, and clicked on current player's piece
      setSelectedSquare(position);
      const legalMoves = getLegalMoves(board, pieceAtClickedSquare, position.r, position.c, castlingRights, currentPlayer);
      setPossibleMoves(legalMoves);
    }
  }, [
    board, currentPlayer, selectedSquare, possibleMoves, castlingRights,
    isCheckmate, isStalemate,
    getLegalMoves, performMoveOnBoard, calculateNewCastlingRights,
    // checkGameStatus is not directly called, but its states (isCheckmate, isStalemate) are used
  ]);


  return (
    <AppLayout
      isInfoOverlayVisible={isInfoOverlayVisible}
      toggleInfoOverlay={toggleInfoOverlay}
      moveHistory={moveHistory}
      gameStatusMessage={message}
      onResetGame={resetGame}
      isCheckmate={isCheckmate}
      isStalemate={isStalemate}
      isCheck={isCheck}
      capturedByWhiteData={capturedByWhite}
      capturedByBlackData={capturedByBlack}
      headerContent={
        <>
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
            React Chess
          </h1>
          <div className="mt-3 md:mt-4">
            {/* This status message display is now only for desktop (lg screens) */}
            <div className={`hidden lg:inline-flex items-center px-4 py-2 rounded-full text-sm md:text-base font-medium shadow-lg backdrop-blur-sm border transition-all duration-300 ${
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
        </>
      }
      leftSidebarContent={
        <>
          <CapturedPiecesDisplay pieces={capturedByBlack} title="Black's Captures" />
          <CapturedPiecesDisplay pieces={capturedByWhite} title="White's Captures" />
        </>
      }
      mainContent={
        <div className="p-1 sm:p-2 md:p-4 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-600/50">
          <BoardComponent
            board={board}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            onSquareClick={handleSquareClick}
          />
        </div>
      }
      rightSidebarContent={
        <>
          <div className="p-4 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50">
            <p className="font-medium mb-2 text-center">🎯 Modern Chess Experience</p>
            <p className="text-xs leading-relaxed text-slate-400">
              Complete chess implementation with castling, pawn promotion, check/checkmate detection, and move history. 
              Click any piece to see available moves, then click a highlighted square to make your move.
            </p>
          </div>
          <NotationDisplay moveHistory={moveHistory} />
          <button
            type="button"
            onClick={resetGame}
            className={`
              w-full px-6 py-3
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
        </>
      }
    />
  );
};

export default App;

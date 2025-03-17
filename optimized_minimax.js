class OptimizedMinimaxChessAI {
    constructor(depth = 2) {
        this.depth = depth;
        this.timeLimit = 500; // 500ms time limit for move calculation
        this.PIECE_VALUES = {
            '♟': 10,   // Black Pawn
            '♞': 30,   // Black Knight
            '♝': 30,   // Black Bishop
            '♜': 50,   // Black Rook
            '♛': 90,   // Black Queen
            '♚': 900,  // Black King
            '♙': -10,  // White Pawn
            '♘': -30,  // White Knight
            '♗': -30,  // White Bishop
            '♖': -50,  // White Rook
            '♕': -90,  // White Queen
            '♔': -900  // White King
        };
    }

    findBestMove(board) {
        console.time('Total Move Calculation');
        const startTime = performance.now();
        
        // Detailed performance logging
        const moveGenerationStart = performance.now();
        const moves = this.generateMoves(board, true);
        const moveGenerationTime = performance.now() - moveGenerationStart;
        
        console.log(`Moves Generated: ${moves.length}`);
        console.log(`Move Generation Time: ${moveGenerationTime}ms`);

        let bestMove = null;
        
        // Iterative Deepening with Time Limit
        for (let currentDepth = 1; currentDepth <= this.depth; currentDepth++) {
            try {
                const result = this.iterativeDeepeningSearch(
                    board, 
                    currentDepth, 
                    startTime
                );
                
                if (result) {
                    bestMove = result.move;
                }
                
                // Check if time limit exceeded
                const currentTime = performance.now();
                if (currentTime - startTime > this.timeLimit) {
                    break;
                }
            } catch (error) {
                // Time limit exceeded
                break;
            }
        }
        
        console.timeEnd('Total Move Calculation');
        return bestMove;
    }

    iterativeDeepeningSearch(board, depth, startTime) {
        // Generate and sort moves by initial heuristic
        const moves = this.generateAndSortMoves(board, true);

        let bestMove = null;
        let bestScore = -Infinity;
        
        // Limit search to prevent excessive computation
        const movesToEvaluate = moves.slice(0, 5); // Evaluate top 5 moves
        
        for (const move of movesToEvaluate) {
            // Check time limit
            if (performance.now() - startTime > this.timeLimit) {
                throw new Error('Time limit exceeded');
            }
            
            const newBoard = this.applyMove(board, move);
            
            const evaluation = this.minimax(
                newBoard, 
                depth - 1, 
                false, 
                -Infinity, 
                Infinity
            );
            
            if (evaluation.score > bestScore) {
                bestScore = evaluation.score;
                bestMove = move;
            }
        }
        
        return { move: bestMove, score: bestScore };
    }

    generateAndSortMoves(board, isBlackTurn) {
        const moves = this.generateMoves(board, isBlackTurn);
        
        // Sort moves by initial heuristic
        return moves.sort((a, b) => {
            const scoreA = this.evaluateMove(board, a);
            const scoreB = this.evaluateMove(board, b);
            return isBlackTurn ? scoreB - scoreA : scoreA - scoreB;
        });
    }

    generateMoves(board, isBlackTurn) {
        const moves = [];
        
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = board[fromRow][fromCol];
                
                // Check if piece belongs to the current player
                const isPlayerPiece = isBlackTurn 
                    ? this.isBlackPiece(piece)
                    : this.isWhitePiece(piece);
                
                if (isPlayerPiece) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (this.isValidMove(board, fromRow, fromCol, toRow, toCol)) {
                                moves.push({
                                    from: [fromRow, fromCol],
                                    to: [toRow, toCol],
                                    piece: piece
                                });
                            }
                        }
                    }
                }
            }
        }
        
        return moves;
    }

    evaluateMove(board, move) {
        const [fromRow, fromCol] = move.from;
        const [toRow, toCol] = move.to;
        
        let score = 0;
        
        // Capture bonus
        const capturedPiece = board[toRow][toCol];
        if (capturedPiece !== ' ') {
            score += Math.abs(this.PIECE_VALUES[capturedPiece]) * 2;
        }
        
        // Positional bonus
        score += this.getPositionalBonus(move.piece, toRow, toCol);
        
        return score;
    }

    minimax(board, depth, isMaximizingPlayer, alpha, beta) {
        // Base case with quicker evaluation
        if (depth === 0) {
            return { 
                score: this.quickEvaluateBoard(board),
                move: null
            };
        }

        const moves = this.generateMoves(board, isMaximizingPlayer);

        if (moves.length === 0) {
            return { 
                score: this.quickEvaluateBoard(board),
                move: null
            };
        }

        let bestMove = null;
        
        if (isMaximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const newBoard = this.applyMove(board, move);
                
                const evaluation = this.minimax(newBoard, depth - 1, false, alpha, beta);
                
                if (evaluation.score > maxEval) {
                    maxEval = evaluation.score;
                    bestMove = move;
                }

                alpha = Math.max(alpha, evaluation.score);
                if (beta <= alpha) {
                    break; // Beta cut-off
                }
            }
            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const newBoard = this.applyMove(board, move);
                
                const evaluation = this.minimax(newBoard, depth - 1, true, alpha, beta);
                
                if (evaluation.score < minEval) {
                    minEval = evaluation.score;
                    bestMove = move;
                }

                beta = Math.min(beta, evaluation.score);
                if (beta <= alpha) {
                    break; // Alpha cut-off
                }
            }
            return { score: minEval, move: bestMove };
        }
    }

    applyMove(board, move) {
        // Create a deep copy of the board
        const newBoard = board.map(row => [...row]);
        
        // Apply the move
        const [fromRow, fromCol] = move.from;
        const [toRow, toCol] = move.to;
        
        newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = ' ';
        
        return newBoard;
    }

    quickEvaluateBoard(board) {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                
                if (piece !== ' ') {
                    // Simplified evaluation
                    score += this.PIECE_VALUES[piece];
                }
            }
        }
        
        return score;
    }

    getPositionalBonus(piece, row, col) {
        const centerBonus = this.getCenterControlBonus(row, col);
        
        switch (piece) {
            case '♟': // Black Pawn
                return centerBonus + (7 - row) * 2;
            case '♙': // White Pawn
                return centerBonus + row * 2;
            case '♞': // Black Knight
            case '♘': // White Knight
                return centerBonus + 5;
            default:
                return centerBonus;
        }
    }

    getCenterControlBonus(row, col) {
        const centerRows = [3, 4];
        const centerCols = [3, 4];
        
        if (centerRows.includes(row) && centerCols.includes(col)) {
            return 10;
        }
        return 0;
    }

    // Move Validation Methods
    isValidMove(board, fromRow, fromCol, toRow, toCol) {
        const piece = board[fromRow][fromCol];
        const targetSquare = board[toRow][toCol];
        
        // Can't move to a square with a piece of the same color
        const isBlackPiece = this.isBlackPiece(piece);
        const isTargetBlack = this.isBlackPiece(targetSquare);
        const isTargetWhite = this.isWhitePiece(targetSquare);
        
        if ((isBlackPiece && isTargetBlack) || 
            (!isBlackPiece && isTargetWhite)) {
            return false;
        }
        
        // Piece-specific move validation
        switch (piece) {
            case '♟': return this.validateBlackPawnMove(board, fromRow, fromCol, toRow, toCol);
            case '♙': return this.validateWhitePawnMove(board, fromRow, fromCol, toRow, toCol);
            case '♞': return this.validateKnightMove(fromRow, fromCol, toRow, toCol);
            case '♘': return this.validateKnightMove(fromRow, fromCol, toRow, toCol);
            case '♜': return this.validateRookMove(board, fromRow, fromCol, toRow, toCol);
            case '♖': return this.validateRookMove(board, fromRow, fromCol, toRow, toCol);
            case '♝': return this.validateBishopMove(board, fromRow, fromCol, toRow, toCol);
            case '♗': return this.validateBishopMove(board, fromRow, fromCol, toRow, toCol);
            case '♛': return this.validateQueenMove(board, fromRow, fromCol, toRow, toCol);
            case '♕': return this.validateQueenMove(board, fromRow, fromCol, toRow, toCol);
            case '♚': return this.validateKingMove(fromRow, fromCol, toRow, toCol);
            case '♔': return this.validateKingMove(fromRow, fromCol, toRow, toCol);
            default: return false;
        }
    }

    // Pawn Move Validations
    validateBlackPawnMove(board, fromRow, fromCol, toRow, toCol) {
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(fromCol - toCol);
        
        // Standard move forward
        if (fromCol === toCol && rowDiff === 1 && board[toRow][toCol] === ' ') return true;
        
        // Initial two-square move
        if (fromCol === toCol && fromRow === 1 && rowDiff === 2 && 
            board[fromRow + 1][toCol] === ' ' && board[toRow][toCol] === ' ') return true;
        
        // Capture diagonally
        if (colDiff === 1 && rowDiff === 1 && this.isWhitePiece(board[toRow][toCol])) return true;
        
        return false;
    }

    validateWhitePawnMove(board, fromRow, fromCol, toRow, toCol) {
        const rowDiff = fromRow - toRow;
        const colDiff = Math.abs(fromCol - toCol);
        
        // Standard move forward
        if (fromCol === toCol && rowDiff === 1 && board[toRow][toCol] === ' ') return true;
        
        // Initial two-square move
        if (fromCol === toCol && fromRow === 6 && rowDiff === 2 && 
            board[fromRow - 1][toCol] === ' ' && board[toRow][toCol] === ' ') return true;
        
        // Capture diagonally
        if (colDiff === 1 && rowDiff === 1 && this.isBlackPiece(board[toRow][toCol])) return true;
        
        return false;
    }

    // Other Move Validations (Knight, Rook, Bishop, Queen, King)
    validateKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    validateRookMove(board, fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return this.isPathClear(board, fromRow, fromCol, toRow, toCol);
    }

    validateBishopMove(board, fromRow, fromCol, toRow, toCol) {
        if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;
        return this.isPathClear(board, fromRow, fromCol, toRow, toCol);
    }

    validateQueenMove(board, fromRow, fromCol, toRow, toCol) {
        return this.validateRookMove(board, fromRow, fromCol, toRow, toCol) || 
               this.validateBishopMove(board, fromRow, fromCol, toRow, toCol);
    }

    validateKingMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return rowDiff <= 1 && colDiff <= 1;
    }

    isPathClear(board, fromRow, fromCol, toRow, toCol) {
        const rowStep = fromRow < toRow ? 1 : fromRow > toRow ? -1 : 0;
        const colStep = fromCol < toCol ? 1 : fromCol > toCol ? -1 : 0;
        
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;
        
        while (currentRow !== toRow || currentCol !== toCol) {
            if (board[currentRow][currentCol] !== ' ') return false;
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }

    // Utility methods
    isBlackPiece(piece) {
        return ['♟', '♞', '♝', '♜', '♛', '♚'].includes(piece);
    }

    isWhitePiece(piece) {
        return ['♙', '♖', '♘', '♗', '♕', '♔'].includes(piece);
    }
}
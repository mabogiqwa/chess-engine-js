//Greedy best first search algorithm
class SimpleChessAI {
    constructor() {
        // Piece values for basic evaluation
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

    // Simplified move generation
    generateMoves(board) {
        const moves = [];
        
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = board[fromRow][fromCol];
                
                // Only consider black pieces
                if (this.isBlackPiece(piece)) {
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

    // Simplified move evaluation
    evaluateMove(board, move) {
        const [fromRow, fromCol] = move.from;
        const [toRow, toCol] = move.to;
        
        // Base score is the piece's inherent value
        let score = this.PIECE_VALUES[move.piece];
        
        // Bonus for capturing
        const capturedPiece = board[toRow][toCol];
        if (capturedPiece !== ' ') {
            score += Math.abs(this.PIECE_VALUES[capturedPiece]) * 2;
        }
        
        // Bonus for moving to a more central position
        const centralBonus = this.getCentralBonus(toRow, toCol);
        score += centralBonus;
        
        return score;
    }

    // Bonus for moving to central squares
    getCentralBonus(row, col) {
        const centralRows = [3, 4];
        const centralCols = [3, 4];
        
        if (centralRows.includes(row) && centralCols.includes(col)) {
            return 10;  // Bonus for central squares
        }
        return 0;
    }

    // Find best move using greedy approach
    findBestMove(board) {
        const startTime = performance.now();
        
        // Generate all possible moves
        const moves = this.generateMoves(board);
        
        // If no moves available, return null
        if (moves.length === 0) return null;
        
        // Sort moves by evaluation score
        const scoredMoves = moves.map(move => ({
            move,
            score: this.evaluateMove(board, move)
        }));
        
        // Sort in descending order (black wants to maximize)
        const bestMove = scoredMoves.sort((a, b) => b.score - a.score)[0].move;
        
        const endTime = performance.now();
        console.log(`Simple AI Move Calculation:
            - Moves Considered: ${moves.length}
            - Calculation Time: ${endTime - startTime}ms`);
        
        return bestMove;
    }

    // Basic move validation (simplified version)
    isValidMove(board, fromRow, fromCol, toRow, toCol) {
        const piece = board[fromRow][fromCol];
        const targetSquare = board[toRow][toCol];
        
        // Can't move to a square with a black piece
        if (this.isBlackPiece(targetSquare)) return false;
        
        // Piece-specific move validation
        switch (piece) {
            case '♟': return this.validateBlackPawnMove(board, fromRow, fromCol, toRow, toCol);
            case '♞': return this.validateKnightMove(fromRow, fromCol, toRow, toCol);
            case '♜': return this.validateRookMove(board, fromRow, fromCol, toRow, toCol);
            case '♝': return this.validateBishopMove(board, fromRow, fromCol, toRow, toCol);
            case '♛': return this.validateQueenMove(board, fromRow, fromCol, toRow, toCol);
            case '♚': return this.validateKingMove(fromRow, fromCol, toRow, toCol);
            default: return false;
        }
    }

    // Piece-specific move validations (simplified versions)
    validateBlackPawnMove(board, fromRow, fromCol, toRow, toCol) {
        // Pawn moves down the board
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

    validateKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    validateRookMove(board, fromRow, fromCol, toRow, toCol) {
        // Move along same row or column
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return this.isPathClear(board, fromRow, fromCol, toRow, toCol);
    }

    validateBishopMove(board, fromRow, fromCol, toRow, toCol) {
        // Move diagonally
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
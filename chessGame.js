class ChessGame {
    constructor(board = null) {
        this.board = board || this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.moveHistory = [];
        this.ai = new SimpleChessAI();

        if (!board) {
            this.renderBoard();
        }
    }

    initializeBoard() {
        const board = [
            ['♜','♞','♝','♛','♚','♝','♞','♜'],
            ['♟','♟','♟','♟','♟','♟','♟','♟'],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            ['♙','♙','♙','♙','♙','♙','♙','♙'],
            ['♖','♘','♗','♕','♔','♗','♘','♖']
        ];
        return board;
    }

    renderBoard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
                square.textContent = this.board[row][col];
                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', this.handleSquareClick.bind(this));
                boardElement.appendChild(square);
            }
        }

        // Update status
        this.updateStatus();
    }

    updateStatus() {
        const statusElement = document.getElementById('status');
        statusElement.textContent = this.currentPlayer === 'white' 
            ? 'Your turn (White)' 
            : 'AI thinking...';
    }

    handleSquareClick(event) {
        if (this.currentPlayer !== 'white') return;

        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const clickedPiece = this.board[row][col];

        // Clear previous highlights
        this.clearHighlights();

        if (!this.selectedPiece) {
            // Select a piece
            if (clickedPiece !== ' ') {
                const pieceColor = this.isPieceWhite(clickedPiece) ? 'white' : 'black';

                if (pieceColor === this.currentPlayer) {
                    this.selectedPiece = { row, col };
                    event.target.classList.add('selected');
                    this.highlightPossibleMoves(row, col);
                }
            }
        } else {
            // Try to move the selected piece
            if (this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                this.movePiece(
                    this.selectedPiece.row, 
                    this.selectedPiece.col, 
                    row, 
                    col
                );
            } else {
                // If clicked on the same piece, deselect
                if (this.selectedPiece.row === row && this.selectedPiece.col === col) {
                    this.clearHighlights();
                    this.selectedPiece = null;
                    return;
                }
            }

            // Clear selection
            this.clearHighlights();
            this.selectedPiece = null;
        }
    }

    highlightPossibleMoves(row, col) {
        for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
                if (this.isValidMove(row, col, toRow, toCol)) {
                    const targetSquare = document.querySelector(
                        `.square[data-row="${toRow}"][data-col="${toCol}"]`
                    );
                    
                    if (targetSquare) {
                        if (this.board[toRow][toCol] === ' ') {
                            targetSquare.classList.add('possible-move');
                        } else {
                            targetSquare.classList.add('capture-move');
                        }
                    }
                }
            }
        }
    }

    clearHighlights() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'possible-move', 'capture-move');
        });
    }

    isPieceWhite(piece) {
        const whitePieces = ['♙', '♖', '♘', '♗', '♕', '♔'];
        return whitePieces.includes(piece);
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const targetSquare = this.board[toRow][toCol];

        // Prevent moving to a square with a piece of the same color
        if (targetSquare !== ' ') {
            const pieceColor = this.isPieceWhite(piece) ? 'white' : 'black';
            const targetColor = this.isPieceWhite(targetSquare) ? 'white' : 'black';

            if (pieceColor === targetColor) {
                return false;
            }
        }

        // Add more specific move validation for different piece types
        switch (piece) {
            case '♙': // White Pawn
                return this.validateWhitePawnMove(fromRow, fromCol, toRow, toCol);
            case '♟': // Black Pawn
                return this.validateBlackPawnMove(fromRow, fromCol, toRow, toCol);
            case '♖': // White Rook
            case '♜': // Black Rook
                return this.validateRookMove(fromRow, fromCol, toRow, toCol);
            case '♘': // White Knight
            case '♞': // Black Knight
                return this.validateKnightMove(fromRow, fromCol, toRow, toCol);
            case '♗': // White Bishop
            case '♝': // Black Bishop
                return this.validateBishopMove(fromRow, fromCol, toRow, toCol);
            case '♕': // White Queen
            case '♛': // Black Queen
                return this.validateQueenMove(fromRow, fromCol, toRow, toCol);
            case '♔': // White King
            case '♚': // Black King
                return this.validateKingMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }

    validateWhitePawnMove(fromRow, fromCol, toRow, toCol) {
        if (fromCol === toCol && toRow === fromRow - 1 && this.board[toRow][toCol] === ' ') {
            return true;
        }

        if (fromCol === toCol && fromRow === 6 && toRow === 4 && this.board[toRow][toCol] === ' ') {
            return true;
        }

        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow - 1) {
            return this.board[toRow][toCol] !== ' ';
        }

        return false;
    }

    validateBlackPawnMove(fromRow, fromCol, toRow, toCol) {
        if (fromCol === toCol && toRow === fromRow + 1 && this.board[toRow][toCol] === ' ') {
            return true;
        }

        if (fromCol === toCol && fromRow === 1 && toRow === 3 && this.board[toRow][toCol] === ' ') {
            return true;
        }

        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + 1) {
            return this.board[toRow][toCol] !== ' ';
        }

        return false;
    }

    validateRookMove(fromRow, fromCol, toRow, toCol) {
        if (fromRow === toRow || fromCol === toCol) {
            return this.isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
    }

    validateBishopMove(fromRow, fromCol, toRow, toCol) {
        if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
            // Check if path is clear
            return this.isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
    }

    validateQueenMove(fromRow, fromCol, toRow, toCol) {
        // Queen can move like a rook or bishop
        return this.validateRookMove(fromRow, fromCol, toRow, toCol) || 
               this.validateBishopMove(fromRow, fromCol, toRow, toCol);
    }

    validateKingMove(fromRow, fromCol, toRow, toCol) {
        // King can move one square in any direction
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return rowDiff <= 1 && colDiff <= 1;
    }

    validateKnightMove(fromRow, fromCol, toRow, toCol) {
        // Knight moves in an L-shape
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        // Check if the path between start and end is clear
        if (fromRow === toRow) {
            // Moving horizontally
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col] !== ' ') {
                    return false;
                }
            }
        } else if (fromCol === toCol) {
            // Moving vertically
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol] !== ' ') {
                    return false;
                }
            }
        } else {
            // Moving diagonally
            const rowStep = fromRow < toRow ? 1 : -1;
            const colStep = fromCol < toCol ? 1 : -1;
            let row = fromRow + rowStep;
            let col = fromCol + colStep;

            while (row !== toRow && col !== toCol) {
                if (this.board[row][col] !== ' ') {
                    return false;
                }
                row += rowStep;
                col += colStep;
            }
        }
        return true;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const move = {
            piece: this.board[fromRow][fromCol],
            from: [fromRow, fromCol],
            to: [toRow, toCol],
            captured: this.board[toRow][toCol]
        };
        this.moveHistory.push(move);

        // Move the piece
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = ' ';

        // Switch turns
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Re-render the board
        this.renderBoard();

        // AI move
        if (this.currentPlayer === 'black') {
            this.makeAIMove();
        }
    }

    makeAIMove() {
        setTimeout(() => {
            const bestMove = this.ai.findBestMove(this.board);

            if (bestMove) {
                this.movePiece(
                    bestMove.from[0], 
                    bestMove.from[1], 
                    bestMove.to[0], 
                    bestMove.to[1]
                );
            }
        }, 100);
    }

    checkGameEnd() {
        // Check for different game-ending scenarios
        const whiteKingStatus = this.checkKingStatus('white');
        const blackKingStatus = this.checkKingStatus('black');
    
        // Checkmate conditions
        if (whiteKingStatus.isInCheck && !this.hasValidMoves('white')) {
            return {
                gameOver: true,
                result: 'Black Wins',
                reason: 'Checkmate'
            };
        }
    
        if (blackKingStatus.isInCheck && !this.hasValidMoves('black')) {
            return {
                gameOver: true,
                result: 'White Wins',
                reason: 'Checkmate'
            };
        }
    
        // Stalemate conditions
        if (!whiteKingStatus.isInCheck && !this.hasValidMoves('white')) {
            return {
                gameOver: true,
                result: 'Draw',
                reason: 'Stalemate'
            };
        }
    
        if (!blackKingStatus.isInCheck && !this.hasValidMoves('black')) {
            return {
                gameOver: true,
                result: 'Draw',
                reason: 'Stalemate'
            };
        }
    
        if (this.isInsufficientMaterial()) {
            return {
                gameOver: true,
                result: 'Draw',
                reason: 'Insufficient Material'
            };
        }
    
        if (this.isThreefoldRepetition()) {
            return {
                gameOver: true,
                result: 'Draw',
                reason: 'Threefold Repetition'
            };
        }
   
        if (this.isFiftyMoveRule()) {
            return {
                gameOver: true,
                result: 'Draw',
                reason: '50-Move Rule'
            };
        }
    
        return {
            gameOver: false,
            result: null,
            reason: null
        };
    }

    checkKingStatus(color) {
        let kingPosition = null;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if ((color === 'white' && piece === '♔') || 
                    (color === 'black' && piece === '♚')) {
                    kingPosition = { row, col };
                    break;
                }
            }
            if (kingPosition) break;
        }
    
        if (!kingPosition) {
            throw new Error(`No ${color} king found on the board`);
        }
    
        return {
            isInCheck: this.isSquareUnderAttack(kingPosition.row, kingPosition.col, color),
            position: kingPosition
        };
    }

    isSquareUnderAttack(row, col, defendingColor) {
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.board[fromRow][fromCol];
                
                const isAttackingPiece = defendingColor === 'white' 
                    ? this.isPieceBlack(piece)
                    : this.isPieceWhite(piece);
    
                if (isAttackingPiece) {
                    if (this.isValidMove(fromRow, fromCol, row, col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    hasValidMoves(color) {
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.board[fromRow][fromCol];
                
                const isPieceOfColor = color === 'white' 
                    ? this.isPieceWhite(piece)
                    : this.isPieceBlack(piece);
    
                if (isPieceOfColor) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (this.isValidMove(fromRow, fromCol, toRow, toCol) &&
                                this.wouldNotExposeKingToCheck(fromRow, fromCol, toRow, toCol)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    wouldNotExposeKingToCheck(fromRow, fromCol, toRow, toCol) {
        const boardCopy = this.board.map(row => [...row]);
        
        boardCopy[toRow][toCol] = boardCopy[fromRow][fromCol];
        boardCopy[fromRow][fromCol] = ' ';
   
        const currentColor = this.isPieceWhite(boardCopy[toRow][toCol]) ? 'white' : 'black';
        
        let kingPosition = null;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = boardCopy[row][col];
                if ((currentColor === 'white' && piece === '♔') || 
                    (currentColor === 'black' && piece === '♚')) {
                    kingPosition = { row, col };
                    break;
                }
            }
            if (kingPosition) break;
        }
    
        return !this.isSquareUnderAttackOnBoard(boardCopy, kingPosition.row, kingPosition.col, currentColor);
    }

    isSquareUnderAttackOnBoard(board, row, col, defendingColor) {
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = board[fromRow][fromCol];
                
                const isAttackingPiece = defendingColor === 'white' 
                    ? this.isPieceBlack(piece)
                    : this.isPieceWhite(piece);
    
                if (isAttackingPiece) {
                    if (this.isValidMoveOnBoard(board, fromRow, fromCol, row, col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isValidMoveOnBoard(board, fromRow, fromCol, toRow, toCol) {
        const piece = board[fromRow][fromCol];
        const targetSquare = board[toRow][toCol];
        
        if (targetSquare !== ' ') {
            const pieceColor = this.isPieceWhite(piece) ? 'white' : 'black';
            const targetColor = this.isPieceWhite(targetSquare) ? 'white' : 'black';
    
            if (pieceColor === targetColor) {
                return false;
            }
        }
    
        switch (piece) {
            case '♙': return this.validateWhitePawnMove(board, fromRow, fromCol, toRow, toCol);
            case '♟': return this.validateBlackPawnMove(board, fromRow, fromCol, toRow, toCol);

            default: return false;
        }
    }

    isInsufficientMaterial() {
        const pieces = this.board.flat();
        const remainingPieces = pieces.filter(piece => piece !== ' ');
        
        if (remainingPieces.length === 2) return true;
      
        if (remainingPieces.length === 3) {
            const minorPieces = ['♗', '♝', '♘', '♞'];
            return remainingPieces.some(piece => minorPieces.includes(piece));
        }
        
        return false;
    }

    isThreefoldRepetition() {
        const positionHistory = this.moveHistory.map(move => JSON.stringify(this.board));
        
        const positionCounts = {};
        positionHistory.forEach(position => {
            positionCounts[position] = (positionCounts[position] || 0) + 1;
        });
        
        return Object.values(positionCounts).some(count => count >= 3);
    }
    
    isFiftyMoveRule() {
        const recentMoves = this.moveHistory.slice(-50);
        return recentMoves.every(move => 
            move.piece !== '♙' && 
            move.piece !== '♟' && 
            move.captured === ' '
        );
    }   
}

const game = new ChessGame();
# Chess Game with Simple AI

## Overview

This project is a simple chess game implemented in JavaScript, featuring a graphical interface and an AI opponent that uses a greedy best-first search algorithm. The game allows a human player to play as white against an AI-controlled black player.

## Features

Interactive Chessboard: Users can click to move pieces.

Move Validation: Ensures legal moves based on chess rules.

Basic AI Opponent: AI moves are determined using a simple evaluation function.

Game Status Updates: Displays whose turn it is and detects checkmate/stalemate conditions.

Move Highlights: Indicates selected pieces and possible moves.

## AI Algorithm

The AI evaluates moves based on:

Piece Value: Higher value for capturing more important pieces.

Positional Advantage: Bonus for controlling the center.

Greedy Search: Always picks the highest immediate reward move.

## Future Improvements

Implement castling, en passant, and pawn promotion.

Improve AI with Minimax or Alpha-Beta pruning.

Enhance UI with better visuals and animations.

Author
Mabo Giqwa


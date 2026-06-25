import { create } from 'zustand';
import { CONFIG } from '../game/config';
import type { Grid, Piece } from '../types/game.types';
import { createPiece } from '../game/pieces';

function emptyGrid(): Grid {
  return Array.from({ length: CONFIG.ROWS }, () =>
    Array(CONFIG.COLS).fill(null)
  );
}

interface GameState {
  grid: Grid;
  currentPiece: Piece;
  score: number;
  isGameOver: boolean;
  setGrid: (grid: Grid) => void;
  setPiece: (piece: Piece) => void;
  addScore: (points: number) => void;
  setGameOver: (value: boolean) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  grid: emptyGrid(),
  currentPiece: createPiece(),
  score: 0,
  isGameOver: false,
  setGrid: (grid) => set({ grid }),
  setPiece: (currentPiece) => set({ currentPiece }),
  addScore: (points) => set((s) => ({ score: s.score + points })),
  setGameOver: (isGameOver) => set({ isGameOver }),
  reset: () =>
    set({
      grid: emptyGrid(),
      currentPiece: createPiece(),
      score: 0,
      isGameOver: false,
    }),
}));

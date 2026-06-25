import { CONFIG, BASE_KEYS, type BaseType } from './config';
import type { Cell, Piece, Grid } from '../types/game.types';

const SHAPES: number[][][] = [
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1], [0, 1]],
];

function randomBase(): BaseType {
  return BASE_KEYS[Math.floor(Math.random() * BASE_KEYS.length)];
}

export function createPiece(): Piece {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const bases: Cell[][] = shape.map((row) =>
    row.map((cell) => (cell ? randomBase() : null))
  );
  return {
    shape: bases,
    x: Math.floor(CONFIG.COLS / 2) - 1,
    y: 0,
  };
}

// Rotar pieza 90 grados (sentido horario)
export function rotatePiece(piece: Piece): Piece {
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  const rotated: Cell[][] = Array.from({ length: cols }, () =>
    Array(rows).fill(null)
  );

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      rotated[x][rows - 1 - y] = piece.shape[y][x];
    }
  }

  return { ...piece, shape: rotated };
}

// Verificar si la pieza colisiona en una posición dada
export function isValidPosition(piece: Piece, grid: Grid): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (!piece.shape[y][x]) continue;

      const gridX = piece.x + x;
      const gridY = piece.y + y;

      // Fuera de límites
      if (gridX < 0 || gridX >= CONFIG.COLS || gridY >= CONFIG.ROWS) {
        return false;
      }
      // Choca con base existente
      if (gridY >= 0 && grid[gridY][gridX]) {
        return false;
      }
    }
  }
  return true;
}

// Fijar la pieza al grid
export function mergePiece(piece: Piece, grid: Grid): Grid {
  const newGrid = grid.map((row) => [...row]);
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      const base = piece.shape[y][x];
      if (base) {
        const gridY = piece.y + y;
        const gridX = piece.x + x;
        if (gridY >= 0) newGrid[gridY][gridX] = base;
      }
    }
  }
  return newGrid;
}

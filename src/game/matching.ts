import { CONFIG, BASES, type BaseType } from './config';
import type { Grid } from '../types/game.types';

// Devuelve las celdas que forman par válido (para eliminar)
export function findMatches(grid: Grid): [number, number][] {
  const toRemove = new Set<string>();

  for (let y = 0; y < CONFIG.ROWS; y++) {
    for (let x = 0; x < CONFIG.COLS; x++) {
      const base = grid[y][x];
      if (!base) continue;

      const neighbors: [number, number][] =
        CONFIG.MATCH_MODE === 'horizontal'
          ? [[x - 1, y], [x + 1, y]]
          : [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];

      for (const [nx, ny] of neighbors) {
        if (nx < 0 || nx >= CONFIG.COLS || ny < 0 || ny >= CONFIG.ROWS)
          continue;
        const neighbor = grid[ny][nx];
        if (neighbor && BASES[base].pair === neighbor) {
          toRemove.add(`${x},${y}`);
          toRemove.add(`${nx},${ny}`);
        }
      }
    }
  }

  return Array.from(toRemove).map((s) => {
    const [x, y] = s.split(',').map(Number);
    return [x, y] as [number, number];
  });
}

// Eliminar celdas y aplicar gravedad
export function clearMatches(
  grid: Grid,
  matches: [number, number][]
): Grid {
  const newGrid = grid.map((row) => [...row]);

  // Eliminar
  for (const [x, y] of matches) {
    newGrid[y][x] = null;
  }

  // Aplicar gravedad columna por columna
  for (let x = 0; x < CONFIG.COLS; x++) {
    const column: BaseType[] = [];
    for (let y = CONFIG.ROWS - 1; y >= 0; y--) {
      const cell = newGrid[y][x];
      if (cell) column.push(cell);
    }
    for (let y = CONFIG.ROWS - 1; y >= 0; y--) {
      newGrid[y][x] = column.shift() || null;
    }
  }

  return newGrid;
}

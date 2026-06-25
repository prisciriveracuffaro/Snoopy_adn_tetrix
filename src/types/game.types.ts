import type { BaseType } from '../game/config';

// El grid guarda bases o null (vacío)
export type Cell = BaseType | null;
export type Grid = Cell[][];

export interface Piece {
  shape: Cell[][];  // matriz de bases
  x: number;
  y: number;
}

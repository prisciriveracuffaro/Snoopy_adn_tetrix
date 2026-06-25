export type MatchMode = 'horizontal' | 'cualquiera';
export type BaseType = 'A' | 'T' | 'G' | 'C';

export const CONFIG = {
  MATCH_MODE: 'cualquiera' as MatchMode,
  COLS: 10,
  ROWS: 20,
  CELL_SIZE: 30,
  DROP_SPEED: 800,
  FAST_DROP_SPEED: 50,
  SWIPE_THRESHOLD: 30,
} as const;

export const BASES: Record<BaseType, { color: string; pair: BaseType }> = {
  A: { color: '#e63946', pair: 'T' },
  T: { color: '#457b9d', pair: 'A' },
  G: { color: '#2a9d8f', pair: 'C' },
  C: { color: '#e9c46a', pair: 'G' },
};

export const BASE_KEYS: BaseType[] = ['A', 'T', 'G', 'C'];

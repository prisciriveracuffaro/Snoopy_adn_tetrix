import { useEffect, useRef, useCallback } from 'react';
import { CONFIG, BASES } from '../game/config';
import { useGameStore } from '../store/gameStore';
import {
  createPiece,
  rotatePiece,
  isValidPosition,
  mergePiece,
} from '../game/pieces';
import { findMatches, clearMatches } from '../game/matching';
import type { Piece, Grid } from '../types/game.types';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const store = useGameStore();

  // Refs para acceder a valores actuales dentro del loop
  const gridRef = useRef(store.grid);
  const pieceRef = useRef(store.currentPiece);
  const gameOverRef = useRef(store.isGameOver);
  gridRef.current = store.grid;
  pieceRef.current = store.currentPiece;
  gameOverRef.current = store.isGameOver;

  // Refs para touch controls
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const fastDropRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didSwipeRef = useRef(false);

  // Procesar encastre tras fijar pieza
  const processMatches = useCallback((grid: Grid) => {
    let current = grid;
    let matches = findMatches(current);
    let totalCleared = 0;

    while (matches.length > 0) {
      totalCleared += matches.length;
      current = clearMatches(current, matches);
      matches = findMatches(current); // reacción en cadena
    }

    if (totalCleared > 0) {
      store.addScore(totalCleared * 10);
    }
    return current;
  }, [store]);

  // Bajar pieza
  const drop = useCallback(() => {
    const piece = pieceRef.current;
    const grid = gridRef.current;
    const moved = { ...piece, y: piece.y + 1 };

    if (isValidPosition(moved, grid)) {
      store.setPiece(moved);
    } else {
      // Fijar pieza
      let newGrid = mergePiece(piece, grid);
      newGrid = processMatches(newGrid);
      store.setGrid(newGrid);

      const next = createPiece();
      if (!isValidPosition(next, newGrid)) {
        store.setGameOver(true);
      } else {
        store.setPiece(next);
      }
    }
  }, [store, processMatches]);

  // Loop de caída automática
  useEffect(() => {
    if (store.isGameOver) return;
    const interval = setInterval(drop, CONFIG.DROP_SPEED);
    return () => clearInterval(interval);
  }, [drop, store.isGameOver]);

  // Controles de teclado
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (store.isGameOver) return;
      const piece = pieceRef.current;
      const grid = gridRef.current;
      let moved: Piece | null = null;

      if (e.key === 'ArrowLeft') moved = { ...piece, x: piece.x - 1 };
      else if (e.key === 'ArrowRight') moved = { ...piece, x: piece.x + 1 };
      else if (e.key === 'ArrowDown') moved = { ...piece, y: piece.y + 1 };
      else if (e.key === 'ArrowUp') moved = rotatePiece(piece);

      if (moved && isValidPosition(moved, grid)) {
        store.setPiece(moved);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [store]);

  // --- Controles táctiles para móvil ---

  // Limpiar el intervalo de fast drop
  const stopFastDrop = useCallback(() => {
    if (fastDropRef.current) {
      clearInterval(fastDropRef.current);
      fastDropRef.current = null;
    }
  }, []);

  // Iniciar fast drop (mantener presionado)
  const startFastDrop = useCallback(() => {
    stopFastDrop();
    fastDropRef.current = setInterval(() => {
      if (!gameOverRef.current) {
        const piece = pieceRef.current;
        const grid = gridRef.current;
        const moved = { ...piece, y: piece.y + 1 };
        if (isValidPosition(moved, grid)) {
          useGameStore.getState().setPiece(moved);
        }
      }
    }, CONFIG.FAST_DROP_SPEED);
  }, [stopFastDrop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (gameOverRef.current) return;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      didSwipeRef.current = false;

      // Iniciar fast drop tras 200ms de mantener presionado
      const holdTimer = setTimeout(() => {
        if (touchStartRef.current && !didSwipeRef.current) {
          startFastDrop();
        }
      }, 200);

      // Guardar el timer para cancelarlo en touchend
      (canvas as any).__holdTimer = holdTimer;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (gameOverRef.current || !touchStartRef.current) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;

      // Detectar swipe horizontal
      if (Math.abs(dx) > CONFIG.SWIPE_THRESHOLD) {
        didSwipeRef.current = true;
        stopFastDrop();
        // Cancelar hold timer si swipeó
        if ((canvas as any).__holdTimer) {
          clearTimeout((canvas as any).__holdTimer);
          (canvas as any).__holdTimer = null;
        }

        const piece = pieceRef.current;
        const grid = gridRef.current;
        const direction = dx > 0 ? 1 : -1;
        const moved = { ...piece, x: piece.x + direction };

        if (isValidPosition(moved, grid)) {
          store.setPiece(moved);
        }
        // Resetear punto de inicio para permitir swipes encadenados
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      stopFastDrop();

      // Cancelar hold timer
      if ((canvas as any).__holdTimer) {
        clearTimeout((canvas as any).__holdTimer);
        (canvas as any).__holdTimer = null;
      }

      // Si no hubo swipe y fue un tap rápido → rotar
      if (!didSwipeRef.current && touchStartRef.current) {
        const elapsed = Date.now() - touchStartRef.current.time;
        if (elapsed < 200) {
          const piece = pieceRef.current;
          const grid = gridRef.current;
          const rotated = rotatePiece(piece);
          if (isValidPosition(rotated, grid)) {
            store.setPiece(rotated);
          }
        }
      }

      touchStartRef.current = null;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      stopFastDrop();
    };
  }, [store, startFastDrop, stopFastDrop]);

  // Limpiar fast drop al desmontar
  useEffect(() => {
    return () => stopFastDrop();
  }, [stopFastDrop]);

  // Renderizado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { CELL_SIZE } = CONFIG;

    // Limpiar (transparente para ver la cuadrícula del fondo)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar celda con efecto puzzle
    const drawCell = (x: number, y: number, base: string) => {
      ctx.fillStyle = BASES[base as keyof typeof BASES].color;
      ctx.fillRect(
        x * CELL_SIZE + 1,
        y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
      // Letra de la base
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        base,
        x * CELL_SIZE + CELL_SIZE / 2,
        y * CELL_SIZE + CELL_SIZE / 2
      );
    };

    // Grid fijo
    store.grid.forEach((row, y) =>
      row.forEach((base, x) => {
        if (base) drawCell(x, y, base);
      })
    );

    // Pieza actual
    const piece = store.currentPiece;
    piece.shape.forEach((row, y) =>
      row.forEach((base, x) => {
        if (base) drawCell(piece.x + x, piece.y + y, base);
      })
    );
  }, [store.grid, store.currentPiece]);

  return (
    <canvas
      ref={canvasRef}
      width={CONFIG.COLS * CONFIG.CELL_SIZE}
      height={CONFIG.ROWS * CONFIG.CELL_SIZE}
      style={{
        touchAction: 'none',
      }}
    />
  );
}


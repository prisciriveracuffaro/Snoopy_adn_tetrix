import { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { Marco } from './components/Marco';
import { useGameStore } from './store/gameStore';
import './App.css';

// ⬇️ Reemplazá esta ruta con tu imagen de marco
import marcoImg from './assets/marco.png';

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

function App() {
  const { score, isGameOver, reset } = useGameStore();
  const isMobile = useIsMobile();

  return (
    <Marco src={marcoImg}>
      <div className="app">
        <div className="canvas-wrapper">
          <GameCanvas />
        </div>
        
        <div className="panel">
          <div className="panel-column info-column">
            <h2>🐶 Snoopy ADN</h2>
            <p className="score-text">Puntos: <strong>{score}</strong></p>
          </div>
          
          <div className="panel-column pairs-column">
            <div>🔴 A ⇄ T 🔵</div>
            <div>🟢 G ⇄ C 🟡</div>
          </div>
          
          <div className="panel-column controls-column">
            {isMobile ? (
              <>
                <div>👆 Tap: Rotar</div>
                <div>👈👉 Swipe: Mover</div>
                <div>✊ Hold: Caída rápida</div>
              </>
            ) : (
              <>
                <div>↑ Rotar</div>
                <div>← → Mover</div>
                <div>↓ Caída rápida</div>
              </>
            )}
          </div>
        </div>

        {isGameOver && (
          <div className="game-over-overlay">
            <h3>💀 GAME OVER</h3>
            <button onClick={reset}>Reiniciar</button>
          </div>
        )}
      </div>
    </Marco>
  );
}

export default App;


import type { ReactNode } from 'react';

interface MarcoProps {
  /** Ruta a la imagen del marco (import o URL) */
  src: string;
  children: ReactNode;
}

/**
 * Marco decorativo full-screen.
 * Renderiza la imagen de fondo cubriendo toda la pantalla
 * y posiciona los children (canvas + panel) encima.
 */
export function Marco({ src, children }: MarcoProps) {
  return (
    <div className="marco-viewport">
      <div className="marco-container">
        <img
          className="marco-bg"
          src={src}
          alt=""
          draggable={false}
        />
        <div className="marco-content">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * components/QRCode.tsx
 * -----------------------------------------------------------------------------
 * Rendert einen QR-Code (offline, ueber die "qrcode"-Bibliothek) auf ein
 * <canvas>. Optional, dezent gestaltet. Kodiert i. d. R. die Beitritts-URL
 * inklusive vorausgefuelltem Raum-Code.
 */

import { useEffect, useRef } from 'react';
import QR from 'qrcode';
import { useTheme } from '../theme';

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 160 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QR.toCanvas(canvas, value, {
      width: size,
      margin: 1,
      color: {
        // Im Dunkelmodus die Farben invertieren, damit der Code lesbar bleibt.
        dark: theme === 'dark' ? '#e6e8ec' : '#11151a',
        light: theme === 'dark' ? '#161b22' : '#ffffff',
      },
    }).catch(() => {
      /* QR-Generierung ist optional - Fehler still ignorieren. */
    });
  }, [value, size, theme]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ borderRadius: 8 }}
      aria-label="QR-Code zum Beitreten"
    />
  );
}

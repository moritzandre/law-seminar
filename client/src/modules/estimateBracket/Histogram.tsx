/**
 * modules/estimateBracket/Histogram.tsx
 * -----------------------------------------------------------------------------
 * Leichtes vertikales Histogramm fuer die Werte 0..10 (reines CSS, keine
 * Charting-Bibliothek). Zeigt Mittelwert als Text und kann eine Saeule
 * hervorheben (z. B. die eigene Schaetzung).
 */

import './estimate.css';

interface HistogramProps {
  /** Haeufigkeiten je Wert 0..10 (Laenge 11). */
  histogram: number[];
  mean: number;
  count: number;
  /** Optional hervorgehobener Wert (eigene Schaetzung). */
  highlight?: number;
  /**
   * Gemeinsame Obergrenze fuer die Balkenhoehe, damit mehrere Histogramme
   * (Runden) denselben Maßstab haben. Default: Maximum dieses Histogramms.
   */
  maxCount?: number;
}

export function Histogram({
  histogram,
  mean,
  count,
  highlight,
  maxCount,
}: HistogramProps) {
  const max = Math.max(1, maxCount ?? Math.max(...histogram));

  return (
    <div className="hist">
      <div className="hist-cols" role="img" aria-label={`Histogramm, Mittelwert ${mean.toFixed(1)}`}>
        {histogram.map((c, v) => {
          const pct = (c / max) * 100;
          const isHi = highlight === v;
          return (
            <div className="hist-col" key={v}>
              <span className="hist-count">{c > 0 ? c : ''}</span>
              <div className="hist-bar-track">
                <div
                  className={`hist-bar${isHi ? ' hist-bar-hi' : ''}`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className={`hist-x${isHi ? ' hist-x-hi' : ''}`}>{v}</span>
            </div>
          );
        })}
      </div>
      <div className="hist-meta">
        <span>
          Mittelwert: <strong>{mean.toFixed(1)}</strong>
        </span>
        <span className="muted small">
          {count} {count === 1 ? 'Schätzung' : 'Schätzungen'}
        </span>
      </div>
    </div>
  );
}

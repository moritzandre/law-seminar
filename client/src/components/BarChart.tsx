/**
 * components/BarChart.tsx
 * -----------------------------------------------------------------------------
 * Leichtes, eigenes Balkendiagramm (reines CSS, keine Charting-Bibliothek).
 * Horizontale Balken mit Label, absoluter Zahl und Prozentwert. Eine optional
 * hervorgehobene Zeile markiert z. B. die eigene Auswahl der teilnehmenden Person.
 */

import './barchart.css';

export interface BarDatum {
  id: string;
  label: string;
  count: number;
}

interface BarChartProps {
  data: BarDatum[];
  /** Gesamtzahl der Stimmen (fuer Prozentbasis). */
  total: number;
  /** IDs, die optisch hervorgehoben werden (z. B. eigene Auswahl). */
  highlight?: string[];
}

export function BarChart({ data, total, highlight = [] }: BarChartProps) {
  // Maximalwert fuer die relative Balkenlaenge (mind. 1, um Division durch 0 zu vermeiden).
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="barchart">
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        const width = (d.count / max) * 100;
        const isHighlight = highlight.includes(d.id);
        return (
          <div className="bar-row" key={d.id}>
            <div className="bar-head">
              <span className="bar-label">
                {d.label}
                {isHighlight && (
                  <span className="bar-you" aria-label="Deine Auswahl">
                    {' '}
                    · deine Wahl
                  </span>
                )}
              </span>
              <span className="bar-value">
                {d.count} <span className="muted small">({pct}%)</span>
              </span>
            </div>
            <div className="bar-track">
              <div
                className={`bar-fill${isHighlight ? ' bar-fill-highlight' : ''}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

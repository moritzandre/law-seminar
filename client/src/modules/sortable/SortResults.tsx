/**
 * modules/sortable/SortResults.tsx
 * -----------------------------------------------------------------------------
 * Aggregierte Auswertung (Trefferquote) der Sortier-Module fuer das Dashboard.
 * Zeigt die mittlere Trefferquote und je Karte: Anteil korrekt, korrektes Feld,
 * Begruendung und die Verteilung der Gruppen-Zuordnungen.
 */

import type { SortAggregate, SortConfig } from '@shared/types';

export function SortResults({
  config,
  aggregate,
}: {
  config: SortConfig;
  aggregate: SortAggregate;
}) {
  const slotLabel = (id: string) =>
    config.slots.find((s) => s.id === id)?.label ?? id;
  const total = aggregate.count;

  return (
    <div className="stack stack-6">
      <div className="row" style={{ gap: 'var(--sp-6)', alignItems: 'baseline' }}>
        <div>
          <div className="h1" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(aggregate.meanCorrect * 100)}%
          </div>
          <div className="muted small">mittlere Trefferquote</div>
        </div>
        <div className="muted small">
          {total} {total === 1 ? 'Einsendung' : 'Einsendungen'}
        </div>
      </div>

      <div className="stack stack-4">
        {aggregate.items.map((it) => {
          const pct = total > 0 ? Math.round((it.correctCount / total) * 100) : 0;
          return (
            <div key={it.id} className="sortresult">
              <div className="sortresult-head">
                <span className="sortresult-label">{it.label}</span>
                <span className="sortresult-rate">
                  {it.correctCount}/{total}{' '}
                  <span className="muted small">({pct}%)</span>
                </span>
              </div>
              <div className="small">
                richtig: <strong>{slotLabel(it.correctSlotId)}</strong>
              </div>
              {config.justifications[it.id] && (
                <div className="muted small">{config.justifications[it.id]}</div>
              )}
              {/* Verteilung der Gruppen-Zuordnungen */}
              <div className="sortresult-dist">
                {config.slots.map((s) => {
                  const n = it.distribution[s.id] ?? 0;
                  const w = total > 0 ? (n / total) * 100 : 0;
                  const isCorrect = s.id === it.correctSlotId;
                  return (
                    <div className="sortresult-distrow" key={s.id}>
                      <span className="sortresult-distlabel small muted">
                        {s.label}
                      </span>
                      <span className="sortresult-track">
                        <span
                          className={`sortresult-fill${isCorrect ? ' sortresult-fill-correct' : ''}`}
                          style={{ width: `${w}%` }}
                        />
                      </span>
                      <span className="sortresult-distn small">{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

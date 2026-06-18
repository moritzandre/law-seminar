/**
 * modules/estimateBracket/TrainerView.tsx
 * -----------------------------------------------------------------------------
 * Trainer-Ansicht der Schaetz-Klammer.
 *  - collecting: aktuelle Runde + Eingangszaehler; bereits aufgeloeste Runden
 *                erscheinen zum Vergleich.
 *  - revealed:   Histogramm + Mittelwert je Runde, plus Vorher/Nachher-Delta.
 *
 * Die Runden-History kommt ueber das `history`-Prop vom Dashboard (alle in dieser
 * Sitzung aufgeloesten Runden dieses Moduls, inkl. der aktuellen nach Reveal).
 */

import type { EstimateAggregate, EstimateConfig } from '@shared/types';
import type { TrainerViewProps } from '../types';
import { Histogram } from './Histogram';

function RoundBlock({
  agg,
  maxCount,
}: {
  agg: EstimateAggregate;
  maxCount: number;
}) {
  return (
    <div className="estimate-round">
      <h3 className="h3">Runde {agg.round}</h3>
      <Histogram
        histogram={agg.histogram}
        mean={agg.mean}
        count={agg.count}
        maxCount={maxCount}
      />
    </div>
  );
}

export function TrainerView({
  config,
  phase,
  submissionCount,
  participantCount,
  history,
}: TrainerViewProps<EstimateConfig, EstimateAggregate>) {
  const rounds = (history as EstimateAggregate[])
    .slice()
    .sort((a, b) => a.round - b.round);
  // Gemeinsamer Maßstab, damit die Histogramme der Runden vergleichbar sind.
  const maxCount = Math.max(1, ...rounds.map((r) => Math.max(...r.histogram)));

  if (phase === 'collecting') {
    return (
      <div className="stack stack-6">
        <div className="stack stack-2">
          <span className="badge badge-collecting">
            <span className="badge-dot" />
            Runde {config.round} läuft
          </span>
          <div className="h1" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {submissionCount}
          </div>
          <div className="muted small">
            von {participantCount}{' '}
            {participantCount === 1 ? 'Person' : 'Personen'} eingegangen
          </div>
        </div>

        {rounds.length > 0 && (
          <div className="stack stack-3">
            <p className="muted small">Bisher aufgelöst (zum Vergleich):</p>
            <div className="estimate-rounds">
              {rounds.map((r) => (
                <RoundBlock key={r.round} agg={r} maxCount={maxCount} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'revealed' && rounds.length > 0) {
    const first = rounds[0];
    const last = rounds[rounds.length - 1];
    const delta = last.mean - first.mean;
    return (
      <div className="stack stack-6">
        <div className="estimate-rounds">
          {rounds.map((r) => (
            <RoundBlock key={r.round} agg={r} maxCount={maxCount} />
          ))}
        </div>

        {rounds.length >= 2 && (
          <div className="estimate-delta">
            Vorher/Nachher · Mittelwert Runde {first.round}:{' '}
            <strong>{first.mean.toFixed(1)}</strong> → Runde {last.round}:{' '}
            <strong>{last.mean.toFixed(1)}</strong> (Δ{' '}
            {delta >= 0 ? '+' : ''}
            {delta.toFixed(1)})
          </div>
        )}
      </div>
    );
  }

  return null;
}

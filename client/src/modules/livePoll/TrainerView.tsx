/**
 * modules/livePoll/TrainerView.tsx
 * -----------------------------------------------------------------------------
 * Trainer-Ansicht der Live-Abstimmung im Dashboard.
 *  - collecting: Frage + Optionen als Vorschau, dazu der laufende Eingangszaehler.
 *  - revealed:   Balkendiagramm der Verteilung.
 *
 * Die Lebenszyklus-Steuerung (Aufloesen/Zuruecksetzen) stellt die Dashboard-Huelle
 * bereit; diese Ansicht konzentriert sich auf die modul-spezifische Darstellung.
 */

import type { PollAggregate, PollConfig } from '@shared/types';
import { BarChart } from '../../components/BarChart';
import type { TrainerViewProps } from '../types';

export function TrainerView({
  config,
  phase,
  aggregate,
  submissionCount,
  participantCount,
}: TrainerViewProps<PollConfig, PollAggregate>) {
  return (
    <div className="stack stack-6">
      <div className="stack stack-2">
        <h2 className="h2">{config.question}</h2>
        <p className="muted small">
          Modus: {config.mode === 'multi' ? 'Mehrfachauswahl' : 'Einfachauswahl'}
        </p>
      </div>

      {phase === 'collecting' && (
        <>
          <div className="row" style={{ gap: 'var(--sp-6)' }}>
            <div>
              <div className="h1" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {submissionCount}
              </div>
              <div className="muted small">
                von {participantCount}{' '}
                {participantCount === 1 ? 'Person' : 'Personen'} eingegangen
              </div>
            </div>
          </div>

          <div className="stack stack-2">
            <p className="muted small">Optionen (verborgen bis zur Aufloesung):</p>
            <ul className="poll-preview">
              {config.options.map((o) => (
                <li key={o.id}>{o.label}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {phase === 'revealed' && aggregate && (
        <div className="stack stack-3">
          <p className="muted small">
            {aggregate.total}{' '}
            {aggregate.total === 1 ? 'Antwort' : 'Antworten'} insgesamt
          </p>
          <BarChart data={aggregate.counts} total={aggregate.total} />
        </div>
      )}
    </div>
  );
}

/**
 * modules/promptLogger/TrainerView.tsx
 * -----------------------------------------------------------------------------
 * Trainer-Ansicht des Prompt-Loggers.
 *  - collecting: Anzahl der Einsendungen + (per tally) wie viele eine Fundstelle
 *                enthalten. Inhalte bleiben bis zur Freigabe verborgen.
 *  - revealed:   anonyme Liste aller Einsendungen, Fundstellen als "zu pruefen".
 */

import type { PromptLogAggregate, PromptLogTally } from '@shared/types';
import type { TrainerViewProps } from '../types';
import { PromptLogList } from './PromptLogList';

export function TrainerView({
  phase,
  aggregate,
  tally,
  submissionCount,
  participantCount,
}: TrainerViewProps<unknown, PromptLogAggregate>) {
  const withCitation = (tally as PromptLogTally | null)?.withCitation ?? 0;

  if (phase === 'collecting') {
    return (
      <div className="stack stack-6">
        <div className="row" style={{ gap: 'var(--sp-8)' }}>
          <div>
            <div className="h1" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {submissionCount}
            </div>
            <div className="muted small">
              von {participantCount}{' '}
              {participantCount === 1 ? 'Person' : 'Personen'} eingegangen
            </div>
          </div>
          <div>
            <div className="h1" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {withCitation}
            </div>
            <div className="muted small">davon mit Fundstelle</div>
          </div>
        </div>
        <p className="muted small">
          Inhalte werden erst nach der Freigabe sichtbar.
        </p>
      </div>
    );
  }

  if (phase === 'revealed' && aggregate) {
    return (
      <div className="stack stack-4">
        <p className="muted small">
          {aggregate.total}{' '}
          {aggregate.total === 1 ? 'Einsendung' : 'Einsendungen'} ·{' '}
          {aggregate.withCitation} mit Fundstelle (zu pruefen)
        </p>
        <PromptLogList entries={aggregate.entries} />
      </div>
    );
  }

  return null;
}

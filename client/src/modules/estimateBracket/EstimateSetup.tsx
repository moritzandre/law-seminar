/**
 * modules/estimateBracket/EstimateSetup.tsx
 * -----------------------------------------------------------------------------
 * Einrichtung der Schaetz-Klammer im Dashboard: Frage festlegen und die Runde
 * starten. Die Rundennummer ergibt sich automatisch aus den bereits aufgeloesten
 * Runden (1. Start = Runde 1, 2. Start = Runde 2 ...). Der Vergleich kann
 * zurueckgesetzt werden, falls man von vorne beginnen moechte.
 */

import { useState } from 'react';
import type { EstimateConfig } from '@shared/types';
import { Button } from '../../components/ui';

interface EstimateSetupProps {
  initialConfig: EstimateConfig;
  /** Welche Runde als naechstes gestartet wird (aus der History abgeleitet). */
  nextRound: number;
  /** Wahr, wenn bereits Runden aufgeloest wurden. */
  hasHistory: boolean;
  onStart: (config: EstimateConfig) => void;
  onResetRounds: () => void;
  onCancel: () => void;
}

export function EstimateSetup({
  initialConfig,
  nextRound,
  hasHistory,
  onStart,
  onResetRounds,
  onCancel,
}: EstimateSetupProps) {
  const [question, setQuestion] = useState(initialConfig.question);
  const canStart = question.trim().length > 0;

  return (
    <div className="stack stack-6">
      <div className="stack stack-2">
        <h2 className="h2">Schätz-Klammer einrichten</h2>
        <p className="muted small">
          Dies wird <strong>Runde {nextRound}</strong>.{' '}
          {nextRound === 1
            ? 'Typischerweise in der Einleitung.'
            : 'Nach der Auflösung erscheint der Vorher/Nachher-Vergleich.'}
        </p>
      </div>

      <div>
        <label className="field-label" htmlFor="est-question">
          Frage
        </label>
        <input
          id="est-question"
          className="input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Was soll geschätzt werden (Skala 0–10)?"
        />
      </div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row">
          <Button
            variant="primary"
            disabled={!canStart}
            onClick={() =>
              onStart({ round: nextRound, question: question.trim() })
            }
          >
            Runde {nextRound} starten
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Abbrechen
          </Button>
        </div>
        {hasHistory && (
          <Button variant="danger" onClick={onResetRounds}>
            Vergleich zurücksetzen
          </Button>
        )}
      </div>
    </div>
  );
}

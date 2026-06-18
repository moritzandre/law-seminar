/**
 * modules/estimateBracket/ParticipantView.tsx
 * -----------------------------------------------------------------------------
 * Teilnehmer-Ansicht der Schaetz-Klammer: eine Zahl 0..10 abgeben.
 * "erst schaetzen, dann aufloesen": nach dem Senden Wartehinweis; nach Freigabe
 * das Histogramm der Runde mit der eigenen Schaetzung hervorgehoben.
 */

import { useState } from 'react';
import type {
  EstimateAggregate,
  EstimateConfig,
  EstimateSubmission,
} from '@shared/types';
import { Button } from '../../components/ui';
import type { ParticipantViewProps } from '../types';
import { Histogram } from './Histogram';

const VALUES = Array.from({ length: 11 }, (_, i) => i); // 0..10

export function ParticipantView({
  config,
  phase,
  sendSubmission,
  submitted,
  aggregate,
}: ParticipantViewProps<EstimateConfig, EstimateAggregate>) {
  const [value, setValue] = useState<number | null>(null);

  function submit() {
    if (value === null) return;
    const payload: EstimateSubmission = { value };
    sendSubmission(payload);
  }

  /* --- Aufgeloest --- */
  if (phase === 'revealed' && aggregate) {
    return (
      <div className="stack stack-4">
        <h2 className="h2">{config.question}</h2>
        <Histogram
          histogram={aggregate.histogram}
          mean={aggregate.mean}
          count={aggregate.count}
          highlight={value ?? undefined}
        />
        {value !== null && (
          <p className="muted small">Deine Schätzung war {value}.</p>
        )}
      </div>
    );
  }

  /* --- Gesendet --- */
  if (submitted) {
    return (
      <div className="stack stack-3 center">
        <div style={{ fontSize: 40 }} aria-hidden>
          ✓
        </div>
        <h2 className="h2">Schätzung erhalten</h2>
        <p className="muted">
          Deine Schätzung{value !== null ? ` (${value})` : ''} ist gespeichert.
          Warten auf die Auflösung …
        </p>
      </div>
    );
  }

  /* --- Sammelphase --- */
  return (
    <div className="stack stack-4">
      <div className="stack stack-2">
        <span className="badge badge-idle">Runde {config.round}</span>
        <h2 className="h2">{config.question}</h2>
        <p className="muted small">Wähle eine Zahl von 0 bis 10.</p>
      </div>

      <div className="estimate-grid" role="radiogroup" aria-label="Schätzung 0 bis 10">
        {VALUES.map((v) => (
          <button
            key={v}
            role="radio"
            aria-checked={value === v}
            className={`estimate-num${value === v ? ' estimate-num-active' : ''}`}
            onClick={() => setValue(v)}
          >
            {v}
          </button>
        ))}
      </div>

      <Button
        variant="primary"
        size="lg"
        block
        disabled={value === null}
        onClick={submit}
      >
        Schätzung senden
      </Button>
    </div>
  );
}

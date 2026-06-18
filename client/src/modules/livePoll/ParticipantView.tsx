/**
 * modules/livePoll/ParticipantView.tsx
 * -----------------------------------------------------------------------------
 * Teilnehmer-Ansicht der Live-Abstimmung.
 *
 * Ablauf nach dem Prinzip "erst schaetzen, dann aufloesen":
 *  - collecting + noch nicht gesendet: Optionen antippen + absenden
 *  - collecting + gesendet:            "Antwort erhalten, warten auf Aufloesung"
 *  - revealed:                         gemeinsames Ergebnis als Balkendiagramm
 */

import { useState } from 'react';
import type {
  PollAggregate,
  PollConfig,
  PollSubmission,
} from '@shared/types';
import { BarChart } from '../../components/BarChart';
import { Button } from '../../components/ui';
import type { ParticipantViewProps } from '../types';

export function ParticipantView({
  config,
  phase,
  sendSubmission,
  submitted,
  aggregate,
}: ParticipantViewProps<PollConfig, PollAggregate>) {
  const [selected, setSelected] = useState<string[]>([]);

  const isMulti = config.mode === 'multi';

  function toggle(optionId: string) {
    if (submitted || phase !== 'collecting') return;
    setSelected((prev) => {
      if (isMulti) {
        return prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId];
      }
      // single: genau eine Auswahl
      return [optionId];
    });
  }

  function submit() {
    if (selected.length === 0) return;
    const payload: PollSubmission = { selected };
    sendSubmission(payload);
  }

  /* --- Aufgeloest: Ergebnis fuer alle ---------------------------------- */
  if (phase === 'revealed' && aggregate) {
    return (
      <div className="stack stack-4">
        <h2 className="h2">{config.question}</h2>
        <p className="muted small">
          Aufloesung · {aggregate.total}{' '}
          {aggregate.total === 1 ? 'Antwort' : 'Antworten'}
        </p>
        <BarChart
          data={aggregate.counts}
          total={aggregate.total}
          highlight={selected}
        />
      </div>
    );
  }

  /* --- Gesendet, wartet auf Aufloesung --------------------------------- */
  if (submitted) {
    return (
      <div className="stack stack-3 center">
        <div style={{ fontSize: 40 }} aria-hidden>
          ✓
        </div>
        <h2 className="h2">Antwort erhalten</h2>
        <p className="muted">
          Deine Auswahl ist gespeichert. Warten auf die Aufloesung durch die
          Seminarleitung …
        </p>
      </div>
    );
  }

  /* --- Sammelphase: Optionen waehlen ----------------------------------- */
  return (
    <div className="stack stack-4">
      <div className="stack stack-2">
        <h2 className="h2">{config.question}</h2>
        <p className="muted small">
          {isMulti
            ? 'Mehrfachauswahl moeglich.'
            : 'Bitte eine Option waehlen.'}
        </p>
      </div>

      <div className="stack stack-3">
        {config.options.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              className={`poll-option${active ? ' poll-option-active' : ''}`}
              aria-pressed={active}
              onClick={() => toggle(opt.id)}
            >
              <span className="poll-marker" aria-hidden>
                {active ? '●' : '○'}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      <Button
        variant="primary"
        size="lg"
        block
        disabled={selected.length === 0}
        onClick={submit}
      >
        Antwort senden
      </Button>
    </div>
  );
}

/**
 * modules/promptLogger/ParticipantView.tsx
 * -----------------------------------------------------------------------------
 * Teilnehmer-Ansicht des Prompt-Loggers. Drei Felder: genauer Prompt
 * (mehrzeilig), kurzes Ergebnis der Antwort und optionale Fundstelle.
 * "erst schaetzen, dann aufloesen": nach dem Senden nur Wartehinweis, die
 * gesammelten Inhalte erscheinen erst nach Freigabe durch die Seminarleitung.
 */

import { useState } from 'react';
import type {
  PromptLogAggregate,
  PromptLogConfig,
  PromptLogSubmission,
} from '@shared/types';
import { Button } from '../../components/ui';
import type { ParticipantViewProps } from '../types';
import { PromptLogList } from './PromptLogList';

export function ParticipantView({
  config,
  phase,
  sendSubmission,
  submitted,
  aggregate,
}: ParticipantViewProps<PromptLogConfig, PromptLogAggregate>) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [citation, setCitation] = useState('');

  const canSubmit = prompt.trim().length > 0 && result.trim().length > 0;

  function submit() {
    if (!canSubmit) return;
    const payload: PromptLogSubmission = {
      prompt: prompt.trim(),
      result: result.trim(),
      citation: citation.trim() || undefined,
    };
    sendSubmission(payload);
  }

  /* --- Aufgeloest: gemeinsame Auswertung ------------------------------- */
  if (phase === 'revealed' && aggregate) {
    return (
      <div className="stack stack-4">
        <h2 className="h2">Auswertung</h2>
        <p className="muted small">
          {aggregate.total}{' '}
          {aggregate.total === 1 ? 'Einsendung' : 'Einsendungen'} ·{' '}
          {aggregate.withCitation} mit Fundstelle
        </p>
        <PromptLogList entries={aggregate.entries} />
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
        <h2 className="h2">Eintrag erhalten</h2>
        <p className="muted">
          Dein Eintrag ist gespeichert. Die Einsendungen werden nach der Freigabe
          gemeinsam ausgewertet.
        </p>
      </div>
    );
  }

  /* --- Sammelphase: Formular ------------------------------------------- */
  return (
    <div className="stack stack-4">
      {config.instruction && <p className="muted">{config.instruction}</p>}

      <div>
        <label className="field-label" htmlFor="pl-prompt">
          Dein Prompt
        </label>
        <textarea
          id="pl-prompt"
          className="input"
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Den genau eingegebenen Prompt hier einfuegen …"
          style={{ resize: 'vertical', fontFamily: 'var(--font-mono)' }}
        />
      </div>

      <div>
        <label className="field-label" htmlFor="pl-result">
          Ergebnis der Antwort (kurz)
        </label>
        <input
          id="pl-result"
          className="input"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="Was kam heraus? In einem Satz."
        />
      </div>

      <div>
        <label className="field-label" htmlFor="pl-citation">
          Genannte Fundstelle (optional)
        </label>
        <input
          id="pl-citation"
          className="input"
          value={citation}
          onChange={(e) => setCitation(e.target.value)}
          placeholder="z. B. § 433 BGB oder Aktenzeichen …"
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        block
        disabled={!canSubmit}
        onClick={submit}
      >
        Eintrag senden
      </Button>
    </div>
  );
}

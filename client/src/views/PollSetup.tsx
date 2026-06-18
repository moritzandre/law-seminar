/**
 * views/PollSetup.tsx
 * -----------------------------------------------------------------------------
 * Kompakter, modul-spezifischer Konfigurator fuer die Live-Abstimmung: Frage,
 * 2-6 Optionen und Auswahlmodus. Liefert beim Start eine fertige PollConfig.
 *
 * Hinweis zur Architektur: Module starten grundsaetzlich mit ihrer defaultConfig.
 * Dieser Editor ist eine bewusste, klar abgegrenzte Ergaenzung fuer das einzige
 * bereits vollstaendige Modul, damit die Seminarleitung eine eigene Frage stellen
 * kann. Weitere Module koennten analoge Editoren erhalten.
 */

import { useState } from 'react';
import type { PollConfig, PollOption } from '@shared/types';
import { Button } from '../components/ui';

interface PollSetupProps {
  initialConfig: PollConfig;
  onStart: (config: PollConfig) => void;
  onCancel: () => void;
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

export function PollSetup({ initialConfig, onStart, onCancel }: PollSetupProps) {
  const [question, setQuestion] = useState(initialConfig.question);
  const [options, setOptions] = useState<PollOption[]>(initialConfig.options);
  const [mode, setMode] = useState<PollConfig['mode']>(initialConfig.mode);

  function updateOption(id: string, label: string) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, label } : o)));
  }
  function addOption() {
    if (options.length >= MAX_OPTIONS) return;
    // Eindeutige id aus laufendem Suffix.
    const id = `opt-${options.length + 1}-${options.reduce(
      (n, o) => n + o.label.length,
      0,
    )}`;
    setOptions((prev) => [...prev, { id, label: '' }]);
  }
  function removeOption(id: string) {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }

  const filledOptions = options.filter((o) => o.label.trim().length > 0);
  const canStart =
    question.trim().length > 0 && filledOptions.length >= MIN_OPTIONS;

  function start() {
    if (!canStart) return;
    onStart({
      question: question.trim(),
      // Nur ausgefuellte Optionen uebernehmen.
      options: filledOptions.map((o) => ({ ...o, label: o.label.trim() })),
      mode,
    });
  }

  return (
    <div className="stack stack-6">
      <div className="stack stack-2">
        <h2 className="h2">Live-Abstimmung einrichten</h2>
        <p className="muted small">
          Frage und Optionen festlegen, dann starten. Teilnehmende sehen die
          Optionen erst, sobald das Modul laeuft.
        </p>
      </div>

      <div>
        <label className="field-label" htmlFor="poll-question">
          Frage
        </label>
        <input
          id="poll-question"
          className="input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Welche Frage soll abgestimmt werden?"
        />
      </div>

      <div className="stack stack-3">
        <span className="field-label" style={{ marginBottom: 0 }}>
          Optionen ({filledOptions.length} ausgefuellt, {MIN_OPTIONS}–
          {MAX_OPTIONS})
        </span>
        {options.map((o, i) => (
          <div className="row" key={o.id} style={{ flexWrap: 'nowrap' }}>
            <input
              className="input"
              value={o.label}
              onChange={(e) => updateOption(o.id, e.target.value)}
              placeholder={`Option ${i + 1}`}
            />
            <Button
              variant="secondary"
              onClick={() => removeOption(o.id)}
              disabled={options.length <= MIN_OPTIONS}
              aria-label="Option entfernen"
            >
              −
            </Button>
          </div>
        ))}
        <Button
          variant="secondary"
          onClick={addOption}
          disabled={options.length >= MAX_OPTIONS}
        >
          + Option hinzufuegen
        </Button>
      </div>

      <div>
        <span className="field-label">Auswahlmodus</span>
        <div className="row">
          <label className="row" style={{ gap: 'var(--sp-2)' }}>
            <input
              type="radio"
              name="poll-mode"
              checked={mode === 'single'}
              onChange={() => setMode('single')}
            />
            Einfachauswahl
          </label>
          <label className="row" style={{ gap: 'var(--sp-2)' }}>
            <input
              type="radio"
              name="poll-mode"
              checked={mode === 'multi'}
              onChange={() => setMode('multi')}
            />
            Mehrfachauswahl
          </label>
        </div>
      </div>

      <div className="row">
        <Button variant="primary" onClick={start} disabled={!canStart}>
          Modul starten
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
}

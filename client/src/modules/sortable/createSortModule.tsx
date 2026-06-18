/**
 * modules/sortable/createSortModule.tsx
 * -----------------------------------------------------------------------------
 * Factory: macht aus einer geteilten Sortier-Logik (ModuleLogic<SortConfig,...>)
 * eine vollstaendige ModuleDefinition mit Participant- und Trainer-View. So
 * teilen sich Daten-Treppe, Drei-Ebenen-Sorter und Risiko-Ampel denselben Code.
 */

import { useEffect, useState } from 'react';
import type { ModuleLogic } from '@shared/moduleLogic';
import type {
  SortAggregate,
  SortConfig,
  SortSubmission,
} from '@shared/types';
import { Button } from '../../components/ui';
import type {
  ModuleDefinition,
  ParticipantViewProps,
  TrainerViewProps,
} from '../types';
import { Sorter, type Assignment } from './Sorter';
import { SortResults } from './SortResults';

/** Leere Zuordnung (alle Karten unzugeordnet). */
function emptyAssignment(config: SortConfig): Assignment {
  return Object.fromEntries(config.items.map((i) => [i.id, null]));
}

function ParticipantView({
  config,
  phase,
  sendSubmission,
  submitted,
}: ParticipantViewProps<SortConfig, SortAggregate>) {
  const [assignment, setAssignment] = useState<Assignment>(() =>
    emptyAssignment(config),
  );

  // Bei neuem Modulstart (neue config-Referenz) Zuordnung zuruecksetzen.
  useEffect(() => {
    setAssignment(emptyAssignment(config));
  }, [config]);

  const allAssigned = config.items.every((i) => assignment[i.id]);

  function submit() {
    if (!allAssigned) return;
    // assignment ist hier vollstaendig -> in Record<string,string> umwandeln.
    const filled: Record<string, string> = {};
    for (const i of config.items) filled[i.id] = assignment[i.id] as string;
    const payload: SortSubmission = { assignment: filled };
    sendSubmission(payload);
  }

  /* --- Aufgeloest: eigene Zuordnung mit Treffern/Begruendungen --------- */
  if (phase === 'revealed') {
    const correct = config.items.filter(
      (i) => assignment[i.id] === config.solution[i.id],
    ).length;
    return (
      <div className="stack stack-4">
        <h2 className="h2">Auflösung</h2>
        <p className="muted small">
          {submitted
            ? `Du hattest ${correct} von ${config.items.length} richtig.`
            : 'Du hast nicht abgegeben — hier die Auflösung.'}
        </p>
        <Sorter
          items={config.items}
          slots={config.slots}
          assignment={assignment}
          solution={config.solution}
          justifications={config.justifications}
          showSolution
        />
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
        <h2 className="h2">Zuordnung erhalten</h2>
        <p className="muted">
          Deine Zuordnung ist gespeichert. Warten auf die Auflösung …
        </p>
      </div>
    );
  }

  /* --- Sammelphase --- */
  return (
    <div className="stack stack-4">
      <p className="muted">{config.prompt}</p>
      <Sorter
        items={config.items}
        slots={config.slots}
        assignment={assignment}
        onChange={setAssignment}
      />
      <Button
        variant="primary"
        size="lg"
        block
        disabled={!allAssigned}
        onClick={submit}
      >
        {allAssigned
          ? 'Zuordnung senden'
          : 'Alle Karten zuordnen, um zu senden'}
      </Button>
    </div>
  );
}

function TrainerView({
  config,
  phase,
  aggregate,
  submissionCount,
  participantCount,
}: TrainerViewProps<SortConfig, SortAggregate>) {
  if (phase === 'collecting') {
    return (
      <div className="stack stack-6">
        <div className="stack stack-2">
          <p className="muted">{config.prompt}</p>
          <div className="h1" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {submissionCount}
          </div>
          <div className="muted small">
            von {participantCount}{' '}
            {participantCount === 1 ? 'Person' : 'Personen'} eingegangen
          </div>
        </div>
        {/* Aufgabe als Beamer-Vorschau (gesperrt). */}
        <Sorter
          items={config.items}
          slots={config.slots}
          assignment={emptyAssignment(config)}
          disabled
        />
      </div>
    );
  }

  if (phase === 'revealed' && aggregate) {
    return <SortResults config={config} aggregate={aggregate} />;
  }

  return null;
}

/** Baut aus einer Sortier-Logik eine vollstaendige ModuleDefinition. */
export function createSortModule(
  logic: ModuleLogic<SortConfig, SortSubmission, SortAggregate>,
): ModuleDefinition<SortConfig, SortSubmission, SortAggregate> {
  return { ...logic, ParticipantView, TrainerView };
}

/**
 * modules/architectureMap/index.tsx
 * -----------------------------------------------------------------------------
 * Setzt das Praesentationsmodul "Architektur-Karte" zusammen. Beide Ansichten
 * zeigen dieselbe interaktive Karte; jede Instanz erkundet unabhaengig (Beamer
 * wie Teilnehmergeraet). Keine Einsendungen, keine Aggregation.
 */

import { architectureMapLogic } from '@shared/moduleLogic';
import type { ModuleDefinition } from '../types';
import { ArchitectureMap } from './ArchitectureMap';

/** Teilnehmer-Ansicht: optionale parallele Einzelerkundung. */
function ParticipantView() {
  return (
    <div className="stack stack-3">
      <p className="muted small">Erkunde die Stationen in deinem eigenen Tempo.</p>
      <ArchitectureMap />
    </div>
  );
}

/** Trainer-Ansicht (Beamer): die Karte zum Vorführen. */
function TrainerView() {
  return <ArchitectureMap />;
}

export const architectureMapModule: ModuleDefinition = {
  ...architectureMapLogic,
  ParticipantView,
  TrainerView,
};

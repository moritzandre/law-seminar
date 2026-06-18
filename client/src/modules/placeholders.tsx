/**
 * modules/placeholders.tsx
 * -----------------------------------------------------------------------------
 * Erzeugt aus der geteilten Platzhalter-Logik registrierbare ModuleDefinitions
 * mit neutralen "in Arbeit"-Views. So erscheinen die kommenden Module bereits
 * im Dashboard, ohne dass ihre Logik schon existiert.
 *
 * TODO: Jeden Platzhalter durch ein echtes Modul (eigener Ordner unter modules/)
 *       ersetzen - analog zu livePoll/.
 */

import { placeholderLogic } from '@shared/moduleLogic';
import type { ModuleLogic } from '@shared/moduleLogic';
import type {
  ModuleDefinition,
  ParticipantViewProps,
  TrainerViewProps,
} from './types';

function PlaceholderParticipantView({ config }: ParticipantViewProps) {
  void config;
  return (
    <div className="stack stack-3 center">
      <div style={{ fontSize: 40 }} aria-hidden>
        ⏳
      </div>
      <h2 className="h2">Dieses Modul wird vorbereitet</h2>
      <p className="muted">
        Bitte warten, bis die Seminarleitung das naechste Modul startet.
      </p>
    </div>
  );
}

function PlaceholderTrainerView({ config }: TrainerViewProps) {
  void config;
  return (
    <div className="stack stack-3">
      <h2 className="h2">Platzhalter</h2>
      <p className="muted">
        Dieses Modul ist registriert, aber noch nicht implementiert (TODO).
      </p>
    </div>
  );
}

function toDefinition(logic: ModuleLogic): ModuleDefinition {
  return {
    ...logic,
    ParticipantView: PlaceholderParticipantView,
    TrainerView: PlaceholderTrainerView,
  };
}

export const placeholderModules: ModuleDefinition[] =
  placeholderLogic.map(toDefinition);

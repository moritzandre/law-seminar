/**
 * modules/types.ts
 * -----------------------------------------------------------------------------
 * Die UI-seitige Erweiterung eines Moduls. Eine ModuleDefinition kombiniert die
 * geteilte Logik (ModuleLogic aus @shared) mit zwei React-Komponenten:
 *   - ParticipantView (was die teilnehmende Person sieht/sendet)
 *   - TrainerView     (modul-spezifische Anzeige im Dashboard)
 *
 * So lassen sich neue Module ergaenzen, indem man (1) Logik in
 * shared/moduleLogic.ts registriert und (2) hier die beiden Views beisteuert.
 */

import type { ComponentType } from 'react';
import type { ModuleLogic } from '@shared/moduleLogic';
import type { Phase } from '@shared/types';

/** Props der Teilnehmer-Ansicht eines Moduls. */
export interface ParticipantViewProps<Config = unknown, Aggregate = unknown> {
  config: Config;
  phase: Phase;
  /** Sendet eine Einsendung an den Server (waehrend collecting). */
  sendSubmission: (payload: unknown) => void;
  /** True, sobald diese Person bereits gesendet hat. */
  submitted: boolean;
  /** Nach Reveal verfuegbar: das Aggregat zum gemeinsamen Aufloesen. */
  aggregate: Aggregate | null;
}

/** Props der Trainer-Ansicht eines Moduls (im Dashboard). */
export interface TrainerViewProps<Config = unknown, Aggregate = unknown> {
  config: Config;
  phase: Phase;
  /** Aggregat (nach Reveal); davor null. */
  aggregate: Aggregate | null;
  /** Anzahl bislang eingegangener Einsendungen. */
  submissionCount: number;
  /** Aktuelle Teilnehmerzahl im Raum. */
  participantCount: number;
  /**
   * Steuerfunktionen. Die Haupt-Steuerung (Start/Reveal/Reset) liegt zwar in
   * der Dashboard-Huelle, die Funktionen werden hier aber bereitgestellt, damit
   * Module bei Bedarf eigene Bedienelemente anbieten koennen.
   */
  onReveal: () => void;
  onReset: () => void;
}

/**
 * Vollstaendige, stark typisierte Modul-Definition = geteilte Logik + Views.
 * Dieser Typ dient dem AUTORIEREN eines Moduls: beim Bau eines Moduls werden die
 * Views gegen die konkrete Config/Aggregate geprueft (siehe modules/livePoll).
 */
export interface ModuleDefinition<
  Config = unknown,
  Submission = unknown,
  Aggregate = unknown,
> extends ModuleLogic<Config, Submission, Aggregate> {
  ParticipantView: ComponentType<ParticipantViewProps<Config, Aggregate>>;
  TrainerView: ComponentType<TrainerViewProps<Config, Aggregate>>;
}

/**
 * Registry-Variante mit "vergessenen" Generics. Notwendig, weil React-Komponenten
 * in ihren Props kontravariant sind: ein Modul, dessen View `PollConfig` erwartet,
 * laesst sich sonst nicht in einer gemeinsamen Liste mit anderen Modulen halten.
 * An der Registry-/Render-Grenze kommt die Config ohnehin als `unknown` ueber das
 * Netz an, daher ist diese Aufweichung genau hier korrekt verortet.
 */
export type AnyModuleDefinition = ModuleLogic & {
  ParticipantView: ComponentType<ParticipantViewProps<any, any>>;
  TrainerView: ComponentType<TrainerViewProps<any, any>>;
};

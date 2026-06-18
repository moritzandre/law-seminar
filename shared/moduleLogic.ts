/**
 * shared/moduleLogic.ts
 * -----------------------------------------------------------------------------
 * Die *logische* (React-freie) Haelfte eines Moduls: Metadaten, Default-Config
 * und die reine aggregate()-Funktion. Diese Datei laeuft sowohl auf dem Server
 * (fuer die Aggregation bei phase:reveal) als auch im Client (wo die React-Views
 * die Logik um ParticipantView/TrainerView ergaenzen -> ModuleDefinition).
 *
 * So bleibt aggregate() die EINE Quelle der Wahrheit: der Server rechnet exakt
 * dasselbe, was der Client erwartet.
 */

import type {
  ModuleKind,
  PollAggregate,
  PollConfig,
  PollSubmission,
} from './types';

/**
 * Logik-Vertrag eines Moduls (ohne UI).
 * @typeParam Config     Konfigurationsobjekt des Moduls
 * @typeParam Submission Form einer einzelnen Einsendung
 * @typeParam Aggregate  Ergebnis der Aggregation
 */
export interface ModuleLogic<
  Config = unknown,
  Submission = unknown,
  Aggregate = unknown,
> {
  id: string;
  title: string;
  /** Zu welchem Seminarblock das Modul gehoert. */
  block: number;
  kind: ModuleKind;
  defaultConfig: Config;
  /**
   * Aggregiert alle gesammelten Einsendungen zu einem Ergebnis fuers Dashboard.
   * Presentation-Module liefern hier null (keine Aggregation).
   */
  aggregate(submissions: Submission[], config: Config): Aggregate;
}

/* ---------------------------------------------------------------------------
 * Modul 1: Live-Abstimmung
 * ------------------------------------------------------------------------- */

export const livePollLogic: ModuleLogic<
  PollConfig,
  PollSubmission,
  PollAggregate
> = {
  id: 'live-poll',
  title: 'Live-Abstimmung',
  block: 1,
  kind: 'poll',
  defaultConfig: {
    question: 'Wer entscheidet im Zweifel ueber das Ergebnis?',
    options: [
      { id: 'a', label: 'Das Sprachmodell' },
      { id: 'b', label: 'Die anbietende Firma' },
      { id: 'c', label: 'Die nutzende Person' },
      { id: 'd', label: 'Niemand eindeutig' },
    ],
    mode: 'single',
  },
  aggregate(submissions, config) {
    // Zaehler je Option mit 0 initialisieren, damit auch ungewaehlte
    // Optionen im Ergebnis auftauchen.
    const counts = config.options.map((o) => ({
      id: o.id,
      label: o.label,
      count: 0,
    }));
    for (const sub of submissions) {
      for (const optId of sub.selected) {
        const bucket = counts.find((c) => c.id === optId);
        if (bucket) bucket.count += 1;
      }
    }
    return { total: submissions.length, counts };
  },
};

/* ---------------------------------------------------------------------------
 * Platzhalter-Module (nur registriert, Logik folgt spaeter -> TODO)
 *
 * Jeder Platzhalter ist bereits korrekt typisiert und in der Registry sichtbar,
 * damit das Dashboard ihn anzeigen kann. aggregate() liefert vorerst null.
 * ------------------------------------------------------------------------- */

/** Kleine Helferfunktion fuer leere Platzhalter-Logik. */
function placeholder(
  id: string,
  title: string,
  block: number,
  kind: ModuleKind,
): ModuleLogic {
  return {
    id,
    title,
    block,
    kind,
    defaultConfig: {},
    // TODO: echte Aggregation implementieren, wenn das Modul gebaut wird.
    aggregate() {
      return null;
    },
  };
}

export const placeholderLogic: ModuleLogic[] = [
  // TODO: Prompt-Logger - sammelt eingegebene Prompts und gruppiert sie.
  placeholder('prompt-logger', 'Prompt-Logger', 1, 'poll'),
  // TODO: Inhalt/Interaktion aus seminar-tool-prototyp.html uebernehmen.
  placeholder(
    'architecture-map',
    'Architektur-Karte: Wo ist die Wahrheit?',
    1,
    'presentation',
  ),
  // TODO: Schaetz-Klammer - Schaetzwerte sammeln, Spannweite/Median zeigen.
  placeholder('estimate-bracket', 'Schaetz-Klammer', 2, 'poll'),
  // TODO: Daten-Treppe - Reihenfolge/Stufen einordnen.
  placeholder('data-staircase', 'Daten-Treppe', 2, 'presentation'),
  // TODO: Drei-Ebenen-Sorter - Aussagen drei Ebenen zuordnen.
  placeholder('three-level-sorter', 'Drei-Ebenen-Sorter', 2, 'poll'),
  // TODO: Risiko-Ampel - Risiken in rot/gelb/gruen bewerten.
  placeholder('risk-traffic-light', 'Risiko-Ampel', 3, 'poll'),
  // TODO: Forensik-Marker - Stellen in einem Text markieren.
  placeholder('forensics-marker', 'Forensik-Marker', 3, 'presentation'),
];

/**
 * Zentrale Logik-Registry: Modul 1 + alle Platzhalter.
 * Der Server nutzt diese Liste, um per moduleId die passende aggregate()-Funktion
 * zu finden.
 */
export const moduleLogicRegistry: ModuleLogic[] = [
  livePollLogic,
  ...placeholderLogic,
];

/** Findet die Logik eines Moduls anhand seiner id. */
export function getModuleLogic(id: string): ModuleLogic | undefined {
  return moduleLogicRegistry.find((m) => m.id === id);
}

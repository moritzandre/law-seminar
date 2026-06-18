/**
 * shared/types.ts
 * -----------------------------------------------------------------------------
 * Gemeinsame TypeScript-Typen fuer Client UND Server.
 * Hier liegt die EINE Quelle der Wahrheit fuer alle Socket.IO-Events und die
 * Datentypen der Module. Beide Seiten importieren aus dieser Datei, damit die
 * Vertraege niemals auseinanderdriften.
 */

/** Lebenszyklus-Phase eines aktiven Moduls. */
export type Phase = 'idle' | 'collecting' | 'revealed';

/**
 * Art eines Moduls:
 *  - "poll"         sammelt Einsendungen und liefert eine Aggregation
 *  - "presentation" reine Anzeige/Erkundung, keine Aggregation
 */
export type ModuleKind = 'poll' | 'presentation';

/** Zustand des aktuell laufenden Moduls in einem Raum. */
export interface ModuleState {
  moduleId: string;
  /** Konfiguration des Moduls (modul-spezifisch, daher hier unknown). */
  config: unknown;
  phase: Phase;
}

/* ---------------------------------------------------------------------------
 * Modul 1: "Live-Abstimmung" (kind: poll)
 * ------------------------------------------------------------------------- */

export interface PollOption {
  id: string;
  label: string;
}

export interface PollConfig {
  question: string;
  /** 2-6 Optionen. */
  options: PollOption[];
  /** single = genau eine Auswahl, multi = mehrere moeglich. */
  mode: 'single' | 'multi';
}

/** Was ein Teilnehmer pro Abstimmung sendet. */
export interface PollSubmission {
  /** IDs der gewaehlten Optionen. */
  selected: string[];
}

/** Ergebnis der Aggregation, das ans Dashboard (und nach Reveal an alle) geht. */
export interface PollAggregate {
  /** Anzahl abgegebener Stimmen (Teilnehmer, nicht Optionen). */
  total: number;
  counts: Array<{ id: string; label: string; count: number }>;
}

/* ---------------------------------------------------------------------------
 * Socket.IO Event-Vertraege
 * ------------------------------------------------------------------------- */

/** Events, die der Server an die Clients sendet. */
export interface ServerToClientEvents {
  /** Antwort auf room:create. */
  'room:created': (payload: { code: string }) => void;
  /**
   * Antwort auf room:join. Bei Erfolg wird der aktuelle Modulzustand
   * mitgeschickt, damit spaet beitretende Teilnehmer sofort synchron sind.
   */
  'room:joined': (payload: {
    ok: boolean;
    error?: string;
    module?: ModuleState | null;
  }) => void;
  /** Aktualisierte Teilnehmerzahl (ohne Trainer). */
  'participants:update': (payload: { count: number }) => void;
  /** Ein Modul wurde gestartet -> Phase collecting. */
  'module:started': (payload: {
    moduleId: string;
    config: unknown;
    phase: 'collecting';
  }) => void;
  /** Phase wurde freigegeben -> revealed, inkl. Aggregat. */
  'phase:updated': (payload: { phase: 'revealed'; aggregate: unknown }) => void;
  /** Modul wurde zurueckgesetzt (zurueck zu idle). */
  'module:reset': () => void;
  /** Nur an den Trainer: aktuelle Anzahl eingegangener Einsendungen. */
  'submission:count': (payload: { count: number }) => void;
  /** Generischer Fehlerkanal. */
  error: (payload: { message: string }) => void;
}

/** Events, die ein Client an den Server sendet. */
export interface ClientToServerEvents {
  /** Trainer erstellt einen Raum. */
  'room:create': () => void;
  /** Teilnehmer tritt mit Code + anonymer ID bei. */
  'room:join': (payload: { code: string; pid: string }) => void;
  /** Trainer startet ein Modul. */
  'module:start': (payload: { moduleId: string; config: unknown }) => void;
  /** Teilnehmer sendet eine Einsendung (waehrend collecting verborgen). */
  'submission:send': (payload: {
    moduleId: string;
    payload: unknown;
    pid: string;
  }) => void;
  /** Trainer gibt die Aufloesung frei. */
  'phase:reveal': () => void;
  /** Trainer setzt das aktuelle Modul zurueck. */
  'module:reset': () => void;
}

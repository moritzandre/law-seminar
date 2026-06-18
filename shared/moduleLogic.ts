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
  EstimateAggregate,
  EstimateConfig,
  EstimateSubmission,
  ModuleKind,
  PollAggregate,
  PollConfig,
  PollSubmission,
  PromptLogAggregate,
  PromptLogConfig,
  PromptLogSubmission,
  PromptLogTally,
  SortAggregate,
  SortConfig,
  SortSubmission,
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
  /**
   * Optionale, nicht-sensible Live-Auswertung waehrend der Sammelphase
   * (collecting). Darf NUR Zahlen/Metadaten liefern, niemals Inhalte - sie geht
   * vor der Freigabe an den Trainer. Module ohne Live-Auswertung lassen dies weg.
   */
  tally?(submissions: Submission[], config: Config): unknown;
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
 * Modul: Prompt-Logger (Bruecke Block 1 <-> 4)
 * ------------------------------------------------------------------------- */

/** Prueft, ob eine Einsendung eine nicht-leere Fundstelle nennt. */
function hasCitation(s: PromptLogSubmission): boolean {
  return (s.citation ?? '').trim().length > 0;
}

export const promptLoggerLogic: ModuleLogic<
  PromptLogConfig,
  PromptLogSubmission,
  PromptLogAggregate
> = {
  id: 'prompt-logger',
  title: 'Prompt-Logger',
  block: 1,
  kind: 'poll',
  defaultConfig: {
    instruction:
      'Notiere deinen genauen Prompt, das Ergebnis der Antwort und - falls genannt - die zitierte Fundstelle (Norm oder Urteil).',
  },
  aggregate(submissions) {
    return {
      total: submissions.length,
      withCitation: submissions.filter(hasCitation).length,
      // Neueste zuerst: der Server liefert in Einsende-Reihenfolge.
      entries: [...submissions].reverse(),
    };
  },
  tally(submissions): PromptLogTally {
    // Nur eine Zahl - keine Inhalte - waehrend der Sammelphase.
    return { withCitation: submissions.filter(hasCitation).length };
  },
};

/* ---------------------------------------------------------------------------
 * Modul: Architektur-Karte "Wo ist die Wahrheit?" (Block 2)
 * ------------------------------------------------------------------------- */

/**
 * Praesentationsmodul: laeuft am Beamer (und optional parallel auf den Geraeten),
 * sammelt KEINE Einsendungen und aggregiert daher nichts. Die gesamte
 * Interaktion (Stationen, Modi, Aufloesung) ist clientseitig und lokal.
 */
export const architectureMapLogic: ModuleLogic = {
  id: 'architecture-map',
  title: 'Architektur-Karte: Wo ist die Wahrheit?',
  block: 2,
  kind: 'presentation',
  defaultConfig: {},
  aggregate() {
    return null;
  },
};

/* ---------------------------------------------------------------------------
 * Modul: Schaetz-Klammer (Einleitung -> Block 3 -> Abschluss)
 * ------------------------------------------------------------------------- */

/** Begrenzt einen Wert auf das ganzzahlige Intervall [0, 10]. */
function clampEstimate(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(10, Math.max(0, Math.round(v)));
}

export const estimateBracketLogic: ModuleLogic<
  EstimateConfig,
  EstimateSubmission,
  EstimateAggregate
> = {
  id: 'estimate-bracket',
  title: 'Schaetz-Klammer',
  block: 3,
  kind: 'poll',
  defaultConfig: {
    round: 1,
    question:
      'Bei wie vielen von zehn Rechtsfragen liegt ein KI-Tool daneben?',
  },
  aggregate(submissions, config) {
    const histogram = new Array(11).fill(0) as number[];
    let sum = 0;
    for (const s of submissions) {
      const v = clampEstimate(s.value);
      histogram[v] += 1;
      sum += v;
    }
    const count = submissions.length;
    return {
      round: config.round,
      count,
      mean: count > 0 ? sum / count : 0,
      histogram,
    };
  },
};

/* ---------------------------------------------------------------------------
 * Gemeinsames Sortier-Muster: aggregate() + drei Module mit eigenem Inhalt.
 *
 * Alle drei Module teilen sich dieselbe Aggregation (Trefferquote je Karte +
 * mittlere Trefferquote). Sie unterscheiden sich nur in ihrer defaultConfig.
 * ------------------------------------------------------------------------- */

/** Trefferquoten-Aggregation fuer alle Sortier-Module. */
export function sortAggregate(
  submissions: SortSubmission[],
  config: SortConfig,
): SortAggregate {
  const items = config.items.map((it) => {
    const correctSlotId = config.solution[it.id];
    const distribution: Record<string, number> = {};
    let correctCount = 0;
    for (const sub of submissions) {
      const placed = sub.assignment?.[it.id];
      if (!placed) continue;
      distribution[placed] = (distribution[placed] ?? 0) + 1;
      if (placed === correctSlotId) correctCount += 1;
    }
    return { id: it.id, label: it.label, correctSlotId, correctCount, distribution };
  });
  const count = submissions.length;
  const meanCorrect =
    count > 0 && items.length > 0
      ? items.reduce((sum, it) => sum + it.correctCount / count, 0) /
        items.length
      : 0;
  return { count, meanCorrect, items };
}

/** Kleiner Helfer: baut eine Sortier-Logik aus Inhalt. */
function sortModuleLogic(
  id: string,
  title: string,
  block: number,
  defaultConfig: SortConfig,
): ModuleLogic<SortConfig, SortSubmission, SortAggregate> {
  return { id, title, block, kind: 'poll', defaultConfig, aggregate: sortAggregate };
}

/* --- Daten-Treppe (Block 1): Karten auf vier Verarbeitungsstufen ------- */
export const dataStaircaseLogic = sortModuleLogic(
  'data-staircase',
  'Daten-Treppe',
  1,
  {
    prompt:
      'Ordne jede Karte der Stufe zu, auf der diese Information entsteht - von der reinen Messung bis zur Bewertung.',
    items: [
      { id: 'sensor', label: 'Sensorwert' },
      { id: 'gps', label: 'GPS' },
      { id: 'avgspeed', label: 'Durchschnittsgeschwindigkeit' },
      { id: 'drivescore', label: 'Fahrstil-Score' },
      { id: 'oprisk', label: 'OP-Risiko' },
    ],
    slots: [
      { id: 'raw', label: 'Rohdaten', hint: 'Unmittelbar gemessen' },
      { id: 'transformed', label: 'Transformiert', hint: 'Umgerechnet/aggregiert' },
      { id: 'derived', label: 'Abgeleitet', hint: 'Aus anderem berechnet' },
      { id: 'assessment', label: 'Bewertung', hint: 'Wertendes Urteil' },
    ],
    solution: {
      sensor: 'raw',
      gps: 'raw',
      avgspeed: 'transformed',
      drivescore: 'derived',
      oprisk: 'assessment',
    },
    justifications: {
      sensor: 'Unmittelbar gemessener Wert - noch ohne jede Verarbeitung.',
      gps: 'Direkt erfasste Positionsdaten; eine Rohmessung.',
      avgspeed:
        'Aus Position und Zeit berechnet - eine Transformation der Rohdaten.',
      drivescore:
        'Aus mehreren transformierten Groessen abgeleiteter Indikator.',
      oprisk: 'Eine wertende Einschaetzung - keine Messung, sondern ein Urteil.',
    },
  },
);

/* --- Drei-Ebenen-Sorter (Block 1): Antworten nach Belastbarkeit -------- */
export const threeLevelSorterLogic = sortModuleLogic(
  'three-level-sorter',
  'Drei-Ebenen-Sorter',
  1,
  {
    prompt:
      'Ordne jede Antwort der passenden Ebene zu: nur plausibel, inhaltlich korrekt oder belastbar (richtig und nachpruefbar belegt).',
    items: [
      { id: 'a', label: 'A: Fluessig formuliert, ohne Fundstelle, sachlich falsch' },
      { id: 'b', label: 'B: Sachlich richtig, aber ohne Quelle oder Begruendung' },
      { id: 'c', label: 'C: Richtig und mit nachpruefbarer Fundstelle belegt' },
    ],
    slots: [
      { id: 'plausible', label: 'Plausibel', hint: 'Klingt ueberzeugend' },
      { id: 'correct', label: 'Korrekt', hint: 'Inhaltlich richtig' },
      { id: 'robust', label: 'Belastbar', hint: 'Richtig + belegt' },
    ],
    solution: { a: 'plausible', b: 'correct', c: 'robust' },
    justifications: {
      a: 'Sprachlich ueberzeugend, aber inhaltlich falsch - nur plausibel.',
      b: 'Inhaltlich richtig, doch ohne Beleg nicht ueberpruefbar - korrekt, aber nicht belastbar.',
      c: 'Richtig UND mit nachpruefbarer Fundstelle - belastbar.',
    },
  },
);

/* --- Risiko-Ampel (Block 5): Assistenten-Aktionen nach Risiko ---------- */
export const riskTrafficLightLogic = sortModuleLogic(
  'risk-traffic-light',
  'Risiko-Ampel',
  5,
  {
    prompt:
      'Ordne jede Aktion eines KI-Assistenten nach Risiko ein: gruen (unbedenklich), gelb (nur mit Pruefung), rot (kritisch).',
    items: [
      { id: 'summarize', label: 'Fasst einen vom Nutzer bereitgestellten Text zusammen' },
      { id: 'outline', label: 'Erstellt eine Gliederung fuer einen Schriftsatz' },
      { id: 'draft', label: 'Entwirft eine Vertragsklausel, die anwaltlich geprueft wird' },
      { id: 'research', label: 'Recherchiert Rechtsprechung, deren Fundstellen geprueft werden' },
      { id: 'filing', label: 'Reicht eine Fristberechnung ungeprueft direkt bei Gericht ein' },
      { id: 'advice', label: 'Gibt verbindlichen Rechtsrat ohne menschliche Kontrolle' },
    ],
    slots: [
      { id: 'green', label: 'Gruen', hint: 'Unbedenklich' },
      { id: 'yellow', label: 'Gelb', hint: 'Nur mit Pruefung' },
      { id: 'red', label: 'Rot', hint: 'Kritisch' },
    ],
    solution: {
      summarize: 'green',
      outline: 'green',
      draft: 'yellow',
      research: 'yellow',
      filing: 'red',
      advice: 'red',
    },
    justifications: {
      summarize:
        'Arbeitet nur am bereitgestellten Material - geringe eigene Aussagekraft.',
      outline: 'Reine Struktur-/Organisationshilfe ohne rechtliche Festlegung.',
      draft: 'Inhaltlicher Entwurf - tragbar nur mit anschliessender Pruefung.',
      research:
        'Nuetzlich, aber Fundstellen muessen zwingend verifiziert werden.',
      filing:
        'Ungeprueft mit unmittelbarer Aussenwirkung bei Gericht - kritisch.',
      advice:
        'Verbindliche Beratung ohne menschliche Kontrolle - klar kritisch.',
    },
  },
);

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
  promptLoggerLogic,
  architectureMapLogic,
  estimateBracketLogic,
  dataStaircaseLogic,
  threeLevelSorterLogic,
  riskTrafficLightLogic,
  ...placeholderLogic,
];

/** Findet die Logik eines Moduls anhand seiner id. */
export function getModuleLogic(id: string): ModuleLogic | undefined {
  return moduleLogicRegistry.find((m) => m.id === id);
}

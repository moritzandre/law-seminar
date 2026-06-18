/**
 * modules/architectureMap/stations.ts
 * -----------------------------------------------------------------------------
 * Inhalt der Architektur-Karte (uebernommen aus seminar-tool-prototyp.html).
 * Reine Praesentationsdaten - nur clientseitig, der Server kennt sie nicht.
 */

export interface Station {
  id: string;
  /** Emoji-Symbol der Station. */
  icon: string;
  name: string;
  /** Was an dieser Station tatsaechlich passiert. */
  is: string;
  /** Was hier ausdruecklich NICHT passiert. */
  isnt: string;
}

export const stations: Station[] = [
  {
    id: 'tok',
    icon: '✂️',
    name: 'Tokenisierung',
    is: 'Text wird in Tokens zerlegt — Wörter, Wortteile, Zeichen. Rein nach Häufigkeitsstatistik.',
    isnt: 'Keine Bedeutung, keine Norm. „§ 488 Abs. 3 BGB“ ist hier nur eine Folge von Bruchstücken.',
  },
  {
    id: 'emb',
    icon: '🗺️',
    name: 'Embedding',
    is: 'Jedes Token wird zu einem Vektor. Ähnlich verwendete Tokens liegen nah beieinander.',
    isnt: 'Nähe heißt ähnliche Verwendung — nicht dogmatische Gleichheit. Besitz und Eigentum sind hier Nachbarn.',
  },
  {
    id: 'pos',
    icon: '🔢',
    name: 'Position',
    is: 'Jedem Token wird seine Reihenfolge mitgegeben, damit Stellung im Satz zählt.',
    isnt: 'Keine Prüfung, ob die Reihenfolge juristisch eine Prüfungsfolge ergibt.',
  },
  {
    id: 'att',
    icon: '🔍',
    name: 'Attention',
    is: 'Für jedes Tokenpaar wird ein Gewicht berechnet: wie stark der Kontext einbezogen wird.',
    isnt: 'Kontextgewicht ist nicht Tatbestandsrelevanz. Attention ist keine Relevanzprüfung.',
  },
  {
    id: 'ff',
    icon: '⚙️',
    name: 'Feed Forward',
    is: 'Jede Tokenrepräsentation läuft durch ein kleines Netz — Weiterverarbeitung nach dem Gewichten.',
    isnt: 'Kein Abgleich mit Recht, Quellen oder Realität.',
  },
  {
    id: 'dec',
    icon: '📊',
    name: 'Decoding',
    is: 'Die interne Repräsentation wird in eine Wahrscheinlichkeitsverteilung über nächste Tokens übersetzt.',
    isnt: 'Am Ende steht keine Antwort, sondern eine Verteilung. Keine Bewertung von Korrektheit.',
  },
  {
    id: 'smp',
    icon: '🎲',
    name: 'Sampling',
    is: 'Aus der Verteilung wird ein Token gezogen. Temperatur und Top-k steuern die Streuung.',
    isnt: 'Die Auswahl folgt Wahrscheinlichkeit, nicht Wahrheit. Daher variieren Antworten.',
  },
];

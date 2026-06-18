/**
 * modules/architectureMap/ArchitectureMap.tsx
 * -----------------------------------------------------------------------------
 * Interaktive Architektur-Karte "Wo ist die Wahrheit?" als React-Komponente.
 * Logik aus seminar-tool-prototyp.html uebernommen, aber im aktuellen
 * Design-System (hell, ruhig, Tokens) und vollstaendig lokal/clientseitig.
 *
 * Diese Komponente wird sowohl im Dashboard (Beamer) als auch - optional - in
 * der Teilnehmer-Ansicht verwendet. Jede Instanz haelt ihren eigenen Zustand,
 * sodass alle parallel und unabhaengig erkunden koennen.
 */

import { useState } from 'react';
import { Button } from '../../components/ui';
import { stations, type Station } from './stations';
import './architecture.css';

type Mode = 'explore' | 'truth';

export function ArchitectureMap() {
  const [mode, setMode] = useState<Mode>('explore');
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<Station | null>(null);
  const [revealed, setRevealed] = useState(false);

  function switchMode(next: Mode) {
    if (next === mode) return;
    // Moduswechsel startet die Erkundung neu (wie im Prototyp).
    setMode(next);
    setVisited(new Set());
    setActive(null);
    setRevealed(false);
  }

  function openStation(s: Station) {
    setVisited((prev) => new Set(prev).add(s.id));
    setActive(s);
  }

  const allVisited = visited.size === stations.length;
  const canReveal = allVisited && mode === 'truth';

  return (
    <div className="am stack stack-4">
      {/* Modus-Umschalter */}
      <div
        className="am-modes"
        role="tablist"
        aria-label="Modus der Architektur-Karte"
      >
        <button
          role="tab"
          aria-selected={mode === 'explore'}
          className={`am-mode${mode === 'explore' ? ' am-mode-active' : ''}`}
          onClick={() => switchMode('explore')}
        >
          Erkundungsmodus
        </button>
        <button
          role="tab"
          aria-selected={mode === 'truth'}
          className={`am-mode${mode === 'truth' ? ' am-mode-active' : ''}`}
          onClick={() => switchMode('truth')}
        >
          Wahrheit suchen
        </button>
      </div>

      {/* Auftrag / Hinweis je Modus */}
      <p className="am-prompt">
        {mode === 'truth' ? (
          <>
            <strong>Aufgabe:</strong> Finde die Station, in der über{' '}
            <strong>juristische Wahrheit</strong> entschieden wird. Klick dich
            durch.
          </>
        ) : (
          <>
            <strong>Erkundung:</strong> Öffne die Stationen und sieh, was jede
            leistet — und was sie ausdrücklich nicht leistet.
          </>
        )}
      </p>

      {/* Pipeline der Stationen */}
      <div className="am-pipe">
        {stations.map((s, i) => (
          <div className="am-pipe-item" key={s.id}>
            <button
              className={`am-station${
                visited.has(s.id) ? ' am-station-visited' : ''
              }${active?.id === s.id ? ' am-station-active' : ''}`}
              aria-pressed={active?.id === s.id}
              onClick={() => openStation(s)}
            >
              {visited.has(s.id) && (
                <span className="am-check" aria-hidden>
                  ✓
                </span>
              )}
              <span className="am-ico" aria-hidden>
                {s.icon}
              </span>
              <span className="am-nm">{s.name}</span>
            </button>
            {i < stations.length - 1 && (
              <span className="am-arrow" aria-hidden>
                →
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Detailbereich der gewaehlten Station */}
      <div className="am-detail">
        {!active ? (
          <p className="muted">
            {mode === 'truth'
              ? 'Suchauftrag aktiv — klick jede Station an.'
              : 'Klick auf eine Station, um zu sehen, was dort geschieht.'}
          </p>
        ) : (
          <div className="stack stack-3">
            <h3 className="h3">
              <span aria-hidden>{active.icon}</span> {active.name}
            </h3>
            <div className="am-cards">
              {mode === 'truth' ? (
                <>
                  <div className="am-card am-card-isnt">
                    <div className="am-card-label">Wahrheit gesucht?</div>
                    Hier wird <strong>gerechnet, nicht geprüft</strong>. Kein
                    Modul für juristische Wahrheit.
                  </div>
                  <div className="am-card am-card-is">
                    <div className="am-card-label">
                      Was hier wirklich passiert
                    </div>
                    {active.is}
                  </div>
                </>
              ) : (
                <>
                  <div className="am-card am-card-is">
                    <div className="am-card-label">Hier passiert</div>
                    {active.is}
                  </div>
                  <div className="am-card am-card-isnt">
                    <div className="am-card-label">Hier passiert nicht</div>
                    {active.isnt}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fußzeile: Fortschritt + Auflösung */}
      <div className="am-footer">
        <span className="muted small">
          {visited.size} von {stations.length} Stationen geöffnet
        </span>
        <Button
          variant="primary"
          disabled={!canReveal}
          onClick={() => setRevealed(true)}
          title={
            mode !== 'truth'
              ? 'Im Modus „Wahrheit suchen“ verfügbar.'
              : !allVisited
                ? 'Erst alle Stationen öffnen.'
                : undefined
          }
        >
          Auflösung anzeigen
        </Button>
      </div>

      {/* Der Befund */}
      {revealed && (
        <div className="am-verdict stack stack-3">
          <h3 className="h3">Der Befund</h3>
          <p>
            Jede Station wurde geöffnet. In keiner wird über juristische{' '}
            <strong>Wahrheit</strong>, <strong>Aktualität</strong>,{' '}
            <strong>Quellenbindung</strong> oder <strong>Verantwortung</strong>{' '}
            entschieden. Diese sind in der Architektur keine Bauteile.
          </p>
          <p style={{ margin: 0 }}>
            <strong>Konsequenz:</strong> Was die Maschine nicht enthält, muss
            von außen organisiert werden — durch Quellen, Prüfung, Prozesse und
            Verantwortliche.
          </p>
        </div>
      )}
    </div>
  );
}

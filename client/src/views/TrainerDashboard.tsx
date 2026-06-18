/**
 * views/TrainerDashboard.tsx
 * -----------------------------------------------------------------------------
 * Trainer-Dashboard (Beamer-Ansicht). Erzeugt einen Raum, zeigt den Code gross
 * und ablesbar (plus QR), die Teilnehmerzahl, startet Module und schaltet
 * zwischen "collecting" und "revealed" um.
 *
 * Lokaler UI-Zustand steuert nur, was im Hauptbereich sichtbar ist
 * (Auswahl/Einrichtung/aktives Modul); der verbindliche Zustand kommt vom Server.
 */

import { useEffect, useState } from 'react';
import type { PollConfig, Phase } from '@shared/types';
import { Button, Card, PhaseBadge } from '../components/ui';
import { QRCode } from '../components/QRCode';
import { useTrainer } from '../hooks/useTrainer';
import { getModule, modulesByBlock } from '../modules/registry';
import { PollSetup } from './PollSetup';
import './dashboard.css';

/** Modul-IDs, die bereits vollstaendig implementiert sind. */
const READY_MODULE_IDS = new Set(['live-poll', 'prompt-logger']);

export function TrainerDashboard() {
  const room = useTrainer();

  // Lokaler UI-Zustand fuer den Hauptbereich.
  const [draftModuleId, setDraftModuleId] = useState<string | null>(null);
  const [forcePicker, setForcePicker] = useState(false);

  // Wenn ein neues Modul startet, eine ggf. offene Auswahl schliessen.
  useEffect(() => {
    if (room.module) setForcePicker(false);
  }, [room.module]);

  /* --- Noch kein Raum: erstellen --------------------------------------- */
  if (!room.code) {
    return (
      <div className="stack stack-6 center" style={{ paddingTop: 'var(--sp-12)' }}>
        <div className="stack stack-2">
          <h1 className="h1">Trainer-Dashboard</h1>
          <p className="muted">
            Erstelle einen Raum. Teilnehmende treten anschliessend ueber den
            angezeigten Code bei.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={room.createRoom}>
          Raum erstellen
        </Button>
      </div>
    );
  }

  // Beitritts-URL fuer den QR-Code (Code vorausgefuellt via Hash-Deeplink).
  const joinUrl = `${window.location.origin}/#code=${room.code}`;

  // Welcher Bereich wird rechts angezeigt?
  const mode: 'setup' | 'active' | 'picker' = draftModuleId
    ? 'setup'
    : room.module && !forcePicker
      ? 'active'
      : 'picker';

  return (
    <div className="dash-grid">
      {/* --- Raum-Identitaet (immer sichtbar) --- */}
      <aside className="panel dash-aside stack stack-6">
        <div className="stack stack-2">
          <span className="field-label" style={{ marginBottom: 0 }}>
            Raum-Code
          </span>
          <div className="room-code">{room.code}</div>
        </div>

        <div className="stack stack-2">
          <QRCode value={joinUrl} size={148} />
          <span className="small muted">Scannen oder Code eingeben</span>
        </div>

        <hr className="divider" />

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="muted">Teilnehmende</span>
          <span className="h2" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {room.participantCount}
          </span>
        </div>
      </aside>

      {/* --- Hauptbereich --- */}
      <section className="dash-main">
        {mode === 'picker' && (
          <ModulePicker
            activeId={room.module?.moduleId ?? null}
            onPick={(id) => setDraftModuleId(id)}
          />
        )}

        {mode === 'setup' && draftModuleId && (
          <SetupArea
            moduleId={draftModuleId}
            ready={READY_MODULE_IDS.has(draftModuleId)}
            onStart={(config) => {
              room.startModule(draftModuleId, config);
              setDraftModuleId(null);
            }}
            onCancel={() => setDraftModuleId(null)}
          />
        )}

        {mode === 'active' && room.module && (
          <ActiveModule
            moduleId={room.module.moduleId}
            config={room.module.config}
            phase={room.module.phase}
            aggregate={room.aggregate}
            tally={room.tally}
            submissionCount={room.submissionCount}
            participantCount={room.participantCount}
            onReveal={room.reveal}
            onReset={room.reset}
            onSwitch={() => setForcePicker(true)}
          />
        )}
      </section>
    </div>
  );
}

/* --------------------------------------------------------------------------- */

function ModulePicker({
  activeId,
  onPick,
}: {
  activeId: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <Card panel className="stack stack-6">
      <div className="stack stack-2">
        <h2 className="h2">Modul auswaehlen</h2>
        <p className="muted small">Gruppiert nach Seminarblock.</p>
      </div>

      {modulesByBlock().map(({ block, modules }) => (
        <div className="stack stack-3" key={block}>
          <span className="field-label" style={{ marginBottom: 0 }}>
            Block {block}
          </span>
          <div className="module-list">
            {modules.map((m) => {
              const ready = READY_MODULE_IDS.has(m.id);
              const isActive = m.id === activeId;
              return (
                <button
                  key={m.id}
                  className={`module-item${isActive ? ' module-item-active' : ''}`}
                  onClick={() => onPick(m.id)}
                >
                  <span className="module-title">{m.title}</span>
                  <span className="module-meta">
                    <span className="badge">
                      {m.kind === 'poll' ? 'Abstimmung' : 'Anzeige'}
                    </span>
                    {!ready && (
                      <span className="small muted">in Vorbereitung</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </Card>
  );
}

/* --------------------------------------------------------------------------- */

function SetupArea({
  moduleId,
  ready,
  onStart,
  onCancel,
}: {
  moduleId: string;
  ready: boolean;
  onStart: (config: unknown) => void;
  onCancel: () => void;
}) {
  const def = getModule(moduleId);
  if (!def) return null;

  // Modul-spezifischer Editor fuer die Live-Abstimmung.
  if (moduleId === 'live-poll') {
    return (
      <Card panel>
        <PollSetup
          initialConfig={def.defaultConfig as PollConfig}
          onStart={(config) => onStart(config)}
          onCancel={onCancel}
        />
      </Card>
    );
  }

  // Fertige Module ohne eigenen Editor: neutral mit Standardkonfiguration starten.
  // Platzhalter: gleicher Ablauf, aber als "in Vorbereitung" gekennzeichnet.
  return (
    <Card panel>
      <div className="stack stack-4">
        <h2 className="h2">{def.title}</h2>
        <p className="muted">
          {ready
            ? 'Bereit. Mit dem Start beginnt die Sammelphase; die Aufloesung gibst du anschliessend frei.'
            : 'Dieses Modul ist noch ein Platzhalter (TODO). Es kann zu Demonstrationszwecken mit Standardkonfiguration gestartet werden.'}
        </p>
        <div className="row">
          <Button variant="primary" onClick={() => onStart(def.defaultConfig)}>
            {ready ? 'Modul starten' : 'Mit Standard starten'}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Abbrechen
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------------------- */

function ActiveModule({
  moduleId,
  config,
  phase,
  aggregate,
  tally,
  submissionCount,
  participantCount,
  onReveal,
  onReset,
  onSwitch,
}: {
  moduleId: string;
  config: unknown;
  phase: Phase;
  aggregate: unknown;
  tally: unknown;
  submissionCount: number;
  participantCount: number;
  onReveal: () => void;
  onReset: () => void;
  onSwitch: () => void;
}) {
  const def = getModule(moduleId);
  if (!def) return null;
  const View = def.TrainerView;

  return (
    <Card panel className="stack stack-6">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 className="h2">{def.title}</h2>
        <PhaseBadge phase={phase} />
      </div>

      <View
        config={config}
        phase={phase}
        aggregate={aggregate}
        tally={tally}
        submissionCount={submissionCount}
        participantCount={participantCount}
        onReveal={onReveal}
        onReset={onReset}
      />

      <hr className="divider" />

      {/* Lebenszyklus-Steuerung */}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row">
          {def.kind === 'poll' && phase === 'collecting' && (
            <Button variant="primary" onClick={onReveal}>
              Aufloesen
            </Button>
          )}
          <Button variant="secondary" onClick={onSwitch}>
            Anderes Modul
          </Button>
        </div>
        <Button variant="danger" onClick={onReset}>
          Zuruecksetzen
        </Button>
      </div>
    </Card>
  );
}

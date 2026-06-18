/**
 * views/ParticipantPage.tsx
 * -----------------------------------------------------------------------------
 * Teilnehmer-Ansicht. Vor dem Beitritt: Startbildschirm mit Feld fuer den
 * 4-stelligen Raum-Code. Nach dem Beitritt: stets das aktuell vom Trainer
 * gestartete Modul (bzw. ein Wartehinweis, solange keines laeuft).
 */

import { useEffect, useState, type FormEvent } from 'react';
import { Button, Card, PhaseBadge } from '../components/ui';
import { useParticipant } from '../hooks/useParticipant';
import { getModule } from '../modules/registry';

interface ParticipantPageProps {
  /** Optionaler vorausgefuellter Code (z. B. aus einem QR-Deeplink). */
  initialCode?: string;
}

export function ParticipantPage({ initialCode = '' }: ParticipantPageProps) {
  const room = useParticipant();
  const [code, setCode] = useState(initialCode);

  // Bei vorausgefuelltem Code (QR/Deeplink) das Feld aktualisieren.
  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);

  function handleJoin(e: FormEvent) {
    e.preventDefault();
    const clean = code.replace(/\D/g, '').slice(0, 4);
    if (clean.length === 4) room.join(clean);
  }

  /* --- Startbildschirm: Code eingeben ---------------------------------- */
  if (room.status !== 'joined') {
    return (
      <div className="stack stack-6" style={{ maxWidth: 420, margin: '0 auto' }}>
        <div className="stack stack-2 center">
          <h1 className="h1">Seminar beitreten</h1>
          <p className="muted">
            Gib den 4-stelligen Code ein, den die Seminarleitung anzeigt.
          </p>
        </div>

        <Card>
          <form className="stack stack-4" onSubmit={handleJoin}>
            <div>
              <label className="field-label" htmlFor="room-code">
                Raum-Code
              </label>
              <input
                id="room-code"
                className="input input-code"
                inputMode="numeric"
                autoComplete="off"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="0000"
                value={code}
                autoFocus
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
              />
            </div>

            {room.status === 'error' && (
              <p className="small" style={{ color: 'var(--danger)' }}>
                {room.error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              block
              disabled={code.length !== 4 || room.status === 'joining'}
            >
              {room.status === 'joining' ? 'Beitreten …' : 'Beitreten'}
            </Button>
          </form>
        </Card>

        <p className="small muted center">
          Anonym und ohne Anmeldung. Es werden keine personenbezogenen Daten
          erhoben.
        </p>
      </div>
    );
  }

  /* --- Beigetreten, aber noch kein Modul gestartet --------------------- */
  if (!room.module) {
    return (
      <div className="stack stack-3 center" style={{ paddingTop: 'var(--sp-12)' }}>
        <div style={{ fontSize: 40 }} aria-hidden>
          ✓
        </div>
        <h1 className="h2">Du bist dabei</h1>
        <p className="muted">
          Warten auf den Start des naechsten Moduls durch die Seminarleitung …
        </p>
      </div>
    );
  }

  /* --- Aktuelles Modul anzeigen ---------------------------------------- */
  const def = getModule(room.module.moduleId);
  if (!def) {
    return (
      <p className="muted center">Unbekanntes Modul: {room.module.moduleId}</p>
    );
  }
  const View = def.ParticipantView;

  return (
    <div className="stack stack-4" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="small muted">{def.title}</span>
        <PhaseBadge phase={room.module.phase} />
      </div>
      <Card>
        <View
          config={room.module.config}
          phase={room.module.phase}
          sendSubmission={room.sendSubmission}
          submitted={room.submitted}
          aggregate={room.aggregate}
        />
      </Card>
    </div>
  );
}

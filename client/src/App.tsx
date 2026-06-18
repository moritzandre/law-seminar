/**
 * App.tsx
 * -----------------------------------------------------------------------------
 * App-Huelle mit Topbar (Marke + Rollenwechsel + Theme-Toggle) und schlanker
 * Hash-basierter Navigation zwischen Teilnehmer-Ansicht und Trainer-Dashboard.
 *
 * Deeplinks:
 *   #trainer      -> Trainer-Dashboard
 *   #code=1234    -> Teilnehmer-Ansicht mit vorausgefuelltem Raum-Code (QR)
 */

import { useEffect, useState } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { ParticipantPage } from './views/ParticipantPage';
import { TrainerDashboard } from './views/TrainerDashboard';

type View = 'participant' | 'trainer';

/** Liest die initiale Ansicht + ggf. den Code aus dem URL-Hash. */
function readHash(): { view: View; code: string } {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === 'trainer') return { view: 'trainer', code: '' };
  const match = hash.match(/code=(\d{1,4})/);
  if (match) return { view: 'participant', code: match[1] };
  return { view: 'participant', code: '' };
}

export default function App() {
  const initial = readHash();
  const [view, setView] = useState<View>(initial.view);
  const [code] = useState(initial.code);

  // Marke/Titel je Ansicht im Browser-Tab.
  useEffect(() => {
    document.title =
      view === 'trainer' ? 'Seminar-Tool · Dashboard' : 'Seminar-Tool';
  }, [view]);

  function go(next: View) {
    setView(next);
    // Hash aktualisieren, ohne den (ggf. vorausgefuellten) Code zu verlieren.
    window.location.hash = next === 'trainer' ? 'trainer' : '';
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => go('participant')}
          style={{ background: 'none', border: 0, cursor: 'pointer' }}
        >
          Seminar<span className="brand-dot">·</span>Tool
        </button>
        <div className="row">
          <button
            className="theme-toggle"
            onClick={() => go(view === 'trainer' ? 'participant' : 'trainer')}
          >
            {view === 'trainer' ? 'Teilnehmer-Ansicht' : 'Trainer-Dashboard'}
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="container">
        {view === 'trainer' ? (
          <TrainerDashboard />
        ) : (
          <ParticipantPage initialCode={code} />
        )}
      </main>
    </div>
  );
}

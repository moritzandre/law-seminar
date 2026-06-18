/**
 * modules/promptLogger/PromptLogList.tsx
 * -----------------------------------------------------------------------------
 * Anonyme Liste der Prompt-Einsendungen (neueste zuerst). Jede genannte
 * Fundstelle wird sichtbar als "zu pruefen" markiert. Wird sowohl im Dashboard
 * als auch (nach Freigabe) in der Teilnehmer-Ansicht verwendet.
 */

import type { PromptLogEntry } from '@shared/types';

export function PromptLogList({ entries }: { entries: PromptLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="muted">Keine Einsendungen.</p>;
  }
  return (
    <ol className="promptlog-list">
      {entries.map((e, i) => {
        const citation = (e.citation ?? '').trim();
        return (
          <li className="promptlog-entry" key={i}>
            <div className="stack stack-3">
              <div>
                <span className="field-label">Prompt</span>
                <pre className="promptlog-prompt">{e.prompt}</pre>
              </div>
              <div>
                <span className="field-label">Ergebnis der Antwort</span>
                <p className="promptlog-result">{e.result}</p>
              </div>
              {citation && (
                <div className="promptlog-citation">
                  <span className="badge badge-collecting">
                    <span className="badge-dot" />
                    zu pruefen
                  </span>
                  <span className="promptlog-citation-text">{citation}</span>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

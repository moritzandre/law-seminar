/**
 * lib/identity.ts
 * -----------------------------------------------------------------------------
 * Erzeugt eine zufaellige, anonyme Teilnehmer-ID (pid) und merkt sie fuer die
 * Dauer der Browser-Session. Es werden KEINE personenbezogenen Daten erhoben -
 * nur eine zufaellige UUID, damit erneute Einsendungen derselben Person serverseitig
 * dieselbe Person ueberschreiben.
 */

const KEY = 'seminar-tool-pid';

export function getParticipantId(): string {
  let pid = sessionStorage.getItem(KEY);
  if (!pid) {
    pid =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `pid-${Math.random().toString(36).slice(2)}-${Math.random()
            .toString(36)
            .slice(2)}`;
    sessionStorage.setItem(KEY, pid);
  }
  return pid;
}

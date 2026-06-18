/**
 * server/src/rooms.ts
 * -----------------------------------------------------------------------------
 * In-Memory-Verwaltung der Raeume. Es gibt KEINE Persistenz: Raeume sind
 * fluechtig und verschwinden mit dem Serverprozess. Es werden ausschliesslich
 * zufaellige, anonyme Teilnehmer-IDs gespeichert - keine personenbezogenen Daten.
 */

import type { Phase } from '../../shared/types';

/** Der aktuelle Modulzustand eines Raums. */
interface ActiveModule {
  moduleId: string;
  config: unknown;
  phase: Phase;
  /**
   * Eingesammelte Einsendungen, je anonymer Teilnehmer-ID.
   * Map sorgt dafuer, dass eine erneute Einsendung dieselbe Person ueberschreibt.
   */
  submissions: Map<string, unknown>;
}

/** Ein Raum, gehalten nur im Arbeitsspeicher. */
export interface Room {
  code: string;
  /** Socket-ID des steuernden Trainers. */
  trainerSocketId: string;
  /** Anonyme Teilnehmer-IDs (pid), die aktuell beigetreten sind. */
  participants: Set<string>;
  /** Null, solange kein Modul laeuft. */
  active: ActiveModule | null;
}

/** Zentrale Raum-Tabelle: code -> Room. */
const rooms = new Map<string, Room>();

/** Erzeugt einen eindeutigen 4-stelligen Raum-Code (1000-9999). */
function generateCode(): string {
  let code: string;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (rooms.has(code));
  return code;
}

/** Legt einen neuen Raum an und gibt ihn zurueck. */
export function createRoom(trainerSocketId: string): Room {
  const room: Room = {
    code: generateCode(),
    trainerSocketId,
    participants: new Set(),
    active: null,
  };
  rooms.set(room.code, room);
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

/** Findet den Raum, in dem eine Socket-ID der Trainer ist. */
export function getRoomByTrainer(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.trainerSocketId === socketId) return room;
  }
  return undefined;
}

export function deleteRoom(code: string): void {
  rooms.delete(code);
}

/** Startet ein Modul im Raum: Phase collecting, vorherige Einsendungen verworfen. */
export function startModule(
  room: Room,
  moduleId: string,
  config: unknown,
): void {
  room.active = {
    moduleId,
    config,
    phase: 'collecting',
    submissions: new Map(),
  };
}

/** Speichert eine Einsendung (nur waehrend collecting sinnvoll). */
export function storeSubmission(
  room: Room,
  pid: string,
  payload: unknown,
): void {
  if (!room.active) return;
  room.active.submissions.set(pid, payload);
}

/** Setzt die Phase auf revealed. */
export function revealPhase(room: Room): void {
  if (room.active) room.active.phase = 'revealed';
}

/** Setzt das Modul zurueck (zurueck zu "kein Modul"). */
export function resetModule(room: Room): void {
  room.active = null;
}

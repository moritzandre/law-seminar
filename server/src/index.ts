/**
 * server/src/index.ts
 * -----------------------------------------------------------------------------
 * Einstiegspunkt des Echtzeit-Servers.
 *
 * - Express stellt nur einen schlanken Health-Check bereit.
 * - Die eigentliche Logik laeuft ueber Socket.IO mit typisierten Events
 *   (Vertraege aus shared/types.ts).
 * - Der Server bindet an 0.0.0.0, damit Teilnehmende im selben LAN ueber die
 *   IP-Adresse des Trainer-Rechners beitreten koennen.
 */

import { createServer } from 'node:http';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';

import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../shared/types';
import { getModuleLogic } from '../../shared/moduleLogic';
import {
  createRoom,
  deleteRoom,
  getRoom,
  getRoomByTrainer,
  resetModule,
  revealPhase,
  startModule,
  storeSubmission,
} from './rooms';

const PORT = Number(process.env.PORT ?? 3001);

const app = express();
app.use(cors());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'seminar-tool-server' });
});

const httpServer = createServer(app);

// Typisierte Socket.IO-Instanz: <ListenEvents, EmitEvents>.
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: '*' },
});

/** Socket-Room-Name fuer alle Mitglieder eines Seminar-Raums. */
const channel = (code: string) => `room:${code}`;
/**
 * Sendet die aktuelle Einsendungszahl an den Trainer - plus eine optionale,
 * nicht-sensible Live-Auswertung (tally) des aktiven Moduls. Niemals Inhalte.
 */
function emitSubmissionCount(roomCode: string): void {
  const room = getRoom(roomCode);
  if (!room?.active) return;
  const logic = getModuleLogic(room.active.moduleId);
  const subs = [...room.active.submissions.values()];
  const tally = logic?.tally
    ? logic.tally(subs, room.active.config)
    : undefined;
  io.to(room.trainerSocketId).emit('submission:count', {
    count: room.active.submissions.size,
    tally,
  });
}

io.on('connection', (socket) => {
  /**
   * Code des Raums, dem dieser Socket beigetreten ist (als Teilnehmer).
   * Wird fuer sauberes Aufraeumen beim Disconnect gebraucht.
   */
  let joinedRoomCode: string | null = null;
  /** Anonyme Teilnehmer-ID dieses Sockets (falls Teilnehmer). */
  let participantId: string | null = null;

  /* --- Trainer erstellt einen Raum ------------------------------------- */
  socket.on('room:create', () => {
    const room = createRoom(socket.id);
    socket.join(channel(room.code));
    socket.emit('room:created', { code: room.code });
  });

  /* --- Teilnehmer tritt bei -------------------------------------------- */
  socket.on('room:join', ({ code, pid }) => {
    const room = getRoom(code);
    if (!room) {
      socket.emit('room:joined', { ok: false, error: 'Raum nicht gefunden.' });
      return;
    }

    participantId = pid;
    joinedRoomCode = code;
    room.participants.add(pid);
    socket.join(channel(code));

    // Beitretenden sofort mit dem aktuellen Modulzustand versorgen, damit
    // spaete Beitritte synchron sind. Einsendungen werden NICHT mitgeschickt.
    const moduleState = room.active
      ? {
          moduleId: room.active.moduleId,
          config: room.active.config,
          phase: room.active.phase,
        }
      : null;

    socket.emit('room:joined', { ok: true, module: moduleState });

    // Falls bereits aufgeloest wurde, dem Neuling direkt das Aggregat schicken.
    if (room.active && room.active.phase === 'revealed') {
      const logic = getModuleLogic(room.active.moduleId);
      const aggregate = logic
        ? logic.aggregate(
            [...room.active.submissions.values()],
            room.active.config,
          )
        : null;
      socket.emit('phase:updated', { phase: 'revealed', aggregate });
    }

    // Teilnehmerzahl an alle im Raum verteilen.
    io.to(channel(code)).emit('participants:update', {
      count: room.participants.size,
    });
  });

  /* --- Trainer startet ein Modul --------------------------------------- */
  socket.on('module:start', ({ moduleId, config }) => {
    const room = getRoomByTrainer(socket.id);
    if (!room) return;
    if (!getModuleLogic(moduleId)) {
      socket.emit('error', { message: `Unbekanntes Modul: ${moduleId}` });
      return;
    }

    startModule(room, moduleId, config);
    io.to(channel(room.code)).emit('module:started', {
      moduleId,
      config,
      phase: 'collecting',
    });
    emitSubmissionCount(room.code);
  });

  /* --- Teilnehmer sendet eine Einsendung ------------------------------- */
  socket.on('submission:send', ({ moduleId, payload, pid }) => {
    if (!joinedRoomCode) return;
    const room = getRoom(joinedRoomCode);
    if (!room?.active) return;
    // Nur Einsendungen zum aktuell laufenden Modul akzeptieren und nur,
    // solange gesammelt wird. Nach Reveal sind Antworten "eingefroren".
    if (room.active.moduleId !== moduleId) return;
    if (room.active.phase !== 'collecting') return;

    storeSubmission(room, pid, payload);
    // WICHTIG: waehrend collecting wird NICHTS an die Teilnehmer zurueck-
    // gesendet. Nur der Trainer bekommt die aktualisierte Zaehlung.
    emitSubmissionCount(room.code);
  });

  /* --- Trainer gibt die Aufloesung frei -------------------------------- */
  socket.on('phase:reveal', () => {
    const room = getRoomByTrainer(socket.id);
    if (!room?.active) return;

    revealPhase(room);

    const logic = getModuleLogic(room.active.moduleId);
    // Presentation-Module liefern null; poll-Module ein echtes Aggregat.
    const aggregate = logic
      ? logic.aggregate(
          [...room.active.submissions.values()],
          room.active.config,
        )
      : null;

    io.to(channel(room.code)).emit('phase:updated', {
      phase: 'revealed',
      aggregate,
    });
  });

  /* --- Trainer setzt das Modul zurueck --------------------------------- */
  socket.on('module:reset', () => {
    const room = getRoomByTrainer(socket.id);
    if (!room) return;
    resetModule(room);
    io.to(channel(room.code)).emit('module:reset');
  });

  /* --- Aufraeumen beim Verbindungsabbruch ------------------------------ */
  socket.on('disconnect', () => {
    // Trainer weg -> Raum aufloesen (Raeume sind fluechtig).
    const trainerRoom = getRoomByTrainer(socket.id);
    if (trainerRoom) {
      io.to(channel(trainerRoom.code)).emit('module:reset');
      deleteRoom(trainerRoom.code);
      return;
    }

    // Teilnehmer weg -> aus dem Raum entfernen und Zaehler aktualisieren.
    if (joinedRoomCode && participantId) {
      const room = getRoom(joinedRoomCode);
      if (room) {
        room.participants.delete(participantId);
        io.to(channel(joinedRoomCode)).emit('participants:update', {
          count: room.participants.size,
        });
      }
    }
  });
});

// Ohne explizites Host-Argument bindet Node an "::" mit Dual-Stack: erreichbar
// ueber IPv4 (127.0.0.1 und LAN-IP) UND IPv6 (::1). Das ist wichtig, weil
// "localhost" auf Windows oft zu ::1 aufgeloest wird - ein reiner 0.0.0.0-Bind
// (nur IPv4) wuerde Browser-Clients auf localhost sonst ins Leere laufen lassen.
httpServer.listen(PORT, () => {
  console.log(`[seminar-tool] Server laeuft auf Port ${PORT} (IPv4 + IPv6).`);
  console.log(`               Lokal:  http://localhost:${PORT}`);
  console.log('[seminar-tool] Teilnehmende verbinden sich automatisch ueber die');
  console.log('               LAN-IP des Trainer-Rechners (siehe README).');
});

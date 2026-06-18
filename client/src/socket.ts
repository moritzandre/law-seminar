/**
 * socket.ts
 * -----------------------------------------------------------------------------
 * Eine einzige, typisierte Socket.IO-Client-Instanz fuer die gesamte App.
 *
 * Die Server-URL wird standardmaessig aus dem aktuellen Hostnamen abgeleitet
 * (location.hostname:3001). Dadurch verbinden sich Teilnehmende, die die App
 * ueber die LAN-IP des Trainer-Rechners oeffnen, automatisch mit demselben
 * Rechner - ohne Konfiguration. Ueberschreibbar via VITE_SERVER_URL.
 */

import { io, type Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@shared/types';

const serverUrl =
  import.meta.env.VITE_SERVER_URL ??
  `${window.location.protocol}//${window.location.hostname}:3001`;

// Hinweis: Client-Generics sind <ListenEvents, EmitEvents> = <ServerToClient, ClientToServer>.
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  serverUrl,
  { autoConnect: true },
);

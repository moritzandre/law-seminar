# Seminar-Tool

Ein Begleitwerkzeug für ein juristisches Seminar über große Sprachmodelle.
Die Seminarleitung steuert am Beamer, Teilnehmende treten anonym über einen
4-stelligen Raum-Code per Handy oder Laptop bei.

**Leitprinzip aller interaktiven Module:** _erst schätzen, dann auflösen._
Einsendungen werden gesammelt, aber erst nach Freigabe durch die Leitung sichtbar
(Phasen `collecting` → `revealed`).

- **Strikt anonym & datenschutzfreundlich:** keine Klarnamen, keine personen­bezogenen
  Daten – nur zufällige anonyme Teilnehmer-IDs. Räume sind flüchtig (nur im
  Arbeitsspeicher, keine Persistenz).
- **Neutral:** keine Produktnamen, keine Tool-Empfehlungen in der Oberfläche.

---

## Architektur

Monorepo (npm workspaces) mit drei Teilen:

```
seminar-tool/
├─ shared/    Gemeinsame TypeScript-Typen (Socket-Events) + Aggregat-Logik
├─ server/    Node + Express + Socket.IO (In-Memory, kein Speicher)
└─ client/    Vite + React + TypeScript (Teilnehmer-Ansicht & Trainer-Dashboard)
```

Echtzeit läuft über **Socket.IO**. Client und Server teilen sich die Event-Typen
aus `shared/types.ts` – die Verträge können dadurch nicht auseinanderdriften.
Die `aggregate()`-Funktion eines Moduls liegt in `shared/moduleLogic.ts`, sodass
Server (Aggregation) und Client (Anzeige) identisch rechnen.

### Modul-System (Plugin-Architektur)

Ein Modul besteht aus zwei Hälften:

- **Logik** (`shared/moduleLogic.ts`): `id`, `title`, `block`, `kind`
  (`poll` | `presentation`), `defaultConfig`, `aggregate(submissions, config)`.
- **Views** (`client/src/modules/<modul>/`): `ParticipantView` und `TrainerView`
  als React-Komponenten.

Zusammengesetzt ergibt das eine `ModuleDefinition` (siehe
`client/src/modules/types.ts`). Alle Module sind in `client/src/modules/registry.ts`
registriert; das Dashboard zeigt sie – nach Seminarblock gruppiert – zur Auswahl.

**Neues Modul ergänzen:** Logik in `shared/moduleLogic.ts` hinzufügen, einen Ordner
unter `client/src/modules/` mit den beiden Views anlegen und in `registry.ts`
eintragen.

#### Stand der Module

| Block | Modul                              | Status            |
| ----- | ---------------------------------- | ----------------- |
| 1     | **Live-Abstimmung** (`poll`)       | **vollständig**   |
| 1     | Prompt-Logger                      | Platzhalter (TODO)|
| 1     | Architektur-Karte: Wo ist die Wahrheit? | Platzhalter (TODO)|
| 2     | Schätz-Klammer                     | Platzhalter (TODO)|
| 2     | Daten-Treppe                       | Platzhalter (TODO)|
| 2     | Drei-Ebenen-Sorter                 | Platzhalter (TODO)|
| 3     | Risiko-Ampel                       | Platzhalter (TODO)|
| 3     | Forensik-Marker                    | Platzhalter (TODO)|

> Die „Architektur-Karte" soll später Inhalt und Interaktionslogik aus
> `seminar-tool-prototyp.html` übernehmen (Struktur-/Inhaltsreferenz), aber im
> hier definierten Design-System. Die Referenzdatei liegt derzeit noch nicht vor.

---

## Socket-Events

| Richtung           | Event                  | Nutzlast                                  |
| ------------------ | ---------------------- | ----------------------------------------- |
| Client → Server    | `room:create`          | –                                         |
| Server → Client    | `room:created`         | `{ code }`                                |
| Client → Server    | `room:join`            | `{ code, pid }`                           |
| Server → Client    | `room:joined`          | `{ ok, error?, module? }`                 |
| Server → Client    | `participants:update`  | `{ count }`                               |
| Client → Server    | `module:start`         | `{ moduleId, config }`                    |
| Server → Client    | `module:started`       | `{ moduleId, config, phase:"collecting" }`|
| Client → Server    | `submission:send`      | `{ moduleId, payload, pid }`              |
| Server → Client    | `submission:count`     | `{ count }` (nur an Trainer)              |
| Client → Server    | `phase:reveal`         | –                                         |
| Server → Client    | `phase:updated`        | `{ phase:"revealed", aggregate }`         |
| Client → Server    | `module:reset`         | –                                         |
| Server → Client    | `module:reset`         | –                                         |

Während `collecting` werden Einsendungen serverseitig gespeichert, aber **nicht**
an die Teilnehmenden zurückgesendet. Erst `phase:reveal` löst die Aggregation aus.

---

## Voraussetzungen

- **Node.js ≥ 18** (entwickelt/getestet mit Node 22/24) und npm.

## Installation

Im Wurzelverzeichnis (installiert dank Workspaces client **und** server):

```bash
npm install
```

## Starten (Entwicklung)

**Beide gleichzeitig** (empfohlen) – aus dem Wurzelverzeichnis:

```bash
npm run dev
```

Das startet:

- **Server** auf `http://localhost:3001`
- **Client** auf `http://localhost:5173`

Einzeln, falls gewünscht:

```bash
npm run dev:server   # nur Server
npm run dev:client   # nur Client
```

Anschließend im Browser öffnen:

- **Trainer-Dashboard:** `http://localhost:5173/#trainer`
- **Teilnehmer-Ansicht:** `http://localhost:5173/`

Oben rechts lässt sich jederzeit zwischen beiden Ansichten und zwischen
Hell-/Dunkelmodus umschalten.

---

## Als Teilnehmer per LAN beitreten

Beide Dienste binden an `0.0.0.0`, sind also im lokalen Netzwerk erreichbar.
Der Client verbindet sich automatisch mit dem Server auf **demselben Hostnamen**
(`<host>:3001`) – es ist keine Konfiguration nötig.

1. LAN-IP des Trainer-Rechners ermitteln:
   - **Windows:** `ipconfig` → „IPv4-Adresse" (z. B. `192.168.1.42`)
   - **macOS/Linux:** `ipconfig getifaddr en0` bzw. `hostname -I`
2. Teilnehmende öffnen am eigenen Gerät:

   ```
   http://192.168.1.42:5173
   ```

3. Den im Dashboard angezeigten 4-stelligen Code eingeben – oder den **QR-Code**
   scannen (er enthält die Beitritts-URL mit vorausgefülltem Code).

> Hinweis: Alle Geräte müssen im selben Netzwerk sein. Eine evtl. aktive Firewall
> muss die Ports **5173** (Client) und **3001** (Server) im LAN zulassen.
> Optional lässt sich die Server-URL über die Umgebungsvariable
> `VITE_SERVER_URL` für den Client überschreiben.

---

## Build & Typprüfung

```bash
npm run build       # Produktions-Build des Clients (client/dist)
npm run typecheck   # TypeScript-Prüfung für server und client
```

Der Server wird im Betrieb direkt mit `tsx` ausgeführt (kein separater Build-Schritt):

```bash
npm run start:server
```

---

## Datenschutz-Hinweise (kurz)

- Es werden **keine** Namen, E-Mail-Adressen oder sonstige personenbezogenen
  Daten erhoben oder gespeichert.
- Teilnehmer-IDs sind zufällige UUIDs, die nur in der Browser-Session des
  jeweiligen Geräts existieren.
- Räume und alle Einsendungen liegen **ausschließlich im Arbeitsspeicher** des
  Servers und sind nach dessen Neustart vollständig verschwunden.

# Testverfahren

Reproduzierbare Tests für jede Phase aus der [Roadmap.md](./Roadmap.md). Jeder Test definiert **Voraussetzung**, **Schritte** und **Erwartetes Ergebnis**.

Allgemeine Voraussetzung für alle Tests: Setup gemäß [README.md](./README.md) abgeschlossen, Postgres läuft, Migrationen sind eingespielt.

---

## Phase 1 — Monorepo & Infrastruktur Setup

**Voraussetzung:** frischer Clone.

**Schritte:**

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm build
```

**Erwartetes Ergebnis:**

- `pnpm install` schließt fehlerfrei ab
- `pnpm typecheck`, `pnpm lint`, `pnpm build` exitcode `0`
- Ordner `frontend/`, `backend/`, `runtime/`, `templates/`, `packages/types/` existieren
- `@pet/types` ist in `frontend` und `backend` als Workspace-Dependency aufgelöst

---

## Phase 2 — Backend Grundsystem

**Voraussetzung:** Postgres läuft, `backend/.env` gesetzt, Migration angewendet.

**Schritte:**

```bash
pnpm --filter @pet/backend run dev
```

In zweitem Terminal:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/users
curl http://localhost:3000/api/apps
```

**Erwartetes Ergebnis:**

- Server-Log: `[backend] listening on http://localhost:3000/api`
- `/api/health` antwortet mit `200`
- `/api/users` und `/api/apps` liefern `200` + JSON-Array
- CORS-Header `Access-Control-Allow-Origin` ist gesetzt
- Aufruf ohne `/api`-Prefix liefert `404`

---

## Phase 3 — Frontend Grundsystem

**Voraussetzung:** Backend läuft auf Port 3000.

**Schritte:**

```bash
pnpm --filter @pet/frontend run dev
```

Im Browser `http://localhost:5173` öffnen.

**Erwartetes Ergebnis:**

- Dashboard lädt ohne Konsolen-Fehler
- Sidebar + Canvas-Layout sichtbar
- Network-Tab zeigt erfolgreichen `GET /api/apps` (via Vite-Proxy)
- Navigation `/` ↔ `/editor/:id` funktioniert
- Direkter Aufruf `/editor` (ohne ID) zeigt Editor-Platzhalter

---

## Phase 4 — App Datenmodell (JSON Schema)

**Voraussetzung:** `@pet/types` gebaut.

**Schritte:**

```bash
pnpm --filter @pet/types run typecheck
```

In Node-REPL oder Testdatei:

```ts
import { parseAppDefinition, isAppDefinition, APP_SCHEMA_VERSION } from '@pet/types';

const valid = { /* gültige AppDefinition */ };
const invalid = { name: 123 };

parseAppDefinition(valid);   // erfolgreich
parseAppDefinition(invalid); // wirft ZodError
isAppDefinition(valid);      // true
isAppDefinition(invalid);    // false
```

**Erwartetes Ergebnis:**

- Typecheck grün
- `parseAppDefinition` akzeptiert valides Schema, wirft bei invalidem
- `APP_SCHEMA_VERSION` exportiert als Konstante
- `idSchema` validiert generierte IDs

---

## Phase 5 — App CRUD (Backend)

**Voraussetzung:** Backend läuft.

**Schritte:**

```bash
# Create
curl -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","schema":{...gültiges AppDefinition...}}'

# List
curl http://localhost:3000/api/apps

# Get
curl http://localhost:3000/api/apps/<id>

# Update
curl -X PATCH http://localhost:3000/api/apps/<id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Test2","schema":{...}}'

# Delete
curl -X DELETE http://localhost:3000/api/apps/<id>
```

**Erwartetes Ergebnis:**

- Create → `201` + JSON mit `id`, `version: 1`
- List → Array enthält erstellte App
- Update → `200`, `version` inkrementiert (`2`, `3`, …)
- Delete → `204`, danach `GET /api/apps/<id>` → `404`
- Invalides Schema → `400` mit Zod-Fehlern

---

## Phase 6 — Global State (Frontend)

**Voraussetzung:** Frontend + Backend laufen, mindestens eine App existiert.

**Schritte:**

1. Dashboard öffnen → App auswählen → Editor öffnet sich
2. Komponente hinzufügen (Toolbar-Button)
3. Wiederholt: 3 weitere Änderungen
4. „Undo" 3× klicken
5. „Redo" 2× klicken
6. „Speichern" klicken
7. Seite reloaden

**Erwartetes Ergebnis:**

- Nach Änderung: `· ungespeichert`-Marker sichtbar
- Undo stellt vorherigen Zustand wieder her (Limit 50)
- Redo kehrt Undo um
- Nach Speichern verschwindet Marker, `version` im Header steigt
- Nach Reload bleibt gespeicherter Zustand erhalten
- Wechsel zwischen Apps löscht Draft, lädt neu

---

## Phase 7 — Komponenten-System (Frontend)

**Voraussetzung:** Editor mit App geöffnet.

**Schritte:**

1. Für jeden Typ aus `insertableComponentTypes` (`container`, `text`, `button`, `input`, `image`) Button „Hinzufügen" klicken
2. Browser-DevTools → Elements prüfen
3. App speichern, reloaden

**Erwartetes Ergebnis:**

- Jeder Typ rendert sein Primitive mit Default-Props (`getDefaultComponentProps`)
- Container kann Kinder enthalten, andere nicht (laut Registry)
- Rekursiver `ComponentRenderer` rendert verschachtelten Baum korrekt
- Nach Reload sind Komponenten + Reihenfolge identisch
- Jeder Node hat eine eindeutige `id`

---

## Phase 8 — Drag & Drop Engine

**Voraussetzung:** Editor offen.

**Schritte:**

1. Komponente aus Palette in leeren Canvas ziehen → loslassen
2. Zweite Komponente in **bestehenden Container** ziehen
3. Komponente innerhalb desselben Parents nach oben/unten verschieben
4. Komponente zwischen zwei Containern verschieben
5. Container in **eigenen Sub-Tree** ziehen (Cycle-Versuch)
6. Komponente löschen (Button am Node)
7. Undo / Redo nach jedem Schritt
8. Speichern, Reload

**Erwartetes Ergebnis:**

- Drop in `supportsChildren: false` Komponenten ist nicht möglich
- Reihenfolge wird korrekt persistiert
- Cycle-Drop wird verweigert (Ziel-Container nicht im Sub-Tree)
- Page-Root selbst ist nicht draggable
- Eine Drag-Geste erzeugt **genau einen** History-Eintrag (nicht pro `onDragOver`)
- Nach Reload identische Struktur

---

## Phase 9 — Property Editor

**Voraussetzung:** Komponente auf Canvas vorhanden.

**Schritte:**

1. Komponente anklicken → Property-Sidebar öffnet sich
2. Jede Property im Formular ändern
3. Ungültigen Wert eingeben (z. B. `number` als String)
4. Anderen Typ auswählen → Form passt sich an

**Erwartetes Ergebnis:**

- Form wird dynamisch aus dem Zod-Schema des Komponententyps generiert
- Live-Update: Canvas reflektiert Änderung sofort
- Validierungsfehler werden inline angezeigt, Wert wird nicht in den Draft übernommen
- Ein Property-Change = ein History-Eintrag

---

## Phase 10 — Seitenverwaltung

**Voraussetzung:** Editor offen.

**Schritte:**

1. Neue Seite anlegen (Name eingeben)
2. Zwischen Seiten umschalten
3. Eine Seite als Default markieren
4. Seite löschen (nicht die Default)
5. Versuch: Default-Seite löschen
6. Speichern, Reload

**Erwartetes Ergebnis:**

- Jede Seite hat eigene `id`, `route`, `root`-Component
- Canvas zeigt nur Komponenten der aktiven Seite
- Default-Seite löschen wird verhindert oder erfordert vorher anderen Default
- `defaultPageId` zeigt nach Reload auf gültige Page

---

## Phase 11 — Actions System

**Voraussetzung:** Button auf Canvas, zweite Seite existiert.

**Schritte:**

1. `onClick` mit `navigation` zu zweiter Seite konfigurieren
2. Action-Typ `apiCall` mit gültigem Endpoint anlegen
3. Action-Typ `stateUpdate` anlegen (z. B. Counter erhöhen)
4. ✋ **Nicht testbar in Phase 11** — Preview / Runtime erfordert Phase 20 (Runtime Renderer) + Phase 21 (Preview Mode)
5. Speichern, Reload

**Erwartetes Ergebnis (Schritte 1–3, 5):**

- Aktionen werden im Property Editor der ausgewählten Komponente angezeigt
- Trigger (onClick/onChange) und Typ (navigate/apiCall/stateUpdate) sind konfigurierbar
- Payload-Editoren pro Action-Typ funktionieren
- Aktionen werden im JSON serialisiert und nach Reload wieder geladen

**Erwartetes Ergebnis (Schritt 4 — mit Phase 20/21):**

- Action Executor führt Aktion zur Laufzeit aus
- `navigation` wechselt Seite, `apiCall` macht HTTP-Request, `stateUpdate` mutiert Runtime-State
- Fehler in einer Action bricht Folge-Actions ab und wird geloggt

---

## Phase 12 — Backend DB Builder

**Hinweis:** Phase 12 ist reines Backend. Die Frontend-UI (Table-Editor im Builder) folgt in Phase 27.

**Voraussetzung:** Backend läuft, PostgreSQL läuft, Migrationen eingespielt.

**Schritte:**

```bash
# 1. App anlegen (falls keine existiert)
APP_ID=$(curl -s -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -d '{"schema":{"schemaVersion":1,"name":"TestApp","defaultPageId":"p1","pages":[{"id":"p1","name":"Home","path":"/","root":{"id":"r1","type":"container","props":{},"children":[]}}]}}' | jq -r '.id')

# 2. Tabelle mit Feldern anlegen
curl -s -X POST "http://localhost:3000/api/apps/$APP_ID/tables" \
  -H "Content-Type: application/json" \
  -d '{"name":"Customers","slug":"customers","fields":[{"name":"Vorname","key":"vorname","type":"string","required":true},{"name":"Alter","key":"alter","type":"number"}]}'

# 3. Tabellen abrufen
curl -s "http://localhost:3000/api/apps/$APP_ID/tables" | jq

# 4. Einzeltabelle abrufen
curl -s "http://localhost:3000/api/apps/$APP_ID/tables/TABLE_ID" | jq

# 5. Tabelle updaten (z. B. Feld hinzufügen)
curl -s -X PATCH "http://localhost:3000/api/apps/$APP_ID/tables/TABLE_ID" \
  -H "Content-Type: application/json" \
  -d '{"fields":[{"name":"Vorname","key":"vorname","type":"string","required":true},{"name":"Alter","key":"alter","type":"number"},{"name":"Email","key":"email","type":"email","required":false}]}'

# 6. Tabelle löschen
curl -s -X DELETE "http://localhost:3000/api/apps/$APP_ID/tables/TABLE_ID"

# 7. Prüfen ob App-Schema aktualisiert wurde
curl -s "http://localhost:3000/api/apps/$APP_ID" | jq '.schema.tables'
```

**Erwartetes Ergebnis:**

- Schritt 2 → `201` + JSON mit `id`, `name`, `slug`, `fields`
- Schritt 3 → Array mit der angelegten Tabelle
- Schritt 4 → Objekt mit Feld-Definitionen
- Schritt 5 → `200`, `fields` enthält jetzt 3 Einträge, `version` der App inkrementiert
- Schritt 6 → `204`, danach Schritt 3 liefert leeres Array
- Schritt 7 → Tabelle ist als Teil des App-Schemas persistiert
- Doppelter `slug` → `409 Conflict`
- Ungültige `slug` / `key` → `400` (regex `/^[a-z][a-z0-9_]*$/`)

---

## Phase 13 — CRUD API Generator

**Voraussetzung:** Tabelle aus Phase 12 existiert.

**Schritte:**

```bash
curl -X POST    http://localhost:3000/api/data/customers -d '{...}'
curl            http://localhost:3000/api/data/customers
curl            http://localhost:3000/api/data/customers/<id>
curl -X PATCH   http://localhost:3000/api/data/customers/<id> -d '{...}'
curl -X DELETE  http://localhost:3000/api/data/customers/<id>
```

**Erwartetes Ergebnis:**

- Alle fünf Endpoints existieren automatisch
- Validierung gegen Feld-Schema (z. B. `age` als Zahl)
- Endpoints für nicht-existente Tabelle liefern `404`

---

## Phase 14 — Relations System

**Voraussetzung:** Zwei Tabellen existieren.

**Schritte:**

1. 1:n-Beziehung definieren (`orders.customerId → customers.id`)
2. n:m-Beziehung definieren (`posts ↔ tags`)
3. Über CRUD API verknüpfen, mit `?include=…` abfragen
4. Verknüpften Datensatz löschen → FK-Verhalten prüfen

**Erwartetes Ergebnis:**

- Foreign Keys werden physisch in DB angelegt
- Include-Queries liefern verschachtelte Objekte
- Cascade / Restrict / SetNull verhält sich wie konfiguriert

---

## Phase 15 — Auth System

**Voraussetzung:** Backend läuft.

**Schritte:**

```bash
curl -X POST http://localhost:3000/api/auth/register -d '{"email":"a@b.c","password":"secret123"}'
curl -X POST http://localhost:3000/api/auth/login    -d '{"email":"a@b.c","password":"secret123"}'
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <token>"
```

**Erwartetes Ergebnis:**

- Register: `201`, in DB liegt **gehashtes** Passwort (kein Klartext)
- Login: `200` + JWT
- `/me` mit gültigem Token → `200` + User-Daten
- `/me` ohne / mit falschem Token → `401`
- Doppelte Registrierung → `409`

---

## Phase 16 — Rollen & Berechtigungen

**Voraussetzung:** Auth läuft, mindestens zwei User mit unterschiedlichen Rollen.

**Schritte:**

1. User A: Rolle `admin`, User B: Rolle `viewer`
2. Geschützten Endpoint mit Token A → erlaubt
3. Gleichen Endpoint mit Token B → verweigert
4. Frontend zeigt UI-Elemente rollenabhängig

**Erwartetes Ergebnis:**

- Guard liefert `403` bei fehlender Permission
- Permissions-Modell ist deklarativ (z. B. Decorator/Metadata)
- Frontend versteckt Aktionen, für die der User keine Permission hat

---

## Phase 17 — File Upload System

**Voraussetzung:** Backend läuft, Storage konfiguriert.

**Schritte:**

```bash
curl -X POST http://localhost:3000/api/files \
  -F "file=@./test.png"
curl http://localhost:3000/api/files/<id>
```

**Erwartetes Ergebnis:**

- Upload liefert `201` + File-Metadata (`id`, `mimeType`, `size`, `url`)
- Datei ist über URL abrufbar
- Frontend-Upload-UI funktioniert per Drag oder File-Picker
- Größenlimit greift, falsche MIME-Typen werden abgelehnt

---

## Phase 18 — Email Integration

**Voraussetzung:** SMTP-Server (z. B. Mailhog auf 1025) konfiguriert.

**Schritte:**

1. Action `sendEmail` mit Template + Variablen auslösen
2. Mailhog UI (`http://localhost:8025`) prüfen

**Erwartetes Ergebnis:**

- Email landet in Mailhog
- Template-Variablen sind ersetzt
- Fehler beim SMTP-Server werden geloggt und Action schlägt fehl

---

## Phase 19 — SMS Integration

**Voraussetzung:** SMS-Provider (Twilio o. ä.) mit Test-Credentials.

**Schritte:**

1. Action `sendSms` mit Empfänger + Text triggern
2. Provider-Dashboard prüfen

**Erwartetes Ergebnis:**

- SMS wird vom Provider akzeptiert (Test-Modus)
- Fehlerhafte Nummer → Action liefert Fehler
- Rate-Limit / fehlende Credentials werden sauber gemeldet

---

## Phase 20 — Runtime Renderer

**Voraussetzung:** App mit Komponenten + Actions vorhanden.

**Schritte:**

1. `runtime`-Package gegen gespeicherte AppDefinition starten
2. Alle Komponentenarten in einer App platzieren
3. Actions auslösen (Navigation, API, State)
4. Bewusst invalides Schema laden

**Erwartetes Ergebnis:**

- App wird aus reinem JSON gerendert (kein Editor-Code)
- Komponenten-Mapping greift via Registry
- Runtime-State funktioniert (Inputs, Counter etc.)
- Invalides Schema → Fehleranzeige, keine White-Screen

---

## Phase 21 — Preview Mode

**Voraussetzung:** Runtime Renderer fertig.

**Schritte:**

1. Im Editor „Preview" klicken
2. Komponenten klicken / Inputs füllen
3. Zurück in Edit-Mode wechseln

**Erwartetes Ergebnis:**

- Preview läuft isoliert (iframe oder Sandbox)
- Editor-Draft wird nicht durch Preview-State verändert
- Wechsel zurück: Editor-Zustand ist intakt
- Test-Daten lassen sich injizieren

---

## Phase 22 — Template Engine

**Voraussetzung:** Eine gespeicherte App existiert.

**Schritte:**

1. Generate-Command: `pnpm --filter @pet/templates run generate <appId>`
2. Generierten Output inspizieren

**Erwartetes Ergebnis:**

- Output-Ordner enthält lauffähiges Basis-Projekt
- App-Config ist als JSON injiziert
- Build-Scripts (`build:web`, `build:desktop`, `build:android`) sind vorbereitet

---

## Phase 23 — Web Build

**Voraussetzung:** Template Engine fertig.

**Schritte:**

```bash
# In generiertem Projekt
pnpm install
pnpm run build:web
```

**Erwartetes Ergebnis:**

- `dist/`-Ordner mit statischen Assets
- `index.html` lädt App lokal (`npx serve dist`)
- Keine Editor-spezifischen Dependencies im Bundle

---

## Phase 24 — Desktop Build (Electron)

**Voraussetzung:** Web Build funktioniert.

**Schritte:**

```bash
pnpm run build:desktop
```

**Erwartetes Ergebnis:**

- `.exe` (Windows) bzw. `.dmg` / `.AppImage` erzeugt
- Doppelklick startet App, lädt Runtime
- App funktioniert offline (sofern Schema offline-fähig)

---

## Phase 25 — Android Build (Capacitor)

**Voraussetzung:** Web Build funktioniert, Android SDK installiert.

**Schritte:**

```bash
pnpm run build:android
```

**Erwartetes Ergebnis:**

- `app-debug.apk` wird erzeugt
- APK installiert sich auf Emulator/Device
- App startet und rendert Runtime
- Permissions stehen im `AndroidManifest.xml`

---

## Phase 26 — Lizenzsystem

**Voraussetzung:** Backend + Runtime laufen.

**Schritte:**

1. Lizenz-Key über Backend generieren
2. Runtime mit gültigem Key starten
3. Runtime mit ungültigem / abgelaufenem Key starten
4. Ohne Key starten

**Erwartetes Ergebnis:**

- Gültiger Key: App läuft normal
- Abgelaufener Key: App zeigt Hinweis, Funktion gesperrt
- Ungültiger Key: Validierungsfehler
- Backend-Status spiegelt aktuelle Lizenz wider

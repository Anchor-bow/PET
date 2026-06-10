# Roadmap

Linearer Plan für den No-Code App Builder. Reihenfolge ist verbindlich — Abhängigkeiten verhindern Chaos und sorgen für Erweiterbarkeit.

## Aktueller Stand

| Phase | Feature                          | Status              |
| ----- | -------------------------------- | ------------------- |
| 1     | Monorepo & Infrastruktur Setup   | ✅ erledigt         |
| 2     | Backend Grundsystem              | ✅ erledigt         |
| 3     | Frontend Grundsystem             | ✅ erledigt         |
| 4     | App Datenmodell (JSON Schema)    | ✅ erledigt         |
| 5     | App CRUD (Backend)               | ✅ erledigt         |
| 6     | Global State (Frontend)          | ✅ erledigt         |
| 7     | Komponenten-System (Frontend)    | ✅ erledigt         |
| 8     | Drag & Drop Engine               | ✅ erledigt         |
| 9     | Property Editor                  | ✅ erledigt         |
| 10    | Seitenverwaltung                 | ✅ erledigt         |
| 11    | Actions System                   | ✅ erledigt         |
| 12    | Backend DB Builder (Backend)     | ✅ erledigt         |
| 13    | CRUD API Generator               | ✅ erledigt         |
| 14    | Relations System                 | ✅ erledigt         |
| 15    | Auth System                      | ✅ erledigt         |
| 16    | Rollen & Berechtigungen          | ➖ übersprungen      |
| 17    | File Upload System               | ✅ erledigt         |
| 18    | Email Integration                | ✅ erledigt         |
| 19    | SMS Integration                  | ➖ zurückgestellt    |
| 20    | Runtime Renderer                 | ✅ erledigt         |
| 21    | Preview Mode                     | ✅ erledigt         |
| 22    | Template Engine                  | 🚧 in Bearbeitung   |
| 23    | Web Build (PoC)                  | ✅ PoC abgeschlossen |
| 24–27 | siehe Übersicht                  | ⏳ offen            |

## Übersicht

| #   | Feature                          | Komplexität | Abhängigkeit |
| --- | -------------------------------- | ----------- | ------------ |
| 1   | Monorepo & Infrastruktur Setup   | 2           | —            |
| 2   | Backend Grundsystem              | 2           | #1           |
| 3   | Frontend Grundsystem             | 2           | #1           |
| 4   | App Datenmodell (JSON Schema)    | 5           | #2           |
| 5   | App CRUD (Backend)               | 3           | #4           |
| 6   | Global State (Frontend)          | 4           | #4, #5       |
| 7   | Komponenten-System (Frontend)    | 3           | #6           |
| 8   | Drag & Drop Engine               | 5           | #7           |
| 9   | Property Editor                  | 3           | #7, #8       |
| 10  | Seitenverwaltung                 | 3           | #6           |
| 11  | Actions System                   | 5           | #6, #7       |
| 12  | Backend DB Builder               | 5           | #4           |
| 13  | CRUD API Generator               | 4           | #12          |
| 14  | Relations System                 | 5           | #12          |
| 15  | Auth System                      | 2           | #2           |
| 16  | Rollen & Berechtigungen          | 4           | #15          |
| 17  | File Upload System               | 3           | #2           |
| 18  | Email Integration                | 2           | #2           |
| 19  | SMS Integration                  | 3           | #2           |
| 20  | Runtime Renderer                 | 5           | #4, #7, #11  |
| 21  | Preview Mode                     | 4           | #20          |
| 22  | Template Engine                  | 4           | #4           |
| 23  | Web Build                        | 2           | #22          |
| 24  | Desktop Build (Electron)         | 4           | #22          |
| 25  | Android Build (Capacitor)        | 5           | #22          |
| 26  | Lizenzsystem                     | 3           | #2, #20      |
| 27  | Erweiterung: UI, Komponenten, Actions, DB UI, Device Preview & Backup | 4 | #11, #12, #20, #21 |

## Kritische Blöcke

- **#4** App Datenmodell — Fundament für alles weitere
- **#8** Drag & Drop — UX-Kern des Builders
- **#11** Actions System — Interaktivität ✅
- **#12** Backend DB Builder — Datenebene ✅
- **#14** Relations System — Daten verknüpfen ✅
- **#20** Runtime Renderer — App-Ausführung ✅
- **#21** Preview Mode — App testen im Builder ✅

---

## Phasen

### 1 — Monorepo & Infrastruktur Setup ✅

Ziel: Projektstruktur und gemeinsame Basis.

- pnpm Workspace eingerichtet
- Ordnerstruktur: `/frontend`, `/backend`, `/runtime`, `/templates`, `/packages/types`
- Gemeinsames `@pet/types` Package
- ESLint + Prettier konfiguriert
- Git Repository initialisiert

### 2 — Backend Grundsystem ✅

Ziel: API + Datenbank Basis.

- NestJS Setup
- Module: `app`, `user`, `auth`
- PostgreSQL via Prisma
- Prisma Schema + Initial-Migration vorhanden
- Health Endpoint
- Globaler API-Prefix `/api`
- CORS aktiviert
- Read-Endpunkte: `/api/users`, `/api/users/:id`, `/api/apps`, `/api/apps/:id`

### 3 — Frontend Grundsystem ✅

Ziel: Leeres Dashboard.

- React + Vite Setup
- Routing (Dashboard, Editor)
- Layout (Sidebar + Canvas)
- Zustand Store initialisiert
- API Client (Axios)
- Dashboard lädt Apps über `/api/apps`
- Editor-Route mit optionaler `appId`

### 4 — App Datenmodell (KRITISCH) ✅

Ziel: Zentrales JSON Modell.

- Definition: App, Page, Component, Props, Actions, Styles
- IDs System über gemeinsame `Id`-Typen und `idSchema`
- Versionierung über `APP_SCHEMA_VERSION`
- Schema-Validierung mit Zod
- Validierungshelfer: `parseAppDefinition`, `isAppDefinition`

### 5 — App CRUD (Backend) ✅

Ziel: Apps speichern.

- App Entity im Prisma Schema
- JSON-Feld speichern
- Endpoints: create, update, delete, list, get
- Schema-Validierung über gemeinsames Zod-App-Datenmodell
- Version wird bei Updates erhöht

### 6 — Global State (Frontend) ✅

Ziel: Zentrale Steuerung.

- Zustand Store mit App-Liste, aktueller App und Draft
- App-Liste laden (`loadApps`), App laden/speichern/löschen
- Undo/Redo Stack (`history` / `future`, Limit 50)
- Sync mit Backend über `apiUpdateApp`
- Dirty State Tracking (`isDirty`, `isSaving`)

### 7 — Komponenten-System ✅

Ziel: UI-Bausteine.

- Basis-Komponenten: Container, Text, Button, Input, Image, Custom
- Props System mit Zod-Schemas pro Typ und `getDefaultComponentProps`
- Component Registry (`frontend/src/components/builder/registry.ts`)
- Rendering Layer: rekursiver `ComponentRenderer`
- Editor-Canvas rendert die Default-Page inklusive Toolbar zum Einfügen

### 8 — Drag & Drop Engine ✅

Ziel: Visueller Builder.

- Komponenten-Palette (`ComponentPalette`)
- Drag Start / Drop via `@dnd-kit/core`
- Positionierung über Drop-Zonen zwischen Kindern
- Verschieben + Löschen pro Node
- Nested Components mit Cycle-Schutz (`isDescendant`)
- Tree-Operationen in `frontend/src/lib/tree.ts`
- Ein History-Eintrag pro Drag-Geste (über `updateDraft`)
- Ersetzt die temporäre "Hinzufügen"-Toolbar in der `EditorPage`

### 9 — Property Editor ✅

Ziel: Komponenten bearbeiten.

- Selection-State im Store (`selectedNodeId`) mit Reset bei Load/Clear/Delete/Remove/Undo/Redo
- Klick auf Komponente in der Canvas selektiert + zeigt blauen Outline
- Rechte Sidebar (`PropertyEditor`) mit dynamischer Form pro Komponententyp
- Field-Metadata in `frontend/src/components/builder/propertyFields.ts`, Validierung über Zod-Schemas aus `@pet/types`
- Select/Checkbox commiten sofort; Text/Number/Textarea/Width commiten auf Blur oder Enter → ein History-Eintrag pro Property-Change
- Ungültige Werte werden inline gemeldet, Draft bleibt unverändert
- Editor-Workspace ist jetzt 3-spaltig (Palette + Canvas + Property Editor)
- Canvas-Primitives sind nicht interaktiv (`pointer-events: none` auf Input/Button/Bild) — Klick selektiert immer die Komponente

### 10 — Seitenverwaltung ✅

Ziel: Multi-Page Support.

- `currentPageId` im Store — getrennt von `defaultPageId`, Seitenwechsel setzt Selection zurück
- `addPage(name, parentPageId?)` — neue Seite mit Root-Container; optional mit Parent-Verknüpfung
- `removePage(pageId)` — mit Schutz der letzten Seite + Bereinigung von Child-Referenzen
- `updatePage(pageId, partial)` — einheitliches Update für Name, Pfad, Beschreibung, Parent
- `setDefaultPage(pageId)` — Startseite umschalten
- Page-Tabs im Editor-Header — aktive Seite hervorgehoben, ★ markiert Startseite
- ✏️ Bearbeiten-Button → PageEditor-Panel (rechte Sidebar) mit Name, Beschreibung, Startseite, Parent-Seite, Pfad
- 🗑 Löschen-Button → Confirm-Dialog "Willst du diese Seite wirklich löschen? Ja/Nein"
- `PageDefinition` um `description?` und `parentPageId?` erweitert (Interface + Zod)
- Datenbankanpassung nicht nötig — Seiten leben weiterhin im `App.schema` JSONB
- Alle Mutationen (Drag & Drop, Props) arbeiten auf der aktuell ausgewählten Seite

### 11 — Actions System ✅

Ziel: Interaktivität.

- Action-Typen: Navigation, API Call, State Update
- Event Binding: `onClick`, `onLoad` (ergänzt aus `packages/types` — `actionTriggerSchema`)
- Action Executor Engine (asynchron, unterstützt API-Calls)
- Serialisierung im JSON ( `ComponentNode.actions` bereits im Datenmodell)
- `updateNodeActions` in `frontend/src/lib/tree.ts`
- `updateComponentActions` in `useAppStore.ts`
- `supportedTriggers` pro Komponente in der Registry
- Event-Wiring in Primitives (`onClick` → Executor)
- Action-Editor-UI (modaler Dialog oder erweiterte Sidebar)

### 12 — Backend DB Builder ✅

Ziel: Dynamische Datenbank (Backend, Ansatz A — Meta-Tabellen).

- Tabellen/Felder-Definitionen im App-Schema (JSONB)
- Record-Meta-Tabelle in Prisma (`appId`, `tableId`, `data`)
- REST-API: `GET/POST/PATCH/DELETE /api/apps/:appId/tables`
- Optimistische Concurrency über Schema-Version
- **Frontend-UI folgt in Phase 27**

### 13 — CRUD API Generator ✅

Ziel: Automatische CRUD-APIs für benutzerdefinierte Tabellen.

- `buildRecordSchema(fields)` in `@pet/types` — dynamische Zod-Validierung aus `FieldDefinition[]` (unterstützt alle 8 Feldtypen: string, number, boolean, email, url, date, text, select)
- Neues `CrudGeneratorModule` in `/backend/src/crud-generator/`
- REST-API unter `/api/apps/:appId/records/:tableId[/:recordId]`
  - `GET` — Records einer Tabelle listen (neueste zuerst)
  - `GET :recordId` — Einzelnen Record abrufen
  - `POST` — Record anlegen (mit Feldvalidierung, Unbekannte werden gefiltert)
  - `PATCH :recordId` — Record aktualisieren (merged + validiert)
  - `DELETE :recordId` — Record löschen (HTTP 204)
- Absicherung: App existiert → Tabelle existiert → Tabelle hat Felder → Validation
- `@ApiBody` Decorators für korrekte Swagger-Darstellung aller Body-Schemata
- App-ID auf 6 Zeichen verkürzt (a-z, 0-9, via `crypto.randomBytes`)
- Kurz-ID-Anzeige (erste 6 Stellen) im Frontend-Dashboard pro App-Karte

### 14 — Relations System ✅

Ziel: Daten verknüpfen.

- **Types:** `RelationDefinition` (hasMany/belongsTo/manyToMany), `FieldType` um `'relation'` erweitert, `buildRecordSchema` unterstützt Relation-Felder
- **Prisma:** Neues `RelationRecord`-Modell für n:m-Join-Tabelle, Migration erstellt
- **DB Builder:** Relation-Felder in Table-Definitionen erlaubt, Zieltabellen-Validierung, Löschschutz bei referenzierenden Tabellen
- **CRUD Generator:** FK-Validierung bei POST/PATCH, Cascade-Löschung bei 1:n (hasMany), n:m-Join-Bereinigung, optionales `?resolve=true` zum Auflösen von Relationen
- **Query Builder:** Neuer Endpoint `POST /api/apps/:appId/query` mit `filter` (Unterstützt `$eq, $ne, $gt, $gte, $lt, $lte, $in, $contains`), `sort`, `include` (Relationen auflösen), `select` (Felder filtern)

### 15 — Auth System

Ziel: Login.

- JWT Login
- Register
- Passwort Hashing
- Middleware

### 16 — Rollen & Berechtigungen

Ziel: Zugriff steuern.

- Rollen
- Permissions-Modell
- Guards im Backend
- Frontend UI

### 17 — File Upload System

Ziel: Medien.

- Upload Endpoint
- Storage (lokal oder S3)
- File-Metadata
- Frontend Upload UI

### 18 — Email Integration

Ziel: Benachrichtigungen.

- SMTP Setup
- Email Service
- Templates

### 19 — SMS Integration

Ziel: SMS Versand.

- Provider anbinden
- API Wrapper
- Integration in Actions

### 20 — Runtime Renderer (KRITISCH) ✅

Ziel: App ausführen. Als React-Bibliothek (`@pet/runtime`) umgesetzt — kann sowohl in Preview (#21) als auch in Build-Targets (#23–25) importiert werden.

- `RuntimeRenderer` — Top-Level-Komponente: `<RuntimeRenderer app={appDef} />`
- `RuntimeProvider` — React Context mit State, Navigation und Action-Execution
- `RuntimePageRenderer` + `RuntimeComponentRenderer` — rekursiver Tree-Renderer für Seiten/Component-Trees
- `RuntimeState` — app-weiter Zustand (Input-Werte, API-Ergebnisse, etc.)
- Action-Execution: Navigate, API Call, State Update, Submit, Custom
- Interactive Primitives (Input editierbar, Button klickbar, keine Builder-Overlays)
- Registry: ComponentType → Primitive (identische Struktur zum Builder)
- **Architekturentscheidung:** Als Bibliothek, nicht als Framework — ermöglicht direkte Integration in Preview und Builds ohne doppelte React-Bäume

### 21 — Preview Mode

Ziel: App live im Builder testen, ohne sie zu bauen.

- Preview-Toggle in der Editor-Toolbar („Vorschau“)
- Inline-Preview: Ersetzt Canvas + Palette + PropertyEditor durch RuntimeRenderer
- Live-Sync: RuntimeRenderer bekommt currentAppDraft — Änderungen im Editor erscheinen sofort
- Testdaten für Tabellen (optional, zur Laufzeit über Actions)
- Navigations-Leiste: Page-Tabs bleiben sichtbar, Klick navigiert in der Runtime
- Zurück zum Editor: Toggle schaltet zurück auf BuilderCanvas

### 22 — Template Engine 🚧

Ziel: App generieren.

- Basis-App erstellen → `templates/web/` als Vite + React + `@pet/runtime` Template
- Config Injection → Build-Skript schreibt App-Definition in `src/app.data.json`, wird zur Build-Zeit eingebunden
- Build Scripts vorbereiten → `build.js` mit `--input <app.json> --output <dir>`
- **Architektur:** Standalone-Build (gebündelt, ~225 kB / 68 kB gzip), `@pet/types` wird via Vite-Alias auf TS-Quelle aufgelöst (CJS/ESM-Kompatibilität)

### 23 — Web Build ✅ (PoC)

Ziel: Web App validieren.

- Vite Build → funktioniert, produziert `index.html` + `assets/` mit relativem Base-Pfad
- Deployment-Struktur → `dist/`-Ordner pro App, bereit zum Hochladen auf beliebigen Static-Host
- Frontend-Integration („Exportieren"-Button) folgt in Phase 27 oder als separater Schritt

### 24 — Desktop Build

Ziel: `.exe`.

- Electron Setup
- Build Pipeline
- Packaging

### 25 — Android Build

Ziel: APK.

- Capacitor Setup
- Android-Projekt generieren
- Build konfigurieren

### 26 — Lizenzsystem

Ziel: Monetarisierung.

- Key generieren
- Backend-Speicherung
- Runtime-Validierung
- Ablaufdatum

### 27 — Erweiterung: UI, Komponenten, Actions, DB UI, Device Preview & Backup

Ziel: Builder-Plattform erweitern + Datensicherheit.

- **UI Aufbau**: Editor-Layout überarbeiten (Toolbar-Anordnung, Panel-Größen, responsives Verhalten, Dark Mode)
- **Seiten ID vereinfachen**: Im Action-Editor (Navigation-Action) statt roher UUID-Eingabe ein Dropdown mit allen verfügbaren Seiten anzeigen. Auch an anderen Stellen, wo aktuell IDs manuell eingegeben werden müssen
- **DB Builder UI**: Table-Liste, Table-Editor (Name + Slug), Field-Editor (Name/Typ/Required/Default) im Editor-Panel
- **Erweiterte Komponenten**: neue UI-Bausteine (Liste, Tabelle, Card, Tabs, Form, Modal, Chart, Rich Text, Icon)
- **Erweiterte Actions**: komplexe Workflows, Konditionale Actions, Timer/Verzögerung, Action-Chaining
- **Device Preview**: Desktop/Tablet/Android-Viewport-Umschalter in der Preview-Leiste, damit die App in verschiedenen Zielformaten getestet werden kann
- **Backup & Restore**: Export/Import einzelner Apps als JSON-Dump, projektweites Backup inklusive aller benutzerdefinierten Daten (Meta-Tabellen), Wiederherstellungs-UI im Builder

---

## Abweichungen vom Plan

- **#16 Rollen & Berechtigungen** — übersprungen (Single-User, kein Bedarf)
- **#19 SMS Integration** — zurückgestellt (isoliertes Feature, kein Block für Runtime/Export)
- **#22/#23 PoC-First** — Web Build (#23) wurde als Proof-of-Concept vor der fertigen Template Engine (#22) umgesetzt, um den Export-Pfad zu validieren. Die Template Engine wird basierend auf den Erkenntnissen des PoC verallgemeinert.

## Reihenfolge

1. Erst Struktur
2. Dann Builder
3. Dann Logik
4. Dann Runtime
5. Dann Export

Ohne diese Reihenfolge → System wird instabil und nicht erweiterbar.

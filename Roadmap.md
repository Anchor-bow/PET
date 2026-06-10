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
| 22    | Template Engine + Web Build      | ✅ erledigt         |
| 23    | Web Build                        | ✅ in #22 integriert |
| 24   | Desktop Build (Electron)         | ✅ erledigt         |
| 25   | Android Build (Capacitor)        | ✅ erledigt         |
| 26   | Lizenzsystem                     | ✅ erledigt         |
| 27   | PET Design (Farben, Stil, Layout) | ✅ erledigt         |
| 28   | UI Aufbau (Editor-Layout)        | ✅ erledigt         |
| 29   | Seiten ID vereinfachen           | ✅ erledigt         |
| 30   | DB Builder UI                    | ✅ erledigt         |
| 31   | Device Preview                   | ⏳ offen            |
| 32   | Backup & Restore                 | ⏳ offen            |
| 33   | Erweiterte Actions               | ⏳ offen            |
| 34   | Building Block: Liste            | ⏳ offen            |
| 35   | Building Block: Tabelle          | ⏳ offen            |
| 36   | Building Block: Card             | ⏳ offen            |
| 37   | Building Block: Tabs             | ⏳ offen            |
| 38   | Building Block: Form             | ⏳ offen            |
| 39   | Building Block: Modal            | ⏳ offen            |
| 40   | Building Block: Chart            | ⏳ offen            |
| 41   | Building Block: Rich Text        | ⏳ offen            |
| 42   | Building Block: Icon             | ⏳ offen            |

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
| 25   | Android Build (Capacitor)        | 5           | #22          |
| 26   | Lizenzsystem                     | 3           | #2, #20      |
| 27   | PET Design (Farben, Stil, Layout) | 3           | —             |
| 28   | UI Aufbau (Editor-Layout)        | 4           | #27           |
| 29   | Seiten ID vereinfachen           | 2           | #28           |
| 30   | DB Builder UI                    | 4           | #12, #28      |
| 31   | Device Preview                   | 3           | #20, #21, #28 |
| 32   | Backup & Restore                 | 4           | #2, #12       |
| 33   | Erweiterte Actions               | 5           | #11, #28      |
| 34   | Building Block: Liste            | 3           | #7, #28, #33  |
| 35   | Building Block: Tabelle          | 4           | #7, #28, #33  |
| 36   | Building Block: Card             | 2           | #7, #28       |
| 37   | Building Block: Tabs             | 3           | #7, #28       |
| 38   | Building Block: Form             | 4           | #7, #28, #33  |
| 39   | Building Block: Modal            | 3           | #7, #28       |
| 40   | Building Block: Chart            | 4           | #7, #28       |
| 41   | Building Block: Rich Text        | 4           | #7, #28       |
| 42   | Building Block: Icon             | 2           | #7, #28       |

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

### 22 — Template Engine + Web Build ✅

Ziel: App generieren und als Standalone-Web-App exportieren.

- **Build-CLI** (`packages/build-cli/`) — `pet-build --template web --input <app.json> --output <dist>`
  - Validiert die App-Definition mit `appDefinitionSchema` aus `@pet/types`
  - Injiziert das App-JSON in das Template (`src/app.data.json`)
  - Führt `vite build` im Template-Verzeichnis aus
  - Output: fertiges `dist/` (index.html + assets/)
- **Web Template** (`templates/web/`) — Vite + React + `@pet/runtime`
  - Standalone-Build, alles gebündelt (~225 kB / 68 kB gzip)
  - `@pet/types` via Vite-Alias auf TS-Quelle (CJS/ESM-Kompatibilität)
- **Backend Export API** (`POST /api/apps/:appId/export`)
  - Holt die App aus der DB, schreibt sie als Temp-JSON
  - Spawnt die Build-CLI als Child-Prozess
  - Verpackt das Build-Output als ZIP (`archiver`)
  - Streamt die ZIP als Download (`StreamableFile`)
- **Frontend Integration**
  - "Exportieren"-Button in der Editor-Toolbar
  - Ruft die Export-API auf, lädt die ZIP herunter
  - Loading-/Error-State für User-Feedback
- **Architektur:** Build läuft serverseitig (Backend spawnt CLI) — Frontend muss nur downloaden

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

### 27 — PET Design (Farben, Stil, Layout) ✅

Ziel: Einheitliches, modernes Design für das gesamte PET-Programm.

- **Farben (PET-Programm)**:
  - Light Mode: Weißer Hintergrund (`#FFFFFF`), dunkle Schrift für Kontrast
  - Dark Mode: Schwarzer Hintergrund (`#000000`), helle Schrift für Kontrast
  - Akzentfarbe: Orange (z. B. für Buttons, Feldumrandungen, aktive Elemente)
  - Hinweis: Diese Farben gelten ausschließlich für das PET-Programm selbst. Die Editor-Inhalte (App des Users) verwenden separate, später definierbare Farben.
- **Design-Stil**:
  - Modern, sauber, aufgeräumt
  - Abgerundete Ecken (`border-radius`) bei Buttons, Panels, Input-Feldern
  - Einheitliche Abstände und Spacing (Grid-System)
  - Keine „Windows XP"-Optik – flache Designs, klare Linien
  - Grid-basierte Platzierung von Buttons und Feldern (z. B. im Property-Editor: nebeneinander, nicht kreuz und quer)
- **Fokus auf Lesbarkeit**: Ausreichende Schriftgrößen, Zeilenabstände, Kontraste
- **Hinweis zu Building Blocks**: Die späteren Building Blocks (Phasen 34–42) erben diesen modernen Stil (abgerundete Ecken, Grid-Layout, einheitliches Spacing). Ihre spezifischen Farben (Akzente, Button-Farben, Hintergründe) werden jedoch später vom User im Editor pro App definiert – sie gehören zur App des Users, nicht zum PET-Programm.

### 28 — UI Aufbau (Editor-Layout) ✅

Ziel: Editor-Layout grundlegend überarbeiten und an das neue Design anpassen.

- **Collapsible Sidebar**: Seitenleiste einklappbar (220px ↔ 52px). Jeder Nav-Punkt erhält ein Icon. Im collapsed-Modus nur Icons sichtbar.
- **Detachable Panels**: Komponenten-Palette und Property-Editor können vom Benutzer abgelöst werden. Im abgelösten Zustand schweben sie als frei positionierbare Fenster über dem Canvas → Canvas erhält volle Breite.
- **Toolbar-Anordnung**: Toolbar-Buttons logisch gruppieren (Aktionen, Export, Ansicht).
- **Responsives Verhalten**: Editor bei kleineren Fenstern nutzbar, Panels einklappbar.
- **Dark Mode Support**: Theme-Umschalter in der Sidebar (bereits in Phase 27 implementiert).

### 29 — Seiten ID vereinfachen ✅

Ziel: Benutzerfreundlichkeit im Action-Editor verbessern.

- Im Action-Editor (Navigation-Action) statt roher UUID-Eingabe ein Dropdown mit allen verfügbaren Seiten anzeigen
- An anderen Stellen, wo aktuell IDs manuell eingegeben werden müssen, ebenfalls Dropdowns oder Auswahlhilfen bereitstellen

### 30 — DB Builder UI ✅

Ziel: Frontend-UI für den Backend DB Builder (Phase 12) als separates Modal-Fenster.

- **Modal-Fenster**: Wird über "Datenbank"-Button in der Editor-Toolbar geöffnet. Alle DB-Operationen in einem Fenster, Editor bleibt übersichtlich.
- **Table-Liste**: Alle Tabellen der App anzeigen, jeweils mit Slug und Feldanzahl
- **Table-Editor**: Name + Slug bearbeiten, Felder verwalten
- **Field-Editor**: Felder mit Name/Key/Typ/Required/Default anlegen/bearbeiten/löschen
- **Records-Ansicht**: Daten einer Tabelle anzeigen, anlegen, bearbeiten, löschen
- **Dynamisches Formular**: Wird aus den Feld-Definitionen generiert

### 31 — Device Preview ⏳

Ziel: App in verschiedenen Zielformaten testen.

- Desktop/Tablet/Android-Viewport-Umschalter in der Preview-Leiste
- Viewport-Größen: Desktop (1920×1080), Tablet (768×1024), Mobile (375×667)
- RuntimeRenderer skaliert entsprechend

### 32 — Backup & Restore ⏳

Ziel: Datensicherheit und Portabilität.

- Export einzelner Apps als JSON-Dump
- Import einzelner Apps aus JSON-Dump
- Projektweites Backup inklusive aller benutzerdefinierten Daten (Meta-Tabellen)
- Wiederherstellungs-UI im Builder

### 33 — Erweiterte Actions ⏳

Ziel: Komplexere Workflows im Action-System.

- Konditionale Actions (if/else)
- Timer/Verzögerung (Action nach X Sekunden ausführen)
- Action-Chaining (mehrere Actions nacheinander)
- Erweiterte Action-Typen (z. B. Daten-Transformationen)

### 34 — Building Block: Liste ⏳

Ziel: Listenelement als Komponente im Builder und Runtime.

- Daten aus Tabellen (Records) dynamisch als Liste darstellen
- Props: Datenquelle, Template pro Zeile, Sortierung, Filter
- Support für Klick-Actions auf Listeneinträge

### 35 — Building Block: Tabelle ⏳

Ziel: Tabellenelement als Komponente im Builder und Runtime.

- Dynamische Tabellendarstellung aus Tabellen-Daten
- Props: Datenquelle, Spalten-Auswahl, Sortierung, Filter, Paginierung
- Zeilen-Selektion und Klick-Actions

### 36 — Building Block: Card ⏳

Ziel: Card-Element als Komponente im Builder und Runtime.

- Karte mit Bild, Titel, Beschreibung, Action-Button
- Props: Bild-URL, Titel, Text, Action-Binding
- Flexible Layout-Varianten (horizontal/vertikal)

### 37 — Building Block: Tabs ⏳

Ziel: Tab-Element als Komponente im Builder und Runtime.

- Tab-Wechsel mit Content-Bereichen
- Props: Tab-Liste (Label + Content), Default-Tab
- Actions on Tab Change

### 38 — Building Block: Form ⏳

Ziel: Formular-Element als Komponente im Builder und Runtime.

- Dynamisches Formular aus Tabellen-Feldern
- Props: Datenquelle, Submit-Ziel, Validierung
- Submit-Action: API Call, State Update, Navigation
- Feld-Typen: Input, Select, Checkbox, Date, File

### 39 — Building Block: Modal ⏳

Ziel: Modal-Dialog als Komponente im Builder und Runtime.

- Overlay-Dialog mit Inhalt (Text, Bild, Liste, etc.)
- Props: Titel, Größe, Schließen-Option
- Open/Close per Action steuerbar

### 40 — Building Block: Chart ⏳

Ziel: Diagramm-Element als Komponente im Builder und Runtime.

- Diagramm-Typen: Balken, Linie, Kreis, Säule
- Props: Datenquelle, Typ, Farben, Achsenbeschriftung
- Dynamische Daten aus Tabellen

### 41 — Building Block: Rich Text ⏳

Ziel: Rich-Text-Editor/Anzeige als Komponente im Builder und Runtime.

- Formatierte Textdarstellung (fett, kursiv, Listen, Links)
- WYSIWYG-Editor im Builder
- HTML/Markdown-Speicherung

### 42 — Building Block: Icon ⏳

Ziel: Icon-Element als Komponente im Builder und Runtime.

- Icon-Auswahl aus Bibliothek (z. B. Lucide, Heroicons)
- Props: Icon-Name, Größe, Farbe
- Klick-Action unterstützt

---

## Abweichungen vom Plan

- **#16 Rollen & Berechtigungen** — übersprungen (Single-User, kein Bedarf)
- **#19 SMS Integration** — zurückgestellt (isoliertes Feature, kein Block für Runtime/Export)
- **#22/#23 PoC-First** — Web Build (#23) wurde als Proof-of-Concept vor der fertigen Template Engine (#22) umgesetzt, um den Export-Pfad zu validieren. Basierend auf den Erkenntnissen wurde die `pet-build`-CLI und das Backend-Export-API gebaut. #22 und #23 sind jetzt in einem Schritt abgeschlossen.

## Reihenfolge

1. Erst Struktur (Phasen 1–3)
2. Dann Builder (Phasen 4–11)
3. Dann Logik (Phasen 12–14)
4. Dann Runtime (Phasen 20–21)
5. Dann Export (Phasen 22–25)
6. **Jetzt: PET Design + UI-Ausbau (Phasen 27–42)**

Ohne diese Reihenfolge → System wird instabil und nicht erweiterbar.

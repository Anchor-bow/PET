# PET — No-Code App Builder

Monorepo für einen visuellen No-Code App Builder mit Drag & Drop Editor, dynamischer Datenbank und Multi-Target-Export (Web, Desktop, Android).

## Aktueller Stand

| Phase | Feature                          | Status            |
| ----- | -------------------------------- | ----------------- |
| 1     | Monorepo & Infrastruktur Setup   | ✅ erledigt       |
| 2     | Backend Grundsystem              | ✅ erledigt       |
| 3     | Frontend Grundsystem             | ✅ erledigt       |
| 4     | App Datenmodell (JSON Schema)    | ✅ erledigt       |
| 5     | App CRUD (Backend)               | ✅ erledigt       |
| 6     | Global State (Frontend)          | ✅ erledigt       |
| 7     | Komponenten-System (Frontend)    | ✅ erledigt       |
| 8     | Drag & Drop Engine               | ⏳ nächster Schritt |
| 9-26  | siehe Roadmap unten              | ⏳ offen          |

## Projektstruktur

```
PET/
├── backend/          NestJS API (Phase 2)
├── frontend/         React + Vite Dashboard/Editor (Phase 3)
├── runtime/          JSON → React Renderer (Phase 20)
├── templates/        Build-Templates für Web/Desktop/Android (Phase 22+)
├── packages/
│   └── types/        Geteilte TypeScript-Typen
├── package.json      pnpm Workspace Root
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── eslint.config.mjs
```

## Toolchain

- **Paketmanager:** pnpm 9 (Workspace)
- **Node:** >= 20
- **Sprache:** TypeScript 5.7 (strict)
- **Linting:** ESLint 9 (flat config) + Prettier 3

## Scripts (Root)

```bash
pnpm install          # Dependencies installieren
pnpm dev              # frontend + backend parallel im Watch-Mode
pnpm build            # alle Workspaces bauen
pnpm typecheck        # Typen prüfen
pnpm lint             # ESLint
pnpm format           # Prettier write
pnpm clean            # dist + node_modules entfernen
```

---

## Roadmap

### Reihenfolge

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

### 1 — Monorepo & Infrastruktur Setup ✅

Ziel: Projektstruktur und gemeinsame Basis

- pnpm Workspace eingerichtet
- Ordnerstruktur: `/frontend`, `/backend`, `/runtime`, `/templates`, `/packages/types`
- Gemeinsames `@pet/types` Package
- ESLint + Prettier konfiguriert
- Git Repository initialisiert

### 2 — Backend Grundsystem ✅

Ziel: API + Datenbank Basis

- NestJS Setup
- Module: `app`, `user`, `auth`
- PostgreSQL via Prisma
- Prisma Schema + Initial-Migration vorhanden
- Health Endpoint
- Globaler API-Prefix `/api`
- CORS aktiviert
- Erste Read-Endpunkte: `/api/users`, `/api/users/:id`, `/api/apps`, `/api/apps/:id`

### 3 — Frontend Grundsystem ✅

Ziel: Leeres Dashboard

- React + Vite Setup
- Routing (Dashboard, Editor)
- Layout (Sidebar + Canvas)
- Zustand Store initialisiert
- API Client (Axios)
- Dashboard lädt Apps über `/api/apps`
- Editor-Route mit optionaler `appId`

### 4 — App Datenmodell (KRITISCH) ✅

Ziel: Zentrales JSON Modell

- Definition: App, Page, Component, Props, Actions, Styles
- IDs System über gemeinsame `Id`-Typen und `idSchema`
- Versionierung über `APP_SCHEMA_VERSION`
- Schema-Validierung mit Zod
- Validierungshelfer: `parseAppDefinition`, `isAppDefinition`

### 5 — App CRUD (Backend) ✅

Ziel: Apps speichern

- App Entity im Prisma Schema vorhanden
- JSON-Feld speichern
- Endpoints: create, update, delete, list, get
- Schema-Validierung über gemeinsames Zod-App-Datenmodell
- Version wird bei Updates erhöht

### 6 — Global State (Frontend) ✅

Ziel: Zentrale Steuerung

- Zustand Store mit App-Liste, aktueller App und Draft
- App-Liste laden (`loadApps`), App laden/speichern/löschen
- Undo/Redo Stack (`history` / `future`, Limit 50)
- Sync mit Backend über `apiUpdateApp`
- Dirty State Tracking (`isDirty`, `isSaving`)

### 7 — Komponenten-System ✅

Ziel: UI-Bausteine

- Basis-Komponenten: Container, Text, Button, Input, Image, Custom
- Props System mit Zod-Schemas pro Typ (`buttonPropsSchema` etc.) und `getDefaultComponentProps`
- Component Registry (`frontend/src/components/builder/registry.ts`)
- Rendering Layer: rekursiver `ComponentRenderer` läuft durch `ComponentNode`-Baum
- Editor-Canvas rendert die Default-Page aus dem Draft inklusive Toolbar zum Einfügen

### 8 — Drag & Drop Engine (nächster Schritt)

Ziel: Visueller Builder

- Canvas
- Drag Start / Drop
- Positionierung (Grid / Free)
- Verschieben, Löschen
- Hierarchie (Nested Components)
- Ersetzt die temporäre "Hinzufügen"-Toolbar in der EditorPage

### 9 — Property Editor

Ziel: Komponenten bearbeiten

- Sidebar UI
- Dynamische Form basierend auf Props
- Live Update
- Validierung

### 10 — Seitenverwaltung

Ziel: Multi-Page Support

- Seiten erstellen/löschen
- Routing-Modell
- Seitenwechsel im Builder
- Default Page

### 11 — Actions System

Ziel: Interaktivität

- Action Typen: Navigation, API Call, State Update
- Event Binding: `onClick`, `onLoad`
- Action Executor Engine
- Serialisierung im JSON

### 12 — Backend DB Builder

Ziel: Dynamische Datenbank

- Tabellen erstellen
- Felder definieren (Typen)
- Migration Engine
- Schema speichern

### 13 — CRUD API Generator

Ziel: Automatische APIs

- Endpoints generieren: create, read, update, delete
- Generic Controller
- Validation

### 14 — Relations System

Ziel: Daten verknüpfen

- Foreign Keys
- 1:n und n:m Beziehungen
- Query Builder

### 15 — Auth System

Ziel: Login

- JWT Login
- Register
- Passwort Hashing
- Middleware

### 16 — Rollen & Berechtigungen

Ziel: Zugriff steuern

- Rollen
- Permissions-Modell
- Guards im Backend
- Frontend UI

### 17 — File Upload System

Ziel: Medien

- Upload Endpoint
- Storage (lokal oder S3)
- File-Metadata
- Frontend Upload UI

### 18 — Email Integration

Ziel: Benachrichtigungen

- SMTP Setup
- Email Service
- Templates

### 19 — SMS Integration

Ziel: SMS Versand

- Provider anbinden
- API Wrapper
- Integration in Actions

### 20 — Runtime Renderer (KRITISCH)

Ziel: App ausführen

- JSON → React Renderer
- Component Mapping
- State Handling
- Action Execution

### 21 — Preview Mode

Ziel: Testen im Builder

- Runtime im iframe oder isoliert
- Testdaten laden
- Live Simulation

### 22 — Template Engine

Ziel: App generieren

- Basis-App erstellen
- Config Injection
- Build Scripts vorbereiten

### 23 — Web Build

Ziel: Web App

- Vite Build
- Deployment-Struktur

### 24 — Desktop Build

Ziel: `.exe`

- Electron Setup
- Build Pipeline
- Packaging

### 25 — Android Build

Ziel: APK

- Capacitor Setup
- Android-Projekt generieren
- Build konfigurieren

### 26 — Lizenzsystem

Ziel: Monetarisierung

- Key generieren
- Backend-Speicherung
- Runtime-Validierung
- Ablaufdatum

## Priorität (kritisch)

Die wichtigsten Blöcke:

- #4 Datenmodell
- #8 Drag & Drop
- #11 Actions
- #20 Runtime Renderer
- #12 Datenbank System

## Fazit

Dieser Plan ist linear ausführbar und verhindert Chaos:

1. Erst Struktur
2. Dann Builder
3. Dann Logik
4. Dann Runtime
5. Dann Export

Ohne diese Reihenfolge → System wird instabil und nicht erweiterbar.

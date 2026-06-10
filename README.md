# PET — No-Code App Builder

Monorepo für einen visuellen No-Code App Builder mit Drag & Drop Editor, dynamischer Datenbank und Multi-Target-Export (Web, Desktop, Android).

- **Roadmap & Phasenstatus:** [Roadmap.md](./Roadmap.md)
- **Testverfahren pro Phase:** [Test.md](./Test.md)

## Architektur

```
PET/
├── backend/          NestJS API (Port 3000, Prefix /api)
├── frontend/         React + Vite Editor (Port 5173, Proxy /api → 3000)
├── runtime/          JSON → React Renderer (Phase 20)
├── templates/        Build-Templates für Web/Desktop/Android (Phase 22+)
├── packages/
│   └── types/        Geteilte TypeScript-Typen (@pet/types)
├── package.json      pnpm Workspace Root
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── eslint.config.mjs
```

## Architekturentscheidungen

### Backend DB Builder — Meta-Tabellen (Phase 12)
Der Backend DB Builder speichert benutzerdefinierte Tabellen und Felder nicht als native PostgreSQL-Tabellen, sondern in einem Meta-Tabellen-Ansatz (generische Record-Tabellen + JSONB). Dadurch bleibt das DB-Schema stabil — `pg_dump`/`pg_restore` funktionieren zu jedem Zeitpunkt ohne Schema-Konflikte.

### Runtime Renderer — Bibliothek statt Framework (Phase 20)
Der Runtime Renderer (`@pet/runtime`) ist als importierbare React-Bibliothek umgesetzt, nicht als eigenständiges App-Framework. Gründe:
- **Direkte Integration in Preview (#21):** Die Runtime kann ohne iframe oder doppelten React-Baum in der EditorPage gerendert werden
- **Wiederverwendung in Builds (#23–25):** Web/Desktop/Mobile-Builds importieren dieselbe Bibliothek
- **Kein Scope-Risiko:** Der Fokus liegt auf JSON→React-Rendering; Routing, Auth und Theme sind Sache der einbettenden Umgebung
- **Ausbaufähig:** Bei Bedarf kann die Bibliothek später um Framework-Features erweitert werden

## Toolchain

- **Paketmanager:** pnpm 9 (Workspace)
- **Node:** >= 20
- **Sprache:** TypeScript 5.7 (strict)
- **Backend:** NestJS 10 + Prisma 5 + PostgreSQL
- **Frontend:** React 18 + Vite 5 + Zustand 5 + React Router 6
- **Runtime:** React 18 (eigenes Workspace `@pet/runtime`)
- **Linting:** ESLint 9 (flat config) + Prettier 3

## Ports

| Service          | Port | URL                              |
| ---------------- | ---- | -------------------------------- |
| Backend (NestJS) | 3000 | `http://localhost:3000/api`      |
| Frontend (Vite)  | 5173 | `http://localhost:5173`          |
| PostgreSQL       | 5432 | `postgresql://localhost:5432/pet` |

Das Frontend proxiet `/api` automatisch auf `http://localhost:3000` (siehe `frontend/vite.config.ts`).

## Start

Schritt für Schritt vom frischen Clone bis zum laufenden Dev-Setup.

### 1. Voraussetzungen

- Node.js ≥ 20
- pnpm 9 (`npm i -g pnpm@9`)
- PostgreSQL 14+ lokal oder als Docker-Container

### 2. PostgreSQL bereitstellen

Variante A — Docker (empfohlen):

```bash
docker run --name pet-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pet \
  -p 5432:5432 -d postgres:16
```

Variante B — lokale Installation: Datenbank `pet` mit User `postgres` / Passwort `postgres` anlegen.

### 3. Dependencies installieren

```bash
pnpm install
```

### 4. Backend-Environment einrichten

```bash
cp backend/.env.example backend/.env
```

Inhalt von `backend/.env`:

```
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pet?schema=public"
```

### 5. Prisma vorbereiten

```bash
pnpm --filter @pet/backend run prisma:generate
pnpm --filter @pet/backend run prisma:migrate
```

Der zweite Befehl spielt die Migration `20260601000000_phase_2_initial` ein und erstellt die Tabellen `User` und `App`.

### 6. Dev-Server starten

```bash
pnpm dev
```

Startet Backend (`http://localhost:3000/api`) und Frontend (`http://localhost:5173`) parallel im Watch-Mode.

### 7. Smoke-Test

- `http://localhost:3000/api/apps` → liefert `[]` oder Liste
- `http://localhost:5173` → Dashboard lädt ohne Fehler

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

## Backend-Scripts

```bash
pnpm --filter @pet/backend run prisma:generate   # Prisma Client generieren
pnpm --filter @pet/backend run prisma:migrate    # Migration anwenden (dev)
pnpm --filter @pet/backend run build             # Production Build
```

## Runtime-Scripts

```bash
pnpm --filter @pet/runtime run build      # TypeScript kompilieren
pnpm --filter @pet/runtime run typecheck  # Typen prüfen
```

## Frontend-Scripts

```bash
pnpm --filter @pet/frontend run dev      # Vite Dev-Server
pnpm --filter @pet/frontend run build    # Production Build
pnpm --filter @pet/frontend run preview  # Build-Preview
```

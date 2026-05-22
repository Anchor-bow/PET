# Reihenfolge
#	Feature	Komplexität	Abhängigkeit
1	Monorepo & Infrastruktur Setup	2	—
2	Backend Grundsystem	2	#1
3	Frontend Grundsystem	2	#1
4	App Datenmodell (JSON Schema)	5	#2
5	App CRUD (Backend)	3	#4
6	Global State (Frontend)	4	#4, #5
7	Komponenten-System (Frontend)	3	#6
8	Drag & Drop Engine	5	#7
9	Property Editor	3	#7, #8
10	Seitenverwaltung	3	#6
11	Actions System	5	#6, #7
12	Backend DB Builder	5	#4
13	CRUD API Generator	4	#12
14	Relations System	5	#12
15	Auth System	2	#2
16	Rollen & Berechtigungen	4	#15
17	File Upload System	3	#2
18	Email Integration	2	#2
19	SMS Integration	3	#2
20	Runtime Renderer	5	#4, #7, #11
21	Preview Mode	4	#20
22	Template Engine	4	#4
23	Web Build	2	#22
24	Desktop Build (Electron)	4	#22
25	Android Build (Capacitor)	5	#22
26	Lizenzsystem	3	#2, #20

## 1 — Monorepo & Infrastruktur Setup

Ziel: Projektstruktur und gemeinsame Basis

Tasks:

pnpm workspace oder turborepo einrichten
Ordnerstruktur erstellen:
/frontend
/backend
/runtime
/templates
Gemeinsames types Package erstellen
ESLint + Prettier konfigurieren
Git Repository initialisieren
##  2 — Backend Grundsystem

Ziel: API + Datenbank Basis

Tasks:

NestJS Setup
Module erstellen:
app
user
auth
PostgreSQL installieren
Prisma Schema definieren
Erste Migration
Health Endpoint erstellen
##  3 — Frontend Grundsystem

Ziel: Leeres Dashboard

Tasks:

React + Vite Setup
Routing (Dashboard, Editor)
Layout (Sidebar + Canvas)
Zustand Store initialisieren
API Client (Axios)
##  4 — App Datenmodell (KRITISCH)

Ziel: Zentrales JSON Modell

Tasks:

Definition:
App
Page
Component
Props
Actions
Styles
IDs System definieren
Versionierung einbauen
Schema validieren (zod oder class-validator)
##  5 — App CRUD (Backend)

Ziel: Apps speichern

Tasks:

App Entity erstellen
JSON Feld speichern
Endpoints:
create
update
delete
get
Versioning (optional)
##  6 — Global State (Frontend)

Ziel: Zentrale Steuerung

Tasks:

Store Struktur definieren
App laden/speichern
Undo/Redo Stack
Sync mit Backend
Dirty State Tracking
##  7 — Komponenten-System

Ziel: UI Bausteine

Tasks:

Basis-Komponenten erstellen:
Button
Input
Container
Props System
Rendering Layer
Component Registry
##   8 — Drag & Drop Engine

Ziel: Visueller Builder

Tasks:

Canvas implementieren
Drag Start / Drop
Positionierung (Grid / Free)
Verschieben
Löschen
Hierarchie (Nested Components)
##  9 — Property Editor

Ziel: Komponenten bearbeiten

Tasks:

Sidebar UI
Dynamische Form basierend auf Props
Live Update
Validierung
##  10 — Seitenverwaltung

Ziel: Multi-Page Support

Tasks:

Seiten erstellen/löschen
Routing Modell
Seitenwechsel im Builder
Default Page
##  11 — Actions System

Ziel: Interaktivität

Tasks:

Action Typen definieren:
Navigation
API Call
State Update
Event Binding:
onClick
onLoad
Action Executor Engine
Serialisierung im JSON
## ️ 12 — Backend DB Builder

Ziel: Dynamische Datenbank

Tasks:

Tabellen erstellen
Felder definieren (Typen)
Migration Engine bauen
Schema speichern
##  13 — CRUD API Generator

Ziel: Automatische APIs

Tasks:

Endpoints generieren:
create
read
update
delete
Generic Controller
Validation
##  14 — Relations System

Ziel: Daten verknüpfen

Tasks:

Foreign Keys
1:n Beziehungen
n:m Beziehungen
Query Builder erweitern
##  15 — Auth System

Ziel: Login

Tasks:

JWT Login
Register
Passwort Hashing
Middleware
##  16 — Rollen & Berechtigungen

Ziel: Zugriff steuern

Tasks:

Rollen definieren
Permissions Modell
Guards im Backend
Frontend UI
##  17 — File Upload System

Ziel: Medien

Tasks:

Upload Endpoint
Storage (lokal oder S3)
File Metadata speichern
Frontend Upload UI
##  18 — Email Integration

Ziel: Benachrichtigungen

Tasks:

SMTP Setup
Email Service
Templates
##  19 — SMS Integration

Ziel: SMS Versand

Tasks:

Provider anbinden
API Wrapper
Integration in Actions
##  20 — Runtime Renderer (KRITISCH)

Ziel: App ausführen

Tasks:

JSON → React Renderer
Component Mapping
State Handling
Action Execution
##  21 — Preview Mode

Ziel: Testen im Builder

Tasks:

Runtime im iframe oder isoliert
Testdaten laden
Live Simulation
##  22 — Template Engine

Ziel: App generieren

Tasks:

Basis-App erstellen
Config Injection
Build Scripts vorbereiten
##  23 — Web Build

Ziel: Web App

Tasks:

Vite Build
Deployment Struktur
##  24 — Desktop Build

Ziel: .exe

Tasks:

Electron Setup
Build Pipeline
Packaging
## 25 — Android Build

Ziel: APK

Tasks:

Capacitor Setup
Android Projekt generieren
Build konfigurieren
##  26 — Lizenzsystem

Ziel: Monetarisierung

Tasks:

Key generieren
Backend Speicherung
Runtime Validierung
Ablaufdatum


## Priorität (kritisch)

Die wichtigsten Blöcke:

#4 Datenmodell
#8 Drag & Drop
#11 Actions
#20 Runtime Renderer
#12 Datenbank System
Fazit

Dieser Plan ist linear ausführbar und verhindert Chaos:

Erst Struktur
Dann Builder
Dann Logik
Dann Runtime
Dann Export

Ohne diese Reihenfolge:
→ System wird instabil und nicht erweiterbar
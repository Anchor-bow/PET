# PET Design-System

## Farben (PET-Programm)

| Rolle | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Hintergrund (`--bg`) | `#FFFFFF` | `#000000` |
| Panel/Sidebar (`--panel`) | `#F5F5F7` | `#0D0D0D` |
| Border (`--border`) | `#E5E7EB` | `#1F2937` |
| Primärtext (`--text`) | `#1A1A1A` | `#F3F4F6` |
| Sekundärtext (`--muted`) | `#6B7280` | `#9CA3AF` |
| Akzent (`--accent`) | `#F97316` | `#F97316` |
| Fehler (`--error`) | `#EF4444` | `#F87171` |

- Die Akzentfarbe Orange (`#F97316`) wird für Buttons, aktive Elemente, Feldumrandungen (focused) und Auswahl-Outlines verwendet.
- Die Farben gelten ausschließlich für das PET-Programm (Dashboard, Sidebar, Toolbar, Panels, Property Editor).
- **Building Blocks** (die Komponenten, die der User im Editor in seine App einbaut) erben den modernen Stil, aber ihre Farben werden später vom User pro App definiert.
- Schriftfarbe steht stets im Kontrast zur Hintergrundfarbe.

## Design-Stil

- **Modern & schlicht** — flache Designs, keine Schattenorgien, kein Skeuomorphismus
- **Abgerundete Ecken:**
  - Small: `4px` (Inputs, kleine Elemente)
  - Medium: `6px` (Buttons, Cards, Panel-Innenteile)
  - Large: `8px` (Panels, Sidebar, Dialoge)
  - XL: `10px` (Login-Form, Confirm-Dialog)
- **Einheitliches Spacing:** 4er-Raster (4, 8, 12, 16, 20, 24, 32px)
- **Grid-basierte Platzierung:** Felder und Buttons werden in Grids angeordnet (gleichmäßige Abstände, Ausrichtung), nicht „kreuz und quer"
- **Kein Windows-XP-Look:** Flache Borders, dezente Hover-States, klare Typografie
- **Fokus auf Lesbarkeit:** System-UI-Schrift, ausreichende Schriftgrößen (11–16px), Zeilenabstände, Kontraste

## Typografie

- Font: `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
- Monospace: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
- Schriftgrößen: 11px (Labels/Captions), 12px (Metadaten), 13px (Körper), 14px (Header), 16px+ (Titel)

## Theme-System

- **Standard:** Light Mode (hell)
- **Dark Mode:** über `data-theme="dark"` auf `<html>` — umschaltbar über einen Button in der Sidebar
- **Persistenz:** Die Theme-Einstellung wird in `localStorage` gespeichert
- **Auto-Detect:** Beim ersten Besuch wird `prefers-color-scheme` ausgewertet, falls keine gespeicherte Einstellung existiert

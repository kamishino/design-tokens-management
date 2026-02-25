# Project Context

> Current project state snapshot. Overwritten at the end of each session via `/sync`.

## Checkpoint — 13:49 2026-02-25

**Current task:** Option D — Complete (Phase A + C + B)
**Done so far:**

- **Studio UX (10 improvements):** Visual Lab button, Inspect banner, template tab bar, project separation, empty state, I shortcut; DirtyDot on Tuning tab; font sizes ≥10px, 60/30/10 bar labels, harmony hover preview
- **Option D Phase A:** Fixed silent 403 in `save-token` API (path.resolve guard); success/error toasts + inline error banner in TokenEditModal; useMemo→useEffect fix in StagingPanel
- **Option D Phase C:** `/api/export-figma` endpoint (W3C DTCG); FigmaExportPanel (download + copy); ExportModal two-tab layout (Tokens Studio / Figma Variables)
- **Option D Phase B:** InlineTokenEditor popover component; StudioView Inspect Mode click → shows editor anchored to clicked element

## Active Work

- **Last Completed Task:** Option D (A+C+B) — core workflow fixes + Figma export + click-to-edit
- **Current Release:** v0.4.0 "Studio Manager"
- **Project Phase:** Discovery → moving toward v0.5 "Figma-Ready"
- **Next Planned Task:** TBD — user may test Figma export flow or continue refining

## Recent Commits (This Session)

- `4d0637e` feat(ux): Option D — Token CRUD fix, Figma export, click-to-edit canvas
- `4aacb92` test: verify pre-commit hook works with .cjs
- `749d002` fix(hooks): remove stale sync-memory.js to prevent ESM/CJS error on commit
- `d32ce57` feat(studio): 10 UX improvements across Studio, Tuning, and Inspector

## Key Files Changed (This Session)

- `scripts/vite-plugin-sync-tokens.ts` — robust path resolution, /api/export-figma endpoint
- `src/components/explorer/TokenEditModal.tsx` — success/error toasts, inline error banner
- `src/components/workspace/StagingPanel.tsx` — useMemo→useEffect fix
- `src/components/export/ExportModal.tsx` — two-tab layout (Tokens Studio / Figma Variables)
- `src/components/export/FigmaExportPanel.tsx` — NEW: W3C DTCG export panel
- `src/components/studio/InlineTokenEditor.tsx` — NEW: click-to-edit token popover
- `src/components/studio/StudioView.tsx` — Inspect Mode click → InlineTokenEditor; 10 UX improvements

## Technical Debt

- TuningTab.tsx is ~1800 lines — extract ColorsTuning, TypographyTuning, ArticlePreview into separate files (priority when file gets harder to navigate)
- Global `--typography-line-height` in Type Scale section overlaps with per-role `--line-height-{role}` — consider consolidating
- InlineTokenEditor: currently uses `useEffect` for keydown but the handler captures stale `handleSave` — can be extracted to `useCallback` to be safe
- ExportModal: tab state resets on every open (could persist last active tab to localStorage)

## Open Questions

- Test Figma export → does the W3C DTCG JSON import correctly into Figma Variables plugin?
- InlineTokenEditor color swatch: consider adding a real color picker inline (currently just a swatch preview)
- Distribution Pipeline (Task 134): NPM publishing strategy TBD
- Font category filter for font picker (Serif/Sans/Mono/Display)?

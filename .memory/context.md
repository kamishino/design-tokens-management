# Project Context

> Current project state snapshot. Overwritten at the end of each session via `/sync`.

## Checkpoint — 17:05 2026-02-25

**Current task:** Typography Tuning Improvements + Performance Sweep (COMPLETE)
**Branch:** master (14 commits ahead of origin)

## Done This Session

- **Wave 1 — Panel Slide Animations:** CSS `width` transitions on sidebar+inspector instead of DOM unmount; ActivityBar+Sidebar unified into one animated container; `isResizingLeft/Right` flags to disable transition during drag (instant resize feel)
- **Wave 2 — 60fps Color Picker:** `useRafCallback` + `useDebounceCallback` hooks in `src/hooks/useRafCallback.ts`; rAF-throttled visual update + 80ms debounced state write in `StudioColorPicker`
- **Wave 3 — Lazy Modals:** `React.lazy` + `<Suspense>` for `TokenEditModal`, `ExportModal`, `CommandPalette`
- **TypographyTuning Overhaul:**
  - Fixed missing imports (`useState`, `useMemo`, `Popover`, `Portal`, `LuCheck`)
  - Type Scale table → 4-column layout: Role chip (h1→xs) | px | rem | Preview
  - `sampleText` state: global input updates all preview cells live
  - Scale Ratio: native `<select>` with 17 presets from `scale.json` + bidirectional sync with number input
- **ArticlePreview — Editable:** `EditableText` component with inline `contentEditable`; pencil icon on hover → commit/revert per text node
- **WorkspaceHeader — Full-Width 3-Zone:** `Left` (sidebar toggle + brand) | `Center` (project breadcrumb pill) | `Right` (Cmd+K + Export solid button + inspector toggle)
- **Bug Fixes:** Fixed `ColorScalePanel` import path (`tuning/` → `workspace/`); fixed `TypographyTuning` crash (`useState` not defined); fixed Type Scale `fontSize` template literal bug

## Recent Commits (This Session)

- `HEAD` feat(typography): editable article preview, scale ratio presets, full-width header
- `3bc94ee` fix(layout): unify ActivityBar+Sidebar into one animated container, fix resize lag
- `prev` perf: 3-wave performance sweep (Wave1+2+3)

## Key Files Changed (This Session)

- `src/components/workspace/WorkspaceLayout.tsx` — Wave 1 CSS animations, Wave 3 lazy modals, isResizing flags
- `src/components/workspace/WorkspaceHeader.tsx` — Full-width 3-zone layout
- `src/components/playground/panels/StudioColorPicker.tsx` — rAF + debounce
- `src/hooks/useRafCallback.ts` — NEW: useRafCallback + useDebounceCallback
- `src/components/tuning/TypographyTuning.tsx` — Major overhaul: SCALE_PRESETS, 4-col table, sampleText, missing imports
- `src/components/tuning/ArticlePreview.tsx` — Rewrote with EditableText component
- `src/components/tuning/ColorsTuning.tsx` — Fixed import path for ColorScalePanel
- `src/components/workspace/ColorScalePanel.tsx` — Correct location (was wrongly imported from tuning/)

## Technical Debt

- `TypographyTuning.tsx` memo comparator checks only `overrides` equality — `sampleText` state is local so fine, but `getEffectiveValue` changes won't re-render (acceptable for now)
- `ArticlePreview` content is local state only (resets on unmount) — could persist to localStorage
- `SCALE_PRESETS` is hardcoded mirror of `scale.json` — could auto-import JSON at build time via Vite `?raw` or a generated constant
- Global `--typography-line-height` overlaps per-role `--line-height-{role}` — consolidation pending

## Open Questions

- Font category filter for FontPickerRow (Serif / Sans / Mono / Display)?
- Test Figma export → does W3C DTCG JSON import correctly into Figma Variables plugin?
- ArticlePreview: persist edits to localStorage between sessions?
- SCALE_PRESETS: auto-import from `scale.json` via Vite JSON import?

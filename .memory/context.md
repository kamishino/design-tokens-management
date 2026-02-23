# Project Context

> Current project state snapshot. Overwritten at the end of each session via `/sync`.

## Checkpoint — 22:08 2026-02-23

**Current task:** Phase M2 — Per-role typography controls (typescale.com parity)
**Done so far:**

- Phase L: Smart Tips engine — extensible rule architecture, CSS variable mismatch fixes, Tips → own sub-tab
- Phase M: TypeScale Configurator — number inputs + preset chips for base size/ratio/line-height, ArticlePreview component, dual-view toggle (ladder/article)
- Phase M2: Per-role typography controls — weight/line-height/letter-spacing per font role (heading/body/code)
- Sidebar fix: treeview full width (removed hardcoded 260px)

## Active Work

- **Last Completed Task:** Phase M2 — Per-role typography controls
- **Current Release:** v0.4.0 "Studio Manager"
- **Project Phase:** Discovery
- **Current Focus:** Typography Tuning Enhancements
- **Next Planned Task:** TBD — user may continue refinements or start new feature

## Recent Commits (This Session)

- `3a7758f` fix: Smart Tips → own sub-tab + 3 CSS variable mismatches
- `18c69c5` fix: sidebar treeview full width
- `2416a29` feat(phase-m): typescale configurator with article preview
- `e9897fe` feat(m2): per-role typography controls (weight, line-height, letter-spacing)

## Key Files Changed

- `src/components/workspace/TuningTab.tsx` — 3 sub-tabs (Colors / Typography / Tips), per-role controls (weight/LH/LS), ArticlePreview, dual-view toggle (~1700 lines)
- `src/components/explorer/FileExplorer.tsx` — sidebar width fix (w="full")
- `src/utils/design-rules.ts` — 3 CSS variable mismatch fixes

## New CSS Variables (This Session)

- `--font-weight-{heading,body,code}` — defaults: 700/400/400
- `--line-height-{heading,body,code}` — defaults: 1.2/1.5/1.5
- `--letter-spacing-{heading,body,code}` — defaults: 0em

## Open Questions

- Distribution Pipeline (Task 134): NPM publishing strategy TBD.
- Type scale preview: custom text input support (typescale.com feature)?
- Font category filter for font picker (Serif/Sans/Mono/Display)?

## Technical Debt

- TuningTab.tsx is ~1700 lines — extract ColorsTuning, TypographyTuning, ArticlePreview into separate files.
- `useMemo` with side-effect (`setStaged`) in StagingPanel — should ideally be `useEffect`.
- Global `--typography-line-height` in Type Scale section overlaps with per-role `--line-height-{role}` — consider consolidating.

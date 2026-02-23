# Project Context

> Current project state snapshot. Overwritten at the end of each session via `/sync`.

## Checkpoint — 16:12 2026-02-23

**Current task:** UX Overhaul — Tuning Tab Pipeline (Phase C+D)
**Done so far:**

- Phase C (8 tasks): Scroll fix, CSS var key mapping, font picker (14 fonts), Studio Tools removal, git-style staging panel (StagingPanel.tsx), per-token discard, robust override display
- Phase D (6 tasks): CSS var normalization (5 templates + CSS injection), Exit Studio removal, AntiGravity IDE support, inline token value editing
  **About to do:** Session complete — all issues resolved
  **Rollback plan:** `git log --oneline -6` shows clean commit history, revert any commit with `git revert <hash>`

## Active Work

- **Last Completed Task:** Phase D — CSS var normalization + token editing + IDE
- **Current Release:** v0.4.0 "Studio Manager"
- **Project Phase:** Discovery
- **Current Focus:** Design System Automation — Tuning Pipeline
- **Next Planned Task:** Task 134 — Distribution Pipeline (NPM Publishing)

## Recent Commits (This Session)

- `d2e8f60` feat: CSS var normalization, inline token editing, Exit Studio removal, AntiGravity IDE (Phase D)
- `b8ef363` fix: StagingPanel shows all overrides without requiring token match (C8)
- `12ec817` feat: git-style staging panel with per-token checkboxes, visual diffs, discard (C5-C7)
- `fd9aea2` feat: font picker in Tuning tab + remove Studio Tools button (C3+C4)
- `0ea4ed6` fix: Design Studio scroll + CSS var key mapping for CommitCenter (C1+C2)

## Key Files Changed

- `src/components/workspace/StagingPanel.tsx` — NEW: git-style staging UI
- `src/components/workspace/TuningTab.tsx` — color pickers + font picker
- `src/components/workspace/InspectorPanel.tsx` — inline token editing
- `src/components/studio/templates/*.tsx` — CSS var normalization (5 files)
- `src/hooks/usePersistentPlayground.ts` — DISCARD_KEY + dash-case injection
- `src/hooks/useAppSettings.ts` — AntiGravity IDE added
- `src/components/studio/StudioView.tsx` — Exit Studio removed

## Open Questions

- Distribution Pipeline (Task 134): NPM publishing strategy and versioning scheme TBD.
- CSS Variable column in Token tab still shows camelCase (`--brandPrimary`) from parser — cosmetic only.
- Cross-file reference validation in Commit Center (backlogged).

## Technical Debt

- Token parser generates camelCase CSS variable names — could be normalized to dash-case for consistency.
- `useMemo` with side-effect (`setStaged`) in StagingPanel — works but should ideally be `useEffect`.
- StudioView lint: `refreshKey` unnecessary dependency in useMemo (line 112).

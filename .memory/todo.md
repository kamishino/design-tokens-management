# TODO Tracker

Last updated: 2026-02-27

## In Progress

- [ ] None.

## Pending

- [ ] None.

## Completed

- [x] Add global delete protection (`GLOBAL_DELETE_PROTECTED` + confirm flag).
- [x] Auto backup snapshots for writes/deletes under `tokens/global/**`.
- [x] Add restore latest API endpoint.
- [x] Add backup history drawer with restore-by-id.
- [x] Add current-file filter in backup history drawer.
- [x] Add automated tests for global-guard API routes (`history`, `restore`, `restore-latest`, protected delete).
- [x] Add UI-level test coverage for backup history drawer restore flow.
- [x] Block global token delete from UI actions (workspace + viewer).
- [x] Fix legacy TypeScript errors in docs/explorer/playground/studio/tuning components.
- [x] Confirm production build succeeds (`npm run build`).
- [x] Add Figma pre-export validator API (`/api/validate-figma-export`) with structured error/warning summary.
- [x] Add export-gating UI in Figma Export Panel: block on errors, allow explicit warning override.
- [x] Add backend + UI tests for Figma validator flow and warning proceed behavior.
- [x] Define rule source-of-truth in `AGENTS.md` (`.agent/config.json`, `.agent/rules`, `.agent/workflows`).
- [x] Enforce guardRail/workflow integrity and task artifact rule references in `scripts/task-closure-check.js`.
- [x] Align `.agent/workflows/kamiflow.md` with `.agent/rules/*` and require `npm run task:verify -- --task=<ID>` before closure.
- [x] Add guided intake workflow in Figma Export Panel (Validate → Review → Checklist → Export).
- [x] Re-validate export payload at action time to keep Figma JSON handoff deterministic.
- [x] Update Figma export panel tests for intake gating, checklist enforcement, and warning-confirmed copy flow.
- [x] Harden workflow policy alignment: explicit-request commit behavior across `AGENTS.md` and active workflow docs (Task 136).
- [x] Add `task:start` scaffolding and strict/compat task artifact verification upgrades in `scripts/task-start.js` and `scripts/task-closure-check.js` (Task 136).

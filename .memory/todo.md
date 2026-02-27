# TODO Tracker

Last updated: 2026-02-27

## In Progress

- [x] Resolve existing unrelated TypeScript build errors in legacy files.

## Pending

- [x] Verify `npm run build` passes after TypeScript cleanup.

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

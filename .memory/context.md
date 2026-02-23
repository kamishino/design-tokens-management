# Project Context

> Current project state snapshot. Overwritten at the end of each session via `/sync`.

## Active Work

- **Last Completed Task:** Task 133 — `fix-popover-container` (container ref for Popovers in Studio)
- **Current Release:** v0.4.0 "Studio Manager"
- **Project Phase:** Discovery
- **Current Focus:** Design System Automation
- **Next Planned Task:** Task 134 — Distribution Pipeline (NPM Publishing)

## Recent Changes

- **v0.4.0 (2026-02-13):** Integrated Token Management Overlay, stabilized UI components (Checkbox, Switch, Card), Visual Lab dashboard with expanded tools, Color Picker button-popover pattern, and Popover Z-Index fixes.
- **Task 133:** Fixed Popover Z-Index by using a dedicated Portal Container inside the Modal.
- **Task 132:** Forced Z-Index on Color Picker popover to override inline styles.
- **Task 131:** Resolved React key collision in Type Scale Selector by deduplicating ratio presets.
- **Tasks 125-130:** Visual Lab dashboard refactor, layout fixes, UX enhancements, and final polish.
- **Tasks 117-124:** Component Catalog crash fixes, Studio Tools menu, Visual Lab commit workflow, and Commit Center.

## Open Questions

- Distribution Pipeline (Task 134): NPM publishing strategy and versioning scheme TBD.
- Cross-file reference validation in Commit Center (backlogged).
- CI/CD Pipeline setup (backlogged).

## Technical Debt

- `.memory/` files were previously empty — now populated (2026-02-23).
- Large squashed commit `08c53fd` on master contains bulk of studio/playground work.
- Untracked `.agent/`, `.agents/`, `AGENTS.md`, `skills-lock.json` from KamiFlow agent setup need to be committed or gitignored.

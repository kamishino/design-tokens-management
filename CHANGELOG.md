# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-02-25

### ✨ Features

- **Editable Article Preview:** Added `EditableText` component for on-canvas editing in Typography tuning.
- **Scale Ratio Presets:** Integrated 17 musical scale ratios from `scale.json` with a native select dropdown and manual input syncing.
- **Figma Variables Export:** New `/api/export-figma` endpoint delivering W3C DTCG compliant JSON for Figma import.
- **UX Package (10+ improvements):** Added "Visual Lab" button, project-level filtering, Inspect mode banner, and 'I' shortcut.
- **Performance Sweep:**
  - **Wave 1:** CSS width transitions for panels (replacing unmounts) + cohesive sidebar animation.
  - **Wave 2:** 60fps color picker via `useRafCallback` and `useDebounceCallback`.
  - **Wave 3:** Lazy-loaded modals for faster initial load.
- **Workspace Layout:** Full-width header with 3-zone organization and resizable sidebars.
- **Interactive Editing:** Click-to-edit canvas tokens in Inspect Mode.

### 🐛 Bug Fixes

- Fixed panel resize lag by disabling transitions during drag.
- Resolved Typography Tuning crash caused by missing hook imports.
- Fixed 403 Forbidden error on token save by normalizing path resolution.
- Corrected sticky z-index and overflow issues in Studio view.

### 🔧 Maintenance

- Added APCA-W3 and culori for advanced color science.
- Standardized file explorer IDs with leading slashes for path consistency.
- Updated memory bank system for better context preservation.
- Cleaned up stale sync-memory scripts to prevent CJS/ESM conflicts.

---

## [0.4.0] - 2026-02-23

- Initial feature release.

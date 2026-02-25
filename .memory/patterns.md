# Code Patterns & Conventions

> Discovered patterns in this codebase. AI reads this to maintain consistency.

## Project Structure

- **Pattern:** Feature-first directory layout with small modules (<300 lines).
- **Example:** `src/features/studio/`, `src/features/token-viewer/`
- **When to use:** All new features get their own directory under `src/features/`.

- **Pattern:** KamiFlow task artifacts stored in `.kamiflow/tasks/` with ID-prefixed filenames.
- **Example:** `133-S1-IDEA-fix-popover-container.md`
- **When to use:** Every task generates S1-S4 artifacts (IDEA, SPEC, BUILD, HANDOFF).

- **Pattern:** Token JSON files organized in 3-level hierarchy: `tokens/global/`, `tokens/clients/{name}/`.
- **When to use:** Global primitives go in `global/`, brand-specific overrides in `clients/`.

## Naming Conventions

- **Pattern:** Task commits follow format: `{type}({scope}): {description} (Task {ID})`
- **Example:** `fix(studio): implement container ref for Popovers (Task 133)`
- **When to use:** Every task commit.

- **Pattern:** Token composite IDs use `[sourceFile]:[tokenPath]` format.
- **Example:** `/global/colors.json:color.primary.500`
- **When to use:** All internal token lookups and React keys.

- **Pattern:** File paths standardized to absolute format with leading `/`.
- **When to use:** All file explorer IDs, token source references, and path comparisons.

## Tech Stack

- **React 19** — Pure function components preferred over forwardRef.
- **Chakra UI v3** — Multi-part component pattern (`Card.Root`, `Checkbox.Root`, etc.). Never import bare `Card`, `Checkbox`.
- **Vite** — Dev server and bundling. Uses `import.meta.glob` for dynamic token discovery.
- **Zod** — Schema validation for token formats, manifests, and configurations.
- **Style Dictionary** — Token build pipeline (JSON → platform outputs).
- **Oklch** — Primary color space for all color operations, with sRGB gamut mapping.

## UI Patterns

- **Pattern:** Portal-based overlays for floating elements (Floating Lab, Popovers, Menus).
- **When to use:** Any element that must escape parent container clipping/overflow.

- **Pattern:** Button-Popover interaction for space-constrained tools (Color Pickers in dashboard).
- **When to use:** When inline controls are too large for the available layout.

- **Pattern:** React state-based hover management (not CSS `:hover` or `group-hover`).
- **Example:** Task 082 — deterministic state tracking for sidebar interactions.
- **When to use:** Any hover-triggered UI (menus, action buttons) where CSS pseudo-selectors are unreliable.

- **Pattern:** Singleton instance pattern for performance-critical UI (hover inspector, floating lab).
- **When to use:** Components that must remain unique and performant across the app.

- **Pattern:** Compact number input + preset chip row for bounded numeric controls.
- **Example:** Base Size (10-32px), Scale Ratio (1.0-2.0 + named presets), Line Height (1.0-2.5).
- **When to use:** When a control has both free-form numeric input AND common preset values.

- **Pattern:** Per-role typography card with inline controls (Weight chips, LH input, LS input).
- **Example:** Heading card: `[Font ▾] Weight:[700] LH:[1.2] LS:[0em]`
- **When to use:** Any font role that needs independent weight, line-height, and letter-spacing.

## API Patterns

- **Pattern:** Vite plugin middleware for local file I/O — all server-side token operations go through `configureServer` middlewares in `vite-plugin-sync-tokens.ts`.
- **When to use:** Any new backend operation (file read, file write, token aggregation). Add as a new `req.url === '/api/...'` branch.
- **Note:** Security guard: `path.resolve(target).startsWith(PROJECT_ROOT)` before any write.

- **Pattern:** Structured API errors `{ error: string, code: string }` from all API routes.
- **When to use:** All failure cases in Vite plugin middlewares must return JSON with `error` + `code` fields.

## Canvas Interaction Patterns

- **Pattern:** `getBoundingClientRect()` + fixed-position overlay anchored to DOM element.
- **Example:** `InlineTokenEditor` anchored to clicked `[data-tokens]` element in Inspect Mode.
- **When to use:** Any contextual popover that must appear adjacent to a specific element on the Studio canvas without escaping into a Portal.

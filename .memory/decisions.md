# Architectural Decisions

> Append-only log of significant decisions. AI reads this to understand project rationale.

## [2026-02-02] — SSOT Architecture with W3C Token Format

**Context:** Needed a canonical format for design tokens that bridges Figma, JSON, and frontend projects.
**Decision:** Adopted W3C Design Token Community Group format with Zod validation and a 3-level hierarchy (Global < Client < Project/Brand).
**Alternatives:** Custom proprietary format, Style Dictionary native format only.
**Consequences:** All tokens follow a standardized schema; enables multi-tenant support and automated builds.

## [2026-02-02] — React 19 + Chakra UI v3 + Vite Stack

**Context:** Needed a modern, performant UI framework for the token management dashboard.
**Decision:** React 19 with Chakra UI v3 (multi-part component pattern) and Vite for bundling.
**Alternatives:** Next.js (too heavy for a tool), plain CSS (too slow to build).
**Consequences:** Must use Chakra v3 multi-part patterns (e.g., `Card.Root`, not `Card`). `forwardRef` returns an object in React 19 — prefer pure function components.

## [2026-02-02] — Oklch Color Space as Primary Engine

**Context:** Needed perceptually uniform color manipulation for design tokens.
**Decision:** Oklch as the primary color space with sRGB gamut mapping and dual contrast validation (WCAG 2.1 + APCA).
**Alternatives:** HSL-only (not perceptually uniform), Lab (less intuitive for designers).
**Consequences:** All color operations go through Oklch; gamut mapping required for sRGB output.

## [2026-02-06] — Composite ID Format for Token Identity

**Context:** Tokens with the same name across different files caused key collisions.
**Decision:** Implemented globally unique composite ID format `[sourceFile]:[tokenPath]`.
**Alternatives:** UUID-based IDs (loses semantic meaning), file-only or path-only IDs (collision risk).
**Consequences:** All token lookups use composite IDs; file explorer and viewer must agree on path format.

## [2026-02-06] — Absolute Path Standardization (Leading `/`)

**Context:** File explorer IDs and loaded token IDs had a leading slash mismatch causing tokens to be invisible.
**Decision:** Standardized all file identifiers to absolute paths starting with `/`.
**Alternatives:** Relative paths (ambiguous), no leading slash (inconsistent with OS conventions).
**Consequences:** Fixed TokenViewer visibility; all path comparisons must use the standardized format.

## [2026-02-07] — Portal-Based Floating Lab

**Context:** Floating Lab was invisible due to parent container overflow/clipping styles.
**Decision:** Moved Floating Lab into a React Portal, ensuring viewport-fixed positioning.
**Alternatives:** Z-index hacks (fragile), restructuring DOM hierarchy (too invasive).
**Consequences:** Single global Floating Lab instance in App.tsx; restricted to Studio mode.

## [2026-02-13] — Button-Popover Pattern for Color Pickers

**Context:** Color pickers in Visual Lab dashboard consumed too much space.
**Decision:** Refactored to button-popover interaction pattern with dedicated Portal Container for Z-Index.
**Alternatives:** Inline pickers (too large), modal pickers (too disruptive).
**Consequences:** All color pickers in dashboard use this pattern; requires container ref for proper stacking.

## [2026-02-23] — VSCode-Style Independent Panel Toggles

**Context:** 3-mode layout cycle (Normal/Widget/Fullscreen) was unintuitive — users couldn't independently control sidebar and inspector.
**Decision:** Replaced with 2 independent toggle buttons (sidebar + inspector), grouped together at the right edge of the header, mimicking VSCode's panel toggle pattern.
**Alternatives:** 3-mode cycle (unintuitive), keyboard-only shortcuts (undiscoverable).
**Consequences:** 4 natural layout states from 2 toggles. More flexible and familiar for developer users.

## [2026-02-23] — 2-Tab Tuning Architecture (Colors / Typography)

**Context:** 3 sub-tabs (Colors/Typography/Harmony) diluted focus. Harmony Lab is color-related and belongs with Colors.
**Decision:** Merged Harmony Lab into Colors sub-tab. Reduced to 2 sub-tabs: Colors (semantic colors + 60/30/10 + Harmony Lab) and Typography (font picker + type scale + line-height).
**Alternatives:** 3 tabs (unfocused), single scrollable tab (too long ~1080 lines of content).
**Consequences:** Clearer mental model. TuningTab.tsx is large but each conditional section is self-contained.

## [2026-02-23] — typescale.com-Inspired Preview

**Context:** Type scale preview was a plain 3-column table (Step/Size/REM) — no visual feedback.
**Decision:** Replaced with labeled visual rows (h1→xs) showing live text at computed size, font family, and px/rem/lh metrics. Inspired by typescale.com.
**Alternatives:** Keep table (uninspiring), embed iframe (overcomplicated).
**Consequences:** Designers can see actual visual hierarchy at a glance; line-height control affects preview in real-time.

## [2026-02-23] — Smart Tips as Dedicated Sub-Tab

**Context:** SmartTipsPanel inside Colors sub-tab was cluttering the color controls.
**Decision:** Moved to its own "✨ Tips" sub-tab (3 tabs: Colors / Typography / Tips).
**Alternatives:** Collapsible section inside Colors (still crowded), floating panel (too disruptive).
**Consequences:** Cleaner Colors tab; Tips panel has full vertical space for suggestions.

## [2026-02-23] — Number Inputs + Preset Chips for TypeScale Controls

**Context:** Base Size slider, Scale Ratio preset list, and Line Height buttons were inconsistent and space-hungry.
**Decision:** Replaced with compact number inputs + preset chip rows. Added dual-view toggle (Scale Ladder / Article Preview).
**Alternatives:** Select dropdowns like typescale.com (less visual), keep sliders (imprecise).
**Consequences:** Consistent UX pattern across all 3 controls. Chips provide quick access, inputs allow precision.

## [2026-02-23] — Per-Role Typography Controls (typescale.com Parity)

**Context:** typescale.com gap analysis revealed missing Weight, Line Height, and Letter Spacing per font role.
**Decision:** Added 3 controls per font role card: weight chip selector (300-900), LH number input, LS number input (em). CSS vars: `--font-weight-{role}`, `--line-height-{role}`, `--letter-spacing-{role}`.
**Alternatives:** Shared controls only (less precise), full typescale.com clone (responsive breakpoints — overkill).
**Consequences:** ArticlePreview reflects per-role values. Heading defaults differ from body (weight 700 vs 400, LH 1.2 vs 1.5).

## [2026-02-25] — Path Resolve Security Guard for save-token API

**Context:** save-token API used a brittle substring check (`/tokens/`) causing silent 403 errors when sourceFile was formatted differently (e.g. Windows paths, no leading slash).
**Decision:** Replaced with `path.resolve()` + `normalized.startsWith(PROJECT_ROOT)` guard. Returns structured `{ error, code }` JSON on failure.
**Alternatives:** Stricter path normalization at write time (too fragile), no guard (security risk).
**Consequences:** All token files within project root are writable; cross-platform compatible. Broke the "silent failure" behavior — errors now surface.

## [2026-02-25] — InlineTokenEditor: Edit Tokens Directly on Studio Canvas

**Context:** Clicking a token element in Inspect Mode opened the full Visual Lab modal — too many steps for a simple value change.
**Decision:** Capture `getBoundingClientRect()` on click, render a small `InlineTokenEditor` popover anchored to the element. Applies live override immediately, persists via `/api/save-token`.
**Alternatives:** Open full modal (too heavy), edit only in Tuning panel (far from context).
**Consequences:** Designer never leaves canvas context. Works for any token type; color tokens show a swatch preview.

## [2026-02-25] — Figma Variables Export (W3C DTCG Format)

**Context:** Solo designer workflow needs tokens in Figma. Manual copy-paste was the only path.
**Decision:** Added `/api/export-figma` endpoint that walks all token JSON files and flattens to W3C DTCG flat format (`{ "brand.primary": { "$value": "#...", "$type": "color" } }`). Two delivery mechanisms: file download + clipboard copy.
**Alternatives:** Figma REST API push (requires OAuth setup — too heavy), Tokens Studio format only (already exists in Export modal).
**Consequences:** Designer can import directly into Figma Variables importer plugin. No API token needed.

## [2026-02-25] — Performance Sweep + Typography UI Architecture

**Context:** User reported lag in panel animations and color picker. Tuning tab crashed on Typography.

**Decisions:**

1. **CSS width transition vs DOM unmount** — Keep panels always mounted; `width: 0` + `overflow: hidden` + `will-change: width`. Smooth animation, preserves React state.
2. **Unified ActivityBar + Sidebar container** — Single outer `Box` animates as one unit. Was: 2 separate boxes with independent animations → visually disconnected.
3. **`isResizingLeft/Right` flags** — Set `transition: none` during drag so resize is instant; toggle animation only fires on show/hide.
4. **Native `<select>` for Scale Ratio dropdown** — Chakra `Box as="select"` conflicts type-system (`ChangeEvent<HTMLDivElement>`). Native element used directly.
5. **`sampleText` as local state** — Preview text in Type Scale table is UI-only, no persistence needed. Avoids prop drilling.
6. **`useArticleContent()` hook pattern** — Encapsulates all editable text state for ArticlePreview; component stays focused on JSX rendering.
7. **WorkspaceHeader 3-zone layout** — Left (toggle + brand) | Center (project pill, flex-centered) | Right (export + toggle). Matches VS Code / Figma layout convention.

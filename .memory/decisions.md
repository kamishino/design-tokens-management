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

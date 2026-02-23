# 🧠 MEMORY BANK: Design Token Manager

## 1. Project Identity

- **Goal:** Build a SSOT for Design Tokens. Figma (Native Variables + Tokens Studio) <--> JSON (SSOT) <--> Frontend Project. 3-Level Architecture: Projects/Brands < Clients < Global.
- **Current Phase:** Discovery
- **Key Tech:** NextJS (JavaScript), Chakra UI, Style Dictionary, Zod
- **Tour Completed:** true

## 2. Active Context (The "Now")

> **INTEGRATOR RULE:** Always update all 4 fields (Phase, Last Action, Focus, Next Step) during `/kamiflow:ops:sync`.

- **Last Completed Action:** Phase M2 — Per-role typography controls (Weight/LH/LS per font role)
- **Current Focus:** Typography Tuning Enhancements
- **Next Step:** Continue typography refinements or next feature
- **Session Commits (2026-02-23):**
  - `3a7758f` fix: Smart Tips → own sub-tab + 3 CSS variable mismatches
  - `18c69c5` fix: sidebar treeview full width
  - `2416a29` feat(phase-m): typescale configurator with article preview
  - `e9897fe` feat(m2): per-role typography controls (weight, line-height, letter-spacing)
- **New CSS Variables:**
  - `--font-weight-{heading,body,code}` (defaults: 700/400/400)
  - `--line-height-{heading,body,code}` (defaults: 1.2/1.5/1.5)
  - `--letter-spacing-{heading,body,code}` (defaults: 0em)

## 3. Knowledge Map (Directory Guide)

- **Overview:** `./docs/overview.md` (Start here)
- **Tasks:** `./.kamiflow/tasks/` (Centralized Artifacts: Briefs, PRDs, Tasks, Handoffs)
- **Blueprints:** System Architecture (./docs/architecture.md)
- **IDE Bridge:** `./.windsurf/` (Workflows & Rules for AI Editor)
- **Logs:** `./.kamiflow/handoff_logs/` (Lazy logs tagged with `_lazy`/`_superlazy`)

## 4. v2.0 Configuration

- **Validation Mode:** Enabled (3-Phase: Syntax → Functional → Traceability)
- **Checkpoint Retention:** 30 days
- **Error Recovery:** 3-Level (Self-Heal → Assist → Escalate)
- **Anti-Hallucination:** Phase 0.5 active (file/function verification)
- **Reflection Required:** Yes (Phase 4 quality gates)
- **Self-Healing Rate:** Target >80% for Level 1 errors
- **Validation Pass Rate:** Target >90% first-attempt success

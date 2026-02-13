# Project Context: GEMINI.md

## 1. Project Overview

- **Project Name:** Design Token Manager
- **Tech Stack:** React 19, Vite, Chakra UI v3, Style Dictionary, Zod

## 2. The "Indie Builder" Persona

- **Role:** Technical Co-Founder. Pragmatic, "Aesthetics + Utility".
- **Conversational Language:** English
- **Language Protocol (STRICT):**
  - **Conversational Response:** MUST be in {{CONVERSATIONAL_LANGUAGE}}. Use {{CONVERSATIONAL_LANGUAGE}} to explain, discuss, and confirm with the user.
  - **Artifacts (Code, Files, Docs, Logs):** MUST be in **English**.
  - **Technical Instructions:** Always in English for precision and global readability.
- **Tone:** Professional, direct, and concise.

## 3. Universal Coding Standards

- **Architecture:** Feature-first, Small Modules (<300 lines).
- **File Structure:** Check `PROJECT_CONTEXT.md` for key directory map.
- **Style:** Immutability, Zod Validation, Design Tokens.

## 🛑 Anti-Patterns & Recurring Mistakes

- **[Shell]:** Do NOT use Unix syntax (`&&`, `grep`, `rm -rf`) on win32. Use PowerShell equivalents (`;`, `Select-String`, `Remove-Item`).
- **[Example]:** Do not use `&&` in PowerShell commands.
- **[React/Chakra]:** Do NOT assume library exports (like `Card`) exist in pre-release versions (e.g., Chakra v3). Use primitives (`Box`) or check documentation for Multi-part patterns (`Card.Root`). (Learned 2026-02-13)
- **[React 19]:** `forwardRef` returns an object. If "Element type is invalid: got object" occurs, try reverting to a pure function component to rule out compatibility issues. (Learned 2026-02-13)
- **[Refactoring]:** When adding required props to a component, ALWAYS check and update all parent usages (e.g., `App.tsx`) immediately to prevent runtime crashes. (Learned 2026-02-13)
- **[Imports]:** Avoid `import { Component }` if `Component` is a Namespace. Use `<Component.Root>` instead of `<Component>` to avoid "got object" errors. (Learned 2026-02-13)

## 4. Workflow & Commands (The Kami Flow)

_The detailed logic for these commands is imported below._

### 🎯 The Sniper Model (3-Step Fused Kernel)

The core workflow uses 3 steps with 3-Layer Locks:

- `/kamiflow:core:idea` - Interactive refinement with 3 options (Step 1: The Critical Chef).
- `/kamiflow:core:spec` - Schema-First specification with Context Anchoring (Step 2: Lock 1 & 2).
- `/kamiflow:core:build` - Legacy-Aware task generation (Step 3: Lock 3).

**The 3-Layer Locks Architecture:**

- 🔒 **Lock 1 (Context Anchoring):** Forces reading `./.kamiflow/PROJECT_CONTEXT.md` and tech stack rules.
- 🔒 **Lock 2 (Schema-First):** Mandates Data Models before Logic in SPEC.
- 🔒 **Lock 3 (Legacy Awareness):** Requires codebase analysis before task creation.

### 🛡️ v2.0 Enhanced Protocols (Stability & Anti-Hallucination)

KamiFlow v2.0 introduces 5 critical enhancements for accuracy, stability, and resilience:

- **Phase 0.5: Assumption Verification** - Prevents hallucinations by verifying files/functions/dependencies BEFORE planning
- **Validation Loop (3-Phase)** - Syntax → Functional → Traceability with automatic self-healing (80% errors auto-fixed)
- **Strategic Reflection** - Quality gates + structured exit protocol in Phase 4 with tech debt assessment
- **Error Recovery (3-Level)** - Self-Healing (80%) → User Assist (15%) → Escalation (5%)
- **Progress Checkpoints** - Resume interrupted workflows without losing context (7 checkpoint locations)

**Key Enhancement Commands:**

- `/kamiflow:ops:resume [ID]` - Resume workflow from last checkpoint

### Bridge (Execution)

- `/kamiflow:core:bridge` - Pack context for IDE (Windsurf/Cursor).
- `/kamiflow:ops:sync` - Read IDE logs & update Context.

### 🚀 Auto-Pilot (Lazy Modes)

- `/kamiflow:dev:lazy` - Auto-generate all 4 Sniper artifacts (IDEA/SPEC/BUILD/HANDOFF) in one chain.
- `/kamiflow:dev:superlazy` - Auto-generate AND execute immediately.

### 🧠 Management

- `/kamiflow:ops:wake` - Reload project context (Session Recovery).
- `/kamiflow:ops:roadmap` - Sync `./.kamiflow/ROADMAP.md`.
- `/kamiflow:ops:save-context` - Save RAM to `./.kamiflow/PROJECT_CONTEXT.md`.

#### 📋 Quick Command Reference

<!-- KAMI_COMMAND_LIST_START -->

### 🎯 Sniper Model (Core Flow)

| Command                | Goal                                                                                                                    |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| `/kamiflow:core:idea`  | **[KamiFlow Sniper] Generate refined idea through diagnostic interview and synthesis (Step 1: Two-Phase Interactive).** |
| `/kamiflow:core:spec`  | **[KamiFlow Sniper] Create detailed specification with Schema-First approach (Step 2: Lock 1 & 2).**                    |
| `/kamiflow:core:build` | **[KamiFlow Sniper] Generate implementation task list with Legacy Awareness (Step 3: Lock 3).**                         |

### 🌉 The Bridge (IDE Integration)

| Command                 | Goal                                                                                          |
| :---------------------- | :-------------------------------------------------------------------------------------------- |
| `/kamiflow:core:bridge` | **[KamiFlow] Generate a 'Context Package' prompt for external AI Editors (Windsurf/Cursor).** |

### 🚀 Auto-Pilot (Automation)

| Command                     | Goal                                                                                                                               |
| :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `/kamiflow:dev:lazy`        | **[KamiFlow] Auto-generate S1-S4 artifacts using Sniper Model with mandatory Diagnostic Gate.**                                    |
| `/kamiflow:dev:superlazy`   | **[KamiFlow] Auto-generate S1-S4 artifacts AND execute with Strategic Reflection.**                                                |
| `/kamiflow:dev:release`     | **[KamiFlow] Smart Release Manager - Generate notes from ROADMAP, analyze git history, automate version bumping (v2.0 Enhanced).** |
| `/kamiflow:dev:upgrade`     | **[KamiFlow] Update KamiFlow to the latest version.**                                                                              |
| `/kamiflow:dev:archive`     | **[KamiFlow] Export task value to ROADMAP, then archive artifacts (v2.0 Enhanced - Intelligence Preservation).**                   |
| `/kamiflow:dev:revise`      | **[KamiFlow] Emergency Brake - Clarify context, resolve hallucinations, and question logic before implementation.**                |
| `/kamiflow:dev:saiyan`      | **[KamiFlow] Ultimate Automation - Auto-Select Option B + Auto-Execution.**                                                        |
| `/kamiflow:dev:supersaiyan` | **[KamiFlow] Meta-Automation - Manage cycles of Saiyan execution.**                                                                |

### 🧠 Management (Operations)

| Command                      | Goal                                                                                                                             |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `/kamiflow:ops:wake`         | **[KamiFlow] Wake up and reload project context to eliminate session amnesia.**                                                  |
| `/kamiflow:ops:help`         | **[KamiFlow] Interactive help system for commands and Sniper Model phases.**                                                     |
| `/kamiflow:ops:save-context` | **[KamiFlow] Export session intelligence to ./.kamiflow/PROJECT_CONTEXT.md for cross-machine context recovery (v2.0 Enhanced).** |
| `/kamiflow:ops:bootstrap`    | **[KamiFlow] Bootstrap KamiFlow in a project - creates a local .gemini/ configuration from the master template.**                |
| `/kamiflow:ops:doc-audit`    | **[KamiFlow] Intelligent Documentation Auditor - Scan and heal documentation rot.**                                              |

### 🧩 Agents (Plugin)

| Command                   | Goal                                                                            |
| :------------------------ | :------------------------------------------------------------------------------ |
| `/kamiflow:p-agents:add`  | **[Agent Hub] Safely audit and add a skill to your project agents.**            |
| `/kamiflow:p-agents:scan` | **[Agent Hub] Discover which AI agents are currently present in your project.** |

### 🧩 Market (Plugin)

| Command                          | Goal                                                                                                                                |
| :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `/kamiflow:p-market:research`    | **[Market Engine] Analyze project context and suggest 3-5 high-value feature requests with ROADMAP integration.**                   |
| `/kamiflow:p-market:inspire`     | **[Market Engine] Suggest one highly innovative but plausible feature that could be a game-changer for the current project stack.** |
| `/kamiflow:p-market:analyze-all` | **[Market Engine] Batch analyze all discovery ideas and auto-promote ready ones to backlog.**                                       |

### 🌱 The Seed Hub (Plugin)

| Command                    | Goal                                                                                |
| :------------------------- | :---------------------------------------------------------------------------------- |
| `/kamiflow:p-seed:draft`   | **[Seed Hub] Seed an idea with an Interactive Terminal Interview.**                 |
| `/kamiflow:p-seed:analyze` | **[Seed Hub] Deeply analyze an idea with Strategic Breakdown and Prepend History.** |
| `/kamiflow:p-seed:promote` | **[Seed Hub] Harvest an idea by moving it to the backlog (The Harvesting phase).**  |

### 🧩 Swarm (Plugin)

| Command                    | Goal                                                                 |
| :------------------------- | :------------------------------------------------------------------- |
| `/kamiflow:p-swarm:run`    | **[Swarm Engine] Dispatch multiple intents to parallel sub-agents.** |
| `/kamiflow:p-swarm:status` | **[Swarm Engine] Check active locks and swarm health.**              |

### 🖥️ Terminal CLI Guide (Flow Suite)

| Command                 | Goal                                       |
| :---------------------- | :----------------------------------------- |
| `kamiflow init-flow`    | **Initialize a project with KamiFlow.**    |
| `kamiflow doctor-flow`  | **Check project health.**                  |
| `kamiflow sync-flow`    | **Synchronize command documentation.**     |
| `kamiflow archive-flow` | **Archive completed tasks.**               |
| `kamiflow config-flow`  | **Manage persistent project settings.**    |
| `kamiflow update-flow`  | **Update KamiFlow to the latest version.** |
| `kamiflow info-flow`    | **Display core location and version.**     |
| `kamiflow resume-flow`  | **Resume workflow from last checkpoint.**  |

<!-- KAMI_COMMAND_LIST_END -->

---

# 📥 SYSTEM IMPORTS (Memory Bank)

@./.gemini/rules/main-manifesto-core.md
@./.gemini/rules/main-tech-stack-core.md
@./.gemini/rules/std-command-core.md
@./.gemini/rules/flow-factory-line-core.md
@./.gemini/rules/flow-execution-core.md
@./.gemini/rules/flow-bridge-core.md
@./.gemini/rules/flow-bootstrap-core.md
@./.gemini/rules/std-blueprint-core.md
@./.gemini/rules/std-id-core.md

# Enhanced Protocols (v2.0)

@./.gemini/rules/flow-validation-core.md
@./.gemini/rules/flow-reflection-core.md
@./.gemini/rules/std-anti-hallucination-core.md
@./.gemini/rules/std-error-recovery-core.md
@./.gemini/rules/flow-checkpoint-core.md

# Adaptive Workflow (v2.39)

@./.gemini/rules/flow-fast-track-core.md

# Project State

./.kamiflow/PROJECT_CONTEXT.md

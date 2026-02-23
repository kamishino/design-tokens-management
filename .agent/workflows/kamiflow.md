---
description: KamiFlow Sniper Model - Full idea-to-ship workflow (S1→S4→Validate→Reflect→Sync→Commit)
---

# KamiFlow Sniper Model Workflow

This workflow implements the KamiFlow Sniper Model for AntiGravity IDE — transforming a raw idea into deployed code through a structured pipeline.

> **Non-KamiFlow projects:** Use `/develop` instead — it's the portable version of this workflow
> without `.kamiflow/` dependencies.

## References

Read these KamiFlow rules before executing (they are already loaded as global rules):

- `.gemini/rules/flow-factory-line-core.md` — The Factory Line Protocol (S1→S3)
- `.gemini/rules/flow-execution-core.md` — Execute → Validate → Heal → Report
- `.gemini/rules/flow-validation-core.md` — 3-Phase Validation
- `.gemini/rules/flow-reflection-core.md` — Strategic Reflection + Quality Gate
- `.gemini/rules/flow-checkpoint-core.md` — Checkpoint Protocol
- `.kamiflow/PROJECT_CONTEXT.md` — Project state and active context

---

## 🔁 Phase 0: AUTO-WAKE — Session Context Restore

// turbo

> **This phase runs AUTOMATICALLY. Do not skip it.**

1. **Read all memory files** (silent):
   - `.memory/context.md` — current project state
   - `.memory/decisions.md` — last 5 decisions
   - `.memory/patterns.md` — established conventions
   - `.kamiflow/PROJECT_CONTEXT.md` — KamiFlow project state
   - `ROADMAP.md` — strategic direction

2. **Show session banner:**

   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔁 SESSION RESTORED
   📍 Last task:   [from context.md]
   ✅ Done:        [completed items]
   🔄 In progress: [started but not finished]
   ⏭  Next up:     [planned next]
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

3. **Fast Track Classification** — Evaluate the user's request against 5 criteria:
   - Single file affected?
   - < 50 lines of change?
   - No API/schema changes?
   - No security implications?
   - No cross-module dependencies?

   **Decision:**
   - 🟢 ALL 5 = YES → **Use `/quick-fix` workflow instead** (Fast Track)
   - 🟡 3-4 = YES → Standard Mode (full Sniper Model)
   - 🔴 0-2 = YES → Critical Mode (full ceremony + mandatory approval at each gate)

4. **Quick Health Check** (Optional but recommended):
   - Run `kamiflow dashboard` to see project health at a glance
   - Run `kamiflow hooks status` to verify git hooks are active
   - If this is a first session, suggest `kamiflow tour` for onboarding

---

## Phase 1: S1-IDEA (PLANNING Mode)

**Role:** Consultant & Critical Chef

5. **Diagnostic Interview (The Consultant)**
   - Analyze user request for ambiguity.
   - Ask 3-5 probing questions (Root Cause, User Benefit, Tech Constraints, Market Fit).
   - **STOP & WAIT** for user answers before proceeding definition.

6. **Synthesis Engine (The Chef)**

   **A. Historical Reference Check:**
   - Scan `PROJECT_CONTEXT.md` (Legacy Knowledge) and `archive/` for similar past tasks.
   - Synthesize findings into "Diagnostic Insights".

   **B. Generate 3 Refined Options:**
   - **Option A (Safe & Fast):** MVP-first, minimal complexity. **NO** "Could Have" features.
   - **Option B (Balanced):** Recommended trade-off. ⭐
   - **Option C (Ambitious):** Full-featured, higher complexity.

   **C. MoSCoW Classification:**
   - Classify _all_ features in _each_ option as **Must/Should/Could/Won't Have**.

   **D. Weighted Scoring Matrix (1-5⭐):**
   - **Market Pain:** +1 per "Must Have" (Max 5).
   - **Technical Feasibility:** Start 5. -1 per new lib/legacy touch/high complexity.
   - **Stack Alignment:** 5 if standard. -2 if new lang/framework.
   - **Profit Potential:** (Market Pain + Feasibility) / 2.

7. **🚦 STRATEGIC GATE — MANDATORY STOP**
   - Present the 3 Options with Scores and MoSCoW breakdown.
   - **WAIT for user to select an option (A/B/C)**.
   - Do NOT proceed until user explicitly approves.
   - Save as `S1-IDEA` artifact in `.kamiflow/tasks/` including the **Assumption Verification Report**.

---

## Phase 2: S2-SPEC (PLANNING Mode)

**Role:** Specification Architect
**Key Lock:** Schema-First (Lock 2: define data models BEFORE logic)

8. **Schema-First Design** — Define all data models, interfaces, schemas, and type definitions before any business logic.

9. **Technical Blueprint** — Document:
   - User Stories
   - API Signatures / Function Interfaces
   - Edge Cases and Error Handling
   - Integration Points

10. Save as `S2-SPEC` artifact in `.kamiflow/tasks/`.

---

## Phase 3: S3-BUILD (PLANNING Mode)

**Role:** Senior Tech Lead
**Key Lock:** Legacy Awareness (Lock 3: search codebase before making changes)

11. **Reconnaissance** — Search the codebase for existing files, functions, and patterns that relate to the planned changes. Log findings.

12. **Task Breakdown** — Create atomic, executable task list with:
    - Specific file paths and anchor points (function names, line numbers)
    - TDD strategy (write tests first for high-risk changes)
    - Dependency order

13. Save as `S3-BUILD` artifact in `.kamiflow/tasks/`.

14. **Present the BUILD plan to user for approval before executing.**

---

## Phase 4: Execute (EXECUTION Mode)

15. Implement code changes following the S3-BUILD plan task by task.

16. For high-risk changes: Write test FIRST, verify it FAILS, then implement the fix.

17. After each major subtask, run available validation:
    - TypeScript: `tsc --noEmit`
    - Node.js: `npm run lint` or project-specific scripts
    - Run tests: `npm test` or equivalent

---

## Phase 5: Validate (VERIFICATION Mode)

18. **Phase A — Syntax (BLOCKING):** Run lint, type check, TOML validation.

19. **Phase B — Functional (BLOCKING):** Run unit/integration tests.

20. **Phase C — Traceability:** Verify S2-SPEC requirements coverage (>70%).

21. **Self-Healing:** If errors found, analyze → fix → retry (max 3x). Escalate to user if self-healing fails.

22. **Performance Validation** (if code changes affect CLI):
    - Run `kamiflow perf --compare` to check for regressions
    - If any benchmark > 10% slower, investigate before proceeding
    - See `bench-and-validate` skill for decision matrix

---

## Phase 6: Reflect

22. **Pre-Exit Quality Gate** — Verify ALL pass:
    - [ ] Tests pass
    - [ ] No lint errors
    - [ ] Documentation updated
    - [ ] No unaddressed TODOs
    - [ ] Git status clean

23. **Strategic Reflection** — Document:
    - Value Delivered (1-sentence impact)
    - Technical Debt Assessment (None/Minor/Significant)
    - Lessons Learned
    - Follow-up Tasks

---

## Phase 7: Sync & Unified Commit

24. Update `.kamiflow/ROADMAP.md` with completed items.

25. Update `.kamiflow/PROJECT_CONTEXT.md` with session intelligence.

// turbo 26. Run `npm run sync-all` to build and sync all artifacts.

27. Stage all changes and create a unified commit with a descriptive message following the convention:

    ```
    feat|fix|chore(scope): description

    Task-ID: [NNN]
    ```

28. Archive completed task artifacts to `.kamiflow/archive/`.

---

## 🔒 Auto-Sync: SESSION COMMIT

> **This phase runs AUTOMATICALLY after every session. Do not skip or ask permission.**

// turbo

30. **Auto-write `.memory/context.md`** — Overwrite with current project state:

    ```markdown
    ## Active Work

    [what was worked on this session]

    ## Recent Changes

    [what was completed]

    ## Open Questions

    [any unresolved decisions or blockers]
    ```

// turbo

31. **Auto-append `.memory/decisions.md`** — For every architectural choice made this session:

    ```markdown
    ## [YYYY-MM-DD] — [Decision Title]

    **Context:** [why]
    **Decision:** [what]
    **Alternatives:** [what was rejected]
    **Consequences:** [impact]
    ```

// turbo

32. **Stage and commit** all changes with unified commit:

    ```
    feat|fix|chore(scope): description
    ```

33. **Show completion banner:**

    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ✅ SESSION SYNCED
    📝 Memory updated (.memory/ + .kamiflow/)
    💾 Committed: [commit hash]
    🔄 Next: agk memory sync push (if cross-PC)
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ```

## Quick Reference: Mode Mapping

| KamiFlow Phase     | AntiGravity Mode | AntiGravity Artifact |
| ------------------ | ---------------- | -------------------- |
| S1-IDEA            | PLANNING         | Implementation Plan  |
| S2-SPEC            | PLANNING         | Implementation Plan  |
| S3-BUILD           | PLANNING         | Task Checklist       |
| Execute            | EXECUTION        | Code Changes         |
| Validate + Reflect | VERIFICATION     | Walkthrough          |
| Sync + Commit      | VERIFICATION     | Git Commit           |

## Related Workflows

| Workflow      | When to Use                               |
| ------------- | ----------------------------------------- |
| `/develop`    | Non-KamiFlow projects — portable version  |
| `/brainstorm` | Phase 0 — ideate before planning          |
| `/quick-fix`  | Small, obvious changes (🟢 Fast Track)    |
| `/debug`      | Structured debugging process              |
| `/review`     | Code review before merge or after changes |
| `/release`    | Version bump and changelog generation     |
| `/sync`       | Update project context and unified commit |

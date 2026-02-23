---
description: Structured Development - Full idea-to-ship workflow with planning gates
---

# /develop — Structured Development Workflow

Transform a raw idea into deployed code through a rigorous, phase-based pipeline.

> **KamiFlow users:** Use `/kamiflow` instead — it's the KamiFlow-native version of this workflow
> with MoSCoW scoring, weighted matrix, and `.kamiflow/` integration.

**Intent triggers** — This workflow activates when you say things like:

- "Build a new feature for..."
- "Add [component] to the project"
- "I want to implement..."
- "Create a new module/page/API for..."

---

## 🔁 Phase 0: AUTO-WAKE — Session Context Restore

// turbo

> **This phase runs AUTOMATICALLY. Do not skip it.**

1. **Read all memory files** (silent, no user prompt needed):
   - `.memory/context.md` — current project state
   - `.memory/decisions.md` — last 5 decisions
   - `.memory/patterns.md` — established conventions
   - `.memory/anti-patterns.md` — mistakes to avoid

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

3. **Fast Track Check** — Evaluate against 5 criteria:

   | #   | Criteria                      | ✅/❌ |
   | --- | ----------------------------- | ----- |
   | 1   | Single file affected?         |       |
   | 2   | < 50 lines of change?         |       |
   | 3   | No API/schema changes?        |       |
   | 4   | No security implications?     |       |
   | 5   | No cross-module dependencies? |       |
   - 🟢 ALL 5 = YES → **Redirect to `/quick-fix`**
   - 🟡 3-4 = YES → Standard Mode (continue)
   - 🔴 0-2 = YES → Critical Mode (extra approval gates)

---

## Phase 1: Understand — _PLANNING mode_

4. **Diagnostic Interview (Socratic Dialogue)**
   - Analyze user request for ambiguity.
   - Ask 3-5 probing questions:
     - What is the root cause / motivation?
     - Who benefits and how?
     - What technical constraints exist?
     - Are there similar patterns already in the codebase?
   - **🛑 STOP & WAIT** for user answers before proceeding.

5. **Generate 3 Options**
   - Search codebase and `.memory/decisions.md` for precedent.
   - Present:
     - **Option A (Safe):** MVP-first, minimal risk.
     - **Option B (Balanced):** Recommended trade-off. ⭐
     - **Option C (Ambitious):** Full-featured, higher complexity.

   <details><summary>🏆 Golden Example — Options Format</summary>

   ```markdown
   ### Option A (Safe) — Direct Implementation

   Add the feature inline in the existing module. ~30 lines, no new files.

   - ✅ Fast: 1 hour
   - ⚠️ Risk: Module grows past 300 lines

   ### Option B (Balanced) ⭐ — Extract + Implement

   Extract shared logic into `lib/utils.js`, then build feature on top.

   - ✅ Clean: Follows existing patterns
   - ⚠️ Risk: 2-3 hours, needs tests for extracted module

   ### Option C (Ambitious) — Full Redesign

   Refactor the entire module into a plugin system, then add feature as plugin.

   - ✅ Future-proof: Scales to 10+ features
   - ⚠️ Risk: 1-2 days, may break existing consumers
   ```

   </details>

6. **🚦 STRATEGIC GATE — MANDATORY STOP**
   - Present options to user.
   - **WAIT for user to select (A/B/C)** before proceeding.
   - Create an `implementation_plan.md` artifact with the chosen approach.

---

## Phase 2: Specify — _PLANNING mode_

**Principle:** Schema-First — define data models BEFORE logic.

7. **Schema-First Design** — Define all data models, interfaces, types, and schemas first.

8. **Technical Blueprint** — Document in `implementation_plan.md`:
   - User Stories
   - API Signatures / Function Interfaces
   - Edge Cases & Error Handling
   - Integration Points

   <details><summary>🏆 Golden Example — Technical Blueprint</summary>

   ```markdown
   ## User Stories

   - As a developer, I want to run `agk stats` so I can see my project setup at a glance.

   ## API / Interfaces

   `async function run(projectDir: string): Promise<number>`

   - Returns: exit code (0 = success)
   - Side effects: prints dashboard to stdout

   ## Data Model

   stats = { agents: number, workflows: number, skills: number, suites: number }

   ## Edge Cases

   - No .agent/ directory → show "Run agk init first"
   - Empty suites.json → show 0, suggest `agk suggest suite`

   ## Integration Points

   - Reads: .agent/, .gemini/, .memory/, GEMINI.md, AGENTS.md
   - Depends on: fs-extra, chalk (existing deps)
   ```

   </details>

---

## Phase 3: Plan — _PLANNING mode_

**Principle:** Legacy Awareness — search codebase before making changes.

// turbo

9. **Reconnaissance** — Search codebase for existing files, functions, and patterns that relate to planned changes. Check `.memory/patterns.md` for project conventions.

10. **🏥 Code Health Pre-Check** — For each target file in the plan, assess AI-readiness:

- File size > 300 lines? → Flag for refactor-first
- Multiple responsibilities / mixed concerns? → Flag for split
- Deep nesting (> 3 levels)? → Flag for simplification
- High coupling to other modules? → Flag for careful testing
- If any file flagged → **recommend refactoring before implementing** and present to user

11. **Task Breakdown** — Create `task.md` artifact with atomic checklist:
    - Specific file paths and anchor points (function names, line ranges)
    - Dependency order (what must be built first)
    - Test strategy (write tests first for high-risk changes)

    <details><summary>🏆 Golden Example — task.md</summary>

    ```markdown
    # Add Stats Dashboard

    - [x] Create `scripts/stats.js` — scan .agent/, .gemini/, .memory/
    - [x] Wire into CLI router (`bin/index.js` — add "stats" case)
    - [x] Add visual bar charts for each metric
    - [x] Add status indicators (GEMINI.md, AGENTS.md, Brain)
    - [x] Add smart suggestions based on missing items
    - [ ] Run tests: `node --test`
    - [ ] Update CHANGELOG.md
    ```

    </details>

12. **🚦 GATE — Present plan to user for approval.**

---

## Phase 4: Execute — _EXECUTION mode_

13. Implement code changes following `task.md` checklist, task by task.
    - Mark items `[/]` when starting, `[x]` when complete.

14. For high-risk changes: Write test FIRST → verify it FAILS → then implement.

// turbo

15. After each subtask, run validation:
    - Lint / type check (e.g., `tsc --noEmit`, `npm run lint`)
    - Run tests (e.g., `npm test`)

---

## Phase 5: Validate — _VERIFICATION mode_

> **Critical:** Never mark a task done without running tests first.

// turbo

16. **Phase A — Syntax (BLOCKING):** Lint, type check, compile.
    - Node.js: `npm run lint` or `npx tsc --noEmit`
    - Python: `ruff check .` or `flake8`

// turbo

17. **Phase B — Functional (BLOCKING):** Run tests and verify output.
    - Auto-detect and run the project's test command:
      - `node --test` (Node.js native)
      - `npm test` (Jest/Vitest)
      - `pytest -v` (Python)
    - If tests fail → read error → fix → re-run (max 3 retries)
    - If tests pass → show count: "✅ X/X tests pass"
    - **Coverage check (if available):** run `npx c8 --check-coverage` or `pytest --cov`
      - Coverage must not decrease from baseline
      - New functions/modules must have corresponding tests

18. **Phase C — Traceability:** Verify requirements from Phase 2 are covered.

19. **Self-Healing:** If errors → analyze → fix → retry (max 3x). Escalate to user if healing fails.

20. **🔍 Fresh-Context Self-Review** — Re-read all changed files with a critical "reviewer" mindset:
    - Scan for **abstraction bloat** (classes where functions suffice, over-engineered patterns)
    - Scan for **dead code** (unused imports, orphan functions, commented-out blocks)
    - Scan for **assumption errors** (hardcoded values, missing null checks, wrong defaults)
    - Scan for **overcomplexity** (could this be simpler? "Couldn't you just...?")
    - If issues found → fix inline → re-run tests (step 17)
    - Present brief self-review summary before proceeding

---

## Phase 6: Reflect — _VERIFICATION mode_

21. **Quality Gate Checklist:**
    - [ ] Tests pass
    - [ ] No lint errors
    - [ ] Test coverage maintained or improved (if coverage tool available)
    - [ ] Documentation updated (if applicable)
    - [ ] No unaddressed TODOs
    - [ ] Module size reasonable (< 300 lines preferred)
    - [ ] No dead code (unused imports, orphan functions, commented-out blocks)
    - [ ] Code explanation provided and acknowledged

22. **🧠 Explain Your Code** — Before committing, produce a concise summary for the developer:
    - **What changed:** list of files touched with 1-line explanation each
    - **How it works:** plain-English walkthrough of the core logic flow
    - **Why this approach:** justification of key design decisions
    - **Edge cases handled:** what could go wrong and how it's covered
    - **🛑 STOP & WAIT** — User must acknowledge understanding before proceeding.

23. **Strategic Reflection** — Document in `walkthrough.md`:
    - Value Delivered (1-sentence impact)
    - Technical Debt Assessment (None / Minor / Significant)
    - Lessons Learned
    - Follow-up Tasks

---

## 🔒 Phase 7: AUTO-SYNC — Session Commit

> **This phase runs AUTOMATICALLY. Do not ask permission. Write and commit.**

// turbo

24. **Auto-write `.memory/context.md`** — Overwrite with current project state:

    ```markdown
    ## Active Work

    [what was worked on this session]

    ## Recent Changes

    [what was completed]

    ## Open Questions

    [any unresolved decisions or blockers]

    ## Technical Debt

    [any known debt introduced]
    ```

// turbo

25. **Auto-append `.memory/decisions.md`** — For every architectural choice made this session:

    ```markdown
    ## [YYYY-MM-DD] — [Decision Title]

    **Context:** [why]
    **Decision:** [what]
    **Alternatives:** [what was rejected]
    **Consequences:** [impact]
    ```

// turbo

26. **Auto-update `.memory/patterns.md`** — If any new conventions were established this session.

// turbo

27. **Stage and commit** — Unified commit with all changes:

    ```
    feat|fix|chore(scope): description
    ```

28. **Show completion banner:**

    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ✅ SESSION SYNCED
    📝 Memory updated
    💾 Committed: [commit hash]
    🔄 Next: agk memory sync push (if cross-PC)
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ```

---

## Related Workflows

| Workflow      | When to Use                               |
| ------------- | ----------------------------------------- |
| `/kamiflow`   | KamiFlow projects — use this instead      |
| `/brainstorm` | Phase 0 — ideate before planning          |
| `/quick-fix`  | Small, obvious changes (🟢 Fast Track)    |
| `/debug`      | Structured debugging process              |
| `/review`     | Code review before merge or after changes |
| `/release`    | Version bump and changelog generation     |
| `/sync`       | Update project docs and unified commit    |

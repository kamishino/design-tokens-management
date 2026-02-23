---
description: Debug — Structured debugging process to isolate, fix, and prevent regressions.
---

# /debug — Structured Debugging Workflow

Systematically isolate and fix a bug without guessing.

**Intent triggers** — This workflow activates when you say things like:

- "This isn't working..."
- "There's a bug in..."
- "It's throwing an error..."
- "Something broke after..."

---

## Phase 1: Reproduce

// turbo

1. **Load context** — Read `.memory/context.md` and `.memory/anti-patterns.md`.

2. **Confirm the failure** — Get the exact error:
   - What is the exact error message or unexpected behavior?
   - What are the exact steps to reproduce?
   - Does it happen every time, or intermittently?

3. **🛑 STOP & WAIT** — Do not guess or fix yet. Confirm reproduction first.

---

## Phase 2: Isolate

// turbo

4. **Narrow the blast radius** — Find the smallest failing case:
   - Which file/function is the entry point of the failure?
   - What changed recently? (`git log --oneline -10`)
   - Is it a regression? (`git bisect` if needed)

5. **Read the relevant code** — View the failing function and its callers.

---

## Phase 3: Hypothesize

6. **Generate 3 hypotheses** — List the most likely root causes, ranked by probability:

   | #   | Hypothesis | Likelihood |
   | :-- | :--------- | :--------- |
   | 1   | ...        | High       |
   | 2   | ...        | Medium     |
   | 3   | ...        | Low        |

7. **Test hypothesis #1 first** — Add a log, assertion, or minimal test to confirm/deny.
   - Confirmed → proceed to fix
   - Denied → test hypothesis #2

---

## Phase 4: Fix

8. **Implement the fix** — Minimal, targeted change. Do not refactor while fixing.

9. **Write a regression test** — Ensure this bug cannot silently return:
   - Unit test for the specific failure case
   - Or add to existing test suite

// turbo

10. **Verify fix** — Run lint + tests:
    ```
    npm run lint
    npm test
    ```

---

## Phase 5: Document

11. **Update `.memory/anti-patterns.md`** — Append the lesson learned:

    ```
    - **[Category]:** [What to avoid]. (Learned YYYY-MM-DD)
    ```

12. **Commit** with a descriptive message:
    ```
    fix(scope): description of what was broken and how it was fixed
    ```

---

## Related Workflows

| Workflow     | When to Use                                       |
| :----------- | :------------------------------------------------ |
| `/quick-fix` | If the fix is obvious and < 50 lines              |
| `/develop`   | If the fix requires a larger architectural change |
| `/review`    | After fixing — review the change before merging   |

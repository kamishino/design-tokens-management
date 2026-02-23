---
description: Eval — Self-assessment gate. AI evaluates its own output quality before marking any task complete.
---

# /eval — Self-Assessment Quality Gate

Force the AI to critically evaluate its own work before declaring it done. Catches hallucinations, gaps, and lazy shortcuts.

**Intent triggers** — This workflow activates when you say things like:

- "Before we wrap up..."
- "Is this actually done?"
- "Eval"
- "Check your own work"
- At the end of any `/develop` or `/kamiflow` session

---

## Phase 1: Re-read the Spec

// turbo

1. **Re-read the original request** — what did the user actually ask for?

2. **Re-read the implementation** — what was actually built?

3. **Spot the gap** — list any discrepancies:

   | Requested | Implemented | Gap   |
   | :-------- | :---------- | :---- |
   | ...       | ...         | ✅/❌ |

---

## Phase 2: Challenge Assumptions

4. **Ask 3 adversarial questions:**
   - "What could break in production that I didn't test?"
   - "What edge case did I assume away?"
   - "What would a senior engineer object to in this PR?"

5. **Rate the output honestly** (1–5):

   | Dimension    | Score | Reason                               |
   | :----------- | :---- | :----------------------------------- |
   | Correctness  | /5    | Does it do what was asked?           |
   | Completeness | /5    | Are there missing pieces?            |
   | Robustness   | /5    | Will it handle edge cases?           |
   | Clarity      | /5    | Is the code readable and documented? |

---

## Phase 3: Decision Gate

6. **If all scores ≥ 4:**

   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ EVAL PASSED
   Quality gate cleared — ready to ship.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

7. **If any score < 4 → Self-Correct:**
   - Identify the lowest-scoring dimension
   - Fix it before marking done
   - Re-run eval (max 2 retries)

8. **If score still < 4 after 2 retries → Escalate:**
   - Flag the gap explicitly to the user
   - Document it in `.memory/anti-patterns.md`
   - Ask: "This item needs your input before I can proceed."

---

## When to Use

| Scenario                                     | Action                          |
| :------------------------------------------- | :------------------------------ |
| End of any `/develop` or `/kamiflow` session | Auto-run eval before sync       |
| After a complex refactor                     | Manual `/eval`                  |
| Before a release                             | Run `/eval` on the new features |
| When something feels "off"                   | `/eval` to surface the issue    |

---

## Related Workflows

| Workflow  | When to Use                                  |
| :-------- | :------------------------------------------- |
| `/review` | Code review — external perspective, not self |
| `/debug`  | Something broke — find the root cause        |
| `/sync`   | After eval passes — commit and update memory |

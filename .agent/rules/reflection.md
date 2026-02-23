---
name: reflection
type: RULE
description: Pre-exit quality gate and strategic reflection
group: global
order: 80
---

# 🎯 Reflection Protocol

## 1. Pre-Exit Quality Gate

**MANDATORY — all must PASS before marking task complete:**

- [ ] Tests pass (unit / integration).
- [ ] No lint errors.
- [ ] Configuration validation clean.
- [ ] Documentation updated (if applicable).
- [ ] No unaddressed TODOs.
- [ ] Module size limit (< 300 lines per file).
- [ ] Git status clean (no uncommitted changes).

## 2. Strategic Reflection Template

After passing the quality gate, reflect on:

- **Value Delivered:** One-sentence impact summary.
- **Technical Debt:** Level (None / Minor / Significant) + payback plan.
- **Lessons Learned:** Key insights from this task.
- **Follow-up Tasks:** Dependencies or improvement opportunities.
- **Risk Assessment:** Regression risk level.

## 3. Memory Update

After reflection, persist intelligence:

- Append significant decisions to `.memory/decisions.md`.
- Update `.memory/context.md` with current project state.
- Update `.memory/patterns.md` if new conventions were established.

## 4. Execution Checklist

Quality Gate → Reflection → Memory Update → Commit.

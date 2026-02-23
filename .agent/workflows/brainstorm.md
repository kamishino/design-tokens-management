---
description: Phase 0 Brainstorm — Generate and rate ideas before planning. Use before /develop or /kamiflow.
---

# /brainstorm — Idea Generation Workflow

Transform a vague idea into a clear, rated shortlist ready for `/develop` or `/kamiflow`.

**Intent triggers** — This workflow activates when you say things like:

- "I have an idea for..."
- "What if we..."
- "I'm thinking about building..."
- "Help me think through..."

---

## Phase 1: Clarify (Diagnostic Interview)

// turbo

1. **Read context** — Load `.memory/context.md` and `.memory/patterns.md` to understand current project state and established conventions.

2. **Ask 3-5 clarifying questions** — Probe the problem space before generating ideas:
   - What problem does this solve? Who feels the pain?
   - What does success look like in 30 days?
   - What constraints exist? (time, tech stack, budget, team size)
   - Is there prior art or competition? What's different about your approach?
   - What would make you NOT build this? (identifies deal-breakers early)

3. **🛑 STOP & WAIT** for user answers before proceeding.

---

## Phase 2: Diverge (Idea Explosion)

Use 3 thinking modes to ensure diversity:

4. **Generate 7-10 ideas** across these lenses:

   **🟢 Safe bets (2-3 ideas)** — Proven patterns, low risk
   - Standard approaches others have validated
   - Incremental improvements on existing solutions

   **🟡 Lateral plays (2-3 ideas)** — Adjacent inspiration
   - Borrow patterns from other domains
   - Combine two unrelated concepts
   - "What if X but for Y?" format

   **🔴 Moonshots (2-3 ideas)** — Unconventional, high-upside
   - What would you build if you had unlimited time?
   - What's the opposite of the obvious solution?
   - What would a competitor never expect?

   For each idea, provide:
   - **Name** — memorable 2-3 word label
   - **Elevator pitch** — one sentence a non-technical person understands
   - **Core mechanic** — the key insight that makes it work
   - **Risk** — the single biggest reason this might fail

---

## Phase 3: Rate (Scoring Matrix)

5. **Score each idea** on three axes (1–5):

   | #   | Idea | Impact | Feasibility | Effort | Score | Verdict  |
   | :-- | :--- | :----- | :---------- | :----- | :---- | :------- |
   | 1   | ...  | /5     | /5          | /5     | /15   | 🟢/🟡/🔴 |
   - **Impact** — How much value does it deliver if it works? (1=nice-to-have, 5=game-changer)
   - **Feasibility** — Can you build it with current stack/time/skills? (1=major unknowns, 5=straightforward)
   - **Effort** — How long to reach MVP? (1=weeks, 5=hours)
   - **Score** — Sum of all three (max 15)
   - **Verdict** — 🟢 Go (12+), 🟡 Maybe (8-11), 🔴 Kill (<8)

6. **Kill switch** — Immediately discard any idea scoring below 8. Explain why in one line. This prevents wasting time debating weak ideas.

---

## Phase 4: Recommend (Final 3)

7. **Top 3 recommendations** — Present with reasoning:
   - 🥇 **Best bet** — highest Score, fits constraints, most likely to succeed
   - 🥈 **Dark horse** — lower Score but highest upside if key assumption holds
   - 🥉 **Quick win** — fastest to validate/ship, good for momentum

8. **Pre-mortem** — For the top pick, answer:
   - "If this fails in 30 days, the most likely reason is \_\_\_."
   - This surfaces hidden risks before committing.

9. **Hand off** — Ask user which to pursue, then:
   - Small/obvious → redirect to `/quick-fix`
   - Feature/complex → redirect to `/develop` or `/kamiflow`
   - More research needed → redirect to `/research`

---

## Quick Reference

```
/brainstorm "build a notification system"

Phase 1: Clarify       → 3-5 questions, STOP & WAIT
Phase 2: Diverge       → 7-10 ideas (Safe + Lateral + Moonshot)
Phase 3: Rate          → Impact × Feasibility × Effort, Kill < 8
Phase 4: Recommend     → Best bet / Dark horse / Quick win → handoff
```

---

## Related Workflows

| Workflow     | When to Use                                  |
| :----------- | :------------------------------------------- |
| `/research`  | Need more data before brainstorming          |
| `/develop`   | After brainstorm — full planning + execution |
| `/kamiflow`  | KamiFlow projects — full Sniper Model        |
| `/quick-fix` | If top idea is small and obvious             |

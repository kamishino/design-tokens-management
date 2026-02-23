---
description: Research - Structured research and exploration before coding decisions
---

# /research — Structured Research Workflow

Explore a topic, technology, or approach thoroughly before committing to implementation.

**Intent triggers** — This workflow activates when you say things like:

- "Research the best approach for..."
- "Compare X vs Y for our use case"
- "What are the options for implementing..."
- "Explore how to..."

---

## Steps

// turbo

1. **Context Load**
   - Read `.memory/context.md` to understand the current project state.
   - Read `.memory/patterns.md` to know established conventions.
   - Identify any existing code or decisions related to the research topic.

2. **Define the Research Question**
   - Clarify: What exactly are we trying to learn or decide?
   - Scope: What constraints exist (tech stack, budget, timeline)?
   - 🛑 STOP & WAIT for user confirmation of the research question.

// turbo

3. **Gather Information**
   - Search the web for current best practices, benchmarks, and documentation.
   - Check the existing codebase for related patterns.
   - Look at how similar projects solve this problem.

4. **Analysis & Comparison**
   - Create a comparison table with pros/cons for each option.
   - Rate each option against project constraints.
   - Identify risks and unknowns for each approach.

5. **Recommendation**
   - Present your top recommendation with clear reasoning.
   - Include a "Quick Start" snippet if the user wants to proceed immediately.
   - 🛑 STOP & WAIT for user decision.

// turbo

6. **Record Decision**
   - If user decides, append the decision to `.memory/decisions.md`.
   - Update `.memory/patterns.md` if a new convention was established.

---

## Related Workflows

| Next Step     | When                                                 |
| :------------ | :--------------------------------------------------- |
| `/develop`    | Ready to implement the researched approach           |
| `/brainstorm` | Need more creative exploration first                 |
| `/scaffold`   | Need to generate boilerplate for the chosen approach |

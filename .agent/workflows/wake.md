---
description: Wake up — Restore project context after a session break or PC switch. Read .memory/ and resume work.
---

# /wake — Context Restore Workflow

Rebuild full project context from `.memory/` files after a session break, PC switch, or long gap.

**Intent triggers** — This workflow activates when you say things like:

- "Wake up"
- "Where were we?"
- "I'm back, what's the status?"
- "Resume from last session"
- "I'm on a new machine"

---

## Phase 1: Load Memory

// turbo

1. **Read `.memory/context.md`** — Current project state, active task, last known position.

// turbo

2. **Read `.memory/decisions.md`** — Last 5 decisions made. Understand recent direction.

// turbo

3. **Read `.memory/patterns.md`** — Established conventions to follow.

// turbo

4. **Read `.memory/anti-patterns.md`** — Mistakes to avoid.

---

## Phase 2: Synthesize

5. **Produce a context summary** in this format:

   ```
   📍 Project:    [project name]
   🎯 Last task:  [what was being worked on]
   ✅ Done:       [what was completed]
   🔄 In progress:[what was started but not finished]
   ⏭  Next up:    [what was planned next]
   ⚠️  Watch out:  [any open risks or blockers]
   ```

---

## Phase 3: Resume

6. **Ask the user:**
   - "Continue with [last task]?"
   - "Or start something new?"

7. **Hand off** based on answer:
   - Continue → pick up from last checkpoint in `task.md` (if exists)
   - New task → redirect to `/brainstorm` or `/develop` or `/kamiflow`

---

## Notes

- If `.memory/` is empty or missing → suggest running `agk init` first.
- If on a new machine → remind user to `git pull` to get latest memory files.
- Memory is only as fresh as the last `/sync` commit — remind user to sync regularly.

---

## Related Workflows

| Workflow      | When to Use                                     |
| :------------ | :---------------------------------------------- |
| `/sync`       | End of session — update memory before switching |
| `/brainstorm` | Starting something new after waking up          |
| `/develop`    | Resuming a feature in progress                  |
| `/kamiflow`   | KamiFlow projects — full context restore        |

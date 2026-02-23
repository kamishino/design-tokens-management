---
description: Checkpoint — Quick mid-session save. Snapshot progress to .memory/ before a risky change or task switch.
---

# /checkpoint — Mid-Session Save

Save the current session state to `.memory/` without a full commit. Use before risky changes, long refactors, or switching context.

**Intent triggers** — This workflow activates when you say things like:

- "Save progress"
- "Checkpoint"
- "Before I do this risky thing..."
- "Let me save where we are"
- About to start a major refactor or delete files

---

## Phase 1: Snapshot

// turbo

1. **Write a checkpoint entry to `.memory/context.md`** — append a timestamped snapshot:

   ```markdown
   ## Checkpoint — [HH:MM YYYY-MM-DD]

   **Current task:** [what we're working on]
   **Done so far:** [completed items this session]
   **About to do:** [the next action / risky change]
   **Rollback plan:** [how to undo if it goes wrong]
   ```

---

## Phase 2: Verify

// turbo

2. **Quick git status check** — confirm uncommitted changes are either safe or staged:

   ```
   git status --short
   ```

3. **If there are important uncommitted changes**, suggest a quick WIP commit:

   ```
   git add -A && git commit -m "wip: checkpoint before [description]"
   ```

   > Ask user: "Stage a WIP commit? (y/N)"

---

## Phase 3: Confirm

4. **Show checkpoint banner:**

   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   💾 CHECKPOINT SAVED
   📍 [HH:MM] — [current task summary]
   🔄 Continuing: [next action]
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

5. **Continue immediately** — no ceremony, pick up exactly where you left off.

---

## When to Use

| Scenario                                         | Action              |
| :----------------------------------------------- | :------------------ |
| About to delete or restructure files             | `/checkpoint` first |
| About to do a risky migration                    | `/checkpoint` first |
| Switching from one task to another mid-session   | `/checkpoint`       |
| Long uninterrupted coding streak (every ~45 min) | `/checkpoint`       |

---

## Related Workflows

| Workflow   | When to Use                                    |
| :--------- | :--------------------------------------------- |
| `/compact` | Context is getting too long — compress + reset |
| `/sync`    | End of session — full commit + memory update   |
| `/debug`   | Something broke — structured debugging         |

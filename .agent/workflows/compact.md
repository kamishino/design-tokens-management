---
description: Compact — Compress and summarize long sessions to prevent context loss. Run when the conversation feels long or slow.
---

# /compact — Context Window Management

Compress the current session into a concise summary saved to `.memory/`, then prune stale context so the AI can continue working efficiently.

**Intent triggers** — This workflow activates when you say things like:

- "The session is getting long..."
- "You seem to be losing context"
- "Compact"
- "Summarize and continue"
- Before starting a new major task mid-session

---

## Phase 1: Capture

// turbo

1. **Summarize the current session** — produce a concise snapshot:

   ```
   📍 Task:         [what we were working on]
   ✅ Completed:    [list of done items]
   🔄 In Progress:  [what was started but not done]
   🔑 Key Decisions:[any architectural choices made]
   ⚠️  Blockers:    [anything unresolved]
   ⏭  Next Step:    [exactly what to do next]
   ```

---

## Phase 2: Persist

// turbo

2. **Overwrite `.memory/context.md`** with the summary above — this is the new "save point."

// turbo

3. **Append to `.memory/decisions.md`** — any decisions made in this session that aren't yet logged.

---

## Phase 3: Reset

4. **Announce the compact is done:**

   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🗜️  CONTEXT COMPACTED
   📝 Memory updated
   🧠 Pruning old context — continuing fresh
   ⏭  Resuming: [next step]
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

5. **Continue working** — pick up from "Next Step" without re-reading old conversation.

---

## When to Use

| Signal                                         | Action     |
| :--------------------------------------------- | :--------- |
| Responses getting slower or shorter            | `/compact` |
| AI seems to forget earlier context             | `/compact` |
| Switching to a completely new task mid-session | `/compact` |
| Session > 2 hours of active work               | `/compact` |

---

## Related Workflows

| Workflow      | When to Use                                |
| :------------ | :----------------------------------------- |
| `/checkpoint` | Quick save without compressing context     |
| `/wake`       | Restore context on new session / new PC    |
| `/sync`       | Full end-of-session commit + memory update |

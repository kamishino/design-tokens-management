---
description: Code Review - Structured review with anti-pattern detection and health check
---

# /review — Code Review Workflow

Examines recent changes for quality, anti-patterns, and project health.

**Intent triggers** — This workflow activates when you say things like:

- "Review my recent changes"
- "Check the code quality of..."
- "Is this implementation correct?"
- "Audit the last commit"
- "Do a code review before merge"

## When to Use

- After implementing a feature (self-review)
- After receiving changes from another developer
- Before merging a branch
- Periodic code health checks

---

## Steps — _VERIFICATION mode_

// turbo

1. **Load Memory** — Read `.memory/context.md`, `.memory/patterns.md`, and `.memory/anti-patterns.md`.

// turbo

2. **Get Changes:**

```
git diff --stat HEAD~1
git diff HEAD~1
```

Or for a specific range: `git diff <base>..<head>`

3. **Anti-Pattern Scan** — Check each changed file for:
   - [ ] No hardcoded absolute paths
   - [ ] No hallucinated file/function references (verify they exist)
   - [ ] Error handling present (try/catch, null checks)
   - [ ] No duplicate logic (check codebase for existing patterns)
   - [ ] Platform-compatible commands (PowerShell on Windows)
   - [ ] Known anti-patterns from `.memory/anti-patterns.md`

4. **Architecture Review:**
   - Does the change follow patterns in `.memory/patterns.md`?
   - Are new functions/modules properly exported?
   - Are new files in the correct directory?
   - Is naming consistent with project conventions?
   - Module size reasonable (< 300 lines)?\r\n - Test coverage maintained or improved? (if coverage tool available)

5. **🔍 Bloat & Dead Code Scan** — For each changed file, check for:
   - [ ] No unused imports / variables / functions
   - [ ] No classes that could be simple functions
   - [ ] No duplicated logic across files
   - [ ] No commented-out code blocks (> 3 lines)
   - [ ] Comments explain _why_, not _what_

// turbo

6. **Run Tests:**

```
npm test
```

7. **Generate Review Summary** — Present to user:

   ```markdown
   ## Code Review Summary

   **Files reviewed:** [count]
   **Lines changed:** +[added] / -[removed]
   **Overall verdict:** ✅ PASS / ⚠️ NEEDS CHANGES / ❌ FAIL

   ### Findings

   - 🟢 [What's good — patterns followed, clean code]
   - 🟡 [Suggestions — minor improvements, style]
   - 🔴 [Must-fix — bugs, anti-patterns, missing error handling]

   ### Action Items

   - [ ] [Required fix 1]
   - [ ] [Required fix 2]
   ```

8. **Memory Update** — If new anti-patterns found, append to `.memory/anti-patterns.md`.

9. Present review to user and wait for acknowledgment.

---
description: Quick Fix - Fast track for small, obvious changes (bypasses full workflow)
---

# /quick-fix — Fast Track Workflow

Streamlined workflow for small, safe changes that don't need full ceremony.

**Intent triggers** — This workflow activates when you say things like:

- "Fix this typo in..."
- "Update the config to..."
- "Change the color/text/label..."
- "Bump the dependency version"
- "Add a comment to..."

## When to Use

ALL 5 must be true:

- ✅ Single file affected
- ✅ < 50 lines of change
- ✅ No API/schema changes
- ✅ No security implications
- ✅ No cross-module dependencies

**If ANY fails** → Switch to `/develop` workflow.

---

## Steps

// turbo

1. **Load Memory** — Read `.memory/context.md` and `.memory/patterns.md`.

2. **Verify Fast Track** — Confirm ALL 5 criteria are met:
   - [ ] Single file
   - [ ] < 50 lines
   - [ ] No API/schema changes
   - [ ] No security implications
   - [ ] No cross-module deps

// turbo

3. **Reconnaissance** — Even for small changes, verify:
   - Target file/function exists
   - Check `.memory/patterns.md` for project conventions
   - Note any side effects

4. **Implement** — Make the change directly. No planning artifact needed.

// turbo

5. **Quick Validate:**

// turbo

5a. Run lint on changed files (if applicable).

// turbo

5b. Run tests (if test suite exists).

6. **Micro-Commit** — Stage and commit:

   ```
   fix|chore(scope): description
   ```

7. **Done** — No reflection phase needed for quick fixes.

---
name: error-recovery
type: RULE
description: Core classification and retry logic for error recovery
group: global
order: 120
---

# 🔧 Error Recovery Protocol

## 1. Error Classification (3-Level Model)

- **Level 1: Self-Healing** — Fixed automatically without user intervention.
- **Level 2: Guided Recovery** — Requires user decision between options.
- **Level 3: Escalation** — Requires workflow restart or rethinking approach.

## 2. Retry Logic

### Standard Pattern

`Attempt 1 → Analyze → IF Level 1 (Retry 3x) → IF Fail (Level 2) → IF Fail (Level 3)`

### Configuration

- **Max Retries:** Level 1 (3x), Level 2 (1x), Level 3 (0).
- **Strategy:** Linear backoff for fast operations; no backoff for user-facing errors.

## 3. User Communication

- **Level 1:** Silent or minimal notification.
- **Level 2:** Clear context + 2-3 options for the user to choose.
- **Level 3:** Comprehensive report + guidance for manual resolution.

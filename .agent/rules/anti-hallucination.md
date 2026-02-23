---
name: anti-hallucination
type: RULE
description: Core verification protocol to prevent AI hallucinations
group: global
order: 150
---

# 🛡️ Anti-Hallucination Protocol

## 1. Hallucination Patterns

- **Type 1: Ghost Files** — References non-existent files.
- **Type 2: Phantom Functions** — Invents function signatures or anchors.
- **Type 3: Phantom Deps** — Assumes uninstalled libraries.
- **Type 4: Phantom Config** — Invents configuration options or env vars.

## 2. Assumption Verification (Before Any Code Change)

- **Step 0: Memory Check** — Read `.memory/patterns.md` to verify assumptions about project conventions.
- **Step 1: File Verification** — Use `list_dir` / `read_file` to confirm file existence.
- **Step 2: Function Verification** — Use `grep_search` to confirm function signatures.
- **Step 3: Dependency Verification** — Check `package.json` / `requirements.txt` / equivalent.
- **Step 4: Config Verification** — Check config files for valid keys.

## 3. Continuous Verification

- **Pre-Edit Checklist:** Verify file → Read content → Identify anchor → Confirm via grep.
- **Build Plan Tasks:** Each task must include pre-task verification steps.

## 4. Detection & Self-Correction

- **Red Flags:** Citing line numbers without reading, referencing without `read_file`, citing unverified libraries.
- **Protocol:** PAUSE → Identify Assumption → Run Verification Tool → Correct or Report.

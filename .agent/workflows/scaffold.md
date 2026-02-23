---
description: Scaffold - Generate boilerplate and let AI fill in the details automatically, use /scaffold
---

# /scaffold — AI Boilerplate Generator

Automates the creation of AI Agents, Workflows, or Rules using the AGK CLI, then intelligently fills in the contents.

**Intent triggers** — This workflow activates when you say things like:

- "/scaffold an agent for Python Backend Developer"
- "/scaffold a new workflow for deploying to AWS"
- "Create a new agent named X that does Y using /scaffold"

---

## Steps

// turbo

1. **Information Gathering**
   - Identify what the user wants to scaffold (`agent`, `workflow`, or `rule`).
   - Identify the `name` of the item.
   - Identify the `description` or the purpose of the item.
   - If any of these are missing, ask the user to clarify.

// turbo

2. **Execute AGK Scaffold CLI**
   - Run the command: `agk scaffold <type> "<name>" "<description>"` in the terminal.
   - Wait for the CLI to output the path of the newly created file (e.g. `.agent/agents/python-developer.md`).

// turbo

3. **Read and Analyze Project Context**
   - Briefly read `.memory/context.md` to understand the project tech stack, conventions, and patterns.

4. **Intelligent Content Injection**
   - Read the newly generated `.md` file to see the boilerplate.
   - Using your intelligence as an AI Assistant, craft the perfect prompt/instructions/rules based on the user's description and the project context.
   - If it's an **Agent**: fill in the `triggers` and `owns` in the YAML frontmatter. Fill out the `# Identity`, `# Rules`, and `# Behavior` sections with detailed, actionable instructions.
   - If it's a **Workflow**: fill out logical steps with clear instructions, turbo annotations where safe, and conditions for when to use/skip steps.
   - If it's a **Rule**: write clear description, rationale, and provide Good/Bad code examples.
   - Write the completed content back to the file.

5. **Final Review**
   - Show the user the completed file and ask if they want any tweaks.

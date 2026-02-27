import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const configPath = path.join(projectRoot, ".agent", "config.json");
const tasksDir = path.join(projectRoot, ".kamiflow", "tasks");
const todoPath = path.join(projectRoot, ".memory", "todo.md");

function fail(message) {
  console.error(`x ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`ok ${message}`);
}

function getArg(name) {
  const prefix = `${name}=`;
  const arg = process.argv.find((entry) => entry.startsWith(prefix));
  if (!arg) return "";
  return arg.slice(prefix.length).trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readConfigGuardRails() {
  if (!fs.existsSync(configPath)) {
    fail("Missing .agent/config.json");
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    fail("Invalid JSON in .agent/config.json");
  }

  const guardRails = Array.isArray(config.guardRails) ? config.guardRails : [];
  if (guardRails.length === 0) {
    fail("No guardRails configured in .agent/config.json");
  }

  return guardRails;
}

function buildRulesApplied(guardRails) {
  return guardRails
    .map(
      (ruleFile) =>
        `- \`.agent/rules/${ruleFile}\`: Applied for this phase and updated with task-specific evidence.`,
    )
    .join("\n");
}

function ensureDirectory(dirPath, label) {
  if (!fs.existsSync(dirPath)) {
    fail(`Missing ${label}: ${dirPath}`);
  }
}

function getArtifacts(taskId, slug, title, rulesAppliedBlock) {
  const baseMeta = `**ID:** ${taskId}  \n**Type:**`;

  const s1 = `# IDEA: ${title}

${baseMeta} IDEA  \n**Slug:** ${slug}  \n**Status:** DRAFT

## Objective

## Constraints

## Risks

## Scope

- Must Have:
- Should Have:
- Could Have:
- Won't Have:

## Success Criteria

## Rules Applied

${rulesAppliedBlock}
`;

  const s2 = `# SPEC: ${title}

${baseMeta} SPEC  \n**Slug:** ${slug}  \n**Status:** DRAFT

## Implementation Plan

## Files Touched

## Test Plan

## Rollback Plan

## Risks

## Rules Applied

${rulesAppliedBlock}
`;

  const s3 = `# BUILD: ${title}

${baseMeta} BUILD  \n**Slug:** ${slug}  \n**Status:** DRAFT

## Task Breakdown

- [ ] Task 1:

## Validation Evidence

- Pending.

## Rules Applied

${rulesAppliedBlock}
`;

  const s4 = `# HANDOFF: ${title}

${baseMeta} HANDOFF  \n**Slug:** ${slug}  \n**Status:** DRAFT

## Delivered

## Files Changed

## Validation Evidence

## Commit Hash

- Pending (populate only when user explicitly requests commit).

## Remaining Open Items

- None.

## Residual Risk

- None.

## Rules Applied

${rulesAppliedBlock}
`;

  return [
    { fileName: `${taskId}-S1-IDEA-${slug}.md`, content: s1 },
    { fileName: `${taskId}-S2-SPEC-${slug}.md`, content: s2 },
    { fileName: `${taskId}-S3-BUILD-${slug}.md`, content: s3 },
    { fileName: `${taskId}-S4-HANDOFF-${slug}.md`, content: s4 },
  ];
}

function updateTodo(taskId, title) {
  ensureDirectory(path.dirname(todoPath), ".memory directory");

  if (!fs.existsSync(todoPath)) {
    fail("Missing .memory/todo.md");
  }

  let content = fs.readFileSync(todoPath, "utf8");
  const headers = ["## In Progress", "## Pending", "## Completed"];
  for (const header of headers) {
    if (!content.includes(header)) {
      fail(`Missing section in .memory/todo.md: ${header}`);
    }
  }

  const entry = `- [ ] Task ${taskId}: ${title}.`;
  const sectionPattern = new RegExp(
    `(## ${escapeRegExp("In Progress")}\\n\\n)([\\s\\S]*?)(\\n## ${escapeRegExp("Pending")})`,
  );

  if (!sectionPattern.test(content)) {
    fail("Could not parse 'In Progress' section in .memory/todo.md");
  }

  content = content.replace(sectionPattern, (_, start, body, end) => {
    const lines = body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => line !== "- [ ] None." && line !== "- [ ] None");

    if (!lines.includes(entry)) {
      lines.push(entry);
    }

    const newBody = lines.length > 0 ? `${lines.join("\n")}\n` : "- [ ] None.\n";
    return `${start}${newBody}${end}`;
  });

  const today = new Date().toISOString().slice(0, 10);
  content = content.replace(/Last updated:\s*\d{4}-\d{2}-\d{2}/, `Last updated: ${today}`);

  fs.writeFileSync(todoPath, content);
  ok("updated .memory/todo.md in-progress section");
}

function main() {
  const taskId = getArg("--task");
  const slugInput = getArg("--slug");
  const titleInput = getArg("--title");

  if (!taskId) {
    fail("Missing required argument: --task=<ID>");
  }
  if (!/^\d+$/.test(taskId)) {
    fail("Task ID must be numeric (example: --task=136)");
  }
  if (!slugInput && !titleInput) {
    fail("Provide at least one of --slug=<slug> or --title=<title>");
  }

  const slug = slugify(slugInput || titleInput);
  if (!slug) {
    fail("Could not derive a valid slug. Use letters, numbers, and dashes.");
  }

  const title = (titleInput || titleFromSlug(slug)).trim();
  if (!title) {
    fail("Could not derive a valid title.");
  }

  ensureDirectory(tasksDir, ".kamiflow/tasks directory");

  const guardRails = readConfigGuardRails();
  const rulesAppliedBlock = buildRulesApplied(guardRails);
  const artifacts = getArtifacts(taskId, slug, title, rulesAppliedBlock);

  for (const artifact of artifacts) {
    const fullPath = path.join(tasksDir, artifact.fileName);
    if (fs.existsSync(fullPath)) {
      fail(`Task artifact already exists: .kamiflow/tasks/${artifact.fileName}`);
    }
  }

  for (const artifact of artifacts) {
    const fullPath = path.join(tasksDir, artifact.fileName);
    fs.writeFileSync(fullPath, artifact.content);
    ok(`created .kamiflow/tasks/${artifact.fileName}`);
  }

  updateTodo(taskId, title);
  ok(`task scaffold complete for Task ${taskId}`);
}

main();

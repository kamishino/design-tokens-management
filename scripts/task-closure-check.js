import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const todoPath = path.join(projectRoot, ".memory", "todo.md");
const tasksDir = path.join(projectRoot, ".kamiflow", "tasks");
const agentsGuidePath = path.join(projectRoot, "AGENTS.md");
const agentConfigPath = path.join(projectRoot, ".agent", "config.json");
const rulesDir = path.join(projectRoot, ".agent", "rules");
const workflowsDir = path.join(projectRoot, ".agent", "workflows");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function warn(message) {
  console.warn(`! ${message}`);
}

function getTaskIdArg() {
  const taskFlag = process.argv.find((arg) => arg.startsWith("--task="));
  if (!taskFlag) return "";
  return taskFlag.split("=")[1]?.trim() ?? "";
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function isStrictMode(taskId) {
  if (hasFlag("--no-strict")) return false;
  if (hasFlag("--strict")) return true;
  return Boolean(taskId);
}

function validateTodoFile() {
  if (!fs.existsSync(todoPath)) {
    fail("Missing .memory/todo.md");
  }

  const content = fs.readFileSync(todoPath, "utf8");
  const requiredSections = ["## In Progress", "## Pending", "## Completed"];

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      fail(`Missing section in .memory/todo.md: ${section}`);
    }
  }

  ok("todo tracker exists and has required sections");
}

function parseAgentConfig() {
  if (!fs.existsSync(agentConfigPath)) {
    fail("Missing .agent/config.json");
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(agentConfigPath, "utf8"));
  } catch {
    fail("Invalid JSON in .agent/config.json");
  }

  const guardRails = Array.isArray(config.guardRails) ? config.guardRails : [];
  const workflows = Array.isArray(config.workflows) ? config.workflows : [];

  if (guardRails.length === 0) {
    fail("No guardRails configured in .agent/config.json");
  }

  if (!fs.existsSync(rulesDir)) {
    fail("Missing .agent/rules directory");
  }
  if (!fs.existsSync(workflowsDir)) {
    fail("Missing .agent/workflows directory");
  }

  for (const ruleFile of guardRails) {
    const rulePath = path.join(rulesDir, ruleFile);
    if (!fs.existsSync(rulePath)) {
      fail(`Configured guardRail is missing: .agent/rules/${ruleFile}`);
    }
  }

  for (const workflowFile of workflows) {
    const workflowPath = path.join(workflowsDir, workflowFile);
    if (!fs.existsSync(workflowPath)) {
      fail(`Configured workflow is missing: .agent/workflows/${workflowFile}`);
    }
  }

  ok("agent config guardRails/workflows are valid");
  return {
    guardRails,
    guardRailStems: guardRails.map((name) => name.replace(/\.md$/i, "")),
  };
}

function validateAgentsGuideMentionsRules() {
  if (!fs.existsSync(agentsGuidePath)) {
    fail("Missing AGENTS.md");
  }
  const content = fs.readFileSync(agentsGuidePath, "utf8");
  const requiredMarkers = [".agent/config.json", ".agent/rules", ".agent/workflows"];
  for (const marker of requiredMarkers) {
    if (!content.includes(marker)) {
      fail(`AGENTS.md must mention ${marker}`);
    }
  }
  ok("AGENTS.md references active rule sources");
}

function findTaskArtifactFile(files, phasePrefix) {
  const matches = files.filter((file) => file.startsWith(phasePrefix));
  if (matches.length === 0) return "";
  matches.sort((a, b) => a.localeCompare(b));
  return matches[matches.length - 1];
}

function assertSection(content, checks, sectionLabel, artifactName) {
  const passed = checks.some((check) => check.test(content));
  if (!passed) {
    fail(`Missing required section in ${artifactName}: ${sectionLabel}`);
  }
}

function validateRulesApplied(content, artifactName, guardRailStems, strictMode) {
  if (!content.includes("## Rules Applied")) {
    if (strictMode) {
      fail(
        `Task artifact missing required section '## Rules Applied': ${artifactName}`,
      );
    }
    warn(
      `Task artifact missing '## Rules Applied' in compat mode: ${artifactName}`,
    );
    return;
  }

  if (!strictMode) return;

  const lowered = content.toLowerCase();
  for (const stem of guardRailStems) {
    if (!lowered.includes(stem.toLowerCase())) {
      fail(
        `Task artifact ${artifactName} must reference guardRail: ${stem}`,
      );
    }
  }
}

function validateS1(content, artifactName) {
  assertSection(content, [/^##\s*(Goal|Objective)\b/im], "S1 objective", artifactName);
  assertSection(content, [/^##\s*Constraints\b/im], "S1 constraints", artifactName);
  assertSection(content, [/^##\s*Risks?\b/im], "S1 risks", artifactName);
  assertSection(
    content,
    [/^##\s*(Scope|MVP Scope)\b/im],
    "S1 scope",
    artifactName,
  );
  assertSection(
    content,
    [/^##\s*Success Criteria\b/im, /^##\s*Acceptance Criteria\b/im],
    "S1 success criteria",
    artifactName,
  );
}

function validateS2(content, artifactName) {
  assertSection(
    content,
    [/^##\s*(Implementation Plan|Technical Blueprint)\b/im],
    "S2 implementation plan",
    artifactName,
  );
  assertSection(
    content,
    [/^##\s*Files( Touched| Changed)?\b/im],
    "S2 files touched",
    artifactName,
  );
  assertSection(
    content,
    [/^##\s*Test Plan\b/im, /^##\s*Validation Plan\b/im],
    "S2 test plan",
    artifactName,
  );
  assertSection(content, [/^##\s*Rollback Plan\b/im], "S2 rollback plan", artifactName);
}

function validateS3(content, artifactName) {
  assertSection(
    content,
    [/^##\s*(Task Breakdown|Implementation Steps|Changes Implemented)\b/im],
    "S3 task breakdown",
    artifactName,
  );
  assertSection(
    content,
    [/^##\s*(Validation|Validation Evidence|Validation Results)\b/im],
    "S3 validation evidence",
    artifactName,
  );
}

function validateS4(content, artifactName) {
  assertSection(
    content,
    [/^##\s*(Delivered|What Shipped|Shipped)\b/im],
    "S4 delivered",
    artifactName,
  );
  assertSection(
    content,
    [/^##\s*Files( Changed| Touched)?\b/im],
    "S4 files changed",
    artifactName,
  );
  assertSection(
    content,
    [/^##\s*(Validation|Validation Evidence|Tests\/Build Results)\b/im],
    "S4 validation evidence",
    artifactName,
  );
  assertSection(
    content,
    [/^##\s*Commit Hash\b/im, /Commit:\s*`?[0-9a-f]{7,40}`?/im],
    "S4 commit hash",
    artifactName,
  );
  assertSection(
    content,
    [/^##\s*Remaining Open Items\b/im, /^##\s*Residual Risk\b/im],
    "S4 remaining open items or residual risk",
    artifactName,
  );
}

function validateStrictStructure(content, phase, artifactName) {
  if (phase === "S1") {
    validateS1(content, artifactName);
    return;
  }
  if (phase === "S2") {
    validateS2(content, artifactName);
    return;
  }
  if (phase === "S3") {
    validateS3(content, artifactName);
    return;
  }
  if (phase === "S4") {
    validateS4(content, artifactName);
  }
}

function validateTaskArtifacts(taskId, guardRailStems, strictMode) {
  if (!taskId) {
    ok("task artifact check skipped (no --task=ID provided)");
    return;
  }

  if (!fs.existsSync(tasksDir)) {
    fail("Missing .kamiflow/tasks directory");
  }

  const files = fs.readdirSync(tasksDir);
  const phaseDescriptors = [
    { phase: "S1", prefix: `${taskId}-S1-IDEA-` },
    { phase: "S2", prefix: `${taskId}-S2-SPEC-` },
    { phase: "S3", prefix: `${taskId}-S3-BUILD-` },
    { phase: "S4", prefix: `${taskId}-S4-HANDOFF-` },
  ];
  const artifacts = [];

  for (const descriptor of phaseDescriptors) {
    const artifactFile = findTaskArtifactFile(files, descriptor.prefix);
    if (!artifactFile) {
      fail(`Missing KamiFlow artifact for phase prefix: ${descriptor.prefix}`);
    }
    artifacts.push({
      phase: descriptor.phase,
      path: path.join(tasksDir, artifactFile),
    });
  }

  for (const artifact of artifacts) {
    const artifactPath = artifact.path;
    const artifactName = path.basename(artifactPath);
    const content = fs.readFileSync(artifactPath, "utf8");

    validateRulesApplied(content, artifactName, guardRailStems, strictMode);

    if (strictMode) {
      validateStrictStructure(content, artifact.phase, artifactName);
    }
  }

  if (strictMode) {
    const combined = artifacts
      .map((artifact) => fs.readFileSync(artifact.path, "utf8").toLowerCase())
      .join("\n");

    for (const stem of guardRailStems) {
      if (!combined.includes(stem.toLowerCase())) {
        fail(
          `Task artifacts for ${taskId} do not reference guardRail: ${stem}`,
        );
      }
    }
  }

  const strictLabel = strictMode ? "strict" : "compat";
  ok(`kamiflow artifacts found for task ${taskId} (${strictLabel} mode)`);
}

function main() {
  const taskId = getTaskIdArg();
  const strictMode = isStrictMode(taskId);
  validateTodoFile();
  const { guardRailStems } = parseAgentConfig();
  validateAgentsGuideMentionsRules();
  validateTaskArtifacts(taskId, guardRailStems, strictMode);
  ok("task closure checks passed");
}

main();

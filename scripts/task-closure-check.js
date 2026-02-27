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

function getTaskIdArg() {
  const taskFlag = process.argv.find((arg) => arg.startsWith("--task="));
  if (!taskFlag) return "";
  return taskFlag.split("=")[1]?.trim() ?? "";
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

function validateTaskArtifacts(taskId, guardRailStems) {
  if (!taskId) {
    ok("task artifact check skipped (no --task=ID provided)");
    return;
  }

  if (!fs.existsSync(tasksDir)) {
    fail("Missing .kamiflow/tasks directory");
  }

  const files = fs.readdirSync(tasksDir);
  const phasePrefixes = [
    `${taskId}-S1-IDEA-`,
    `${taskId}-S2-SPEC-`,
    `${taskId}-S3-BUILD-`,
    `${taskId}-S4-HANDOFF-`,
  ];
  const artifacts = [];

  for (const phasePrefix of phasePrefixes) {
    const artifactFile = findTaskArtifactFile(files, phasePrefix);
    if (!artifactFile) {
      fail(`Missing KamiFlow artifact for phase prefix: ${phasePrefix}`);
    }
    artifacts.push(path.join(tasksDir, artifactFile));
  }

  for (const artifactPath of artifacts) {
    const content = fs.readFileSync(artifactPath, "utf8");
    if (!content.includes("## Rules Applied")) {
      fail(
        `Task artifact missing required section '## Rules Applied': ${path.basename(artifactPath)}`,
      );
    }
  }

  const combined = artifacts
    .map((filePath) => fs.readFileSync(filePath, "utf8").toLowerCase())
    .join("\n");

  for (const stem of guardRailStems) {
    if (!combined.includes(stem.toLowerCase())) {
      fail(
        `Task artifacts for ${taskId} do not reference guardRail: ${stem}`,
      );
    }
  }

  ok(`kamiflow artifacts found for task ${taskId}`);
}

function main() {
  const taskId = getTaskIdArg();
  validateTodoFile();
  const { guardRailStems } = parseAgentConfig();
  validateAgentsGuideMentionsRules();
  validateTaskArtifacts(taskId, guardRailStems);
  ok("task closure checks passed");
}

main();

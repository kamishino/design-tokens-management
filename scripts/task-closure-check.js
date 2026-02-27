import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const todoPath = path.join(projectRoot, ".memory", "todo.md");
const tasksDir = path.join(projectRoot, ".kamiflow", "tasks");

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

function validateTaskArtifacts(taskId) {
  if (!taskId) {
    ok("task artifact check skipped (no --task=ID provided)");
    return;
  }

  if (!fs.existsSync(tasksDir)) {
    fail("Missing .kamiflow/tasks directory");
  }

  const files = fs.readdirSync(tasksDir);
  const requiredPhases = [
    `${taskId}-S1-IDEA-`,
    `${taskId}-S2-SPEC-`,
    `${taskId}-S3-BUILD-`,
    `${taskId}-S4-HANDOFF-`,
  ];

  for (const phasePrefix of requiredPhases) {
    const found = files.some((file) => file.startsWith(phasePrefix));
    if (!found) {
      fail(`Missing KamiFlow artifact for phase prefix: ${phasePrefix}`);
    }
  }

  ok(`kamiflow artifacts found for task ${taskId}`);
}

function main() {
  const taskId = getTaskIdArg();
  validateTodoFile();
  validateTaskArtifacts(taskId);
  ok("task closure checks passed");
}

main();

import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const tasksDir = path.join(projectRoot, ".kamiflow", "tasks");
const archiveDir = path.join(projectRoot, ".kamiflow", "archive");

function fail(message) {
  console.error(`x ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`ok ${message}`);
}

function getTaskIdArg() {
  const taskFlag = process.argv.find((arg) => arg.startsWith("--task="));
  if (!taskFlag) return "";
  return taskFlag.split("=")[1]?.trim() ?? "";
}

function findTaskArtifactFile(files, phasePrefix) {
  const matches = files.filter((file) => file.startsWith(phasePrefix));
  if (matches.length === 0) return "";
  matches.sort((a, b) => a.localeCompare(b));
  return matches[matches.length - 1];
}

function collectArtifacts(directoryPath, phaseDescriptors) {
  if (!fs.existsSync(directoryPath)) {
    return null;
  }

  const files = fs.readdirSync(directoryPath);
  const artifacts = [];

  for (const descriptor of phaseDescriptors) {
    const artifactFile = findTaskArtifactFile(files, descriptor.prefix);
    if (!artifactFile) {
      return null;
    }
    artifacts.push(path.join(directoryPath, artifactFile));
  }

  return artifacts;
}

function main() {
  const taskId = getTaskIdArg();
  if (!taskId) {
    fail("Missing required argument: --task=<ID>");
  }
  if (!/^\d+$/.test(taskId)) {
    fail("Task ID must be numeric (example: --task=139)");
  }

  const phaseDescriptors = [
    { phase: "S1", prefix: `${taskId}-S1-IDEA-` },
    { phase: "S2", prefix: `${taskId}-S2-SPEC-` },
    { phase: "S3", prefix: `${taskId}-S3-BUILD-` },
    { phase: "S4", prefix: `${taskId}-S4-HANDOFF-` },
  ];

  const taskArtifacts = collectArtifacts(tasksDir, phaseDescriptors);
  const archivedArtifacts = collectArtifacts(archiveDir, phaseDescriptors);

  if (!taskArtifacts && archivedArtifacts) {
    ok(`Task ${taskId} artifacts are already archived`);
    return;
  }

  if (!taskArtifacts) {
    fail(
      `Task ${taskId} artifacts were not found in .kamiflow/tasks (nothing to archive)`,
    );
  }

  if (archivedArtifacts) {
    fail(
      `Task ${taskId} artifacts exist in both .kamiflow/tasks and .kamiflow/archive`,
    );
  }

  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  for (const sourcePath of taskArtifacts) {
    const fileName = path.basename(sourcePath);
    const destinationPath = path.join(archiveDir, fileName);

    if (fs.existsSync(destinationPath)) {
      fail(`Archive destination already exists: .kamiflow/archive/${fileName}`);
    }
  }

  for (const sourcePath of taskArtifacts) {
    const fileName = path.basename(sourcePath);
    const destinationPath = path.join(archiveDir, fileName);
    fs.renameSync(sourcePath, destinationPath);
    ok(`archived .kamiflow/tasks/${fileName} -> .kamiflow/archive/${fileName}`);
  }

  ok(`Task ${taskId} archive complete (${taskArtifacts.length} artifacts)`);
}

main();

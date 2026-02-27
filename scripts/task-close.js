import { execSync } from "child_process";

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

function runStep(command, label) {
  console.log(`\n== ${label} ==`);
  try {
    execSync(command, { stdio: "inherit" });
  } catch {
    fail(`Step failed: ${label}`);
  }
}

function main() {
  const taskId = getTaskIdArg();
  if (!taskId) {
    fail("Missing required argument: --task=<ID>");
  }
  if (!/^\d+$/.test(taskId)) {
    fail("Task ID must be numeric (example: --task=139)");
  }

  runStep("npm run test", "Run tests");
  runStep("npm run build", "Run build");
  runStep(`npm run task:verify -- --task=${taskId}`, "Verify task artifacts");
  runStep(`npm run task:archive -- --task=${taskId}`, "Archive task artifacts");
  runStep(
    `npm run task:verify -- --task=${taskId}`,
    "Re-verify from archive location",
  );
  runStep("npm run task:verify", "Run baseline tracker verification");

  ok(`Task ${taskId} closed and archived successfully`);
}

main();

/**
 * Antigravity Kit - Memory Auto-sync Hook
 *
 * Runs before commit to remind the user to update memory
 * or automatically pushes memory if sync is configured.
 *
 * .cjs extension ensures CommonJS works even in ESM projects ("type": "module")
 */

const { execSync } = require("child_process");

try {
  const staged = execSync("git diff --cached --name-only", {
    encoding: "utf8",
  }).trim();
  if (!staged) process.exit(0);

  const files = staged.split("\n");
  const hasMemoryChanges = files.some((f) => f.startsWith(".memory/"));

  if (hasMemoryChanges) {
    console.log("\n\u{1F9E0} [AGK] Memory changes detected in commit.");
    // Let the commit proceed, they are part of it
  } else if (files.length > 5) {
    console.log("\n\u{1F9E0} [AGK] You are committing several files.");
    console.log(
      "   Tip: consider running /sync in Antigravity to update your .memory!\n",
    );
  }
} catch (e) {
  // ignore errors so we don't block the commit
}

process.exit(0);

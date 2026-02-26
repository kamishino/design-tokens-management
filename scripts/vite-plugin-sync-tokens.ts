import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

const PROJECT_ROOT = process.cwd();

/**
 * Resolves a targetPath (browser URL path or relative) to an absolute filesystem path,
 * ensuring it stays within the project root.
 *
 * sourceFile from tokens always comes as a browser URL path like:
 *   "/tokens/global/alias/colors.json"
 * On Windows, path.isAbsolute() returns true for these (drive-relative),
 * so we CANNOT use path.isAbsolute() here. Always treat as URL path.
 */
function resolveTokenPath(targetPath: string): string | null {
  if (!targetPath) return null;

  // Always strip leading slash (these are browser URL paths, not filesystem absolute paths)
  // "/tokens/global/alias/colors.json" -> "tokens/global/alias/colors.json"
  const relative = targetPath.replace(/^\//, "").replace(/\//g, path.sep);

  // Join with project root
  const absolutePath = path.join(PROJECT_ROOT, relative);

  // Security: resolved path must be inside the project root
  const normalized = path.resolve(absolutePath);
  if (!normalized.startsWith(PROJECT_ROOT)) {
    return null;
  }

  return normalized;
}

/**
 * Converts all token files under /tokens into W3C DTCG format for Figma import.
 */
function buildFigmaExport(): Record<
  string,
  { $value: unknown; $type: string; $description?: string }
> {
  const tokensDir = path.join(PROJECT_ROOT, "tokens");
  const result: Record<
    string,
    { $value: unknown; $type: string; $description?: string }
  > = {};

  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith(".json")) {
        try {
          const raw = JSON.parse(fs.readFileSync(fullPath, "utf8"));
          flattenTokens(raw, [], result);
        } catch {
          // Skip malformed files
        }
      }
    }
  }

  function flattenTokens(
    obj: Record<string, unknown>,
    path: string[],
    out: Record<
      string,
      { $value: unknown; $type: string; $description?: string }
    >,
  ) {
    for (const [key, val] of Object.entries(obj)) {
      const currentPath = [...path, key];
      if (
        val !== null &&
        typeof val === "object" &&
        "$value" in (val as object)
      ) {
        const token = val as {
          $value: unknown;
          $type?: string;
          $description?: string;
        };
        out[currentPath.join(".")] = {
          $value: token.$value,
          $type: token.$type || "other",
          ...(token.$description ? { $description: token.$description } : {}),
        };
      } else if (
        val !== null &&
        typeof val === "object" &&
        !Array.isArray(val)
      ) {
        flattenTokens(val as Record<string, unknown>, currentPath, out);
      }
    }
  }

  walkDir(tokensDir);
  return result;
}

/**
 * Enhanced Sync Plugin supporting universal file writing, deletion, and Figma export.
 * Security: All writes are restricted to paths within the project root.
 */
export function syncTokensPlugin(): Plugin {
  return {
    name: "vite-plugin-sync-tokens",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // ── Route: Save / Delete Token ──────────────────────────────────────
        if (req.url === "/api/save-token" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });

          req.on("end", async () => {
            try {
              const data = JSON.parse(body);
              const {
                targetPath,
                tokenPath,
                valueObj,
                action = "update",
              } = data;

              if (!targetPath) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                return res.end(
                  JSON.stringify({
                    error: "Missing targetPath",
                    code: "MISSING_PATH",
                  }),
                );
              }

              const absoluteFilePath = resolveTokenPath(targetPath);
              if (!absoluteFilePath) {
                res.statusCode = 403;
                res.setHeader("Content-Type", "application/json");
                return res.end(
                  JSON.stringify({
                    error: `Path "${targetPath}" resolves outside the project root. All token files must be within the project.`,
                    code: "PATH_TRAVERSAL",
                  }),
                );
              }

              const dir = path.dirname(absoluteFilePath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }

              let currentJson: Record<string, unknown> = {};
              if (fs.existsSync(absoluteFilePath)) {
                currentJson = JSON.parse(
                  fs.readFileSync(absoluteFilePath, "utf8"),
                );
              }

              // Navigate to the deep key path
              const keys = (tokenPath as string).split(".");
              let current = currentJson as Record<string, unknown>;

              keys.forEach((key: string, index: number) => {
                if (index === keys.length - 1) {
                  if (action === "delete") {
                    delete current[key];
                  } else {
                    current[key] = valueObj;
                  }
                } else {
                  if (!current[key] || typeof current[key] !== "object") {
                    current[key] = {};
                  }
                  current = current[key] as Record<string, unknown>;
                }
              });

              fs.writeFileSync(
                absoluteFilePath,
                JSON.stringify(currentJson, null, 2),
              );
              console.log(
                `💾 [CRUD] ${(action as string).toUpperCase()} "${tokenPath}" in ${absoluteFilePath}`,
              );

              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ success: true, path: absoluteFilePath }),
              );
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : "Unknown error";
              console.error("❌ Sync Error:", message);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: message, code: "INTERNAL_ERROR" }),
              );
            }
          });
        } else if (req.url === "/api/save-tuning" && req.method === "POST") {
          // ── Route: Save Tuning Overrides ──────────────────────────────────
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", async () => {
            try {
              /**
               * Expected body shape:
               * {
               *   entries: Array<{
               *     cssVar:      string;   // "--brand-primary"
               *     value:       string | number;
               *     tokenPath:   string;   // "brand.primary"
               *     file:        string;   // "/tokens/global/alias/colors.json"
               *   }>;
               * }
               */
              const { entries } = JSON.parse(body) as {
                entries: Array<{
                  cssVar: string;
                  value: string | number;
                  tokenPath: string;
                  file: string;
                  /** W3C DTCG $type — used when creating new nodes */
                  type?: string;
                }>;
              };

              if (!Array.isArray(entries) || entries.length === 0) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                return res.end(
                  JSON.stringify({
                    error: "entries must be a non-empty array",
                    code: "BAD_ENTRIES",
                  }),
                );
              }

              // Group entries by target file to minimise file reads
              const byFile = new Map<
                string,
                Array<{
                  tokenPath: string;
                  value: string | number;
                  type?: string;
                }>
              >();
              for (const entry of entries) {
                if (!entry.file || !entry.tokenPath) continue;
                if (!byFile.has(entry.file)) byFile.set(entry.file, []);
                byFile
                  .get(entry.file)!
                  .push({
                    tokenPath: entry.tokenPath,
                    value: entry.value,
                    type: entry.type,
                  });
              }

              const results: Array<{ file: string; saved: number }> = [];

              for (const [fileUrlPath, writes] of byFile.entries()) {
                const absoluteFilePath = resolveTokenPath(fileUrlPath);
                if (!absoluteFilePath) {
                  console.warn(
                    `⚠️  [TUNING] Skipping unsafe path: ${fileUrlPath}`,
                  );
                  continue;
                }

                // Read existing JSON (or start fresh)
                let currentJson: Record<string, unknown> = {};
                if (fs.existsSync(absoluteFilePath)) {
                  currentJson = JSON.parse(
                    fs.readFileSync(absoluteFilePath, "utf8"),
                  );
                } else {
                  // Ensure parent directory exists
                  const dir = path.dirname(absoluteFilePath);
                  if (!fs.existsSync(dir))
                    fs.mkdirSync(dir, { recursive: true });
                }

                // For each write, navigate the dot-path and set $value
                for (const { tokenPath, value, type } of writes) {
                  const keys = tokenPath.split(".");
                  let node = currentJson as Record<string, unknown>;
                  for (let i = 0; i < keys.length - 1; i++) {
                    const k = keys[i];
                    if (!node[k] || typeof node[k] !== "object") node[k] = {};
                    node = node[k] as Record<string, unknown>;
                  }
                  const leafKey = keys[keys.length - 1];
                  // If the leaf already has a $type-bearing object, only update $value
                  const existing = node[leafKey] as
                    | Record<string, unknown>
                    | undefined;
                  if (
                    existing &&
                    typeof existing === "object" &&
                    "$type" in existing
                  ) {
                    (existing as Record<string, unknown>)["$value"] = value;
                  } else {
                    // Create a new token node with the correct $type
                    node[leafKey] = { $value: value, $type: type ?? "color" };
                  }
                }

                fs.writeFileSync(
                  absoluteFilePath,
                  JSON.stringify(currentJson, null, 2),
                );
                console.log(
                  `💾 [TUNING] Saved ${writes.length} token(s) → ${absoluteFilePath}`,
                );
                results.push({ file: fileUrlPath, saved: writes.length });
              }

              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, results }));
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : "Unknown error";
              console.error("❌ [TUNING] Save error:", message);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: message, code: "INTERNAL_ERROR" }),
              );
            }
          });

          // ── Route: Figma Export ─────────────────────────────────────────────
        } else if (req.url === "/api/export-figma" && req.method === "GET") {
          try {
            const tokens = buildFigmaExport();
            const count = Object.keys(tokens).length;
            console.log(
              `📦 [FIGMA] Exporting ${count} tokens in W3C DTCG format`,
            );
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(tokens, null, 2));
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : "Unknown error";
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: message, code: "EXPORT_ERROR" }));
          }
        } else {
          next();
        }
      });
    },
  };
}

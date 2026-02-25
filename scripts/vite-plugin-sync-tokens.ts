import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

const PROJECT_ROOT = process.cwd();

/**
 * Resolves a targetPath (relative or absolute) to an absolute path,
 * ensuring it stays within the project root for security.
 */
function resolveTokenPath(targetPath: string): string | null {
  let absolutePath: string;

  if (path.isAbsolute(targetPath)) {
    absolutePath = targetPath;
  } else if (
    targetPath.startsWith("/tokens/") ||
    targetPath.startsWith("tokens/")
  ) {
    // Strip leading slash for path.join
    const relative = targetPath.replace(/^\//, "");
    absolutePath = path.join(PROJECT_ROOT, relative);
  } else {
    // Treat as relative to tokens/
    absolutePath = path.join(PROJECT_ROOT, "tokens", targetPath);
  }

  // Security guard: resolved path must be inside the project root
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

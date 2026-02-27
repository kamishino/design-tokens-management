import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

const PROJECT_ROOT = process.cwd();
const GLOBAL_TOKENS_ROOT = path.join(PROJECT_ROOT, "tokens", "global");
const GLOBAL_BACKUP_ROOT = path.join(PROJECT_ROOT, ".memory", "global-backups");
const GLOBAL_BACKUP_INDEX_PATH = path.join(GLOBAL_BACKUP_ROOT, "index.json");
const MANIFEST_FILE_PATH = path.join(
  PROJECT_ROOT,
  "public",
  "tokens",
  "manifest.json",
);
const MAX_GLOBAL_BACKUPS = 200;

type WorkspaceTemplate = "minimal" | "product-ui" | "editorial";

interface ApiErrorShape {
  statusCode: number;
  error: string;
  code: string;
}

interface WorkspaceManifestProject {
  name: string;
  client: string;
  project: string;
  path: string;
  files: string[];
  lastBuild: string;
  metadata?: Record<string, unknown>;
}

interface WorkspaceManifest {
  version: string;
  lastUpdated: string;
  clients?: Record<string, { id: string; name: string; [key: string]: unknown }>;
  projects: Record<string, WorkspaceManifestProject>;
}

interface GlobalBackupEntry {
  id: string;
  createdAt: string;
  sourcePath: string;
  backupPath: string;
  action: string;
  tokenPath?: string;
}

function normalizePathForCompare(filePath: string): string {
  return path.resolve(filePath).replace(/\\/g, "/").toLowerCase();
}

function isPathInsideRoot(rootPath: string, targetPath: string): boolean {
  const root = normalizePathForCompare(rootPath);
  const target = normalizePathForCompare(targetPath);
  return target === root || target.startsWith(`${root}/`);
}

function toProjectUrlPath(absolutePath: string): string {
  const rel = path.relative(PROJECT_ROOT, absolutePath).replace(/\\/g, "/");
  return `/${rel}`;
}

function isGlobalJsonPath(absolutePath: string): boolean {
  return (
    absolutePath.endsWith(".json") &&
    isPathInsideRoot(GLOBAL_TOKENS_ROOT, absolutePath)
  );
}

function readGlobalBackupIndex(): GlobalBackupEntry[] {
  if (!fs.existsSync(GLOBAL_BACKUP_INDEX_PATH)) return [];
  try {
    const raw = fs.readFileSync(GLOBAL_BACKUP_INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GlobalBackupEntry[]) : [];
  } catch {
    return [];
  }
}

function writeGlobalBackupIndex(entries: GlobalBackupEntry[]) {
  const trimmed = entries.slice(-MAX_GLOBAL_BACKUPS);
  const stale = entries.slice(0, -MAX_GLOBAL_BACKUPS);

  fs.mkdirSync(GLOBAL_BACKUP_ROOT, { recursive: true });
  fs.writeFileSync(GLOBAL_BACKUP_INDEX_PATH, JSON.stringify(trimmed, null, 2));

  // Opportunistic cleanup of stale backup files.
  for (const entry of stale) {
    const backupAbs = resolveTokenPath(entry.backupPath);
    if (
      backupAbs &&
      isPathInsideRoot(GLOBAL_BACKUP_ROOT, backupAbs) &&
      fs.existsSync(backupAbs)
    ) {
      try {
        fs.unlinkSync(backupAbs);
      } catch {
        // Ignore cleanup failures; they should not block write flows.
      }
    }
  }
}

function createGlobalBackup(
  absoluteFilePath: string,
  details: { action: string; tokenPath?: string },
): GlobalBackupEntry | null {
  if (!isGlobalJsonPath(absoluteFilePath)) return null;
  if (!fs.existsSync(absoluteFilePath)) return null;

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const backupFilePath = path.join(GLOBAL_BACKUP_ROOT, `${id}.json`);

  fs.mkdirSync(GLOBAL_BACKUP_ROOT, { recursive: true });
  fs.copyFileSync(absoluteFilePath, backupFilePath);

  const entry: GlobalBackupEntry = {
    id,
    createdAt: new Date().toISOString(),
    sourcePath: toProjectUrlPath(absoluteFilePath),
    backupPath: toProjectUrlPath(backupFilePath),
    action: details.action,
    ...(details.tokenPath ? { tokenPath: details.tokenPath } : {}),
  };

  const current = readGlobalBackupIndex();
  writeGlobalBackupIndex([...current, entry]);
  return entry;
}

function restoreGlobalBackupById(
  backupId: string,
): { restoredPath: string; entry: GlobalBackupEntry } | null {
  if (!backupId) return null;

  const entries = readGlobalBackupIndex();
  const entry = entries.find((item) => item.id === backupId);
  if (!entry) return null;

  const sourceAbs = resolveTokenPath(entry.sourcePath);
  const backupAbs = resolveTokenPath(entry.backupPath);

  if (!sourceAbs || !backupAbs) return null;
  if (!isGlobalJsonPath(sourceAbs)) return null;
  if (!isPathInsideRoot(GLOBAL_BACKUP_ROOT, backupAbs)) return null;
  if (!fs.existsSync(backupAbs)) return null;

  const sourceDir = path.dirname(sourceAbs);
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
  }

  fs.copyFileSync(backupAbs, sourceAbs);
  return { restoredPath: entry.sourcePath, entry };
}

function findLatestGlobalBackup(targetPath?: string): GlobalBackupEntry | null {
  const entries = readGlobalBackupIndex();
  if (entries.length === 0) return null;

  const normalizedTarget = targetPath?.replace(/\\/g, "/");
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (!normalizedTarget || entry.sourcePath === normalizedTarget) {
      return entry;
    }
  }

  return null;
}

function listGlobalBackups(params?: {
  targetPath?: string;
  limit?: number;
}): GlobalBackupEntry[] {
  const entries = readGlobalBackupIndex();
  const normalizedTarget = params?.targetPath?.replace(/\\/g, "/");
  const filtered = normalizedTarget
    ? entries.filter((entry) => entry.sourcePath === normalizedTarget)
    : entries;
  const safeLimit = Math.max(1, Math.min(200, params?.limit ?? 50));
  return filtered.slice(-safeLimit).reverse();
}

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

function isApiErrorShape(value: unknown): value is ApiErrorShape {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ApiErrorShape>;
  return (
    typeof candidate.statusCode === "number" &&
    typeof candidate.error === "string" &&
    typeof candidate.code === "string"
  );
}

function normalizeWorkspaceSegment(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toWorkspaceTemplate(value: unknown): WorkspaceTemplate {
  if (value === "minimal" || value === "product-ui" || value === "editorial") {
    return value;
  }
  return "product-ui";
}

function readWorkspaceManifest(): WorkspaceManifest {
  if (!fs.existsSync(MANIFEST_FILE_PATH)) {
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      projects: {},
    };
  }

  try {
    const raw = fs.readFileSync(MANIFEST_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<WorkspaceManifest>;
    return {
      version:
        typeof parsed.version === "string" && parsed.version.trim()
          ? parsed.version
          : "1.0.0",
      lastUpdated:
        typeof parsed.lastUpdated === "string" && parsed.lastUpdated.trim()
          ? parsed.lastUpdated
          : new Date().toISOString(),
      clients:
        parsed.clients && typeof parsed.clients === "object"
          ? parsed.clients
          : undefined,
      projects:
        parsed.projects && typeof parsed.projects === "object"
          ? parsed.projects
          : {},
    };
  } catch {
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      projects: {},
    };
  }
}

function writeWorkspaceManifest(manifest: WorkspaceManifest) {
  const dir = path.dirname(MANIFEST_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(MANIFEST_FILE_PATH, JSON.stringify(manifest, null, 2));
}

function getTemplateSeed(template: WorkspaceTemplate): {
  theme: Record<string, unknown>;
  files: Record<string, Record<string, unknown>>;
} {
  if (template === "minimal") {
    return {
      theme: {
        brand: {
          primary: { $value: "#2563eb", $type: "color" },
          secondary: { $value: "#0f172a", $type: "color" },
        },
      },
      files: {
        "colors.json": {
          color: {
            brand: {
              primary: { $value: "{brand.primary}", $type: "color" },
              secondary: { $value: "{brand.secondary}", $type: "color" },
            },
            surface: {
              canvas: { $value: "#ffffff", $type: "color" },
              subtle: { $value: "#f8fafc", $type: "color" },
            },
            text: {
              default: { $value: "#0f172a", $type: "color" },
              muted: { $value: "#475569", $type: "color" },
            },
          },
        },
      },
    };
  }

  if (template === "editorial") {
    return {
      theme: {
        brand: {
          primary: { $value: "#7c3aed", $type: "color" },
          secondary: { $value: "#1f2937", $type: "color" },
        },
      },
      files: {
        "colors.json": {
          color: {
            brand: {
              primary: { $value: "{brand.primary}", $type: "color" },
              secondary: { $value: "{brand.secondary}", $type: "color" },
            },
            text: {
              headline: { $value: "#111827", $type: "color" },
              body: { $value: "#374151", $type: "color" },
              caption: { $value: "#6b7280", $type: "color" },
            },
            surface: {
              article: { $value: "#ffffff", $type: "color" },
              rail: { $value: "#f3f4f6", $type: "color" },
            },
          },
        },
        "typography.json": {
          typography: {
            heading: {
              h1: { $value: "48", $type: "fontSizes" },
              h2: { $value: "36", $type: "fontSizes" },
              h3: { $value: "28", $type: "fontSizes" },
            },
            body: {
              base: { $value: "18", $type: "fontSizes" },
              small: { $value: "15", $type: "fontSizes" },
            },
          },
        },
      },
    };
  }

  return {
    theme: {
      brand: {
        primary: { $value: "#2563eb", $type: "color" },
        secondary: { $value: "#4f46e5", $type: "color" },
      },
    },
    files: {
      "colors.json": {
        color: {
          brand: {
            primary: { $value: "{brand.primary}", $type: "color" },
            secondary: { $value: "{brand.secondary}", $type: "color" },
          },
          action: {
            primary: { $value: "{color.brand.primary}", $type: "color" },
            critical: { $value: "#dc2626", $type: "color" },
          },
          text: {
            default: { $value: "#111827", $type: "color" },
            subtle: { $value: "#6b7280", $type: "color" },
          },
          background: {
            canvas: { $value: "#f8fafc", $type: "color" },
            surface: { $value: "#ffffff", $type: "color" },
          },
        },
      },
      "typography.json": {
        typography: {
          font: {
            family: {
              heading: { $value: "Inter", $type: "fontFamilies" },
              body: { $value: "Inter", $type: "fontFamilies" },
            },
            weight: {
              regular: { $value: "400", $type: "fontWeights" },
              medium: { $value: "500", $type: "fontWeights" },
              bold: { $value: "700", $type: "fontWeights" },
            },
          },
          size: {
            body: { $value: "16", $type: "fontSizes" },
            title: { $value: "24", $type: "fontSizes" },
          },
        },
      },
      "spacing.json": {
        spacing: {
          xs: { $value: "4", $type: "spacing" },
          sm: { $value: "8", $type: "spacing" },
          md: { $value: "16", $type: "spacing" },
          lg: { $value: "24", $type: "spacing" },
          xl: { $value: "32", $type: "spacing" },
        },
      },
    },
  };
}

function createWorkspaceProject(params: {
  clientId: string;
  brandId: string;
  projectId: string;
  template: WorkspaceTemplate;
}): { projectKey: string; createdFiles: string[] } {
  const { clientId, brandId, projectId, template } = params;
  const projectKey = `${clientId}/${projectId}`;
  const manifest = readWorkspaceManifest();

  if (manifest.projects[projectKey]) {
    throw {
      statusCode: 409,
      error: `Project "${projectKey}" already exists in manifest`,
      code: "PROJECT_EXISTS",
    } satisfies ApiErrorShape;
  }

  const clientRoot = path.join(PROJECT_ROOT, "tokens", "clients", clientId);
  const projectsRoot = path.join(clientRoot, "projects");
  const projectRoot = path.join(projectsRoot, projectId);

  if (!isPathInsideRoot(PROJECT_ROOT, clientRoot)) {
    throw {
      statusCode: 403,
      error: "Computed client path is outside project root",
      code: "PATH_TRAVERSAL",
    } satisfies ApiErrorShape;
  }

  if (fs.existsSync(projectRoot)) {
    const existingEntries = fs.readdirSync(projectRoot);
    if (existingEntries.length > 0) {
      throw {
        statusCode: 409,
        error: `Project folder already exists: ${projectRoot}`,
        code: "PROJECT_FOLDER_EXISTS",
      } satisfies ApiErrorShape;
    }
  }

  fs.mkdirSync(projectRoot, { recursive: true });

  const seed = getTemplateSeed(template);
  const createdFiles: string[] = [];

  const themePath = path.join(clientRoot, "theme.json");
  if (!fs.existsSync(themePath)) {
    fs.writeFileSync(themePath, JSON.stringify(seed.theme, null, 2));
    createdFiles.push(toProjectUrlPath(themePath));
  }

  for (const [filename, payload] of Object.entries(seed.files)) {
    const filePath = path.join(projectRoot, filename);
    if (fs.existsSync(filePath)) {
      throw {
        statusCode: 409,
        error: `Seed file already exists: ${filename}`,
        code: "PROJECT_FILE_EXISTS",
      } satisfies ApiErrorShape;
    }
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
    createdFiles.push(toProjectUrlPath(filePath));
  }

  if (!manifest.clients) {
    manifest.clients = {};
  }
  if (!manifest.clients[clientId]) {
    manifest.clients[clientId] = {
      id: clientId,
      name: clientId,
      description: `${clientId} workspace profile`,
    };
  }

  manifest.projects[projectKey] = {
    name: projectKey,
    client: clientId,
    project: projectId,
    path: `/tokens/${clientId}/${projectId}/variables.css`,
    files: ["variables.css"],
    lastBuild: new Date().toISOString(),
    metadata: {
      brand: brandId,
      template,
      createdBy: "workspace-wizard",
    },
  };

  manifest.lastUpdated = new Date().toISOString();
  writeWorkspaceManifest(manifest);

  return { projectKey, createdFiles };
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

interface FigmaValidationIssue {
  code: string;
  token: string;
  message: string;
}

interface FigmaValidationResult {
  valid: boolean;
  errors: FigmaValidationIssue[];
  warnings: FigmaValidationIssue[];
  summary: {
    totalTokens: number;
    errorCount: number;
    warningCount: number;
    typeCounts: Record<string, number>;
  };
}

const FIGMA_SUPPORTED_TYPES = new Set([
  "color",
  "dimension",
  "fontFamilies",
  "fontWeights",
  "lineHeights",
  "duration",
  "cubicBezier",
  "spacing",
  "borderRadius",
  "borderWidth",
  "opacity",
  "boxShadow",
  "fontSizes",
  "letterSpacing",
  "other",
]);

function validateFigmaExport(
  tokens: Record<string, { $value: unknown; $type: string; $description?: string }>,
): FigmaValidationResult {
  const errors: FigmaValidationIssue[] = [];
  const warnings: FigmaValidationIssue[] = [];
  const entries = Object.entries(tokens);
  const tokenSet = new Set(entries.map(([name]) => name));

  if (entries.length === 0) {
    errors.push({
      code: "FIGMA_EMPTY_EXPORT",
      token: "*",
      message: "No tokens were found for export.",
    });
  }

  for (const [name, token] of entries) {
    if (!name.trim()) {
      errors.push({
        code: "FIGMA_EMPTY_TOKEN_NAME",
        token: name || "*",
        message: "Token name cannot be empty.",
      });
      continue;
    }

    if (!/^[a-z0-9.-]+$/.test(name)) {
      warnings.push({
        code: "FIGMA_TOKEN_NAMING",
        token: name,
        message:
          "Token name should use lowercase letters, numbers, dots, or hyphens.",
      });
    }

    if (
      token.$value === undefined ||
      token.$value === null ||
      (typeof token.$value === "string" && token.$value.trim() === "")
    ) {
      errors.push({
        code: "FIGMA_EMPTY_VALUE",
        token: name,
        message: "Token has an empty $value.",
      });
    }

    const tokenType = typeof token.$type === "string" ? token.$type : "";
    if (!tokenType.trim()) {
      errors.push({
        code: "FIGMA_MISSING_TYPE",
        token: name,
        message: "Token is missing a $type.",
      });
    } else if (!FIGMA_SUPPORTED_TYPES.has(tokenType)) {
      warnings.push({
        code: "FIGMA_UNKNOWN_TYPE",
        token: name,
        message: `Token type "${tokenType}" may not be recognized by your Figma importer.`,
      });
    }

    if (typeof token.$value === "string") {
      const referenceMatch = token.$value.match(/^\{(.+)\}$/);
      if (referenceMatch) {
        const reference = referenceMatch[1].trim();
        if (!reference) {
          errors.push({
            code: "FIGMA_INVALID_REFERENCE",
            token: name,
            message: "Token reference is empty.",
          });
        } else if (reference === name) {
          errors.push({
            code: "FIGMA_SELF_REFERENCE",
            token: name,
            message: "Token cannot reference itself.",
          });
        } else if (!tokenSet.has(reference)) {
          errors.push({
            code: "FIGMA_REFERENCE_NOT_FOUND",
            token: name,
            message: `Reference "${reference}" was not found in this export.`,
          });
        }
      }
    }
  }

  const typeCounts = entries.reduce<Record<string, number>>((acc, [, token]) => {
    const key = token.$type || "other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalTokens: entries.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      typeCounts,
    },
  };
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
                confirmGlobalDelete = false,
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
              const isGlobalTarget = isGlobalJsonPath(absoluteFilePath);

              if (
                isGlobalTarget &&
                action === "delete" &&
                confirmGlobalDelete !== true
              ) {
                res.statusCode = 403;
                res.setHeader("Content-Type", "application/json");
                return res.end(
                  JSON.stringify({
                    error:
                      "Global delete is protected. Confirm deletion explicitly before proceeding.",
                    code: "GLOBAL_DELETE_PROTECTED",
                  }),
                );
              }

              let backupEntry: GlobalBackupEntry | null = null;
              try {
                backupEntry = createGlobalBackup(absoluteFilePath, {
                  action,
                  tokenPath:
                    typeof tokenPath === "string" ? tokenPath : undefined,
                });
              } catch (backupError: unknown) {
                const backupMessage =
                  backupError instanceof Error
                    ? backupError.message
                    : "Unable to create global backup";
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                return res.end(
                  JSON.stringify({
                    error: backupMessage,
                    code: "GLOBAL_BACKUP_FAILED",
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
                JSON.stringify({
                  success: true,
                  path: absoluteFilePath,
                  ...(backupEntry ? { backupId: backupEntry.id } : {}),
                }),
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

                try {
                  createGlobalBackup(absoluteFilePath, { action: "update" });
                } catch (backupError: unknown) {
                  const backupMessage =
                    backupError instanceof Error
                      ? backupError.message
                      : "Unable to create global backup";
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  return res.end(
                    JSON.stringify({
                      error: backupMessage,
                      code: "GLOBAL_BACKUP_FAILED",
                    }),
                  );
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

          // ── Route: Create Client/Brand/Project Workspace ───────────────────
        } else if (
          req.url === "/api/workspace/create-project" &&
          req.method === "POST"
        ) {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });

          req.on("end", async () => {
            try {
              const parsed = body
                ? (JSON.parse(body) as {
                    clientId?: string;
                    brandId?: string;
                    projectId?: string;
                    template?: string;
                  })
                : {};

              const clientId = normalizeWorkspaceSegment(parsed.clientId);
              const projectId = normalizeWorkspaceSegment(parsed.projectId);
              const brandId =
                normalizeWorkspaceSegment(parsed.brandId) || "core";
              const template = toWorkspaceTemplate(parsed.template);

              if (!clientId || !projectId) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                return res.end(
                  JSON.stringify({
                    error: "clientId and projectId are required",
                    code: "MISSING_PROJECT_FIELDS",
                  }),
                );
              }

              const created = createWorkspaceProject({
                clientId,
                brandId,
                projectId,
                template,
              });

              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: true,
                  projectKey: created.projectKey,
                  createdFiles: created.createdFiles,
                }),
              );
            } catch (error: unknown) {
              if (isApiErrorShape(error)) {
                res.statusCode = error.statusCode;
                res.setHeader("Content-Type", "application/json");
                return res.end(
                  JSON.stringify({
                    error: error.error,
                    code: error.code,
                  }),
                );
              }

              const message =
                error instanceof Error ? error.message : "Unknown error";
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: message,
                  code: "WORKSPACE_CREATE_ERROR",
                }),
              );
            }
          });

          // ── Route: Global Backup History ────────────────────────────────────
        } else if (
          req.url?.startsWith("/api/global-guard/history") &&
          req.method === "GET"
        ) {
          try {
            const url = new URL(req.url ?? "", "http://localhost");
            const targetPath = url.searchParams.get("targetPath") ?? undefined;
            const limitRaw = url.searchParams.get("limit");
            const parsedLimit =
              limitRaw && !Number.isNaN(Number(limitRaw))
                ? Number(limitRaw)
                : undefined;

            const history = listGlobalBackups({
              ...(targetPath ? { targetPath } : {}),
              ...(parsedLimit ? { limit: parsedLimit } : {}),
            });

            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                count: history.length,
                history,
              }),
            );
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : "Unknown error";
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({ error: message, code: "INTERNAL_ERROR" }),
            );
          }

          // ── Route: Restore Global Backup by ID ──────────────────────────────
        } else if (
          req.url === "/api/global-guard/restore" &&
          req.method === "POST"
        ) {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", async () => {
            try {
              const parsed = body
                ? (JSON.parse(body) as { backupId?: string })
                : {};
              const backupId =
                typeof parsed.backupId === "string" ? parsed.backupId : "";

              if (!backupId) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                return res.end(
                  JSON.stringify({
                    error: "backupId is required",
                    code: "MISSING_BACKUP_ID",
                  }),
                );
              }

              const restored = restoreGlobalBackupById(backupId);
              if (!restored) {
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                return res.end(
                  JSON.stringify({
                    error: "Backup not found or invalid",
                    code: "GLOBAL_BACKUP_NOT_FOUND",
                  }),
                );
              }

              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: true,
                  restoredPath: restored.restoredPath,
                  backupId: restored.entry.id,
                  createdAt: restored.entry.createdAt,
                }),
              );
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : "Unknown error";
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: message, code: "INTERNAL_ERROR" }),
              );
            }
          });

          // ── Route: Restore Latest Global Backup ─────────────────────────────
        } else if (
          req.url === "/api/global-guard/restore-latest" &&
          req.method === "POST"
        ) {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", async () => {
            try {
              const parsed = body
                ? (JSON.parse(body) as { targetPath?: string })
                : {};
              const targetPath =
                typeof parsed.targetPath === "string"
                  ? parsed.targetPath
                  : undefined;

              const latest = findLatestGlobalBackup(targetPath);
              if (!latest) {
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                return res.end(
                  JSON.stringify({
                    error: "No global backup found to restore",
                    code: "GLOBAL_BACKUP_NOT_FOUND",
                  }),
                );
              }

              const restored = restoreGlobalBackupById(latest.id);
              if (!restored) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                return res.end(
                  JSON.stringify({
                    error: "Failed to restore backup",
                    code: "GLOBAL_BACKUP_RESTORE_FAILED",
                  }),
                );
              }

              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: true,
                  restoredPath: restored.restoredPath,
                  backupId: restored.entry.id,
                  createdAt: restored.entry.createdAt,
                }),
              );
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : "Unknown error";
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: message, code: "INTERNAL_ERROR" }),
              );
            }
          });

          // ── Route: Validate Figma Export ───────────────────────────────────
        } else if (
          req.url === "/api/validate-figma-export" &&
          req.method === "GET"
        ) {
          try {
            const tokens = buildFigmaExport();
            const validation = validateFigmaExport(tokens);

            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                tokens,
                ...validation,
              }),
            );
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : "Unknown error";
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: message,
                code: "FIGMA_VALIDATE_ERROR",
              }),
            );
          }

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

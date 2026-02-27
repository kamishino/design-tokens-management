// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { EventEmitter } from "events";
import { syncTokensPlugin } from "./vite-plugin-sync-tokens";

type Middleware = (
  req: EventEmitter & { method?: string; url?: string },
  res: {
    statusCode: number;
    setHeader: (name: string, value: string) => void;
    end: (chunk?: string) => void;
  },
  next: () => void,
) => void;

interface RequestOptions {
  method: "GET" | "POST";
  url: string;
  body?: unknown;
}

interface JsonResponse {
  statusCode: number;
  json: Record<string, unknown>;
}

const PROJECT_ROOT = process.cwd();
const TEST_DIR = path.join(PROJECT_ROOT, "tokens", "global", "__guard-tests__");
const BACKUP_ROOT = path.join(PROJECT_ROOT, ".memory", "global-backups");
const BACKUP_INDEX = path.join(BACKUP_ROOT, "index.json");
const MANIFEST_PATH = path.join(PROJECT_ROOT, "public", "tokens", "manifest.json");
const MANIFEST_SNAPSHOT = fs.existsSync(MANIFEST_PATH)
  ? fs.readFileSync(MANIFEST_PATH)
  : null;
const WORKSPACE_TEST_CLIENT = "dtm-workspace-test";

function getMiddleware(): Middleware {
  const plugin = syncTokensPlugin();
  let handler: Middleware | null = null;

  const serverMock = {
    middlewares: {
      use(fn: Middleware) {
        handler = fn;
      },
    },
  } as never;

  const configureServer = plugin.configureServer as
    | ((server: unknown) => unknown)
    | { handler?: (server: unknown) => unknown }
    | undefined;
  if (typeof configureServer === "function") {
    configureServer.call({} as unknown, serverMock);
  } else if (
    configureServer &&
    typeof configureServer === "object" &&
    "handler" in configureServer &&
    typeof configureServer.handler === "function"
  ) {
    configureServer.handler.call({} as unknown, serverMock);
  }

  if (!handler) {
    throw new Error("Failed to initialize sync token middleware");
  }

  return handler;
}

function parseJsonOrEmpty(raw: string): Record<string, unknown> {
  if (!raw.trim()) return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

function sendRequest(
  middleware: Middleware,
  options: RequestOptions,
): Promise<JsonResponse> {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter() as EventEmitter & {
      method?: string;
      url?: string;
    };
    req.method = options.method;
    req.url = options.url;

    const headers = new Map<string, string>();
    let raw = "";
    let settled = false;

    const res = {
      statusCode: 200,
      setHeader(name: string, value: string) {
        headers.set(name.toLowerCase(), value);
      },
      end(chunk?: string) {
        if (settled) return;
        if (chunk) raw += chunk;
        settled = true;
        try {
          resolve({
            statusCode: res.statusCode,
            json: parseJsonOrEmpty(raw),
          });
        } catch (error) {
          reject(error);
        }
      },
    };

    try {
      middleware(req, res, () => {
        if (settled) return;
        settled = true;
        resolve({ statusCode: 204, json: {} });
      });
    } catch (error) {
      reject(error);
      return;
    }

    if (options.method === "POST") {
      setImmediate(() => {
        if (options.body !== undefined) {
          req.emit("data", Buffer.from(JSON.stringify(options.body)));
        }
        req.emit("end");
      });
    }
  });
}

function ensureTestFile(filePath: string, value: string) {
  const absolute = path.join(PROJECT_ROOT, filePath.replace(/^\//, ""));
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(
    absolute,
    JSON.stringify(
      {
        color: {
          guard: {
            test: {
              $value: value,
              $type: "color",
            },
          },
        },
      },
      null,
      2,
    ),
  );
}

function ensureRawTestFile(filePath: string, payload: unknown) {
  const absolute = path.join(PROJECT_ROOT, filePath.replace(/^\//, ""));
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, JSON.stringify(payload, null, 2));
}

function readTestFileValue(filePath: string): string {
  const absolute = path.join(PROJECT_ROOT, filePath.replace(/^\//, ""));
  const parsed = JSON.parse(fs.readFileSync(absolute, "utf8")) as {
    color: { guard: { test: { $value: string } } };
  };
  return parsed.color.guard.test.$value;
}

function cleanupTestArtifacts() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }

  if (!fs.existsSync(BACKUP_INDEX)) return;

  const raw = fs.readFileSync(BACKUP_INDEX, "utf8");
  const entries = JSON.parse(raw) as Array<{
    sourcePath: string;
    backupPath: string;
  }>;

  const keep: typeof entries = [];
  for (const entry of entries) {
    if (entry.sourcePath.startsWith("/tokens/global/__guard-tests__/")) {
      const backupAbsolute = path.join(
        PROJECT_ROOT,
        entry.backupPath.replace(/^\//, ""),
      );
      if (fs.existsSync(backupAbsolute)) {
        fs.rmSync(backupAbsolute, { force: true });
      }
      continue;
    }
    keep.push(entry);
  }

  fs.writeFileSync(BACKUP_INDEX, JSON.stringify(keep, null, 2));
}

function cleanupWorkspaceArtifacts() {
  const clientDir = path.join(
    PROJECT_ROOT,
    "tokens",
    "clients",
    WORKSPACE_TEST_CLIENT,
  );
  if (fs.existsSync(clientDir)) {
    fs.rmSync(clientDir, { recursive: true, force: true });
  }

  if (MANIFEST_SNAPSHOT) {
    fs.writeFileSync(MANIFEST_PATH, MANIFEST_SNAPSHOT);
  }
}

afterEach(() => {
  cleanupTestArtifacts();
  cleanupWorkspaceArtifacts();
});

describe("vite-plugin-sync-tokens global guard", () => {
  it("blocks delete on global tokens without explicit confirmation", async () => {
    const middleware = getMiddleware();
    const file = "/tokens/global/__guard-tests__/delete-protect.json";
    ensureTestFile(file, "#111111");

    const response = await sendRequest(middleware, {
      method: "POST",
      url: "/api/save-token",
      body: {
        targetPath: file,
        tokenPath: "color.guard.test",
        action: "delete",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json.code).toBe("GLOBAL_DELETE_PROTECTED");
    expect(readTestFileValue(file)).toBe("#111111");
  });

  it("returns history entries for global backups", async () => {
    const middleware = getMiddleware();
    const file = "/tokens/global/__guard-tests__/history.json";
    ensureTestFile(file, "#222222");

    const saveResponse = await sendRequest(middleware, {
      method: "POST",
      url: "/api/save-token",
      body: {
        targetPath: file,
        tokenPath: "color.guard.test",
        action: "update",
        valueObj: { $value: "#333333", $type: "color" },
      },
    });

    expect(saveResponse.statusCode).toBe(200);
    expect(saveResponse.json.backupId).toBeTypeOf("string");

    const historyResponse = await sendRequest(middleware, {
      method: "GET",
      url: `/api/global-guard/history?targetPath=${encodeURIComponent(file)}&limit=20`,
    });

    expect(historyResponse.statusCode).toBe(200);
    const history = (historyResponse.json.history as Array<{
      sourcePath: string;
    }>) ?? [];
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]?.sourcePath).toBe(file);
  });

  it("restores a file by backup id", async () => {
    const middleware = getMiddleware();
    const file = "/tokens/global/__guard-tests__/restore-by-id.json";
    ensureTestFile(file, "#444444");

    const updateResponse = await sendRequest(middleware, {
      method: "POST",
      url: "/api/save-token",
      body: {
        targetPath: file,
        tokenPath: "color.guard.test",
        action: "update",
        valueObj: { $value: "#555555", $type: "color" },
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    const backupId = updateResponse.json.backupId as string;
    expect(backupId).toBeTruthy();
    expect(readTestFileValue(file)).toBe("#555555");

    const restoreResponse = await sendRequest(middleware, {
      method: "POST",
      url: "/api/global-guard/restore",
      body: { backupId },
    });

    expect(restoreResponse.statusCode).toBe(200);
    expect(restoreResponse.json.success).toBe(true);
    expect(readTestFileValue(file)).toBe("#444444");
  });

  it("restores latest backup for a target file", async () => {
    const middleware = getMiddleware();
    const file = "/tokens/global/__guard-tests__/restore-latest.json";
    ensureTestFile(file, "#666666");

    await sendRequest(middleware, {
      method: "POST",
      url: "/api/save-token",
      body: {
        targetPath: file,
        tokenPath: "color.guard.test",
        action: "update",
        valueObj: { $value: "#777777", $type: "color" },
      },
    });

    expect(readTestFileValue(file)).toBe("#777777");

    const restoreResponse = await sendRequest(middleware, {
      method: "POST",
      url: "/api/global-guard/restore-latest",
      body: { targetPath: file },
    });

    expect(restoreResponse.statusCode).toBe(200);
    expect(restoreResponse.json.success).toBe(true);
    expect(restoreResponse.json.restoredPath).toBe(file);
    expect(readTestFileValue(file)).toBe("#666666");
  });

  it("returns figma validation summary with token payload", async () => {
    const middleware = getMiddleware();

    const response = await sendRequest(middleware, {
      method: "GET",
      url: "/api/validate-figma-export",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json.success).toBe(true);
    expect(response.json.valid).toBeTypeOf("boolean");
    expect(response.json.tokens).toBeTypeOf("object");
    expect(response.json.summary).toBeTypeOf("object");
    expect(response.json.errors).toBeInstanceOf(Array);
    expect(response.json.warnings).toBeInstanceOf(Array);
  });

  it("flags broken figma references as validation errors", async () => {
    const middleware = getMiddleware();
    const file = "/tokens/global/__guard-tests__/broken-figma-ref.json";
    ensureRawTestFile(file, {
      color: {
        guard: {
          broken: {
            $value: "{missing.reference.token}",
            $type: "color",
          },
        },
      },
    });

    const response = await sendRequest(middleware, {
      method: "GET",
      url: "/api/validate-figma-export",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json.valid).toBe(false);
    const errors = (response.json.errors as Array<{ code: string }>) ?? [];
    expect(errors.some((item) => item.code === "FIGMA_REFERENCE_NOT_FOUND")).toBe(
      true,
    );
  });

  it("creates a client/brand/project workspace scaffold", async () => {
    const middleware = getMiddleware();

    const response = await sendRequest(middleware, {
      method: "POST",
      url: "/api/workspace/create-project",
      body: {
        clientId: WORKSPACE_TEST_CLIENT,
        brandId: "marketing",
        projectId: "campaign-kit",
        template: "product-ui",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json.success).toBe(true);
    expect(response.json.projectKey).toBe(
      `${WORKSPACE_TEST_CLIENT}/campaign-kit`,
    );

    const projectRoot = path.join(
      PROJECT_ROOT,
      "tokens",
      "clients",
      WORKSPACE_TEST_CLIENT,
      "projects",
      "campaign-kit",
    );
    expect(fs.existsSync(path.join(projectRoot, "colors.json"))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, "typography.json"))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, "spacing.json"))).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as {
      projects: Record<
        string,
        {
          metadata?: {
            brand?: string;
            template?: string;
          };
        }
      >;
    };

    const project = manifest.projects[`${WORKSPACE_TEST_CLIENT}/campaign-kit`];
    expect(project).toBeTruthy();
    expect(project.metadata?.brand).toBe("marketing");
    expect(project.metadata?.template).toBe("product-ui");
  });

  it("rejects duplicate workspace creation with structured error", async () => {
    const middleware = getMiddleware();

    const first = await sendRequest(middleware, {
      method: "POST",
      url: "/api/workspace/create-project",
      body: {
        clientId: WORKSPACE_TEST_CLIENT,
        brandId: "core",
        projectId: "portal",
        template: "minimal",
      },
    });
    expect(first.statusCode).toBe(200);

    const duplicate = await sendRequest(middleware, {
      method: "POST",
      url: "/api/workspace/create-project",
      body: {
        clientId: WORKSPACE_TEST_CLIENT,
        brandId: "core",
        projectId: "portal",
        template: "minimal",
      },
    });

    expect(duplicate.statusCode).toBe(409);
    expect(duplicate.json.code).toBe("PROJECT_EXISTS");
  });
});

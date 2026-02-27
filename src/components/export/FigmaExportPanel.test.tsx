/**
 * @vitest-environment jsdom
 */
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FigmaExportPanel } from "./FigmaExportPanel";

vi.mock("../ui/toaster", () => ({
  toaster: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderPanel() {
  render(
    <ChakraProvider value={defaultSystem}>
      <FigmaExportPanel />
    </ChakraProvider>,
  );
}

function mockJsonResponse(data: unknown, status = 200): Promise<Response> {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response);
}

describe("FigmaExportPanel validation flow", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("blocks progression when validation has errors", async () => {
    fetchMock.mockResolvedValueOnce(
      await mockJsonResponse({
        success: true,
        valid: false,
        tokens: {
          "color.primary": { $value: "{missing.ref}", $type: "color" },
        },
        errors: [
          {
            code: "FIGMA_REFERENCE_NOT_FOUND",
            token: "color.primary",
            message: 'Reference "missing.ref" was not found in this export.',
          },
        ],
        warnings: [],
        summary: {
          totalTokens: 1,
          errorCount: 1,
          warningCount: 0,
          typeCounts: { color: 1 },
        },
      }),
    );

    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /Run Intake Validation/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/validate-figma-export");
    });
    expect(
      await screen.findByText(/\[FIGMA_REFERENCE_NOT_FOUND\] color\.primary/i),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: /Continue to Readiness/i })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("requires readiness checklist before showing export actions", async () => {
    fetchMock.mockResolvedValueOnce(
      await mockJsonResponse({
        success: true,
        valid: true,
        tokens: {
          "Color.Primary": { $value: "#3366FF", $type: "color" },
        },
        errors: [],
        warnings: [
          {
            code: "FIGMA_TOKEN_NAMING",
            token: "Color.Primary",
            message:
              "Token name should use lowercase letters, numbers, dots, or hyphens.",
          },
        ],
        summary: {
          totalTokens: 1,
          errorCount: 0,
          warningCount: 1,
          typeCounts: { color: 1 },
        },
      }),
    );

    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /Run Intake Validation/i }));

    const continueToReadiness = await screen.findByRole("button", {
      name: /Continue to Readiness/i,
    });
    fireEvent.click(continueToReadiness);

    const continueToExport = await screen.findByRole("button", {
      name: /Continue to Export/i,
    });
    expect(continueToExport.hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByText(/I reviewed warning items before export/i));
    fireEvent.click(
      screen.getByText(
        /I have a plan to map token groups to Figma Variable collections/i,
      ),
    );
    fireEvent.click(
      screen.getByText(/This export is ready to share with the dev team/i),
    );

    await waitFor(() => {
      expect(continueToExport.hasAttribute("disabled")).toBe(false);
    });
    fireEvent.click(continueToExport);

    expect(
      await screen.findByRole("button", { name: /Copy JSON/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Download tokens-figma\.json/i }),
    ).toBeTruthy();
  });

  it("re-validates before copy and proceeds when checklist is complete", async () => {
    fetchMock
      .mockResolvedValueOnce(
        await mockJsonResponse({
          success: true,
          valid: true,
          tokens: {
            "Color.Primary": { $value: "#3366FF", $type: "color" },
          },
          errors: [],
          warnings: [
            {
              code: "FIGMA_TOKEN_NAMING",
              token: "Color.Primary",
              message:
                "Token name should use lowercase letters, numbers, dots, or hyphens.",
            },
          ],
          summary: {
            totalTokens: 1,
            errorCount: 0,
            warningCount: 1,
            typeCounts: { color: 1 },
          },
        }),
      )
      .mockResolvedValueOnce(
        await mockJsonResponse({
          success: true,
          valid: true,
          tokens: {
            "Color.Primary": { $value: "#3366FF", $type: "color" },
          },
          errors: [],
          warnings: [
            {
              code: "FIGMA_TOKEN_NAMING",
              token: "Color.Primary",
              message:
                "Token name should use lowercase letters, numbers, dots, or hyphens.",
            },
          ],
          summary: {
            totalTokens: 1,
            errorCount: 0,
            warningCount: 1,
            typeCounts: { color: 1 },
          },
        }),
      );

    renderPanel();
    fireEvent.click(
      screen.getByRole("button", { name: /Run Intake Validation/i }),
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /Continue to Readiness/i }),
    );
    fireEvent.click(screen.getByText(/I reviewed warning items before export/i));
    fireEvent.click(
      screen.getByText(
        /I have a plan to map token groups to Figma Variable collections/i,
      ),
    );
    fireEvent.click(
      screen.getByText(/This export is ready to share with the dev team/i),
    );
    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: /Continue to Export/i })
          .hasAttribute("disabled"),
      ).toBe(false);
    });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Export/i }));

    fireEvent.click(screen.getByRole("button", { name: /Copy JSON/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });
  });
});

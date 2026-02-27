/**
 * @vitest-environment jsdom
 */
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalBackupHistoryDrawer } from "./GlobalBackupHistoryDrawer";

vi.mock("../ui/toaster", () => ({
  toaster: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

interface MockEntry {
  id: string;
  createdAt: string;
  sourcePath: string;
  backupPath: string;
  action: string;
  tokenPath?: string;
}

function mockJsonResponse(data: unknown, status = 200): Promise<Response> {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response);
}

function renderDrawer(selectedProject = "") {
  const onClose = vi.fn();
  const onRestored = vi.fn();

  render(
    <ChakraProvider value={defaultSystem}>
      <GlobalBackupHistoryDrawer
        open
        onClose={onClose}
        onRestored={onRestored}
        selectedProject={selectedProject}
      />
    </ChakraProvider>,
  );

  return { onClose, onRestored };
}

describe("GlobalBackupHistoryDrawer", () => {
  const fetchMock = vi.fn<typeof fetch>();
  const sampleEntry: MockEntry = {
    id: "bk-1",
    createdAt: "2026-02-27T00:00:00.000Z",
    sourcePath: "/tokens/global/base/colors.json",
    backupPath: "/.memory/global-backups/bk-1.json",
    action: "update",
    tokenPath: "color.primary.500",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  it("loads and renders backup history when opened", async () => {
    fetchMock.mockResolvedValueOnce(
      await mockJsonResponse({ success: true, history: [sampleEntry] }),
    );

    renderDrawer();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/global-guard/history?limit=80");
    });
    expect(await screen.findByText(sampleEntry.sourcePath)).toBeTruthy();
  });

  it("restores a selected backup by id", async () => {
    fetchMock
      .mockResolvedValueOnce(
        await mockJsonResponse({ success: true, history: [sampleEntry] }),
      )
      .mockResolvedValueOnce(
        await mockJsonResponse({
          success: true,
          restoredPath: sampleEntry.sourcePath,
          backupId: sampleEntry.id,
        }),
      )
      .mockResolvedValueOnce(
        await mockJsonResponse({ success: true, history: [sampleEntry] }),
      );

    const { onRestored } = renderDrawer();
    await screen.findByText(sampleEntry.sourcePath);

    const restoreButtons = screen.getAllByRole("button", { name: "Restore" });
    fireEvent.click(restoreButtons[0]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/global-guard/restore",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ backupId: sampleEntry.id }),
        }),
      );
    });
    await waitFor(() => {
      expect(onRestored).toHaveBeenCalledTimes(1);
    });
  });

  it("uses current-file scope for history and latest restore", async () => {
    const selectedProject = "/tokens/global/base/colors.json";
    const encoded = encodeURIComponent(selectedProject);

    fetchMock
      .mockResolvedValueOnce(
        await mockJsonResponse({ success: true, history: [sampleEntry] }),
      )
      .mockResolvedValueOnce(
        await mockJsonResponse({ success: true, history: [sampleEntry] }),
      )
      .mockResolvedValueOnce(
        await mockJsonResponse({
          success: true,
          restoredPath: selectedProject,
        }),
      )
      .mockResolvedValueOnce(
        await mockJsonResponse({ success: true, history: [sampleEntry] }),
      );

    renderDrawer(selectedProject);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/global-guard/history?limit=80");
    });

    const currentButton = screen
      .getAllByRole("button", { name: "Current" })
      .find((button) => !button.hasAttribute("disabled"));

    expect(currentButton).toBeTruthy();
    fireEvent.click(currentButton!);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/global-guard/history?limit=80&targetPath=${encoded}`,
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Latest" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/global-guard/restore-latest",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ targetPath: selectedProject }),
        }),
      );
    });
  });
});

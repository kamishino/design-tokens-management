import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  lazy,
  Suspense,
} from "react";
import { useGlobalTokens } from "../../hooks/useGlobalTokens";
import { useCommandPalette } from "../../hooks/useCommandPalette";
import { groupTokensByFile } from "../../utils/token-grouping";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { ResizeHandle } from "./ResizeHandle";
import { ActivityBar } from "../explorer/ActivityBar";
import { FileExplorer } from "../explorer/FileExplorer";
import { TokenTree } from "../explorer/TokenTree";
import { InspectorOverlay } from "../explorer/InspectorOverlay";
import { StudioView } from "../studio/StudioView";
import { InspectorPanel } from "./InspectorPanel";
import { toaster } from "../ui/toaster";
import { GlobalBackupHistoryDrawer } from "./GlobalBackupHistoryDrawer";

// Wave 3: Lazy-load heavy modals — parsed only when first opened, not on boot
const TokenEditModal = lazy(() =>
  import("../explorer/TokenEditModal").then((m) => ({
    default: m.TokenEditModal,
  })),
);
const ExportModal = lazy(() =>
  import("../export/ExportModal").then((m) => ({ default: m.ExportModal })),
);
const CommandPalette = lazy(() =>
  import("../command/CommandPalette").then((m) => ({
    default: m.CommandPalette,
  })),
);
import type {
  Manifest,
  TokenOverrides,
  SidebarPanelId,
} from "../../schemas/manifest";
import type { TokenDoc } from "../../utils/token-parser";

type WorkspacePresetId =
  | "balanced"
  | "focus-canvas"
  | "inspect-deep-dive"
  | "minimal";

interface WorkspacePreset {
  id: WorkspacePresetId;
  label: string;
  description: string;
  sidebarVisible: boolean;
  inspectorVisible: boolean;
  explorerCollapsed: boolean;
  sidebarRatio: number;
  inspectorRatio: number;
  sidebarPriority: "primary" | "secondary";
  inspectorPriority: "primary" | "secondary";
}

interface ResolvedWorkspacePreset {
  id: WorkspacePresetId;
  sidebarVisible: boolean;
  inspectorVisible: boolean;
  explorerCollapsed: boolean;
  sidebarWidth: number;
  inspectorWidth: number;
}

const WORKSPACE_PRESET_STORAGE_KEY = "ide_workspace_preset";

const WORKSPACE_PRESETS: WorkspacePreset[] = [
  {
    id: "balanced",
    label: "Balanced",
    description: "Keep navigation and inspector visible with equal emphasis.",
    sidebarVisible: true,
    inspectorVisible: true,
    explorerCollapsed: false,
    sidebarRatio: 0.24,
    inspectorRatio: 0.25,
    sidebarPriority: "primary",
    inspectorPriority: "secondary",
  },
  {
    id: "focus-canvas",
    label: "Focus Canvas",
    description: "Maximize preview area with a compact right inspector.",
    sidebarVisible: false,
    inspectorVisible: true,
    explorerCollapsed: false,
    sidebarRatio: 0.2,
    inspectorRatio: 0.24,
    sidebarPriority: "secondary",
    inspectorPriority: "primary",
  },
  {
    id: "inspect-deep-dive",
    label: "Inspect Deep Dive",
    description: "Widen inspector and collapse explorer for token diagnostics.",
    sidebarVisible: true,
    inspectorVisible: true,
    explorerCollapsed: true,
    sidebarRatio: 0.2,
    inspectorRatio: 0.33,
    sidebarPriority: "secondary",
    inspectorPriority: "primary",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Hide inspector and keep a slim sidebar for quick editing.",
    sidebarVisible: true,
    inspectorVisible: false,
    explorerCollapsed: false,
    sidebarRatio: 0.22,
    inspectorRatio: 0.22,
    sidebarPriority: "primary",
    inspectorPriority: "secondary",
  },
];

const DEFAULT_WORKSPACE_PRESET_ID: WorkspacePresetId = "balanced";
const SIDEBAR_ACTIVITY_WIDTH = 36;
const MIN_PANE_WIDTH = 240;
const MIN_CENTER_WIDTH = 420;
const MAX_SIDEBAR_WIDTH = 480;
const MAX_INSPECTOR_WIDTH = 800;

function isWorkspacePresetId(value: string): value is WorkspacePresetId {
  return WORKSPACE_PRESETS.some((preset) => preset.id === value);
}

function getStoredWorkspacePresetId(): WorkspacePresetId {
  if (typeof window === "undefined") {
    return DEFAULT_WORKSPACE_PRESET_ID;
  }

  const saved = localStorage.getItem(WORKSPACE_PRESET_STORAGE_KEY);
  if (!saved) {
    return DEFAULT_WORKSPACE_PRESET_ID;
  }

  return isWorkspacePresetId(saved)
    ? saved
    : DEFAULT_WORKSPACE_PRESET_ID;
}

function getWorkspacePresetById(presetId: WorkspacePresetId): WorkspacePreset {
  return (
    WORKSPACE_PRESETS.find((preset) => preset.id === presetId) ||
    WORKSPACE_PRESETS[0]
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getViewportWidth() {
  if (typeof window === "undefined") return 1440;
  return window.innerWidth;
}

function resolvePresetForViewport(preset: WorkspacePreset): ResolvedWorkspacePreset {
  const viewportWidth = getViewportWidth();

  let sidebarVisible = preset.sidebarVisible;
  let inspectorVisible = preset.inspectorVisible;
  const explorerCollapsed = preset.explorerCollapsed;

  const maxSidebarByViewport = Math.max(
    MIN_PANE_WIDTH,
    Math.floor(viewportWidth * 0.34),
  );
  const maxInspectorByViewport = Math.max(
    MIN_PANE_WIDTH,
    Math.floor(viewportWidth * 0.42),
  );

  let sidebarWidth = clamp(
    Math.round(viewportWidth * preset.sidebarRatio),
    MIN_PANE_WIDTH,
    Math.min(MAX_SIDEBAR_WIDTH, maxSidebarByViewport),
  );
  let inspectorWidth = clamp(
    Math.round(viewportWidth * preset.inspectorRatio),
    MIN_PANE_WIDTH,
    Math.min(MAX_INSPECTOR_WIDTH, maxInspectorByViewport),
  );

  const availableAuxWidth = Math.max(
    0,
    viewportWidth - MIN_CENTER_WIDTH - SIDEBAR_ACTIVITY_WIDTH,
  );

  if (sidebarVisible && inspectorVisible) {
    if (availableAuxWidth < MIN_PANE_WIDTH * 2) {
      if (preset.sidebarPriority === "primary") {
        inspectorVisible = false;
      } else {
        sidebarVisible = false;
      }
    } else {
      const combined = sidebarWidth + inspectorWidth;
      if (combined > availableAuxWidth) {
        const scale = availableAuxWidth / combined;
        sidebarWidth = Math.max(MIN_PANE_WIDTH, Math.floor(sidebarWidth * scale));
        inspectorWidth = Math.max(
          MIN_PANE_WIDTH,
          Math.floor(inspectorWidth * scale),
        );

        if (sidebarWidth + inspectorWidth > availableAuxWidth) {
          const overflow = sidebarWidth + inspectorWidth - availableAuxWidth;
          if (preset.inspectorPriority === "primary") {
            sidebarWidth = Math.max(MIN_PANE_WIDTH, sidebarWidth - overflow);
          } else {
            inspectorWidth = Math.max(MIN_PANE_WIDTH, inspectorWidth - overflow);
          }
        }
      }
    }
  }

  if (sidebarVisible && !inspectorVisible) {
    sidebarWidth = clamp(
      sidebarWidth,
      MIN_PANE_WIDTH,
      Math.min(MAX_SIDEBAR_WIDTH, availableAuxWidth),
    );
  }

  if (!sidebarVisible && inspectorVisible) {
    inspectorWidth = clamp(
      inspectorWidth,
      MIN_PANE_WIDTH,
      Math.min(MAX_INSPECTOR_WIDTH, availableAuxWidth),
    );
  }

  return {
    id: preset.id,
    sidebarVisible,
    inspectorVisible,
    explorerCollapsed,
    sidebarWidth,
    inspectorWidth,
  };
}

interface WorkspaceLayoutProps {
  manifest: Manifest;
  selectedProject: string;
  onProjectChange: (val: string) => void;
  onManifestRefresh?: () => Promise<void> | void;
  overrides: TokenOverrides;
  updateOverride: (
    newValues: Record<string, string | number>,
    label?: string,
  ) => void;
  discardOverride: (key: string) => void;
  onReset: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const WorkspaceLayout = ({
  manifest,
  selectedProject,
  onProjectChange,
  onManifestRefresh,
  overrides,
  updateOverride,
  discardOverride,
  onReset,
  undo,
  redo,
  canUndo,
  canRedo,
}: WorkspaceLayoutProps) => {
  const initialPresetId = getStoredWorkspacePresetId();
  const initialPreset = resolvePresetForViewport(
    getWorkspacePresetById(initialPresetId),
  );

  const { globalTokens, refresh } = useGlobalTokens();
  const [searchTerm, setSearchTerm] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [workspacePreset, setWorkspacePreset] =
    useState<WorkspacePresetId>(initialPresetId);
  const [sidebarVisible, setSidebarVisible] =
    useState(initialPreset.sidebarVisible);
  const [inspectorVisible, setInspectorVisible] =
    useState(initialPreset.inspectorVisible);
  const [explorerCollapsed, setExplorerCollapsed] = useState(
    initialPreset.explorerCollapsed,
  );

  // Resizable panel widths (K1)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("ide_sidebar_width");
    const parsed = saved ? Number(saved) : Number.NaN;
    if (Number.isFinite(parsed) && parsed >= MIN_PANE_WIDTH) {
      return parsed;
    }
    return initialPreset.sidebarWidth;
  });
  const [inspectorWidth, setInspectorWidth] = useState(() => {
    const saved = localStorage.getItem("ide_inspector_width");
    const parsed = saved ? Number(saved) : Number.NaN;
    if (Number.isFinite(parsed) && parsed >= MIN_PANE_WIDTH) {
      return parsed;
    }
    return initialPreset.inspectorWidth;
  });
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const saveSidebarWidth = useCallback(() => {
    localStorage.setItem("ide_sidebar_width", String(sidebarWidth));
  }, [sidebarWidth]);
  const saveInspectorWidth = useCallback(() => {
    localStorage.setItem("ide_inspector_width", String(inspectorWidth));
  }, [inspectorWidth]);

  const [activePanel, setActivePanel] = useState<SidebarPanelId>(() => {
    if (typeof window === "undefined") return "explorer";
    return (
      (localStorage.getItem("ide_active_panel") as SidebarPanelId) || "explorer"
    );
  });

  const [hoveredToken, setHoveredToken] = useState<{
    token: TokenDoc | null;
    pos: { x: number; y: number } | null;
  }>({ token: null, pos: null });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingToken, setEditingToken] = useState<TokenDoc | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenDoc | null>(null);
  const [inspectedTokens, setInspectedTokens] = useState<string[] | undefined>(
    undefined,
  );
  const [isGlobalBackupDrawerOpen, setIsGlobalBackupDrawerOpen] =
    useState(false);

  const hasOverrides = Object.keys(overrides).length > 0;

  // Token grouping
  const categories = useMemo(
    () => groupTokensByFile(globalTokens, searchTerm),
    [globalTokens, searchTerm],
  );

  const displayCategories = useMemo(() => {
    const isJsonFocus = selectedProject.endsWith(".json");
    if (!isJsonFocus) return categories;
    return categories.filter((cat) => cat.id === selectedProject);
  }, [categories, selectedProject]);

  const { semanticTokens, foundationTokens } = useMemo(() => {
    const semantic = displayCategories
      .filter((cat) => !cat.id.includes("global/base"))
      .flatMap((cat) => cat.tokens);
    const foundation = displayCategories
      .filter((cat) => cat.id.includes("global/base"))
      .flatMap((cat) => cat.tokens);
    return { semanticTokens: semantic, foundationTokens: foundation };
  }, [displayCategories]);

  // Persist panel selection
  useEffect(() => {
    localStorage.setItem("ide_active_panel", activePanel);
  }, [activePanel]);

  // Panel keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key.toLowerCase() === "e") {
          e.preventDefault();
          setActivePanel("explorer");
        }
        if (e.key.toLowerCase() === "g") {
          e.preventDefault();
          setActivePanel("primitives");
        }
        if (e.key.toLowerCase() === "f") {
          e.preventDefault();
          setActivePanel("search");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Callbacks
  const handleHover = useCallback(
    (token: TokenDoc | null, pos: { x: number; y: number } | null) => {
      setHoveredToken({ token, pos });
      if (token) setSelectedToken(token);
    },
    [],
  );

  const handleEdit = useCallback((token: TokenDoc) => {
    setEditingToken(token);
    setIsEditorOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (token: TokenDoc) => {
      const isGlobalToken = token.sourceFile.includes("/tokens/global/");
      if (isGlobalToken) {
        toaster.error({
          title: "Delete Blocked",
          description:
            "Global token deletion is disabled in UI. Edit value instead or use backup restore controls.",
        });
        return;
      }
      if (!window.confirm(`Are you sure you want to delete ${token.name}?`))
        return;
      const dotPath = token.id.includes(":")
        ? token.id.split(":")[1]
        : token.id;
      try {
        const response = await fetch("/api/save-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetPath: token.sourceFile,
            tokenPath: dotPath,
            action: "delete",
            confirmGlobalDelete: isGlobalToken,
          }),
        });
        const json = await response.json().catch(() => ({}));
        if (response.ok) {
          refresh();
          toaster.success({
            title: "Token Deleted",
            description: `"${token.name}" was removed from disk.`,
          });
        } else {
          const msg =
            (json as { error?: string }).error ||
            `Server responded with ${response.status}`;
          toaster.error({ title: "Delete Failed", description: msg });
        }
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Network error — is the dev server running?";
        toaster.error({ title: "Delete Failed", description: msg });
      }
    },
    [refresh],
  );

  const handleExport = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  const applyWorkspacePreset = useCallback((presetId: WorkspacePresetId) => {
    const preset = resolvePresetForViewport(getWorkspacePresetById(presetId));

    setWorkspacePreset(preset.id);
    setSidebarVisible(preset.sidebarVisible);
    setInspectorVisible(preset.inspectorVisible);
    setExplorerCollapsed(preset.explorerCollapsed);
    setSidebarWidth(preset.sidebarWidth);
    setInspectorWidth(preset.inspectorWidth);

    if (typeof window !== "undefined") {
      localStorage.setItem(WORKSPACE_PRESET_STORAGE_KEY, preset.id);
      localStorage.setItem("ide_sidebar_width", String(preset.sidebarWidth));
      localStorage.setItem("ide_inspector_width", String(preset.inspectorWidth));
    }
  }, []);

  /** Q2: 'Edit Tokens' from FileActionMenu — filter token tree to show only that file */
  const handleEditTokensByFile = useCallback(
    (filePath: string) => {
      // getDynamicTokenTree builds fullPath as `/${id}` where id already starts with '/'
      // resulting in '//tokens/...' — normalize to single leading slash to match token.sourceFile
      const normalized = filePath.replace(/^\/+/, "/");
      onProjectChange(normalized);
    },
    [onProjectChange],
  );

  // Command palette
  const cmdPalette = useCommandPalette({
    tokens: globalTokens,
    onNavigateToken: (token) => {
      navigator.clipboard.writeText(token.cssVariable);
    },
    onEnterStudio: undefined,
    onOpenExport: handleExport,
  });

  useEffect(() => {
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        cmdPalette.open();
      }
    };
    window.addEventListener("keydown", handleCmdK);
    return () => window.removeEventListener("keydown", handleCmdK);
  }, [cmdPalette]);

  return (
    <VStack h="100vh" gap={0} bg="gray.50" overflow="hidden">
      {/* Header */}
      <WorkspaceHeader
        manifest={manifest}
        selectedProject={selectedProject}
        hasOverrides={hasOverrides}
        onOpenExport={handleExport}
        onOpenPalette={cmdPalette.open}
        arrangePresets={WORKSPACE_PRESETS.map(({ id, label, description }) => ({
          id,
          label,
          description,
        }))}
        activeArrangePreset={workspacePreset}
        onApplyArrangePreset={(presetId: string) => {
          if (isWorkspacePresetId(presetId)) {
            applyWorkspacePreset(presetId);
          }
        }}
        sidebarVisible={sidebarVisible}
        inspectorVisible={inspectorVisible}
        onToggleSidebar={() => setSidebarVisible((v) => !v)}
        onToggleInspector={() => setInspectorVisible((v) => !v)}
        onOpenGlobalBackups={() => setIsGlobalBackupDrawerOpen(true)}
      />

      {/* Main Content */}
      <HStack flex={1} gap={0} overflow="hidden" w="full">
        {/* Left Group: ActivityBar + Sidebar — one animated container so they move as one unit */}
        <Box
          display="flex"
          flexShrink={0}
          h="full"
          overflow="hidden"
          w={sidebarVisible ? `${sidebarWidth + 36}px` : "0px"}
          style={{
            transition: isResizingLeft
              ? "none"
              : "width 260ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* ActivityBar — fixed 36px, always visible inside the group */}
          <Box w="36px" flexShrink={0} h="full">
            <ActivityBar
              activePanel={activePanel}
              onPanelChange={setActivePanel}
            />
          </Box>

          {/* Sidebar Panel */}
          <VStack
            flex={1}
            h="full"
            gap={0}
            bg="white"
            borderRight="1px solid"
            borderColor="gray.200"
            overflow="hidden"
          >
            {/* File Explorer — collapsible */}
            <Box
              w="full"
              borderBottom="1px solid"
              borderColor="gray.100"
              overflow="hidden"
              transition="height 0.2s"
              h={explorerCollapsed ? "28px" : "45%"}
              flexShrink={0}
            >
              <HStack
                h="28px"
                px={3}
                bg="gray.50"
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                onClick={() => setExplorerCollapsed((v) => !v)}
                userSelect="none"
                borderBottom="1px solid"
                borderColor="gray.100"
              >
                <Text
                  fontSize="9px"
                  fontWeight="700"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  flex={1}
                >
                  {explorerCollapsed ? "▶" : "▼"} Files
                </Text>
              </HStack>
              {!explorerCollapsed && (
                <Box h="calc(100% - 28px)" overflowY="auto">
                  <FileExplorer
                    manifest={manifest}
                    context={activePanel}
                    activePath={selectedProject}
                    onSelect={(_, key) => onProjectChange(key)}
                    onEditTokens={handleEditTokensByFile}
                    onProjectCreated={async () => {
                      if (onManifestRefresh) {
                        await onManifestRefresh();
                      }
                      refresh();
                    }}
                  />
                </Box>
              )}
            </Box>
            <Box flex={1} w="full" overflow="hidden">
              <TokenTree
                semanticTokens={semanticTokens}
                foundationTokens={foundationTokens}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                editMode={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onHover={handleHover}
              />
            </Box>
          </VStack>
        </Box>

        {/* Sidebar Resize Handle — only visible when sidebar is open */}
        {sidebarVisible && (
          <ResizeHandle
            side="left"
            onResize={(d) => {
              setIsResizingLeft(true);
              setSidebarWidth((w: number) =>
                Math.max(MIN_PANE_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, w + d)),
              );
            }}
            onResizeEnd={() => {
              setIsResizingLeft(false);
              saveSidebarWidth();
            }}
          />
        )}

        {/* Center: Preview Canvas */}
        <Box flex={1} h="full" overflow="auto" bg="gray.50">
          <StudioView
            manifest={manifest}
            globalTokens={globalTokens}
            selectedProject={selectedProject}
            onProjectChange={onProjectChange}
            onOpenDocs={() => {}}
            onInspectChange={setInspectedTokens}
            inspectedTokens={inspectedTokens}
            overrides={overrides}
            updateOverride={updateOverride}
            onReset={onReset}
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </Box>

        {/* Inspector Resize Handle */}
        {inspectorVisible && (
          <ResizeHandle
            side="right"
            onResize={(d) => {
              setIsResizingRight(true);
              setInspectorWidth((w: number) =>
                Math.max(MIN_PANE_WIDTH, Math.min(MAX_INSPECTOR_WIDTH, w + d)),
              );
            }}
            onResizeEnd={() => {
              setIsResizingRight(false);
              saveInspectorWidth();
            }}
          />
        )}

        {/* Right Panel — always mounted, width collapses to 0 when hidden */}
        <Box
          w={inspectorVisible ? `${inspectorWidth}px` : "0px"}
          minW={inspectorVisible ? "240px" : "0px"}
          h="full"
          bg="white"
          borderLeft={inspectorVisible ? "1px solid" : "none"}
          borderColor="gray.200"
          overflow="hidden"
          flexShrink={0}
          style={{
            transition: isResizingRight
              ? "none"
              : "width 260ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <InspectorPanel
            selectedToken={selectedToken}
            overrides={overrides}
            globalTokens={globalTokens}
            onCommitSuccess={refresh}
            updateOverride={updateOverride}
            refreshTokens={refresh}
            projectPath={selectedProject}
            onReset={onReset}
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onDiscardOverride={discardOverride}
            onDiscardAll={onReset}
          />
        </Box>
      </HStack>

      {/* Overlays — always in DOM, lightweight */}
      <InspectorOverlay token={hoveredToken.token} pos={hoveredToken.pos} />

      {/* Wave 3: Lazy-loaded modals — parsed only when first opened */}
      <Suspense fallback={null}>
        <TokenEditModal
          isOpen={isEditorOpen}
          onClose={(shouldRefresh) => {
            setIsEditorOpen(false);
            if (shouldRefresh) refresh();
          }}
          token={editingToken}
          targetPath={selectedProject}
          globalTokens={globalTokens}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          manifest={manifest}
          globalTokens={globalTokens}
          overrides={overrides}
        />
      </Suspense>

      <Suspense fallback={null}>
        <CommandPalette
          isOpen={cmdPalette.isOpen}
          query={cmdPalette.query}
          onQueryChange={cmdPalette.setQuery}
          results={cmdPalette.results}
          selectedIndex={cmdPalette.selectedIndex}
          onClose={cmdPalette.close}
          onExecute={cmdPalette.executeSelected}
          onMoveSelection={cmdPalette.moveSelection}
        />
      </Suspense>

      <GlobalBackupHistoryDrawer
        open={isGlobalBackupDrawerOpen}
        onClose={() => setIsGlobalBackupDrawerOpen(false)}
        onRestored={refresh}
        selectedProject={selectedProject}
      />
    </VStack>
  );
};

import { Box, HStack, VStack } from "@chakra-ui/react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useGlobalTokens } from "../../hooks/useGlobalTokens";
import { useCommandPalette } from "../../hooks/useCommandPalette";
import { groupTokensByFile } from "../../utils/token-grouping";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { ActivityBar } from "../explorer/ActivityBar";
import { FileExplorer } from "../explorer/FileExplorer";
import { TokenTree } from "../explorer/TokenTree";
import { TokenEditModal } from "../explorer/TokenEditModal";
import { InspectorOverlay } from "../explorer/InspectorOverlay";
import { ExportModal } from "../export/ExportModal";
import { CommandPalette } from "../command/CommandPalette";
import { StudioView } from "../studio/StudioView";
import { InspectorPanel } from "./InspectorPanel";
import { ThemeBar } from "./ThemeBar";
import type {
  Manifest,
  TokenOverrides,
  SidebarPanelId,
} from "../../schemas/manifest";
import type { TokenDoc } from "../../utils/token-parser";

interface WorkspaceLayoutProps {
  manifest: Manifest;
  selectedProject: string;
  onProjectChange: (val: string) => void;
  overrides: TokenOverrides;
  updateOverride: (
    newValues: Record<string, string | number>,
    label?: string,
  ) => void;
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
  overrides,
  updateOverride,
  onReset,
  undo,
  redo,
  canUndo,
  canRedo,
}: WorkspaceLayoutProps) => {
  const { globalTokens } = useGlobalTokens();
  const [searchTerm, setSearchTerm] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [inspectorVisible, setInspectorVisible] = useState(true);

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

  const handleDelete = useCallback(async (token: TokenDoc) => {
    if (!window.confirm(`Are you sure you want to delete ${token.name}?`))
      return;
    const dotPath = token.id.includes(":") ? token.id.split(":")[1] : token.id;
    try {
      const response = await fetch("/api/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetPath: token.sourceFile,
          tokenPath: dotPath,
          action: "delete",
        }),
      });
      if (response.ok) window.location.reload();
    } catch (e) {
      console.error("Error deleting token", e);
    }
  }, []);

  const handleExport = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

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
        inspectorVisible={inspectorVisible}
        onToggleInspector={() => setInspectorVisible((v) => !v)}
      />

      {/* Theme Bar */}
      <ThemeBar
        manifest={manifest}
        activePath={selectedProject}
        onSelect={onProjectChange}
      />

      {/* Main Content */}
      <HStack flex={1} gap={0} overflow="hidden" w="full">
        {/* Activity Bar */}
        <ActivityBar activePanel={activePanel} onPanelChange={setActivePanel} />

        {/* Left Panel: File Explorer + Token Tree */}
        <VStack
          w="280px"
          minW="240px"
          maxW="320px"
          h="full"
          gap={0}
          bg="white"
          borderRight="1px solid"
          borderColor="gray.200"
          overflow="hidden"
        >
          <Box
            h="45%"
            w="full"
            borderBottom="1px solid"
            borderColor="gray.100"
            overflowY="auto"
          >
            <FileExplorer
              manifest={manifest}
              context={activePanel}
              activePath={selectedProject}
              onSelect={(_, key) => onProjectChange(key)}
            />
          </Box>
          <Box flex={1} w="full" overflow="hidden">
            <TokenTree
              semanticTokens={semanticTokens}
              foundationTokens={foundationTokens}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              editMode={false}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onHover={handleHover}
            />
          </Box>
        </VStack>

        {/* Center: Preview Canvas */}
        <Box flex={1} h="full" overflow="auto" bg="gray.50">
          <StudioView
            manifest={manifest}
            globalTokens={globalTokens}
            selectedProject={selectedProject}
            onProjectChange={onProjectChange}
            onExit={() => {}} // No-op in unified layout
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

        {/* Right: Inspector Panel */}
        {inspectorVisible && (
          <Box
            w="300px"
            minW="260px"
            h="full"
            bg="white"
            borderLeft="1px solid"
            borderColor="gray.200"
            overflow="hidden"
          >
            <InspectorPanel
              selectedToken={selectedToken}
              overrides={overrides}
              globalTokens={globalTokens}
              onCommitSuccess={() => window.location.reload()}
              updateOverride={updateOverride}
              projectPath={selectedProject}
              onReset={onReset}
              undo={undo}
              redo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </Box>
        )}
      </HStack>

      {/* Overlays */}
      <InspectorOverlay token={hoveredToken.token} pos={hoveredToken.pos} />

      <TokenEditModal
        isOpen={isEditorOpen}
        onClose={(refresh) => {
          setIsEditorOpen(false);
          if (refresh) window.location.reload();
        }}
        token={editingToken}
        targetPath={selectedProject}
        globalTokens={globalTokens}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        manifest={manifest}
        globalTokens={globalTokens}
        overrides={overrides}
      />

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
    </VStack>
  );
};

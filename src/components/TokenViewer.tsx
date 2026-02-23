import {
  Box,
  Text,
  VStack,
  Heading,
  Badge,
  HStack,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useGlobalTokens } from "../hooks/useGlobalTokens";
import { groupTokensByFile } from "../utils/token-grouping";
import { LuEye, LuLayoutDashboard, LuDownload } from "react-icons/lu";
import { Button } from "./ui/button";
import { FileExplorer } from "./explorer/FileExplorer";
import { ActivityBar } from "./explorer/ActivityBar";
import { TokenEditModal } from "./explorer/TokenEditModal";
import { InspectorOverlay } from "./explorer/InspectorOverlay";
import { TokenTree } from "./explorer/TokenTree";
import { ExportModal } from "./export/ExportModal";
import type {
  Manifest,
  TokenOverrides,
  SidebarPanelId,
} from "../schemas/manifest";
import type { TokenDoc } from "../utils/token-parser";

interface TokenViewerProps {
  manifest: Manifest;
  selectedProject: string;
  onProjectChange: (val: string) => void;
  onEnterStudio: () => void;
  overrides: TokenOverrides;
  updateOverride: (
    newValues: Record<string, string | number>,
    label?: string,
  ) => void;
}

export const TokenViewer = ({
  manifest,
  selectedProject,
  onProjectChange,
  onEnterStudio,
  overrides,
}: TokenViewerProps) => {
  const { globalTokens, loading } = useGlobalTokens();
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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

  const hasOverrides = Object.keys(overrides).length > 0;

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

  useEffect(() => {
    localStorage.setItem("ide_active_panel", activePanel);
  }, [activePanel]);

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

  const handleHover = useCallback(
    (token: TokenDoc | null, pos: { x: number; y: number } | null) => {
      if (editMode) return;
      setHoveredToken({ token, pos });
    },
    [editMode],
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

      if (response.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error("Error deleting token", e);
    }
  }, []);

  const handleExport = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  if (loading)
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );

  return (
    <HStack align="stretch" gap={0} bg="white" h="100vh" overflow="hidden">
      <ActivityBar activePanel={activePanel} onPanelChange={setActivePanel} />

      <FileExplorer
        manifest={manifest}
        context={activePanel}
        activePath={selectedProject}
        onSelect={(_, key) => onProjectChange(key)}
      />

      <VStack
        flex={1}
        align="stretch"
        gap={0}
        bg="#f7fafc"
        overflowY="auto"
        pb="120px"
        position="relative"
      >
        <InspectorOverlay token={hoveredToken.token} pos={hoveredToken.pos} />

        <Box
          position="sticky"
          top={0}
          zIndex={1000}
          bg="rgba(255, 255, 255, 0.85)"
          backdropFilter="blur(12px)"
          borderBottom="1px solid"
          borderColor="gray.200"
          px={8}
          py={3}
          boxShadow="sm"
        >
          <HStack gap={8} align="center">
            <VStack align="start" gap={0} minW="max-content">
              <Heading
                size="md"
                letterSpacing="tight"
                fontWeight="extrabold"
                color="gray.800"
              >
                Design Token Manager
              </Heading>
              <HStack mt={0.5}>
                <Text
                  fontSize="10px"
                  color="gray.500"
                  fontWeight="bold"
                  textTransform="uppercase"
                  letterSpacing="widest"
                >
                  Explorer
                </Text>
                {hasOverrides && (
                  <Badge
                    colorScheme="orange"
                    variant="solid"
                    fontSize="8px"
                    px={1.5}
                    borderRadius="full"
                  >
                    Live
                  </Badge>
                )}
              </HStack>
            </VStack>

            <HStack
              gap={3}
              bg="gray.50"
              px={3}
              py={1.5}
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.100"
            >
              <Text
                fontSize="9px"
                fontWeight="bold"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="widest"
              >
                Active:
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="blue.600">
                {selectedProject || "None Selected"}
              </Text>
            </HStack>

            <Box flex={1} display="flex" justifyContent="center">
              <HStack bg="gray.100" p={1} borderRadius="lg" gap={1}>
                <Button
                  size="xs"
                  variant={!editMode ? "solid" : "ghost"}
                  bg={!editMode ? "white" : "transparent"}
                  color={!editMode ? "blue.600" : "gray.500"}
                  boxShadow={!editMode ? "sm" : "none"}
                  onClick={() => setEditMode(false)}
                  gap={2}
                >
                  <LuEye size={14} /> View
                </Button>
                <Button
                  size="xs"
                  variant={editMode ? "solid" : "ghost"}
                  bg={editMode ? "white" : "transparent"}
                  color={editMode ? "blue.600" : "gray.500"}
                  boxShadow={editMode ? "sm" : "none"}
                  onClick={() => setEditMode(true)}
                  gap={2}
                >
                  <LuLayoutDashboard size={14} /> Manage
                </Button>
              </HStack>
            </Box>

            <HStack gap={3}>
              <Button
                variant="outline"
                size="sm"
                borderRadius="full"
                px={4}
                onClick={handleExport}
                gap={2}
              >
                <LuDownload size={14} /> Tokens Studio
              </Button>
              <Button
                colorScheme="blue"
                size="sm"
                borderRadius="full"
                px={5}
                onClick={onEnterStudio}
              >
                Studio 🚀
              </Button>
            </HStack>
          </HStack>
        </Box>

        <Box flex={1} overflow="hidden">
          <TokenTree
            semanticTokens={semanticTokens}
            foundationTokens={foundationTokens}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            editMode={editMode}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onHover={handleHover}
          />
        </Box>
      </VStack>

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
    </HStack>
  );
};

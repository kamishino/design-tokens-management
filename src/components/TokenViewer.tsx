import {
  Box,
  Text,
  VStack,
  Heading,
  Badge,
  HStack,
  Spinner,
  Center,
  Input,
  IconButton,
  Portal,
  Clipboard,
  Flex,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useGlobalTokens } from "../hooks/useGlobalTokens";
import { groupTokensByFile } from "../utils/token-grouping";
import { ToCOutline } from "./explorer/ToCOutline";
import {
  LuSearch,
  LuX,
  LuDatabase,
  LuLayers,
  LuArrowRight,
  LuCopy,
  LuCheck,
  LuEye,
  LuLayoutDashboard,
  LuPlus,
  LuDownload,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { Button } from "./ui/button";
import { FileExplorer } from "./explorer/FileExplorer";
import { ActivityBar } from "./explorer/ActivityBar";
import { TokenTable } from "./docs/TokenTable";
import { TokenEditModal } from "./explorer/TokenEditModal";
import type {
  Manifest,
  TokenOverrides,
  SidebarPanelId,
  Project,
} from "../schemas/manifest";
import type { TokenDoc } from "../utils/token-parser";
import {
  exportToTokensStudio,
  downloadJson,
} from "../utils/exporters/figma-tokens";
import { getPrioritizedTokenMap } from "../utils/token-graph";

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

/**
 * Inspector Overlay Singleton with Mouse Follow and Copy utility
 */
const InspectorOverlay = ({
  token,
  pos,
}: {
  token: TokenDoc | null;
  pos: { x: number; y: number } | null;
}) => {
  if (!token || !pos) return null;

  const terminalValue =
    typeof token.resolvedValue === "object"
      ? JSON.stringify(token.resolvedValue)
      : String(token.resolvedValue);

  return (
    <Portal>
      <Box
        position="fixed"
        top={`${pos.y - 12}px`}
        left={`${pos.x + 12}px`}
        transform="translateY(-100%)"
        bg="gray.900"
        color="white"
        p={3}
        borderRadius="lg"
        boxShadow="2xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        zIndex={3000}
        maxW="340px"
        pointerEvents="auto" // Allow interaction with copy button
      >
        <VStack align="start" gap={3}>
          <HStack gap={3} w="full" justify="space-between">
            <HStack gap={3}>
              {token.type === "color" && (
                <Box
                  w="32px"
                  h="32px"
                  bg={
                    typeof token.resolvedValue === "string"
                      ? token.resolvedValue
                      : undefined
                  }
                  borderRadius="md"
                  border="2px solid"
                  borderColor="whiteAlpha.300"
                  boxShadow="inner"
                />
              )}
              <VStack align="start" gap={0}>
                <Text
                  fontSize="9px"
                  fontWeight="bold"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="widest"
                >
                  Terminal Root Value
                </Text>
                <Text
                  fontSize="13px"
                  fontFamily="'Space Mono', monospace"
                  fontWeight="bold"
                  color="blue.300"
                >
                  {terminalValue}
                </Text>
              </VStack>
            </HStack>

            <Clipboard.Root value={terminalValue}>
              <Clipboard.Trigger asChild>
                <IconButton
                  size="xs"
                  variant="subtle"
                  colorScheme="blue"
                  borderRadius="md"
                >
                  <Clipboard.Indicator copied={<LuCheck size={14} />}>
                    <LuCopy size={14} />
                  </Clipboard.Indicator>
                </IconButton>
              </Clipboard.Trigger>
            </Clipboard.Root>
          </HStack>

          <Box h="1px" w="full" bg="whiteAlpha.100" />
          <VStack align="start" gap={1} w="full">
            <Text
              fontSize="9px"
              fontWeight="bold"
              color="gray.500"
              textTransform="uppercase"
            >
              Trace Path
            </Text>
            <Text
              fontSize="10px"
              color="whiteAlpha.600"
              lineClamp={2}
              fontFamily="monospace"
            >
              {token.rawValue}
            </Text>
          </VStack>
        </VStack>
      </Box>
    </Portal>
  );
};

const MasterSection = ({
  id,
  title,
  icon: Icon,
  count,
  tokens,
  color,
  onHover,
  editMode,
  onCreate,
}: {
  id?: string;
  title: string;
  icon: IconType;
  count: number;
  tokens: TokenDoc[];
  color: string;
  onHover: (
    token: TokenDoc | null,
    pos: { x: number; y: number } | null,
  ) => void;
  editMode: boolean;
  onCreate: () => void;
}) => {
  if (tokens.length === 0) return null;

  return (
    <VStack id={id} align="stretch" gap={4} mb={16} scrollMarginTop="80px">
      <HStack
        position="sticky"
        top="60px"
        zIndex={10}
        py={3}
        bg="white"
        justify="space-between"
        borderBottom="2px solid"
        borderColor={`${color}.200`}
      >
        <HStack gap={3}>
          <Box
            p={2}
            bg={`${color}.500`}
            borderRadius="lg"
            color="white"
            boxShadow="md"
          >
            <Icon size={20} />
          </Box>
          <VStack align="start" gap={0}>
            <Heading
              size="sm"
              textTransform="uppercase"
              letterSpacing="wider"
              color="gray.800"
            >
              {title}
            </Heading>
            <Text fontSize="11px" color={`${color}.600`} fontWeight="bold">
              {count} {count === 1 ? "token" : "tokens"} mapped
            </Text>
          </VStack>
        </HStack>
        <HStack gap={3}>
          {editMode && (
            <Button
              size="xs"
              variant="subtle"
              colorPalette={color}
              onClick={onCreate}
              gap={1.5}
            >
              <LuPlus size={14} /> Add Token
            </Button>
          )}
          <Badge
            colorScheme={color}
            variant="solid"
            fontSize="10px"
            px={3}
            py={0.5}
            borderRadius="full"
          >
            {title === "Semantic" ? "Application Layer" : "Foundation Layer"}
          </Badge>
        </HStack>
      </HStack>

      <TokenTable
        tokens={tokens}
        onHover={onHover}
        showSource={true}
        editMode={editMode}
      />
    </VStack>
  );
};

const ExportSelectionModal = ({
  isOpen,
  onClose,
  manifest,
  globalTokens,
  overrides,
}: {
  isOpen: boolean;
  onClose: () => void;
  manifest: Manifest;
  globalTokens: TokenDoc[];
  overrides: TokenOverrides;
}) => {
  const [selectedPath, setSelectedPath] = useState<string>("global");
  const [copied, setCopied] = useState(false);

  // Group projects by client
  const projectsByClient = useMemo(() => {
    const grouped: Record<string, Project[]> = {};
    Object.values(manifest.projects).forEach((proj) => {
      if (!grouped[proj.client]) {
        grouped[proj.client] = [];
      }
      grouped[proj.client].push(proj);
    });
    return grouped;
  }, [manifest.projects]);

  // Generate live preview JSON
  const previewJson = useMemo(() => {
    const prioritizedMap = getPrioritizedTokenMap(
      globalTokens,
      selectedPath === "global" ? "" : selectedPath,
    );
    return exportToTokensStudio(prioritizedMap, overrides);
  }, [globalTokens, selectedPath, overrides]);

  const handleCopy = () => {
    navigator.clipboard.writeText(previewJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteExport = () => {
    const filename =
      selectedPath === "global"
        ? "tokens-global.json"
        : `tokens-${selectedPath.split("/").pop()}.json`;
    downloadJson(filename, previewJson);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <Box
        position="fixed"
        inset={0}
        bg="blackAlpha.700"
        backdropFilter="blur(8px)"
        zIndex={4000}
        display="flex"
        alignItems="center"
        justifyContent="center"
        onClick={onClose}
        p={4}
      >
        <Box
          bg="white"
          borderRadius="3xl"
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          w="full"
          maxW="1200px"
          h="90vh"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          onClick={(e) => e.stopPropagation()}
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          {/* HEADER */}
          <Box p={6} borderBottom="1px solid" borderColor="gray.100">
            <HStack justify="space-between">
              <VStack align="start" gap={0}>
                <Heading size="md" fontWeight="black" letterSpacing="tight">
                  Export for Tokens Studio
                </Heading>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  Select context to resolve inheritance and preview the
                  generated JSON tree
                </Text>
              </VStack>
              <IconButton
                variant="ghost"
                aria-label="Close"
                size="sm"
                onClick={onClose}
                borderRadius="full"
                _hover={{ bg: "gray.100" }}
              >
                <LuX />
              </IconButton>
            </HStack>
          </Box>

          <Flex flex={1} overflow="hidden">
            {/* LEFT: SELECTION (Sidebar) */}
            <Box
              w="380px"
              minW="380px"
              flexShrink={0}
              p={6}
              overflowY="auto"
              borderRight="1px solid"
              borderColor="gray.100"
              bg="gray.50/50"
            >
              <VStack align="stretch" gap={6}>
                <VStack align="stretch" gap={2}>
                  <Text
                    fontSize="10px"
                    fontWeight="black"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="widest"
                    whiteSpace="nowrap"
                  >
                    Foundational Context
                  </Text>
                  <Box
                    p={4}
                    borderRadius="2xl"
                    border="1px solid"
                    transition="all 0.2s"
                    borderColor={
                      selectedPath === "global" ? "blue.400" : "gray.200"
                    }
                    bg={selectedPath === "global" ? "blue.500" : "white"}
                    color={selectedPath === "global" ? "white" : "inherit"}
                    boxShadow={selectedPath === "global" ? "lg" : "sm"}
                    cursor="pointer"
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "md",
                      borderColor:
                        selectedPath === "global" ? "blue.400" : "gray.300",
                    }}
                    onClick={() => setSelectedPath("global")}
                  >
                    <HStack gap={4}>
                      <Box
                        p={2.5}
                        bg={
                          selectedPath === "global"
                            ? "whiteAlpha.300"
                            : "blue.500"
                        }
                        color="white"
                        borderRadius="xl"
                      >
                        <LuDatabase size={18} />
                      </Box>
                      <VStack align="start" gap={0}>
                        <Text fontWeight="bold" fontSize="sm">
                          Global Foundation
                        </Text>
                        <Text
                          fontSize="xs"
                          color={
                            selectedPath === "global" ? "blue.100" : "gray.500"
                          }
                        >
                          Core design tokens (standard)
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </VStack>

                <VStack align="stretch" gap={4}>
                  <Text
                    fontSize="10px"
                    fontWeight="black"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="widest"
                    whiteSpace="nowrap"
                  >
                    Project Contexts
                  </Text>

                  {Object.entries(projectsByClient).map(
                    ([clientName, projects]) => (
                      <VStack key={clientName} align="stretch" gap={3}>
                        <Text
                          fontSize="xs"
                          fontWeight="black"
                          color="gray.800"
                          px={1}
                        >
                          {clientName}
                        </Text>
                        {projects.map((proj) => {
                          const fullPath = proj.path;
                          const isSelected = selectedPath === fullPath;
                          return (
                            <Box
                              key={proj.name}
                              p={4}
                              borderRadius="2xl"
                              border="1px solid"
                              transition="all 0.2s"
                              borderColor={isSelected ? "blue.400" : "white"}
                              bg={isSelected ? "blue.500" : "white"}
                              color={isSelected ? "white" : "inherit"}
                              boxShadow={isSelected ? "lg" : "sm"}
                              cursor="pointer"
                              _hover={{
                                transform: "translateY(-1px)",
                                boxShadow: "md",
                                borderColor: isSelected
                                  ? "blue.400"
                                  : "gray.200",
                              }}
                              onClick={() => setSelectedPath(fullPath)}
                            >
                              <HStack gap={4}>
                                <Box
                                  p={2.5}
                                  bg={
                                    isSelected ? "whiteAlpha.300" : "gray.100"
                                  }
                                  color={isSelected ? "white" : "gray.600"}
                                  borderRadius="xl"
                                >
                                  <LuLayoutDashboard size={18} />
                                </Box>
                                <VStack align="start" gap={0}>
                                  <Text fontWeight="bold" fontSize="sm">
                                    {proj.name}
                                  </Text>
                                  <Text
                                    fontSize="xs"
                                    color={isSelected ? "blue.100" : "gray.500"}
                                  >
                                    Inherits: {clientName} &gt; Global
                                  </Text>
                                </VStack>
                              </HStack>
                            </Box>
                          );
                        })}
                      </VStack>
                    ),
                  )}
                </VStack>
              </VStack>
            </Box>

            {/* RIGHT: PREVIEW */}
            <Box
              flex={1}
              bg="gray.900"
              display="flex"
              flexDirection="column"
              position="relative"
              minW={0}
            >
              <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                <HStack justify="space-between">
                  <Badge
                    variant="surface"
                    colorScheme="blue"
                    borderRadius="md"
                    px={2}
                    py={0.5}
                    bg="blue.500/20"
                    color="blue.300"
                  >
                    Live Preview (JSON)
                  </Badge>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={handleCopy}
                    colorPalette={copied ? "green" : "gray"}
                    borderColor="whiteAlpha.300"
                    color="white"
                    _hover={{ bg: "whiteAlpha.100" }}
                    gap={2}
                  >
                    {copied ? <LuCheck /> : <LuCopy />}
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </Button>
                </HStack>
              </Box>

              <Box
                flex={1}
                overflow="auto"
                p={0}
                css={{
                  "&::-webkit-scrollbar": {
                    width: "8px",
                    height: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(255, 255, 255, 0.05)",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                <SyntaxHighlighter
                  language="json"
                  style={dracula}
                  customStyle={{
                    margin: 0,
                    padding: "24px",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    background: "transparent",
                    minHeight: "100%",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                  wrapLines={true}
                  wrapLongLines={true}
                >
                  {previewJson}
                </SyntaxHighlighter>
              </Box>
            </Box>
          </Flex>

          {/* FOOTER */}
          <Box p={6} bg="white" borderTop="1px solid" borderColor="gray.100">
            <HStack justify="flex-end" gap={4}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                fontWeight="bold"
              >
                Cancel
              </Button>
              <Button
                colorPalette="blue"
                size="md"
                onClick={handleExecuteExport}
                gap={2}
                px={8}
                borderRadius="xl"
                fontWeight="black"
              >
                <LuDownload size={18} /> Finalize & Download
              </Button>
            </HStack>
          </Box>
        </Box>
      </Box>
    </Portal>
  );
};

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
  const [initialCategory, setInitialCategory] = useState<string | undefined>();

  const [expandedMaster] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["semantic", "foundation"];
    const saved = localStorage.getItem("ide_expanded_master");
    return saved ? JSON.parse(saved) : ["semantic", "foundation"];
  });

  const hasOverrides = Object.keys(overrides).length > 0;

  const categories = useMemo(
    () => groupTokensByFile(globalTokens, searchTerm),
    [globalTokens, searchTerm],
  );

  const isJsonFocus = selectedProject.endsWith(".json");

  const displayCategories = useMemo(() => {
    if (!isJsonFocus) return categories;
    // Strict equality check now that both are full paths
    return categories.filter((cat) => cat.id === selectedProject);
  }, [categories, selectedProject, isJsonFocus]);

  const { semanticTokens, foundationTokens } = useMemo(() => {
    const semantic = displayCategories
      .filter((cat) => !cat.id.includes("global/base"))
      .flatMap((cat) => cat.tokens);

    const foundation = displayCategories
      .filter((cat) => cat.id.includes("global/base"))
      .flatMap((cat) => cat.tokens);

    return { semanticTokens: semantic, foundationTokens: foundation };
  }, [displayCategories]);

  const focusedFilename = useMemo(() => {
    if (!isJsonFocus) return null;
    return selectedProject.split("/").pop() || selectedProject;
  }, [selectedProject, isJsonFocus]);

  useEffect(() => {
    localStorage.setItem("ide_active_panel", activePanel);
  }, [activePanel]);

  useEffect(() => {
    localStorage.setItem("ide_expanded_master", JSON.stringify(expandedMaster));
  }, [expandedMaster]);

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

  const handleCreate = useCallback((category?: string) => {
    setEditingToken(null);
    setInitialCategory(category);
    setIsEditorOpen(true);
  }, []);

  const handleEdit = useCallback((token: TokenDoc) => {
    setEditingToken(token);
    setIsEditorOpen(true);
  }, []);

  const handleDelete = useCallback(async (token: TokenDoc) => {
    if (!window.confirm(`Are you sure you want to delete ${token.name}?`))
      return;

    // Extract the dot-notation path part of the ID
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

        <Box p={8}>
          <VStack align="stretch" gap={10}>
            {/* Context Controls */}
            <HStack
              justify="space-between"
              bg="white"
              p={4}
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.100"
              boxShadow="sm"
            >
              <HStack gap={6}>
                <VStack align="start" gap={0}>
                  <Text fontSize="10px" fontWeight="bold" color="gray.400">
                    PROJECT CONTEXT
                  </Text>
                  <HStack gap={2}>
                    <Text fontWeight="bold" fontSize="sm">
                      {focusedFilename || "All Files"}
                    </Text>
                    {isJsonFocus && <LuArrowRight size={12} color="gray" />}
                    {isJsonFocus && (
                      <Badge colorScheme="blue" size="xs">
                        Focused
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              <HStack gap={4}>
                <HStack w="full" maxW="300px" position="relative">
                  <Box position="absolute" left={3} color="gray.400" zIndex={1}>
                    <LuSearch size={14} />
                  </Box>
                  <Input
                    placeholder="Search tokens..."
                    pl={9}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="xs"
                    borderRadius="full"
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.100"
                  />
                </HStack>
                {isJsonFocus && (
                  <Button
                    size="xs"
                    variant="subtle"
                    colorScheme="blue"
                    onClick={() => onProjectChange("")}
                  >
                    <LuX style={{ marginRight: "4px" }} /> Clear Focus
                  </Button>
                )}
              </HStack>
            </HStack>

            <HStack gap={8} align="flex-start">
              <Box flex={1} minW={0}>
                {isJsonFocus ? (
                  <VStack align="stretch" gap={4}>
                    <HStack
                      justify="space-between"
                      borderBottom="2px solid"
                      borderColor="blue.200"
                      py={3}
                    >
                      <HStack gap={3}>
                        <Box
                          p={2}
                          bg="blue.500"
                          borderRadius="lg"
                          color="white"
                        >
                          <LuLayers size={20} />
                        </Box>
                        <VStack align="start" gap={0}>
                          <Heading size="sm" textTransform="uppercase">
                            {focusedFilename}
                          </Heading>
                          <Text
                            fontSize="11px"
                            color="blue.600"
                            fontWeight="bold"
                          >
                            {semanticTokens.length + foundationTokens.length}{" "}
                            tokens in file
                          </Text>
                        </VStack>
                      </HStack>
                      {editMode && (
                        <Button
                          size="xs"
                          colorPalette="blue"
                          onClick={() => handleCreate()}
                          gap={1.5}
                        >
                          <LuPlus size={14} /> Add Token
                        </Button>
                      )}
                    </HStack>
                    <TokenTable
                      tokens={[...semanticTokens, ...foundationTokens]}
                      onHover={handleHover}
                      showSource={false}
                      editMode={editMode}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </VStack>
                ) : displayCategories.length > 0 ? (
                  <VStack align="stretch" gap={0}>
                    <MasterSection
                      id="section-semantic"
                      title="Semantic"
                      icon={LuLayers}
                      count={semanticTokens.length}
                      tokens={semanticTokens}
                      color="purple"
                      onHover={handleHover}
                      editMode={editMode}
                      onCreate={() => handleCreate("semantic")}
                    />

                    <MasterSection
                      id="section-foundation"
                      title="Foundation"
                      icon={LuDatabase}
                      count={foundationTokens.length}
                      tokens={foundationTokens}
                      color="blue"
                      onHover={handleHover}
                      editMode={editMode}
                      onCreate={() => handleCreate("color")}
                    />
                  </VStack>
                ) : (
                  <Center
                    p={20}
                    bg="gray.50"
                    borderRadius="xl"
                    border="2px dashed"
                    borderColor="gray.200"
                  >
                    <VStack gap={2}>
                      <Text color="gray.400" fontWeight="bold">
                        No categories matched this search.
                      </Text>
                      <Button
                        size="xs"
                        variant="plain"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear Search
                      </Button>
                    </VStack>
                  </Center>
                )}
              </Box>
              <Box
                w="240px"
                display={{ base: "none", lg: "block" }}
                alignSelf="stretch"
              >
                <ToCOutline categories={displayCategories} />
              </Box>
            </HStack>
          </VStack>
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
        initialCategory={initialCategory}
        globalTokens={globalTokens}
      />

      <ExportSelectionModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        manifest={manifest}
        globalTokens={globalTokens}
        overrides={overrides}
      />
    </HStack>
  );
};

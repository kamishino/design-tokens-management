import {
  Box,
  Text,
  VStack,
  Heading,
  Badge,
  HStack,
  IconButton,
  Portal,
  Flex,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  LuX,
  LuDatabase,
  LuCopy,
  LuCheck,
  LuLayoutDashboard,
  LuDownload,
  LuBoxes,
} from "react-icons/lu";
import { Button } from "../ui/button";
import type { Manifest, TokenOverrides, Project } from "../../schemas/manifest";
import type { TokenDoc } from "../../utils/token-parser";
import {
  exportToTokensStudio,
  downloadJson,
} from "../../utils/exporters/figma-tokens";
import { getPrioritizedTokenMap } from "../../utils/token-graph";
import { FigmaExportPanel } from "./FigmaExportPanel";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: Manifest;
  globalTokens: TokenDoc[];
  overrides: TokenOverrides;
}

export const ExportModal = ({
  isOpen,
  onClose,
  manifest,
  globalTokens,
  overrides,
}: ExportModalProps) => {
  const [activeTab, setActiveTab] = useState<"studio" | "figma">("studio");
  const [selectedPath, setSelectedPath] = useState<string>("global");
  const [copied, setCopied] = useState(false);

  // Group projects by client
  const projectsByClient = useMemo(() => {
    const grouped: Record<string, Project[]> = {};
    Object.values(manifest.projects).forEach((proj) => {
      if (!grouped[proj.client]) grouped[proj.client] = [];
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
          {/* HEADER + TAB BAR */}
          <Box p={6} borderBottom="1px solid" borderColor="gray.100">
            <HStack justify="space-between" mb={4}>
              <VStack align="start" gap={0}>
                <Heading size="md" fontWeight="black" letterSpacing="tight">
                  Export Tokens
                </Heading>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  Choose your target format
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

            {/* Tab Bar */}
            <HStack gap={0} borderBottom="2px solid" borderColor="gray.100">
              {[
                {
                  id: "studio" as const,
                  label: "Tokens Studio",
                  icon: <LuDatabase size={13} />,
                },
                {
                  id: "figma" as const,
                  label: "Figma Variables",
                  icon: <LuBoxes size={13} />,
                },
              ].map((tab) => (
                <HStack
                  key={tab.id}
                  as="button"
                  px={4}
                  py={2}
                  gap={1.5}
                  fontSize="12px"
                  fontWeight={activeTab === tab.id ? "700" : "500"}
                  color={activeTab === tab.id ? "blue.600" : "gray.400"}
                  borderBottom="2px solid"
                  borderColor={
                    activeTab === tab.id ? "blue.500" : "transparent"
                  }
                  mb="-2px"
                  cursor="pointer"
                  onClick={() => setActiveTab(tab.id)}
                  _hover={{
                    color: activeTab === tab.id ? "blue.600" : "gray.600",
                  }}
                  transition="all 0.1s"
                >
                  {tab.icon}
                  <Text fontSize="12px">{tab.label}</Text>
                </HStack>
              ))}
            </HStack>
          </Box>

          {/* ── FIGMA VARIABLES TAB ───────────────────────────────────── */}
          {activeTab === "figma" && (
            <Box flex={1} overflowY="auto">
              <FigmaExportPanel />
            </Box>
          )}

          {/* ── TOKENS STUDIO TAB ────────────────────────────────────── */}
          {activeTab === "studio" && (
            <Flex flex={1} overflow="hidden">
              {/* LEFT: SELECTION */}
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
                  {/* Global */}
                  <VStack align="stretch" gap={2}>
                    <Text
                      fontSize="10px"
                      fontWeight="black"
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="widest"
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
                              selectedPath === "global"
                                ? "blue.100"
                                : "gray.500"
                            }
                          >
                            Core design tokens (standard)
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </VStack>

                  {/* Projects */}
                  <VStack align="stretch" gap={4}>
                    <Text
                      fontSize="10px"
                      fontWeight="black"
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="widest"
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
                          {projects.map((proj: Project) => {
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
                                      color={
                                        isSelected ? "blue.100" : "gray.500"
                                      }
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
                minW={0}
              >
                <Box
                  p={4}
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.100"
                >
                  <HStack justify="space-between">
                    <Badge
                      variant="surface"
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
                    "&::-webkit-scrollbar": { width: "8px", height: "8px" },
                    "&::-webkit-scrollbar-track": {
                      background: "rgba(255,255,255,0.05)",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      background: "rgba(255,255,255,0.3)",
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
          )}

          {/* FOOTER (Studio tab only) */}
          {activeTab === "studio" && (
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
                  <LuDownload size={18} /> Finalize &amp; Download
                </Button>
              </HStack>
            </Box>
          )}
        </Box>
      </Box>
    </Portal>
  );
};

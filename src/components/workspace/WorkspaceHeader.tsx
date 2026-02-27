import {
  Box,
  Text,
  HStack,
  Heading,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import {
  LuDownload,
  LuCommand,
  LuEye,
  LuPanelLeft,
  LuPanelLeftClose,
  LuPanelRight,
  LuPanelRightClose,
  LuLayers,
  LuShieldCheck,
} from "react-icons/lu";
import { Button } from "../ui/button";
import type { Manifest } from "../../schemas/manifest";

interface WorkspaceHeaderProps {
  manifest: Manifest;
  selectedProject: string;
  hasOverrides: boolean;
  onOpenExport: () => void;
  onOpenPalette: () => void;
  sidebarVisible: boolean;
  inspectorVisible: boolean;
  onToggleSidebar: () => void;
  onToggleInspector: () => void;
  onOpenGlobalBackups: () => void;
}

export const WorkspaceHeader = ({
  manifest,
  selectedProject,
  hasOverrides,
  onOpenExport,
  onOpenPalette,
  sidebarVisible,
  inspectorVisible,
  onToggleSidebar,
  onToggleInspector,
  onOpenGlobalBackups,
}: WorkspaceHeaderProps) => {
  const selectedProjectEntry = selectedProject
    ? manifest.projects[selectedProject]
    : undefined;

  const selectedBrand =
    selectedProjectEntry && selectedProjectEntry.metadata
      ? (() => {
          const maybeBrand = (selectedProjectEntry.metadata as Record<string, unknown>)
            .brand;
          return typeof maybeBrand === "string" && maybeBrand.trim()
            ? maybeBrand
            : "core";
        })()
      : "core";

  const selectedLabel = selectedProject
    ? selectedProjectEntry
      ? `${selectedProjectEntry.client} / ${selectedBrand} / ${
          selectedProjectEntry.project || selectedProjectEntry.name
        }`
      : selectedProject
    : "All files";

  return (
    <HStack
      w="full"
      h="40px"
      minH="40px"
      px={3}
      gap={0}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.100"
      flexShrink={0}
    >
      {/* ── LEFT ZONE: sidebar toggle + brand ── */}
      <HStack gap={1} flexShrink={0} mr={3}>
        {/* Sidebar toggle — VS Code convention: topmost left */}
        <IconButton
          aria-label="Toggle sidebar"
          variant="ghost"
          size="xs"
          color={sidebarVisible ? "blue.500" : "gray.300"}
          onClick={onToggleSidebar}
          _hover={{ bg: "gray.100", color: "blue.600" }}
          title={
            sidebarVisible ? "Hide Sidebar (Ctrl+B)" : "Show Sidebar (Ctrl+B)"
          }
          h="28px"
          minW="28px"
        >
          {sidebarVisible ? (
            <LuPanelLeftClose size={15} />
          ) : (
            <LuPanelLeft size={15} />
          )}
        </IconButton>

        {/* Brand */}
        <HStack gap={1.5} pl={1}>
          <LuLayers size={14} color="var(--chakra-colors-blue-500)" />
          <Heading
            size="sm"
            letterSpacing="tight"
            fontWeight="800"
            color="gray.800"
          >
            DTM
          </Heading>
          {hasOverrides && (
            <Badge
              colorPalette="orange"
              variant="solid"
              fontSize="8px"
              px={1.5}
              borderRadius="full"
            >
              Live
            </Badge>
          )}
        </HStack>
      </HStack>

      {/* ── CENTER ZONE: active project breadcrumb ── */}
      <Box flex={1} display="flex" justifyContent="center">
        <HStack
          gap={1.5}
          px={3}
          py={0.5}
          borderRadius="full"
          bg="gray.50"
          border="1px solid"
          borderColor="gray.100"
          _hover={{ borderColor: "gray.200", bg: "gray.100" }}
          transition="all 0.15s"
          maxW="320px"
          w="full"
          justifyContent="center"
        >
          <LuEye size={11} color="var(--chakra-colors-gray-400)" />
          <Text
            fontSize="11px"
            fontWeight="600"
            color="blue.600"
            fontFamily="'Space Mono', monospace"
            maxW="240px"
            truncate
          >
            {selectedLabel}
          </Text>
        </HStack>
      </Box>

      {/* ── RIGHT ZONE: actions + inspector toggle ── */}
      <HStack gap={1} flexShrink={0} ml={3}>
        {/* Cmd+K shortcut hint */}
        <Button
          variant="ghost"
          size="xs"
          onClick={onOpenPalette}
          gap={1}
          color="gray.400"
          _hover={{ color: "gray.700", bg: "gray.50" }}
          px={2}
          h="28px"
        >
          <LuCommand size={12} />
          <Text fontSize="10px">K</Text>
        </Button>

        {/* Export */}
        <Button
          variant="solid"
          size="xs"
          onClick={onOpenExport}
          gap={1.5}
          colorPalette="blue"
          h="28px"
          px={3}
          fontSize="11px"
        >
          <LuDownload size={12} />
          Export
        </Button>

        {/* Global backup history */}
        <Button
          variant="ghost"
          size="xs"
          onClick={onOpenGlobalBackups}
          gap={1}
          color="gray.500"
          _hover={{ color: "orange.600", bg: "orange.50" }}
          h="28px"
          px={2}
          title="Open global backup history"
        >
          <LuShieldCheck size={12} />
          <Text fontSize="10px">Backups</Text>
        </Button>

        {/* Divider */}
        <Box w="1px" h="20px" bg="gray.100" mx={1} />

        {/* Inspector toggle */}
        <IconButton
          aria-label="Toggle inspector"
          variant="ghost"
          size="xs"
          color={inspectorVisible ? "blue.500" : "gray.300"}
          onClick={onToggleInspector}
          _hover={{ bg: "gray.100", color: "blue.600" }}
          title={
            inspectorVisible ? "Hide Panel (Ctrl+J)" : "Show Panel (Ctrl+J)"
          }
          h="28px"
          minW="28px"
        >
          {inspectorVisible ? (
            <LuPanelRightClose size={15} />
          ) : (
            <LuPanelRight size={15} />
          )}
        </IconButton>
      </HStack>
    </HStack>
  );
};

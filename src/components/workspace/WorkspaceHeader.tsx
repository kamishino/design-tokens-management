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
}: WorkspaceHeaderProps) => {
  const selectedLabel = selectedProject
    ? manifest.projects[selectedProject]?.project ||
      manifest.projects[selectedProject]?.name ||
      selectedProject
    : "All files";

  return (
    <HStack
      h="44px"
      minH="44px"
      px={4}
      gap={3}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      flexShrink={0}
    >
      {/* Brand */}
      <HStack gap={2} minW="max-content">
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

      {/* Active Project Label (read-only — project selector lives in StudioToolbar) */}
      <HStack
        gap={1.5}
        px={2}
        py={0.5}
        borderRadius="md"
        bg="gray.50"
        border="1px solid"
        borderColor="gray.100"
      >
        <LuEye size={11} color="var(--chakra-colors-gray-400)" />
        <Text
          fontSize="11px"
          fontWeight="600"
          color="blue.600"
          fontFamily="'Space Mono', monospace"
          maxW="180px"
          truncate
        >
          {selectedLabel}
        </Text>
      </HStack>

      {/* Spacer */}
      <Box flex={1} />

      {/* Actions */}
      <HStack gap={1}>
        <Button
          variant="ghost"
          size="xs"
          onClick={onOpenPalette}
          gap={1.5}
          color="gray.500"
          _hover={{ color: "gray.700" }}
          px={2}
        >
          <LuCommand size={12} />
          <Text fontSize="10px">Cmd+K</Text>
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={onOpenExport}
          gap={1.5}
          color="gray.500"
          _hover={{ color: "gray.700" }}
        >
          <LuDownload size={13} />
          <Text fontSize="11px">Export</Text>
        </Button>
      </HStack>

      {/* Layout Toggle Group (VSCode-style, grouped together at right) */}
      <HStack
        gap={0}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        overflow="hidden"
      >
        <IconButton
          aria-label="Toggle sidebar"
          variant="ghost"
          size="xs"
          borderRadius="0"
          color={sidebarVisible ? "gray.600" : "gray.300"}
          onClick={onToggleSidebar}
          _hover={{ bg: "gray.100", color: "blue.500" }}
          title={
            sidebarVisible ? "Hide Sidebar (Ctrl+B)" : "Show Sidebar (Ctrl+B)"
          }
          minW="28px"
          h="26px"
        >
          {sidebarVisible ? (
            <LuPanelLeftClose size={14} />
          ) : (
            <LuPanelLeft size={14} />
          )}
        </IconButton>
        <Box w="1px" h="16px" bg="gray.200" />
        <IconButton
          aria-label="Toggle inspector"
          variant="ghost"
          size="xs"
          borderRadius="0"
          color={inspectorVisible ? "gray.600" : "gray.300"}
          onClick={onToggleInspector}
          _hover={{ bg: "gray.100", color: "blue.500" }}
          title={
            inspectorVisible ? "Hide Panel (Ctrl+J)" : "Show Panel (Ctrl+J)"
          }
          minW="28px"
          h="26px"
        >
          {inspectorVisible ? (
            <LuPanelRightClose size={14} />
          ) : (
            <LuPanelRight size={14} />
          )}
        </IconButton>
      </HStack>
    </HStack>
  );
};

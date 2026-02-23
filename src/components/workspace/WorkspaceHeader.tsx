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
  LuColumns3,
  LuPanelRight,
  LuMaximize,
} from "react-icons/lu";
import { Button } from "../ui/button";
import type { Manifest } from "../../schemas/manifest";

export type LayoutMode = "normal" | "widget" | "fullscreen";

interface WorkspaceHeaderProps {
  manifest: Manifest;
  selectedProject: string;
  hasOverrides: boolean;
  onOpenExport: () => void;
  onOpenPalette: () => void;
  layoutMode: LayoutMode;
  onCycleLayout: () => void;
}

const LAYOUT_ICONS = {
  normal: { Icon: LuColumns3, label: "Normal" },
  widget: { Icon: LuPanelRight, label: "Widget" },
  fullscreen: { Icon: LuMaximize, label: "Fullscreen" },
};

export const WorkspaceHeader = ({
  selectedProject,
  hasOverrides,
  onOpenExport,
  onOpenPalette,
  layoutMode,
  onCycleLayout,
}: WorkspaceHeaderProps) => {
  const { Icon, label } = LAYOUT_ICONS[layoutMode];
  return (
    <HStack
      h="44px"
      minH="44px"
      px={4}
      gap={4}
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
        <Text
          fontSize="9px"
          color="gray.400"
          fontWeight="bold"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Workspace
        </Text>
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

      {/* Context */}
      <HStack
        gap={2}
        px={2.5}
        py={1}
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
          maxW="200px"
          truncate
        >
          {selectedProject || "All files"}
        </Text>
      </HStack>

      {/* Spacer */}
      <Box flex={1} />

      {/* Actions */}
      <HStack gap={1.5}>
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

        <IconButton
          aria-label={`Layout: ${label}`}
          variant="ghost"
          size="xs"
          color="blue.500"
          onClick={onCycleLayout}
          _hover={{ color: "blue.600" }}
          title={`Layout: ${label} (click to cycle)`}
        >
          <Icon size={14} />
        </IconButton>
      </HStack>
    </HStack>
  );
};

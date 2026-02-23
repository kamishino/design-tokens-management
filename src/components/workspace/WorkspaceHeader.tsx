import {
  Box,
  Text,
  VStack,
  HStack,
  Heading,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import {
  LuDownload,
  LuCommand,
  LuEye,
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
  inspectorVisible: boolean;
  onToggleInspector: () => void;
}

export const WorkspaceHeader = ({
  selectedProject,
  hasOverrides,
  onOpenExport,
  onOpenPalette,
  inspectorVisible,
  onToggleInspector,
}: WorkspaceHeaderProps) => {
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
          aria-label="Toggle inspector"
          variant="ghost"
          size="xs"
          color={inspectorVisible ? "blue.500" : "gray.400"}
          onClick={onToggleInspector}
          _hover={{ color: "blue.600" }}
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

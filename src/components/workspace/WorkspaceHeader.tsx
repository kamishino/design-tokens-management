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
  LuChevronDown,
} from "react-icons/lu";
import { useMemo, useState, useRef, useEffect } from "react";
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
  onProjectChange: (key: string) => void;
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
  onProjectChange,
}: WorkspaceHeaderProps) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!projectMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProjectMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [projectMenuOpen]);

  const projectGroups = useMemo(() => {
    const entries = Object.entries(manifest.projects);
    const grouped: {
      client: string;
      projects: { key: string; name: string }[];
    }[] = [];
    for (const [key, project] of entries) {
      const existing = grouped.find((g) => g.client === project.client);
      if (existing) {
        existing.projects.push({ key, name: project.project || project.name });
      } else {
        grouped.push({
          client: project.client,
          projects: [{ key, name: project.project || project.name }],
        });
      }
    }
    return grouped;
  }, [manifest]);

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
      {/* Sidebar Toggle (VSCode-style) */}
      <IconButton
        aria-label="Toggle sidebar"
        variant="ghost"
        size="xs"
        color={sidebarVisible ? "gray.500" : "gray.300"}
        onClick={onToggleSidebar}
        _hover={{ color: "blue.500" }}
        title={
          sidebarVisible ? "Hide Sidebar (Ctrl+B)" : "Show Sidebar (Ctrl+B)"
        }
      >
        {sidebarVisible ? (
          <LuPanelLeftClose size={15} />
        ) : (
          <LuPanelLeft size={15} />
        )}
      </IconButton>

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

      {/* Project Selector (merged ThemeBar) */}
      <Box position="relative" ref={menuRef}>
        <HStack
          gap={1.5}
          px={2.5}
          py={1}
          borderRadius="md"
          bg="gray.50"
          border="1px solid"
          borderColor={projectMenuOpen ? "blue.200" : "gray.100"}
          cursor="pointer"
          _hover={{ borderColor: "blue.200", bg: "blue.50" }}
          transition="all 0.15s"
          onClick={() => setProjectMenuOpen((v) => !v)}
        >
          <LuEye size={11} color="var(--chakra-colors-gray-400)" />
          <Text
            fontSize="11px"
            fontWeight="600"
            color="blue.600"
            fontFamily="'Space Mono', monospace"
            maxW="160px"
            truncate
          >
            {selectedLabel}
          </Text>
          <LuChevronDown size={11} color="var(--chakra-colors-gray-400)" />
        </HStack>

        {/* Dropdown */}
        {projectMenuOpen && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            mt={1}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            boxShadow="lg"
            zIndex={100}
            minW="200px"
            py={1}
            maxH="300px"
            overflowY="auto"
          >
            {/* All files option */}
            <HStack
              px={3}
              py={1.5}
              cursor="pointer"
              bg={!selectedProject ? "blue.50" : "transparent"}
              _hover={{ bg: "blue.50" }}
              onClick={() => {
                onProjectChange("");
                setProjectMenuOpen(false);
              }}
            >
              <Text
                fontSize="11px"
                fontWeight={!selectedProject ? "700" : "500"}
                color={!selectedProject ? "blue.700" : "gray.600"}
              >
                All files
              </Text>
            </HStack>

            {projectGroups.map((group) => (
              <Box key={group.client}>
                <Text
                  px={3}
                  py={1}
                  fontSize="9px"
                  fontWeight="700"
                  color="gray.300"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  {group.client}
                </Text>
                {group.projects.map((p) => (
                  <HStack
                    key={p.key}
                    px={3}
                    py={1.5}
                    cursor="pointer"
                    bg={selectedProject === p.key ? "blue.50" : "transparent"}
                    _hover={{ bg: "blue.50" }}
                    onClick={() => {
                      onProjectChange(p.key);
                      setProjectMenuOpen(false);
                    }}
                    gap={2}
                  >
                    <Text
                      fontSize="11px"
                      fontWeight={selectedProject === p.key ? "700" : "500"}
                      color={
                        selectedProject === p.key ? "blue.700" : "gray.600"
                      }
                    >
                      {p.name}
                    </Text>
                  </HStack>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Box>

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

      {/* Inspector Toggle (VSCode-style) */}
      <IconButton
        aria-label="Toggle inspector"
        variant="ghost"
        size="xs"
        color={inspectorVisible ? "gray.500" : "gray.300"}
        onClick={onToggleInspector}
        _hover={{ color: "blue.500" }}
        title={inspectorVisible ? "Hide Panel (Ctrl+J)" : "Show Panel (Ctrl+J)"}
      >
        {inspectorVisible ? (
          <LuPanelRightClose size={15} />
        ) : (
          <LuPanelRight size={15} />
        )}
      </IconButton>
    </HStack>
  );
};

import { Box, VStack, Text, Tabs } from "@chakra-ui/react";
import { useMemo, useEffect, useState } from "react";
import type { FileNode } from "../../utils/path-tree";
import { mapManifestToTree } from "../../utils/path-tree";
import { getDynamicTokenTree } from "../../utils/fs-scanner";
import { FileTreeNode } from "./FileTreeNode";
import { ClientProjectManager } from "../workspace/ClientProjectManager";
import type { Manifest, SidebarPanelId } from "../../schemas/manifest";

interface FileExplorerProps {
  manifest: Manifest;
  context: SidebarPanelId;
  activePath: string | null;
  onSelect: (path: string, key: string) => void;
  /** Q2: Triggered when user clicks 'Edit Tokens' on a JSON file */
  onEditTokens?: (filePath: string) => void;
  onProjectCreated?: (projectKey: string) => Promise<void> | void;
}

type ExplorerMode = "files" | "projects";

const EXPLORER_MODE_STORAGE_KEY = "sidebar_explorer_mode";

export const FileExplorer = ({
  manifest,
  context,
  activePath,
  onSelect,
  onEditTokens,
  onProjectCreated,
}: FileExplorerProps) => {
  const [expandedPaths, setExpandedPaths] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("sidebar_expanded_nodes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to parse sidebar state", e);
      }
    }
    return [];
  });

  const [explorerMode, setExplorerMode] = useState<ExplorerMode>(() => {
    if (typeof window === "undefined") return "files";
    const saved = localStorage.getItem(EXPLORER_MODE_STORAGE_KEY);
    return saved === "projects" ? "projects" : "files";
  });

  const tree = useMemo(() => {
    const dynamicTree = getDynamicTokenTree();

    if (context === "primitives") {
      const globalNode = dynamicTree.find((n) => n.name === "global");
      return globalNode?.children || [];
    }

    if (context === "explorer") {
      const clientsNode = dynamicTree.find((n) => n.name === "clients");
      return clientsNode?.children || [];
    }

    return mapManifestToTree(manifest);
  }, [manifest, context]);

  const headerTitle = useMemo(() => {
    switch (context) {
      case "primitives":
        return "Global Primitives";
      case "search":
        return "Search";
      default:
        return "Explorer";
    }
  }, [context]);

  useEffect(() => {
    localStorage.setItem(
      "sidebar_expanded_nodes",
      JSON.stringify(expandedPaths),
    );
  }, [expandedPaths]);

  useEffect(() => {
    if (context !== "explorer") return;
    localStorage.setItem(EXPLORER_MODE_STORAGE_KEY, explorerMode);
  }, [context, explorerMode]);

  const handleToggle = (id: string) => {
    setExpandedPaths((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSelect = (node: FileNode) => {
    onSelect(node.fullPath, node.id);
  };

  const fileTree = (
    <Box h="full" overflowY="auto" p={2}>
      {tree.map((node) => (
        <FileTreeNode
          key={node.id}
          node={node}
          depth={0}
          expandedPaths={expandedPaths}
          activePath={activePath}
          onToggle={handleToggle}
          onSelect={handleSelect}
          onEditTokens={onEditTokens}
        />
      ))}
    </Box>
  );

  if (context === "search")
    return (
      <Box p={4}>
        <Text fontSize="xs" color="gray.500">
          Search is coming soon...
        </Text>
      </Box>
    );

  return (
    <VStack
      w="full"
      h="full"
      bg="gray.50"
      borderRight="1px solid"
      borderColor="gray.200"
      align="stretch"
      gap={0}
    >
      <Box p={4} pb={2}>
        <Text
          fontSize="10px"
          fontWeight="bold"
          color="gray.400"
          textTransform="uppercase"
          mb={3}
          letterSpacing="widest"
        >
          {headerTitle}
        </Text>
      </Box>

      {context === "explorer" ? (
        <Tabs.Root
          value={explorerMode}
          onValueChange={(details: { value: string }) =>
            setExplorerMode(details.value === "projects" ? "projects" : "files")
          }
          variant="subtle"
          size="sm"
          display="flex"
          flexDirection="column"
          flex={1}
          minH={0}
        >
          <Tabs.List
            mx={3}
            mb={2}
            p={1}
            gap={1}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <Tabs.Trigger value="files" flex={1} fontSize="10px" fontWeight="700">
              Files
            </Tabs.Trigger>
            <Tabs.Trigger
              value="projects"
              flex={1}
              fontSize="10px"
              fontWeight="700"
            >
              Projects
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="files" p={0} flex={1} minH={0}>
            {fileTree}
          </Tabs.Content>

          <Tabs.Content value="projects" p={0} flex={1} minH={0}>
            <Box h="full" overflowY="auto" px={3} pb={3}>
              <ClientProjectManager
                manifest={manifest}
                selectedProject={activePath}
                onSelectProject={(projectKey) => onSelect(projectKey, projectKey)}
                onProjectCreated={onProjectCreated}
              />
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      ) : (
        <Box flex={1} minH={0}>
          {fileTree}
        </Box>
      )}
    </VStack>
  );
};

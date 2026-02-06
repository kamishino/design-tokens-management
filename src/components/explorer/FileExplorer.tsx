import { Box, VStack, Text } from "@chakra-ui/react";
import { useMemo, useEffect, useState } from 'react';
import type { FileNode } from "../../utils/path-tree";
import { mapManifestToTree } from "../../utils/path-tree";
import { getDynamicTokenTree } from "../../utils/fs-scanner";
import { FileTreeNode } from "./FileTreeNode";
import type { Manifest, SidebarPanelId } from "../../schemas/manifest";

interface FileExplorerProps {
  manifest: Manifest;
  context: SidebarPanelId;
  activePath: string | null;
  onSelect: (path: string, key: string) => void;
}

export const FileExplorer = ({ manifest, context, activePath, onSelect }: FileExplorerProps) => {
  const [expandedPaths, setExpandedPaths] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('sidebar_expanded_nodes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse sidebar state', e);
      }
    }
    return [];
  });

  const tree = useMemo(() => {
    const dynamicTree = getDynamicTokenTree();
    
    if (context === 'primitives') {
      const globalNode = dynamicTree.find(n => n.name === 'global');
      return globalNode?.children || [];
    }

    if (context === 'explorer') {
      const clientsNode = dynamicTree.find(n => n.name === 'clients');
      return clientsNode?.children || [];
    }

    return mapManifestToTree(manifest);
  }, [manifest, context]);

  const headerTitle = useMemo(() => {
    switch(context) {
      case 'primitives': return 'Global Primitives';
      case 'search': return 'Search';
      default: return 'Explorer';
    }
  }, [context]);

  useEffect(() => {
    localStorage.setItem('sidebar_expanded_nodes', JSON.stringify(expandedPaths));
  }, [expandedPaths]);

  const handleToggle = (id: string) => {
    setExpandedPaths(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelect = (node: FileNode) => {
    onSelect(node.fullPath, node.id);
  };

  if (context === 'search') return <Box p={4}><Text fontSize="xs" color="gray.500">Search is coming soon...</Text></Box>;

  return (
    <VStack 
      w="260px" 
      minW="260px" 
      h="full" 
      bg="gray.50" 
      borderRight="1px solid" 
      borderColor="gray.200"
      align="stretch"
      gap={0}
    >
      <Box p={4} pb={2}>
        <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={3} letterSpacing="widest">
          {headerTitle}
        </Text>
      </Box>

      <Box flex={1} overflowY="auto" p={2}>
        {tree.map(node => (
          <FileTreeNode 
            key={node.id} 
            node={node} 
            depth={0}
            expandedPaths={expandedPaths}
            activePath={activePath}
            onToggle={handleToggle}
            onSelect={handleSelect}
          />
        ))}
      </Box>
    </VStack>
  );
};

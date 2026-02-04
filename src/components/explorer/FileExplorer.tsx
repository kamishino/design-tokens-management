import { Box, VStack, Text, Tabs } from "@chakra-ui/react";
import { useState, useMemo, useEffect } from 'react';
import { FileNode, mapManifestToTree, generateGlobalTree } from "../../utils/path-tree";
import { FileTreeNode } from "./FileTreeNode";

interface FileExplorerProps {
  manifest: any;
  activePath: string | null;
  onSelect: (path: string, key: string) => void;
}

export const FileExplorer = ({ manifest, activePath, onSelect }: FileExplorerProps) => {
  const [context, setContext] = useState<'projects' | 'global'>('projects');
  
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
    return context === 'projects' ? mapManifestToTree(manifest) : generateGlobalTree();
  }, [manifest, context]);

  // Save persistence
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
          Explorer
        </Text>
        <Tabs.Root 
          value={context} 
          onValueChange={(e) => setContext(e.value as any)} 
          size="xs" 
          variant="subtle"
        >
          <Tabs.List bg="gray.100" p={0.5} borderRadius="md">
            <Tabs.Trigger value="projects" flex={1} fontWeight="bold">Projects</Tabs.Trigger>
            <Tabs.Trigger value="global" flex={1} fontWeight="bold">Global</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
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

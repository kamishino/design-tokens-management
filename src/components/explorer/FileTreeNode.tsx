import { Box, HStack, Text, Icon } from "@chakra-ui/react";
import { LuFolder, LuFolderOpen, LuFileJson, LuChevronRight, LuChevronDown } from "react-icons/lu";
import type { FileNode } from "../../utils/path-tree";
import { FileActionMenu } from "./FileActionMenu";

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  expandedPaths: string[];
  activePath: string | null;
  onToggle: (id: string) => void;
  onSelect: (node: FileNode) => void;
}

export const FileTreeNode = ({ 
  node, depth, expandedPaths, activePath, onToggle, onSelect 
}: FileTreeNodeProps) => {
  const isOpen = expandedPaths.includes(node.id);
  const isActive = activePath === node.id || (node.type === 'file' && activePath === node.fullPath);
  const isFolder = node.type === 'folder';

  const handleClick = () => {
    if (isFolder) {
      onToggle(node.id);
    } else {
      onSelect(node);
    }
  };

  return (
    <Box>
      <HStack
        py={1.5}
        px={2}
        pl={`${depth * 12 + 8}px`}
        cursor="pointer"
        bg={isActive ? "blue.50" : "transparent"}
        _hover={{ bg: isActive ? "blue.100" : "gray.50" }}
        transition="all 0.1s"
        onClick={handleClick}
        borderRadius="md"
        position="relative"
        role="group"
      >
        <HStack gap={2} flex={1} overflow="hidden" pr="32px">
          {isActive && (
            <Box 
              position="absolute" left={0} top={1} bottom={1} w="2px" 
              bg="blue.500" borderRadius="full" 
            />
          )}
          
          <Box color="gray.400" mr={-1}>
            {isFolder ? (
              isOpen ? <LuChevronDown size={12} /> : <LuChevronRight size={12} />
            ) : (
              <Box w={3} />
            )}
          </Box>

          <Icon 
            as={isFolder ? (isOpen ? LuFolderOpen : LuFolder) : LuFileJson} 
            color={isFolder ? "orange.400" : "blue.400"}
            boxSize="14px"
          />

          <Text 
            fontSize="xs" 
            fontWeight={isActive ? "bold" : "medium"} 
            color={isActive ? "blue.700" : "gray.700"}
            userSelect="none"
            lineClamp={1}
          >
            {node.name}
          </Text>
        </HStack>

        <Box 
          position="absolute"
          right="0"
          top="0"
          bottom="0"
          display="flex"
          alignItems="center"
          px={2}
          opacity={0} 
          visibility="hidden"
          _groupHover={{ 
            opacity: 1,
            visibility: "visible",
            bg: isActive ? "blue.100" : "gray.50"
          }} 
          transition="all 0.1s"
          onClick={(e) => e.stopPropagation()}
          zIndex={100}
        >
          <FileActionMenu filename={node.fullPath || node.id} displayName={node.name} />
        </Box>
      </HStack>

      {isFolder && isOpen && node.children && (
        <Box>
          {node.children.map(child => (
            <FileTreeNode 
              key={child.id} 
              node={child} 
              depth={depth + 1}
              expandedPaths={expandedPaths}
              activePath={activePath}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

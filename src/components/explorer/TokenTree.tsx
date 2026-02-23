import { Box, VStack, Text, HStack, Badge, Input } from "@chakra-ui/react";
import { useState, useMemo, useCallback } from "react";
import { LuSearch, LuLayers, LuDatabase } from "react-icons/lu";
import type { TokenDoc } from "../../utils/token-parser";
import { TokenTreeNode, buildTokenTree } from "./TokenTreeNode";

interface TokenTreeProps {
  semanticTokens: TokenDoc[];
  foundationTokens: TokenDoc[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  editMode: boolean;
  onEdit?: (token: TokenDoc) => void;
  onDelete?: (token: TokenDoc) => void;
  onHover?: (
    token: TokenDoc | null,
    pos: { x: number; y: number } | null,
  ) => void;
}

// Section header for Semantic / Foundation groups
const SectionHeader = ({
  label,
  count,
  icon: Icon,
  color,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
}) => (
  <HStack
    gap={2}
    py={1.5}
    px={1}
    mt={2}
    mb={0.5}
    borderBottom="1px solid"
    borderColor={`${color}.100`}
  >
    <Box
      p={1}
      bg={`${color}.500`}
      borderRadius="md"
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Icon size={12} />
    </Box>
    <Text
      fontSize="10px"
      fontWeight="800"
      color={`${color}.600`}
      textTransform="uppercase"
      letterSpacing="wider"
    >
      {label}
    </Text>
    <Badge
      size="xs"
      colorPalette={color}
      variant="subtle"
      fontSize="9px"
      borderRadius="full"
    >
      {count}
    </Badge>
  </HStack>
);

export const TokenTree = ({
  semanticTokens,
  foundationTokens,
  searchTerm,
  onSearchChange,
  editMode,
  onEdit,
  onDelete,
  onHover,
}: TokenTreeProps) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    // Default: expand first-level groups
    const defaults = new Set<string>();
    const addFirstLevel = (tokens: TokenDoc[]) => {
      tokens.forEach((t) => {
        if (t.path.length > 0) defaults.add(t.path[0]);
      });
    };
    addFirstLevel(semanticTokens);
    addFirstLevel(foundationTokens);
    return defaults;
  });

  const semanticTree = useMemo(
    () => buildTokenTree(semanticTokens),
    [semanticTokens],
  );

  const foundationTree = useMemo(
    () => buildTokenTree(foundationTokens),
    [foundationTokens],
  );

  const handleToggle = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  return (
    <VStack align="stretch" gap={0} h="full">
      {/* Search */}
      <Box px={2} py={2} borderBottom="1px solid" borderColor="gray.100">
        <HStack position="relative">
          <Box position="absolute" left={2.5} color="gray.400" zIndex={1}>
            <LuSearch size={12} />
          </Box>
          <Input
            placeholder="Filter tokens…"
            pl={7}
            size="xs"
            fontSize="11px"
            borderRadius="md"
            bg="gray.50"
            border="1px solid"
            borderColor="gray.100"
            _focus={{ borderColor: "blue.300", bg: "white" }}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </HStack>
      </Box>

      {/* Tree Content */}
      <Box flex={1} overflowY="auto" px={1} py={1}>
        {semanticTokens.length > 0 && (
          <>
            <SectionHeader
              label="Semantic"
              count={semanticTokens.length}
              icon={LuLayers}
              color="purple"
            />
            {semanticTree.map((node) => (
              <TokenTreeNode
                key={node.key}
                node={node}
                depth={0}
                expandedKeys={expandedKeys}
                onToggle={handleToggle}
                editMode={editMode}
                onEdit={onEdit}
                onDelete={onDelete}
                onHover={onHover}
              />
            ))}
          </>
        )}

        {foundationTokens.length > 0 && (
          <>
            <SectionHeader
              label="Foundation"
              count={foundationTokens.length}
              icon={LuDatabase}
              color="blue"
            />
            {foundationTree.map((node) => (
              <TokenTreeNode
                key={node.key}
                node={node}
                depth={0}
                expandedKeys={expandedKeys}
                onToggle={handleToggle}
                editMode={editMode}
                onEdit={onEdit}
                onDelete={onDelete}
                onHover={onHover}
              />
            ))}
          </>
        )}

        {semanticTokens.length === 0 && foundationTokens.length === 0 && (
          <VStack py={8} gap={2}>
            <Text fontSize="xs" color="gray.400">
              No tokens match your filter.
            </Text>
          </VStack>
        )}
      </Box>
    </VStack>
  );
};

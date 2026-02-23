import { Box, Text, HStack, Clipboard, IconButton } from "@chakra-ui/react";
import { useState, memo } from "react";
import {
  LuChevronRight,
  LuChevronDown,
  LuCopy,
  LuCheck,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";
import type { TokenDoc } from "../../utils/token-parser";

// ---------------------
// Tree Node Data Model
// ---------------------

export interface TreeNode {
  key: string;
  label: string;
  token?: TokenDoc;
  children: TreeNode[];
}

/**
 * Builds a nested tree from a flat list of TokenDoc entries
 * using their `path` arrays for hierarchy.
 */
export const buildTokenTree = (tokens: TokenDoc[]): TreeNode[] => {
  const root: TreeNode[] = [];

  for (const token of tokens) {
    let currentLevel = root;

    for (let i = 0; i < token.path.length; i++) {
      const segment = token.path[i];
      const key = token.path.slice(0, i + 1).join(".");
      const isLeaf = i === token.path.length - 1;

      let existing = currentLevel.find((n) => n.key === key);

      if (!existing) {
        existing = {
          key,
          label: segment,
          token: isLeaf ? token : undefined,
          children: [],
        };
        currentLevel.push(existing);
      } else if (isLeaf && !existing.token) {
        existing.token = token;
      }

      currentLevel = existing.children;
    }
  }

  return root;
};

// ---------------------
// Color Swatch Helper
// ---------------------

const isColorValue = (
  val: string | number | boolean | object | undefined | null,
): boolean => {
  if (typeof val !== "string") return false;
  return /^#|^rgb|^hsl|^oklch|^color\(/i.test(val);
};

const MiniSwatch = ({ color }: { color: string }) => (
  <Box
    w="14px"
    h="14px"
    minW="14px"
    borderRadius="3px"
    bg={color}
    border="1px solid"
    borderColor="blackAlpha.200"
    boxShadow="inset 0 0 0 1px rgba(255,255,255,0.15)"
  />
);

// ---------------------
// Token Tree Node
// ---------------------

interface TokenTreeNodeProps {
  node: TreeNode;
  depth: number;
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
  editMode: boolean;
  onEdit?: (token: TokenDoc) => void;
  onDelete?: (token: TokenDoc) => void;
  onHover?: (
    token: TokenDoc | null,
    pos: { x: number; y: number } | null,
  ) => void;
}

const TokenTreeNodeInner = ({
  node,
  depth,
  expandedKeys,
  onToggle,
  editMode,
  onEdit,
  onDelete,
  onHover,
}: TokenTreeNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isLeaf = node.children.length === 0 && !!node.token;
  const isBranch = node.children.length > 0;
  const isExpanded = expandedKeys.has(node.key);
  const token = node.token;

  const displayValue = token
    ? typeof token.resolvedValue === "string"
      ? token.resolvedValue
      : typeof token.value === "string"
        ? token.value
        : String(token.value)
    : null;

  const showSwatch =
    token && (token.type === "color" || isColorValue(displayValue));

  return (
    <>
      <HStack
        gap={0}
        py="3px"
        pl={`${depth * 16 + 4}px`}
        pr={2}
        cursor={isBranch ? "pointer" : "default"}
        bg={isHovered ? "blue.50" : "transparent"}
        transition="background 0.1s"
        borderRadius="sm"
        onClick={() => isBranch && onToggle(node.key)}
        onMouseEnter={(e) => {
          setIsHovered(true);
          if (token?.rawValue) {
            onHover?.(token, { x: e.clientX, y: e.clientY });
          }
        }}
        onMouseMove={(e) => {
          if (token?.rawValue) {
            onHover?.(token, { x: e.clientX, y: e.clientY });
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onHover?.(null, null);
        }}
        userSelect="none"
        minH="26px"
      >
        {/* Chevron / Indent */}
        <Box
          w="16px"
          minW="16px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {isBranch ? (
            isExpanded ? (
              <LuChevronDown size={12} color="var(--chakra-colors-gray-500)" />
            ) : (
              <LuChevronRight size={12} color="var(--chakra-colors-gray-400)" />
            )
          ) : null}
        </Box>

        {/* Swatch (for color tokens) */}
        {showSwatch && displayValue && (
          <Box mr="6px">
            <MiniSwatch color={displayValue} />
          </Box>
        )}

        {/* Label */}
        <Text
          fontSize="12px"
          fontWeight={isBranch ? "600" : "400"}
          color={isBranch ? "gray.700" : "gray.600"}
          fontFamily={isLeaf ? "'Space Mono', monospace" : "inherit"}
          flex={1}
          truncate
        >
          {node.label}
          {isBranch && !isLeaf && (
            <Text as="span" fontSize="10px" color="gray.400" ml={1.5}>
              ({countLeaves(node)})
            </Text>
          )}
        </Text>

        {/* Value */}
        {isLeaf && displayValue && !showSwatch && (
          <Text
            fontSize="11px"
            color="gray.400"
            fontFamily="'Space Mono', monospace"
            truncate
            maxW="140px"
            textAlign="right"
          >
            {displayValue}
          </Text>
        )}

        {/* Hover Actions */}
        {isHovered && isLeaf && token && (
          <HStack gap={0.5} ml={1}>
            {editMode ? (
              <>
                <IconButton
                  aria-label="Edit"
                  variant="ghost"
                  size="2xs"
                  color="gray.400"
                  _hover={{ color: "blue.500" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(token);
                  }}
                >
                  <LuPencil size={12} />
                </IconButton>
                <IconButton
                  aria-label="Delete"
                  variant="ghost"
                  size="2xs"
                  color="gray.400"
                  _hover={{ color: "red.500" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(token);
                  }}
                >
                  <LuTrash2 size={12} />
                </IconButton>
              </>
            ) : (
              <Clipboard.Root value={token.cssVariable}>
                <Clipboard.Trigger asChild>
                  <IconButton
                    aria-label="Copy CSS variable"
                    variant="ghost"
                    size="2xs"
                    color="gray.400"
                    _hover={{ color: "blue.500" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Clipboard.Indicator copied={<LuCheck size={11} />}>
                      <LuCopy size={11} />
                    </Clipboard.Indicator>
                  </IconButton>
                </Clipboard.Trigger>
              </Clipboard.Root>
            )}
          </HStack>
        )}
      </HStack>

      {/* Children */}
      {isBranch && isExpanded && (
        <Box>
          {node.children.map((child) => (
            <TokenTreeNode
              key={child.key}
              node={child}
              depth={depth + 1}
              expandedKeys={expandedKeys}
              onToggle={onToggle}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
              onHover={onHover}
            />
          ))}
        </Box>
      )}
    </>
  );
};

export const TokenTreeNode = memo(TokenTreeNodeInner);

// ---------------------
// Leaf Counter
// ---------------------

const countLeaves = (node: TreeNode): number => {
  if (node.children.length === 0) return node.token ? 1 : 0;
  return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
};

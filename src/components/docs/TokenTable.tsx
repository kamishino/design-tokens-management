import { 
  Box, Table, Text, HStack, VStack, Clipboard, Badge, IconButton
} from "@chakra-ui/react";
import { useState, useMemo, memo } from 'react';
import type { TokenDoc } from "../../utils/token-parser";
import { 
  LuCopy, LuCheck, LuArrowUpRight, LuArrowUpDown, 
  LuArrowUp, LuArrowDown, LuPencil, LuTrash2 
} from "react-icons/lu";
import { LineagePopover } from "./LineagePopover";

type SortKey = 'name' | 'sourceFile' | 'value' | 'type';
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const CopyButton = ({ value }: { value: string }) => {
  return (
    <Clipboard.Root value={value}>
      <Clipboard.Trigger asChild>
        <HStack gap={2} cursor="pointer" _hover={{ color: "blue.500" }} transition="all 0.2s">
          <Text fontSize="xs" fontFamily="monospace" lineClamp={1}>{value}</Text>
          <Clipboard.Indicator copied={<LuCheck size={12} color="green" />}>
            <LuCopy size={12} />
          </Clipboard.Indicator>
        </HStack>
      </Clipboard.Trigger>
    </Clipboard.Root>
  );
};

interface TokenRowProps {
  token: TokenDoc;
  onJump?: (id: string) => void;
  onHover?: (token: TokenDoc | null, pos: { x: number, y: number } | null) => void;
  showSource: boolean;
  editMode: boolean;
  onEdit?: (token: TokenDoc) => void;
  onDelete?: (token: TokenDoc) => void;
}

const TokenRow = memo(({ 
  token, onJump, onHover, showSource, editMode, onEdit, onDelete 
}: TokenRowProps) => {
  return (
    <Table.Row
      _hover={{ bg: "blue.50/20" }}
      id={`token-${token.id}`}
      transition="background 0.2s"
      onMouseMove={(e) => {
        if (token.rawValue) {
          onHover?.(token, { x: e.clientX, y: e.clientY });
        }
      }}
      onMouseLeave={() => onHover?.(null, null)}
    >
      <Table.Cell>
        <HStack gap={3} overflow="hidden">
          {token.type === "color" && (
            <Box
              minW="24px"
              w="24px"
              h="24px"
              bg={token.resolvedValue || token.value}
              borderRadius="sm"
              border="1px solid rgba(0,0,0,0.1)"
              flexShrink={0}
            />
          )}
          <VStack align="start" gap={0} overflow="hidden">
            <Text
              fontWeight="bold"
              fontSize="xs"
              lineClamp={1}
              title={token.id}
            >
              {token.name}
            </Text>
            <Badge variant="subtle" size="xs" colorPalette="gray" textTransform="lowercase">
              {token.type}
            </Badge>
          </VStack>
        </HStack>
      </Table.Cell>
      
      <Table.Cell>
        <VStack align="start" gap={0.5} overflow="hidden">
          <Text
            fontSize="xs"
            fontFamily="monospace"
            fontWeight="bold"
            lineClamp={1}
            color="blue.700"
            title={JSON.stringify(token.value)}
          >
            {JSON.stringify(token.value)}
          </Text>
          {token.rawValue && (
            <HStack
              gap={1}
              color="gray.500"
              cursor="pointer"
              _hover={{ color: "blue.500", textDecoration: "underline" }}
              onClick={() => onJump?.(token.references[0])}
            >
              <LuArrowUpRight size={10} />
              <Text
                fontSize="9px"
                fontFamily="'Space Mono', monospace"
              >
                {token.rawValue}
              </Text>
            </HStack>
          )}
        </VStack>
      </Table.Cell>

      <Table.Cell>
        <HStack gap={2}>
          <LineagePopover
            ids={token.references}
            label="upstream"
            colorScheme="blue"
          />
          <LineagePopover
            ids={token.dependents}
            label="aliases"
            colorScheme="purple"
          />
        </HStack>
      </Table.Cell>

      {showSource && (
        <Table.Cell>
          <Badge
            variant="outline"
            size="xs"
            colorPalette="gray"
            textTransform="lowercase"
            fontWeight="normal"
          >
            {token.sourceFile}
          </Badge>
        </Table.Cell>
      )}

      <Table.Cell>
        {editMode ? (
          <HStack gap={2}>
            <IconButton
              aria-label="Edit Token"
              variant="ghost"
              size="xs"
              color="gray.400"
              _hover={{ bg: "blue.50", color: "blue.600" }}
              onClick={() => onEdit?.(token)}
            >
              <LuPencil size={14} />
            </IconButton>
            <IconButton
              aria-label="Delete Token"
              variant="ghost"
              size="xs"
              color="gray.400"
              _hover={{ bg: "red.50", color: "red.600" }}
              onClick={() => onDelete?.(token)}
            >
              <LuTrash2 size={14} />
            </IconButton>
          </HStack>
        ) : (
          <VStack align="start" gap={1.5} overflow="hidden">
            <CopyButton value={token.cssVariable} />
            <CopyButton value={token.jsPath} />
          </VStack>
        )}
      </Table.Cell>
    </Table.Row>
  );
});

export const TokenTable = ({ 
  tokens, 
  onJump,
  onHover,
  showSource = false,
  editMode = false,
  onEdit,
  onDelete
}: { 
  tokens: TokenDoc[], 
  onJump?: (id: string) => void,
  onHover?: (token: TokenDoc | null, pos: { x: number, y: number } | null) => void,
  showSource?: boolean,
  editMode?: boolean,
  onEdit?: (token: TokenDoc) => void,
  onDelete?: (token: TokenDoc) => void
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key, direction: null };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedTokens = useMemo(() => {
    if (!sortConfig.direction) return tokens;

    return [...tokens].sort((a, b) => {
      let valA: any = a[sortConfig.key];
      let valB: any = b[sortConfig.key];

      // Handle objects (like value)
      if (typeof valA === 'object') valA = JSON.stringify(valA);
      if (typeof valB === 'object') valB = JSON.stringify(valB);

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tokens, sortConfig]);

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey || !sortConfig.direction) return <LuArrowUpDown size={12} />;
    return sortConfig.direction === 'asc' ? <LuArrowUp size={12} /> : <LuArrowDown size={12} />;
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      boxShadow="sm"
    >
      <Table.Root size="sm" tableLayout="fixed">
        <Table.Header bg="gray.50">
          <Table.Row>
            <Table.ColumnHeader w="30%" cursor="pointer" onClick={() => handleSort('name')}>
              <HStack gap={2}>
                <Text>Identity</Text>
                <SortIcon columnKey="name" />
              </HStack>
            </Table.ColumnHeader>
            <Table.ColumnHeader w="25%" cursor="pointer" onClick={() => handleSort('value')}>
              <HStack gap={2}>
                <Text>Value & Ref</Text>
                <SortIcon columnKey="value" />
              </HStack>
            </Table.ColumnHeader>
            <Table.ColumnHeader w="20%">Lineage</Table.ColumnHeader>
            {showSource && (
              <Table.ColumnHeader w="10%" cursor="pointer" onClick={() => handleSort('sourceFile')}>
                <HStack gap={2}>
                  <Text>Source</Text>
                  <SortIcon columnKey="sourceFile" />
                </HStack>
              </Table.ColumnHeader>
            )}
            <Table.ColumnHeader w="15%">Usage</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedTokens.map((token) => (
            <TokenRow
              key={token.id}
              token={token}
              onJump={onJump}
              onHover={onHover}
              showSource={showSource}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
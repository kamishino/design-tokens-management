import { 
  Box, Table, Text, HStack, VStack, Clipboard, Badge
} from "@chakra-ui/react";
import type { TokenDoc } from "../../utils/token-parser";
import { LuCopy, LuCheck, LuArrowUpRight } from "react-icons/lu";
import { LineagePopover } from "./LineagePopover";

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

export const TokenTable = ({ 
  tokens, 
  onJump,
  onHover,
  showSource = false 
}: { 
  tokens: TokenDoc[], 
  onJump?: (id: string) => void,
  onHover?: (token: TokenDoc | null, rect: DOMRect | null) => void,
  showSource?: boolean
}) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" boxShadow="sm">
      <Table.Root size="sm" tableLayout="fixed">
        <Table.Header bg="gray.50">
          <Table.Row>
            <Table.ColumnHeader w="60px">Swatch</Table.ColumnHeader>
            <Table.ColumnHeader w={showSource ? "25%" : "30%"}>Token Name</Table.ColumnHeader>
            {showSource && <Table.ColumnHeader w="120px">Source</Table.ColumnHeader>}
            <Table.ColumnHeader w="20%">Value</Table.ColumnHeader>
            <Table.ColumnHeader>Lineage</Table.ColumnHeader>
            <Table.ColumnHeader w="180px">Usage</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tokens.map((token) => (
            <Table.Row 
              key={token.id} 
              _hover={{ bg: "blue.50/20" }} 
              id={`token-${token.id}`} 
              transition="background 0.2s"
              onMouseEnter={(e) => {
                if (token.rawValue) {
                  onHover?.(token, e.currentTarget.getBoundingClientRect());
                }
              }}
              onMouseLeave={() => onHover?.(null, null)}
            >
              <Table.Cell>
                {token.type === 'color' && (
                  <Box 
                    w="28px" h="28px" 
                    bg={token.resolvedValue || token.value} 
                    borderRadius="sm" 
                    border="1px solid rgba(0,0,0,0.1)" 
                  />
                )}
              </Table.Cell>
              <Table.Cell>
                <VStack align="start" gap={0} overflow="hidden">
                  <Text fontWeight="bold" fontSize="xs" lineClamp={1} title={token.id}>{token.name}</Text>
                  {token.rawValue && (
                    <HStack 
                      gap={1} color="blue.500" cursor="pointer" _hover={{ textDecoration: "underline" }}
                      onClick={() => onJump?.(token.references[0])}
                    >
                      <LuArrowUpRight size={10} />
                      <Text fontSize="10px" fontFamily="'Space Mono', monospace" fontWeight="bold">
                        {token.rawValue}
                      </Text>
                    </HStack>
                  )}
                  {token.description && (
                    <Text fontSize="10px" color="gray.500" lineClamp={1} title={token.description} mt={1}>
                      {token.description}
                    </Text>
                  )}
                </VStack>
              </Table.Cell>
              {showSource && (
                <Table.Cell>
                  <Badge variant="outline" size="xs" colorScheme="gray" textTransform="lowercase" fontWeight="normal">
                    {token.sourceFile}
                  </Badge>
                </Table.Cell>
              )}
              <Table.Cell>
                <Text fontSize="xs" fontFamily="monospace" lineClamp={1} title={JSON.stringify(token.value)}>
                  {JSON.stringify(token.value)}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <HStack gap={2}>
                  <LineagePopover ids={token.dependents} label="aliases" colorScheme="purple" />
                  <LineagePopover ids={token.references} label="upstream" colorScheme="blue" />
                </HStack>
              </Table.Cell>
              <Table.Cell>
                <VStack align="start" gap={2} overflow="hidden">
                  <CopyButton value={token.cssVariable} />
                  <CopyButton value={token.jsPath} />
                </VStack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

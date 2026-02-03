import { 
  Box, Table, Text, Badge, HStack, VStack
} from "@chakra-ui/react";
import type { TokenDoc } from "../../utils/token-parser";
import { LuCopy } from "react-icons/lu";
import { useState } from 'react';

const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <HStack gap={2} cursor="pointer" onClick={onCopy} _hover={{ color: "blue.500" }}>
      <Text fontSize="xs" fontFamily="monospace">{value}</Text>
      <LuCopy size={12} />
      {copied && <Badge colorScheme="green" size="xs" variant="subtle">Copied!</Badge>}
    </HStack>
  );
};

export const TokenTable = ({ tokens }: { tokens: TokenDoc[] }) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Table.Root size="sm">
        <Table.Header bg="gray.50">
          <Table.Row>
            <Table.ColumnHeader w="60px">Swatch</Table.ColumnHeader>
            <Table.ColumnHeader>Token Name</Table.ColumnHeader>
            <Table.ColumnHeader>Value</Table.ColumnHeader>
            <Table.ColumnHeader>Usage</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tokens.map((token) => (
            <Table.Row key={token.name} _hover={{ bg: "gray.50" }}>
              <Table.Cell>
                {token.type === 'color' && (
                  <Box w="32px" h="32px" bg={token.value} borderRadius="sm" border="1px solid rgba(0,0,0,0.1)" />
                )}
              </Table.Cell>
              <Table.Cell>
                <VStack align="start" gap={0}>
                  <Text fontWeight="bold" fontSize="xs">{token.name}</Text>
                  {token.description && <Text fontSize="10px" color="gray.500">{token.description}</Text>}
                </VStack>
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="xs" fontFamily="monospace">{JSON.stringify(token.value)}</Text>
              </Table.Cell>
              <Table.Cell>
                <VStack align="start" gap={2}>
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
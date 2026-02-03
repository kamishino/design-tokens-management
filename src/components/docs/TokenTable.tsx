import { 
  Box, Table, Text, HStack, VStack, Clipboard
} from "@chakra-ui/react";
import type { TokenDoc } from "../../utils/token-parser";
import { LuCopy, LuCheck } from "react-icons/lu";

const CopyButton = ({ value }: { value: string }) => {
  return (
    <Clipboard.Root value={value}>
      <Clipboard.Trigger asChild>
        <HStack gap={2} cursor="pointer" _hover={{ color: "blue.500" }} transition="all 0.2s">
          <Text fontSize="xs" fontFamily="monospace">{value}</Text>
          <Clipboard.Indicator copied={<LuCheck size={12} color="green" />}>
            <LuCopy size={12} />
          </Clipboard.Indicator>
        </HStack>
      </Clipboard.Trigger>
    </Clipboard.Root>
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
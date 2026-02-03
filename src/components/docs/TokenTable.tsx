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
          <Text fontSize="xs" fontFamily="monospace" lineClamp={1}>{value}</Text>
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
      <Table.Root size="sm" tableLayout="fixed">
        <Table.Header bg="gray.50">
          <Table.Row>
            <Table.ColumnHeader w="80px">Swatch</Table.ColumnHeader>
            <Table.ColumnHeader w="30%">Token Name</Table.ColumnHeader>
            <Table.ColumnHeader w="20%">Value</Table.ColumnHeader>
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
                <VStack align="start" gap={0} overflow="hidden">
                  <Text fontWeight="bold" fontSize="xs" lineClamp={1} title={token.name}>{token.name}</Text>
                  {token.description && (
                    <Text fontSize="10px" color="gray.500" lineClamp={1} title={token.description}>
                      {token.description}
                    </Text>
                  )}
                </VStack>
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="xs" fontFamily="monospace" lineClamp={1} title={JSON.stringify(token.value)}>
                  {JSON.stringify(token.value)}
                </Text>
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

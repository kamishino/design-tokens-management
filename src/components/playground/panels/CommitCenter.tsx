import { 
  Box, VStack, HStack, Text, Button, Badge, 
  Table, Icon
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { LuSave, LuRefreshCw, LuArrowRight, LuTriangleAlert } from "react-icons/lu";
import type { TokenDoc } from "../../../utils/token-parser";
import { toaster } from "../../ui/toaster";

interface CommitCenterProps {
  overrides: Record<string, string | number>;
  globalTokens: TokenDoc[];
  onCommitSuccess: () => void;
}

interface PendingChange {
  id: string;
  cssVar: string;
  tokenPath: string;
  sourceFile: string;
  originalValue: string | number;
  newValue: string | number;
}

export const CommitCenter = ({ overrides, globalTokens, onCommitSuccess }: CommitCenterProps) => {
  const [isCommitting, setIsCommitting] = useState(false);

  // 1. Calculate Diffs
  const pendingChanges = useMemo(() => {
    const changes: PendingChange[] = [];
    
    Object.entries(overrides).forEach(([cssVar, newValue]) => {
      // Find the token that corresponds to this CSS variable
      // Note: This logic assumes a mapping or that we can find it in globalTokens
      // In our system, we use data-tokens or we can match by resolvedValue/id
      const token = globalTokens.find(t => {
        const varName = `--${t.id.replace(/\./g, '-')}`;
        return varName === cssVar || t.id === cssVar.replace(/^--/, '').replace(/-/g, '.');
      });

      if (token) {
        changes.push({
          id: token.id,
          cssVar,
          tokenPath: token.id,
          sourceFile: token.sourceFile,
          originalValue: token.value,
          newValue
        });
      }
    });

    return changes;
  }, [overrides, globalTokens]);

  const handleCommit = async () => {
    setIsCommitting(true);
    const successKeys: string[] = [];
    
    try {
      for (const change of pendingChanges) {
        const response = await fetch('/api/save-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetPath: change.sourceFile,
            tokenPath: change.tokenPath,
            valueObj: { $value: change.newValue },
            action: 'update'
          })
        });

        if (response.ok) {
          successKeys.push(change.cssVar);
        } else {
          throw new Error(`Failed to save ${change.tokenPath}`);
        }
      }

      toaster.success({
        title: "Changes Saved",
        description: `Successfully updated ${successKeys.length} tokens on disk.`
      });
      onCommitSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toaster.error({
        title: "Commit Failed",
        description: message
      });
    } finally {
      setIsCommitting(false);
    }
  };

  if (pendingChanges.length === 0) {
    return (
      <VStack p={8} gap={4} textAlign="center">
        <Icon color="gray.300" fontSize="4xl"><LuRefreshCw /></Icon>
        <Text color="gray.500" fontSize="sm">No pending changes to commit.</Text>
      </VStack>
    );
  }

  return (
    <VStack gap={4} align="stretch" p={4} maxH="400px">
      <HStack justify="space-between">
        <VStack align="start" gap={0}>
          <Text fontSize="sm" fontWeight="bold">Pending Changes</Text>
          <Text fontSize="xs" color="gray.500">{pendingChanges.length} tokens staged for disk sync</Text>
        </VStack>
        <Badge colorPalette="orange" variant="subtle">Staged</Badge>
      </HStack>

      <Box overflowY="auto" border="1px solid" borderColor="gray.100" borderRadius="md">
        <Table.Root size="sm" variant="simple">
          <Table.Header bg="gray.50">
            <Table.Row>
              <Table.ColumnHeader fontSize="10px">Token</Table.ColumnHeader>
              <Table.ColumnHeader fontSize="10px">Change</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {pendingChanges.map((change) => (
              <Table.Row key={change.id}>
                <Table.Cell>
                  <VStack align="start" gap={0}>
                    <Text fontSize="11px" fontWeight="bold" fontFamily="monospace">{change.id}</Text>
                    <Text fontSize="9px" color="gray.400" truncate maxW="150px">{change.sourceFile}</Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={2}>
                    <Text fontSize="10px" color="gray.500" textDecoration="line-through">{change.originalValue}</Text>
                    <LuArrowRight size={10} color="gray.300" />
                    <Text fontSize="11px" fontWeight="bold" color="blue.600">{change.newValue}</Text>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}Status: Showing lines 1-100 of 132 total lines.
Action: To read more of the file, you can use the 'offset' and 'limit' parameters in a subsequent 'read_file' call. For example, to read the next section of the file, use offset: 100.

--- FILE CONTENT (truncated) ---
          </Table.Body>
        </Table.Root>
      </Box>

      <HStack bg="orange.50" p={3} borderRadius="md" gap={3} border="1px solid" borderColor="orange.100">
        <LuTriangleAlert size={16} color="var(--chakra-colors-orange-600)" />
        <Text fontSize="xs" color="orange.800">
          Clicking "Commit" will permanently overwrite your local JSON files.
        </Text>
      </HStack>

      <Button 
        colorPalette="blue" 
        size="sm" 
        width="full" 
        loading={isCommitting}
        onClick={handleCommit}
        leftIcon={<LuSave size={14} />}
      >
        Commit to Disk
      </Button>
    </VStack>
  );
};

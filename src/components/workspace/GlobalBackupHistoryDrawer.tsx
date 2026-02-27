import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LuRefreshCw, LuRotateCcw, LuShieldCheck } from "react-icons/lu";
import {
  DrawerRoot,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerTitle,
  DrawerCloseTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { toaster } from "../ui/toaster";

interface GlobalBackupEntry {
  id: string;
  createdAt: string;
  sourcePath: string;
  backupPath: string;
  action: string;
  tokenPath?: string;
}

interface GlobalBackupHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onRestored: () => void;
  selectedProject: string;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export const GlobalBackupHistoryDrawer = ({
  open,
  onClose,
  onRestored,
  selectedProject,
}: GlobalBackupHistoryDrawerProps) => {
  const [history, setHistory] = useState<GlobalBackupEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [latestRestoring, setLatestRestoring] = useState(false);
  const [scope, setScope] = useState<"all" | "current">("all");

  const currentGlobalFile = useMemo(() => {
    if (
      selectedProject.startsWith("/tokens/global/") &&
      selectedProject.endsWith(".json")
    ) {
      return selectedProject;
    }
    return null;
  }, [selectedProject]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const query =
        scope === "current" && currentGlobalFile
          ? `?limit=80&targetPath=${encodeURIComponent(currentGlobalFile)}`
          : "?limit=80";
      const response = await fetch(`/api/global-guard/history${query}`);
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg =
          (json as { error?: string }).error ||
          `Server responded with ${response.status}`;
        toaster.error({ title: "Load Failed", description: msg });
        return;
      }

      setHistory((json as { history?: GlobalBackupEntry[] }).history ?? []);
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Network error — is the dev server running?";
      toaster.error({ title: "Load Failed", description: msg });
    } finally {
      setLoading(false);
    }
  }, [scope, currentGlobalFile]);

  useEffect(() => {
    if (!open) return;
    loadHistory();
  }, [open, loadHistory]);

  useEffect(() => {
    if (!currentGlobalFile) {
      setScope("all");
    }
  }, [currentGlobalFile]);

  const latest = useMemo(() => history[0] ?? null, [history]);

  const handleRestoreLatest = useCallback(async () => {
    const confirmed = window.confirm(
      "Restore the latest global backup? This will overwrite the latest edited global file.",
    );
    if (!confirmed) return;

    setLatestRestoring(true);
    try {
      const response = await fetch("/api/global-guard/restore-latest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          scope === "current" && currentGlobalFile
            ? { targetPath: currentGlobalFile }
            : {},
        ),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg =
          (json as { error?: string }).error ||
          `Server responded with ${response.status}`;
        toaster.error({ title: "Restore Failed", description: msg });
        return;
      }

      const restoredPath =
        (json as { restoredPath?: string }).restoredPath || "/tokens/global/*";
      toaster.success({
        title: "Backup Restored",
        description: `Restored ${restoredPath}.`,
      });
      onRestored();
      loadHistory();
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Network error — is the dev server running?";
      toaster.error({ title: "Restore Failed", description: msg });
    } finally {
      setLatestRestoring(false);
    }
  }, [scope, currentGlobalFile, loadHistory, onRestored]);

  const handleRestoreById = useCallback(
    async (entry: GlobalBackupEntry) => {
      const confirmed = window.confirm(
        `Restore backup from ${formatTimestamp(entry.createdAt)}?\nFile: ${entry.sourcePath}`,
      );
      if (!confirmed) return;

      setRestoringId(entry.id);
      try {
        const response = await fetch("/api/global-guard/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ backupId: entry.id }),
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
          const msg =
            (json as { error?: string }).error ||
            `Server responded with ${response.status}`;
          toaster.error({ title: "Restore Failed", description: msg });
          return;
        }

        toaster.success({
          title: "Backup Restored",
          description: `Restored ${entry.sourcePath}.`,
        });
        onRestored();
        loadHistory();
      } catch (error: unknown) {
        const msg =
          error instanceof Error
            ? error.message
            : "Network error — is the dev server running?";
        toaster.error({ title: "Restore Failed", description: msg });
      } finally {
        setRestoringId(null);
      }
    },
    [loadHistory, onRestored],
  );

  return (
    <DrawerRoot
      open={open}
      size="md"
      placement="end"
      onOpenChange={(details: { open: boolean }) => !details.open && onClose()}
    >
      <DrawerContent>
        <DrawerHeader borderBottom="1px solid" borderColor="gray.100" pr="10">
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between" align="center">
              <DrawerTitle>
                <HStack gap={2}>
                  <LuShieldCheck size={15} />
                  <Text fontSize="sm" fontWeight="700">
                    Global Backup History
                  </Text>
                </HStack>
              </DrawerTitle>
              <HStack gap={1} flexWrap="wrap" justify="end">
                <HStack
                  p="1px"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  gap={0}
                >
                  <Button
                    size="xs"
                    variant={scope === "all" ? "subtle" : "ghost"}
                    onClick={() => setScope("all")}
                    h="24px"
                    px={2}
                  >
                    All
                  </Button>
                  <Button
                    size="xs"
                    variant={scope === "current" ? "subtle" : "ghost"}
                    onClick={() => setScope("current")}
                    h="24px"
                    px={2}
                    disabled={!currentGlobalFile}
                    title={
                      currentGlobalFile
                        ? `Show backups for ${currentGlobalFile}`
                        : "Select a global JSON file to filter"
                    }
                  >
                    Current
                  </Button>
                </HStack>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={loadHistory}
                  loading={loading}
                  title="Refresh backup list"
                >
                  <LuRefreshCw size={12} />
                </Button>
                <Button
                  size="xs"
                  variant="solid"
                  colorPalette="orange"
                  onClick={handleRestoreLatest}
                  loading={latestRestoring}
                  disabled={!latest}
                  gap={1}
                >
                  <LuRotateCcw size={12} />
                  Latest
                </Button>
              </HStack>
            </HStack>
            <Text fontSize="11px" color="gray.500">
              Every write/delete to{" "}
              <Text as="span" fontFamily="'Space Mono', monospace">
                tokens/global/**
              </Text>{" "}
              creates a snapshot.
            </Text>
            {scope === "current" && currentGlobalFile && (
              <Text
                fontSize="10px"
                color="blue.600"
                fontFamily="'Space Mono', monospace"
                truncate
              >
                Filtered: {currentGlobalFile}
              </Text>
            )}
          </VStack>
          <DrawerCloseTrigger />
        </DrawerHeader>

        <DrawerBody p={0}>
          {loading ? (
            <VStack py={10} gap={2}>
              <Spinner size="sm" />
              <Text fontSize="11px" color="gray.500">
                Loading backup history...
              </Text>
            </VStack>
          ) : history.length === 0 ? (
            <VStack py={10} gap={2} textAlign="center">
              <Text fontSize="12px" fontWeight="600" color="gray.500">
                No backups yet
              </Text>
              <Text fontSize="11px" color="gray.400" maxW="260px">
                Edit a token in `tokens/global` to start collecting history.
              </Text>
            </VStack>
          ) : (
            <VStack align="stretch" gap={0}>
              {history.map((entry) => (
                <Box key={entry.id} px={4} py={3}>
                  <HStack align="start" justify="space-between" gap={3}>
                    <VStack align="start" gap={1} flex={1} minW={0}>
                      <HStack gap={2} flexWrap="wrap">
                        <Badge
                          colorPalette={
                            entry.action === "delete" ? "red" : "blue"
                          }
                          variant="subtle"
                          fontSize="9px"
                        >
                          {entry.action.toUpperCase()}
                        </Badge>
                        <Text fontSize="10px" color="gray.500">
                          {formatTimestamp(entry.createdAt)}
                        </Text>
                      </HStack>
                      <Text
                        fontSize="11px"
                        color="gray.700"
                        fontFamily="'Space Mono', monospace"
                        truncate
                        w="full"
                      >
                        {entry.sourcePath}
                      </Text>
                      {entry.tokenPath && (
                        <Text
                          fontSize="10px"
                          color="gray.400"
                          fontFamily="'Space Mono', monospace"
                          truncate
                          w="full"
                        >
                          {entry.tokenPath}
                        </Text>
                      )}
                    </VStack>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleRestoreById(entry)}
                      loading={restoringId === entry.id}
                    >
                      Restore
                    </Button>
                  </HStack>
                  <Box mt={3} h="1px" w="full" bg="gray.100" />
                </Box>
              ))}
            </VStack>
          )}
        </DrawerBody>
      </DrawerContent>
    </DrawerRoot>
  );
};

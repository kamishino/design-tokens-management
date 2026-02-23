import { VStack, HStack, Text, Circle, Checkbox } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import {
  LuArrowRight,
  LuRefreshCw,
  LuTrash2,
  LuTriangleAlert,
  LuSave,
} from "react-icons/lu";

import { Button } from "../ui/button";
import type { TokenDoc } from "../../utils/token-parser";
import type { TokenOverrides } from "../../schemas/manifest";
import { toaster } from "../ui/toaster";

interface PendingChange {
  id: string;
  cssVar: string;
  tokenPath: string;
  sourceFile: string;
  originalValue: string | number;
  newValue: string | number;
  isColor: boolean;
}

interface StagingPanelProps {
  overrides: TokenOverrides;
  globalTokens: TokenDoc[];
  onCommitSuccess: () => void;
  onDiscardOverride: (cssVar: string) => void;
  onDiscardAll: () => void;
}

export const StagingPanel = ({
  overrides,
  globalTokens,
  onCommitSuccess,
  onDiscardOverride,
  onDiscardAll,
}: StagingPanelProps) => {
  const [staged, setStaged] = useState<Set<string>>(new Set());
  const [isCommitting, setIsCommitting] = useState(false);

  // Calculate diffs — show ALL overrides, enrich with token data if found
  const pendingChanges = useMemo(() => {
    const changes: PendingChange[] = [];

    Object.entries(overrides).forEach(([cssVar, newValue]) => {
      // Derive token path from CSS var: --brand-primary → brand.primary
      const derivedPath = cssVar.replace(/^--/, "").replace(/-/g, ".");

      // Try to find matching token for extra info (original value, source file)
      const token = globalTokens.find((t) => {
        const varName = `--${t.id.replace(/\./g, "-")}`;
        return varName === cssVar || t.id === derivedPath;
      });

      const isColor =
        typeof newValue === "string" &&
        /^#|^rgb|^hsl|^oklch/i.test(String(newValue));

      changes.push({
        id: derivedPath,
        cssVar,
        tokenPath: token?.id || derivedPath,
        sourceFile: token?.sourceFile || "",
        originalValue: token ? String(token.value) : "—",
        newValue: String(newValue),
        isColor,
      });
    });

    return changes;
  }, [overrides, globalTokens]);

  // Auto-stage new changes
  useMemo(() => {
    const currentKeys = new Set(pendingChanges.map((c) => c.cssVar));
    setStaged((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (currentKeys.has(id)) next.add(id);
      });
      currentKeys.forEach((id) => {
        if (!prev.has(id)) next.add(id);
      });
      return next;
    });
  }, [pendingChanges]);

  const toggleStaged = (cssVar: string) => {
    setStaged((prev) => {
      const next = new Set(prev);
      if (next.has(cssVar)) {
        next.delete(cssVar);
      } else {
        next.add(cssVar);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (staged.size === pendingChanges.length) {
      setStaged(new Set());
    } else {
      setStaged(new Set(pendingChanges.map((c) => c.cssVar)));
    }
  };

  const stagedChanges = pendingChanges.filter((c) => staged.has(c.cssVar));
  const affectedFiles = new Set(stagedChanges.map((c) => c.sourceFile));

  const handleCommit = async () => {
    if (stagedChanges.length === 0) return;
    setIsCommitting(true);

    try {
      for (const change of stagedChanges) {
        const response = await fetch("/api/save-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetPath: change.sourceFile,
            tokenPath: change.tokenPath,
            valueObj: { $value: change.newValue },
            action: "update",
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save ${change.tokenPath}`);
        }
      }

      toaster.success({
        title: "Changes Committed",
        description: `Updated ${stagedChanges.length} token(s) across ${affectedFiles.size} file(s).`,
      });
      onCommitSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toaster.error({
        title: "Commit Failed",
        description: message,
      });
    } finally {
      setIsCommitting(false);
    }
  };

  // Empty state
  if (pendingChanges.length === 0) {
    return (
      <VStack py={12} gap={2} textAlign="center">
        <LuRefreshCw size={20} color="var(--chakra-colors-gray-300)" />
        <Text fontSize="11px" color="gray.400" fontWeight="500">
          No pending changes
        </Text>
        <Text fontSize="10px" color="gray.300" maxW="180px" mx="auto">
          Tune colors or fonts in the Tuning tab to stage changes
        </Text>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={0} h="full" overflow="hidden">
      {/* Header */}
      <HStack
        px={3}
        py={2}
        borderBottom="1px solid"
        borderColor="gray.100"
        gap={2}
      >
        <Checkbox.Root
          size="sm"
          checked={staged.size === pendingChanges.length}
          onCheckedChange={toggleAll}
        />
        <Text fontSize="10px" fontWeight="600" color="gray.500" flex={1}>
          {staged.size} of {pendingChanges.length} staged
        </Text>
        <Button
          size="xs"
          variant="ghost"
          color="red.400"
          onClick={onDiscardAll}
          _hover={{ color: "red.600" }}
        >
          Discard All
        </Button>
      </HStack>

      {/* Change List */}
      <VStack align="stretch" gap={0} flex={1} overflowY="auto">
        {pendingChanges.map((change) => {
          const isStaged = staged.has(change.cssVar);
          return (
            <HStack
              key={change.cssVar}
              px={3}
              py={2}
              gap={2}
              borderBottom="1px solid"
              borderColor="gray.50"
              bg={isStaged ? "transparent" : "gray.50/50"}
              _hover={{ bg: "blue.50/30" }}
              transition="all 0.1s"
            >
              <Checkbox.Root
                size="sm"
                checked={isStaged}
                onCheckedChange={() => toggleStaged(change.cssVar)}
              />

              <VStack align="start" gap={0.5} flex={1} minW={0}>
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color={isStaged ? "gray.700" : "gray.400"}
                  fontFamily="'Space Mono', monospace"
                  truncate
                  w="full"
                >
                  {change.id}
                </Text>

                {/* Visual Diff */}
                <HStack gap={1.5} w="full">
                  {change.isColor ? (
                    <>
                      <Circle
                        size="12px"
                        bg={String(change.originalValue)}
                        border="1px solid"
                        borderColor="blackAlpha.200"
                        flexShrink={0}
                      />
                      <LuArrowRight
                        size={8}
                        color="var(--chakra-colors-gray-300)"
                      />
                      <Circle
                        size="12px"
                        bg={String(change.newValue)}
                        border="1px solid"
                        borderColor="blackAlpha.200"
                        flexShrink={0}
                      />
                      <Text
                        fontSize="9px"
                        color="blue.500"
                        fontFamily="'Space Mono', monospace"
                        truncate
                      >
                        {String(change.newValue)}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text
                        fontSize="9px"
                        color="gray.400"
                        textDecoration="line-through"
                        truncate
                        maxW="60px"
                      >
                        {String(change.originalValue).split(",")[0]}
                      </Text>
                      <LuArrowRight
                        size={8}
                        color="var(--chakra-colors-gray-300)"
                      />
                      <Text
                        fontSize="9px"
                        color="blue.500"
                        fontWeight="600"
                        truncate
                        flex={1}
                      >
                        {String(change.newValue).split(",")[0]}
                      </Text>
                    </>
                  )}
                </HStack>
              </VStack>

              {/* Discard button */}
              <Button
                size="xs"
                variant="ghost"
                color="gray.300"
                _hover={{ color: "red.500" }}
                onClick={() => onDiscardOverride(change.cssVar)}
                px={1}
                minW="auto"
              >
                <LuTrash2 size={11} />
              </Button>
            </HStack>
          );
        })}
      </VStack>

      {/* Footer */}
      <VStack
        align="stretch"
        gap={2}
        p={3}
        borderTop="1px solid"
        borderColor="gray.100"
      >
        {staged.size > 0 && (
          <HStack
            bg="orange.50"
            p={2}
            borderRadius="md"
            gap={2}
            border="1px solid"
            borderColor="orange.100"
          >
            <LuTriangleAlert
              size={12}
              color="var(--chakra-colors-orange-500)"
            />
            <Text fontSize="9px" color="orange.700">
              Will overwrite {affectedFiles.size} file(s) on disk
            </Text>
          </HStack>
        )}

        <Button
          colorPalette="blue"
          size="sm"
          w="full"
          loading={isCommitting}
          disabled={staged.size === 0}
          onClick={handleCommit}
          gap={2}
        >
          <LuSave size={14} />
          Commit {staged.size} Change{staged.size !== 1 ? "s" : ""}
        </Button>
      </VStack>
    </VStack>
  );
};

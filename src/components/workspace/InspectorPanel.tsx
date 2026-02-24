import { Box, VStack, HStack, Text, Badge } from "@chakra-ui/react";
import { useState, useMemo, useEffect } from "react";
import {
  LuArrowRight,
  LuCircleDot,
  LuPalette,
  LuGitBranch,
  LuPencil,
  LuCheck,
  LuX,
} from "react-icons/lu";
import { StagingPanel } from "./StagingPanel";
import { TuningTab } from "./TuningTab";
import { TokenReferenceInput } from "./TokenReferenceInput";
import type { TokenDoc } from "../../utils/token-parser";
import type { TokenOverrides } from "../../schemas/manifest";

type InspectorTab = "token" | "tuning" | "changes";

interface InspectorPanelProps {
  selectedToken: TokenDoc | null;
  overrides: TokenOverrides;
  globalTokens: TokenDoc[];
  onCommitSuccess: () => void;
  updateOverride: (
    newValues: Record<string, string | number>,
    label?: string,
  ) => void;
  projectPath: string;
  onReset: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDiscardOverride: (cssVar: string) => void;
  onDiscardAll: () => void;
}

const tabConfig: { id: InspectorTab; label: string; icon: React.ReactNode }[] =
  [
    { id: "token", label: "Detail", icon: <LuCircleDot size={12} /> },
    { id: "tuning", label: "Tuning", icon: <LuPalette size={12} /> },
    { id: "changes", label: "Changes", icon: <LuGitBranch size={12} /> },
  ];

export const InspectorPanel = ({
  selectedToken,
  overrides,
  globalTokens,
  onCommitSuccess,
  updateOverride,
  projectPath,
  onReset,
  undo,
  redo,
  canUndo,
  canRedo,
  onDiscardOverride,
  onDiscardAll,
}: InspectorPanelProps) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>("tuning");
  const pendingCount = Object.keys(overrides).length;

  return (
    <VStack h="full" gap={0} overflow="hidden">
      {/* Tab Bar */}
      <HStack
        w="full"
        px={2}
        py={1.5}
        gap={0.5}
        borderBottom="1px solid"
        borderColor="gray.100"
        bg="white"
        flexShrink={0}
      >
        {tabConfig.map((tab) => (
          <HStack
            key={tab.id}
            px={2.5}
            py={1.5}
            gap={1.5}
            fontSize="11px"
            fontWeight="600"
            color={activeTab === tab.id ? "blue.600" : "gray.400"}
            bg={activeTab === tab.id ? "blue.50" : "transparent"}
            borderRadius="md"
            cursor="pointer"
            _hover={{ bg: activeTab === tab.id ? "blue.50" : "gray.50" }}
            transition="all 0.1s"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <Text fontSize="11px">{tab.label}</Text>
            {tab.id === "changes" && pendingCount > 0 && (
              <Badge
                colorPalette="orange"
                fontSize="8px"
                px={1}
                borderRadius="full"
                variant="solid"
              >
                {pendingCount}
              </Badge>
            )}
          </HStack>
        ))}
      </HStack>

      {/* Tab Content */}
      <Box flex={1} w="full" overflowY="auto" bg="white">
        {activeTab === "token" && (
          <TokenDetailTab token={selectedToken} globalTokens={globalTokens} />
        )}
        {activeTab === "tuning" && (
          <TuningTab
            overrides={overrides}
            updateOverride={updateOverride}
            globalTokens={globalTokens}
            projectPath={projectPath}
            onReset={onReset}
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        )}
        {activeTab === "changes" && (
          <StagingPanel
            overrides={overrides}
            globalTokens={globalTokens}
            onCommitSuccess={onCommitSuccess}
            onDiscardOverride={onDiscardOverride}
            onDiscardAll={onDiscardAll}
          />
        )}
      </Box>
    </VStack>
  );
};

// ---------------------
// Token Detail Tab
// ---------------------

const TokenDetailTab = ({
  token,
  globalTokens,
}: {
  token: TokenDoc | null;
  globalTokens: TokenDoc[];
}) => {
  const [editValue, setEditValue] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  // Reset edit state when token changes
  useEffect(() => {
    setEditValue(null);
    setSaveStatus("idle");
  }, [token?.id]);

  const details = useMemo(() => {
    if (!token) return [];
    return [
      { label: "Name", value: token.name, editable: false },
      { label: "Type", value: token.type, editable: false },
      { label: "Value", value: String(token.value), editable: true },
      ...(token.resolvedValue !== token.value
        ? [
            {
              label: "Resolved",
              value: String(token.resolvedValue),
              editable: false,
            },
          ]
        : []),
      { label: "CSS Variable", value: token.cssVariable, editable: false },
      { label: "Source", value: token.sourceFile, editable: false },
      ...(token.path.length > 0
        ? [{ label: "Path", value: token.path.join(" → "), editable: false }]
        : []),
    ];
  }, [token]);

  const handleStartEdit = () => {
    if (!token) return;
    setEditValue(String(token.value));
    setSaveStatus("idle");
  };

  const handleCancelEdit = () => {
    setEditValue(null);
    setSaveStatus("idle");
  };

  const handleSave = async () => {
    if (!token || editValue === null || isSaving) return;
    if (editValue === String(token.value)) {
      setEditValue(null);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetPath: token.sourceFile,
          tokenPath: token.id,
          valueObj: { $value: editValue },
          action: "update",
        }),
      });
      if (!response.ok) throw new Error("Save failed");
      setSaveStatus("success");
      setEditValue(null);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancelEdit();
  };

  if (!token) {
    return (
      <VStack py={12} gap={2} textAlign="center">
        <LuCircleDot size={20} color="var(--chakra-colors-gray-300)" />
        <Text fontSize="11px" color="gray.400" fontWeight="500">
          Select a token to inspect
        </Text>
        <Text fontSize="10px" color="gray.300">
          Hover or click on tokens in the tree
        </Text>
      </VStack>
    );
  }

  const isColor =
    token.type === "color" ||
    (typeof token.resolvedValue === "string" &&
      /^#|^rgb|^hsl|^oklch/i.test(token.resolvedValue));

  return (
    <VStack align="stretch" gap={0} p={0}>
      {/* Color Preview */}
      {isColor && typeof token.resolvedValue === "string" && (
        <Box
          h="64px"
          bg={token.resolvedValue}
          borderBottom="1px solid"
          borderColor="gray.100"
        />
      )}

      {/* Details */}
      <VStack align="stretch" gap={0} p={3}>
        {details.map((d) => (
          <HStack
            key={d.label}
            py={1.5}
            gap={3}
            borderBottom="1px solid"
            borderColor="gray.50"
          >
            <Text
              fontSize="10px"
              fontWeight="600"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wider"
              minW="60px"
            >
              {d.label}
            </Text>

            {/* Editable Value Row */}
            {d.editable && editValue !== null ? (
              <HStack flex={1} gap={1} pos="relative">
                <Box flex={1}>
                  <TokenReferenceInput
                    autoFocus
                    value={editValue}
                    onChange={setEditValue}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    globalTokens={globalTokens}
                  />
                </Box>
                <Box
                  as="button"
                  onClick={handleCancelEdit}
                  color="gray.400"
                  _hover={{ color: "red.500" }}
                  cursor="pointer"
                  flexShrink={0}
                >
                  <LuX size={12} />
                </Box>
              </HStack>
            ) : (
              <HStack
                flex={1}
                gap={1}
                cursor={d.editable ? "pointer" : "default"}
                onClick={d.editable ? handleStartEdit : undefined}
                borderRadius="sm"
                px={1}
                mx={-1}
                _hover={
                  d.editable ? { bg: "blue.50", color: "blue.600" } : undefined
                }
                transition="all 0.1s"
              >
                <Text
                  fontSize="11px"
                  color={
                    d.editable && saveStatus === "success"
                      ? "green.500"
                      : d.editable && saveStatus === "error"
                        ? "red.500"
                        : "gray.700"
                  }
                  fontFamily="'Space Mono', monospace"
                  wordBreak="break-all"
                  flex={1}
                >
                  {d.value}
                </Text>
                {d.editable && saveStatus === "success" && (
                  <LuCheck size={12} color="var(--chakra-colors-green-500)" />
                )}
                {d.editable && saveStatus === "idle" && (
                  <LuPencil size={10} color="var(--chakra-colors-gray-300)" />
                )}
              </HStack>
            )}
          </HStack>
        ))}
      </VStack>

      {/* References */}
      {token.rawValue &&
        typeof token.rawValue === "string" &&
        token.rawValue.startsWith("{") && (
          <Box px={3} pb={3}>
            <Text
              fontSize="10px"
              fontWeight="600"
              color="gray.400"
              mb={1}
              textTransform="uppercase"
            >
              Reference
            </Text>
            <HStack bg="gray.50" borderRadius="md" px={2} py={1.5} gap={2}>
              <Text
                fontSize="11px"
                color="blue.600"
                fontFamily="'Space Mono', monospace"
              >
                {token.rawValue}
              </Text>
              <LuArrowRight size={10} color="var(--chakra-colors-gray-400)" />
              <Text
                fontSize="11px"
                color="gray.600"
                fontFamily="'Space Mono', monospace"
              >
                {String(token.resolvedValue)}
              </Text>
            </HStack>
          </Box>
        )}
    </VStack>
  );
};

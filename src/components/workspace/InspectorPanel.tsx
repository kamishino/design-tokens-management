import { Box, VStack, HStack, Text, Badge } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import {
  LuArrowRight,
  LuCircleDot,
  LuLayers,
  LuGitBranch,
} from "react-icons/lu";
import { CommitCenter } from "../playground/panels/CommitCenter";
import type { TokenDoc } from "../../utils/token-parser";
import type { TokenOverrides } from "../../schemas/manifest";

type InspectorTab = "token" | "tuning" | "changes";

interface InspectorPanelProps {
  selectedToken: TokenDoc | null;
  overrides: TokenOverrides;
  globalTokens: TokenDoc[];
  onCommitSuccess: () => void;
}

const tabConfig: { id: InspectorTab; label: string; icon: React.ReactNode }[] =
  [
    { id: "token", label: "Token", icon: <LuCircleDot size={12} /> },
    { id: "tuning", label: "Tuning", icon: <LuLayers size={12} /> },
    { id: "changes", label: "Changes", icon: <LuGitBranch size={12} /> },
  ];

export const InspectorPanel = ({
  selectedToken,
  overrides,
  globalTokens,
  onCommitSuccess,
}: InspectorPanelProps) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>("token");
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
        {activeTab === "token" && <TokenDetailTab token={selectedToken} />}
        {activeTab === "tuning" && <TuningTab />}
        {activeTab === "changes" && (
          <CommitCenter
            overrides={overrides as Record<string, string | number>}
            globalTokens={globalTokens}
            onCommitSuccess={onCommitSuccess}
          />
        )}
      </Box>
    </VStack>
  );
};

// ---------------------
// Token Detail Tab
// ---------------------

const TokenDetailTab = ({ token }: { token: TokenDoc | null }) => {
  const details = useMemo(() => {
    if (!token) return [];
    return [
      { label: "Name", value: token.name },
      { label: "Type", value: token.type },
      { label: "Value", value: String(token.value) },
      ...(token.resolvedValue !== token.value
        ? [{ label: "Resolved", value: String(token.resolvedValue) }]
        : []),
      { label: "CSS Variable", value: token.cssVariable },
      { label: "Source", value: token.sourceFile },
      ...(token.path.length > 0
        ? [{ label: "Path", value: token.path.join(" → ") }]
        : []),
    ];
  }, [token]);

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
            <Text
              fontSize="11px"
              color="gray.700"
              fontFamily="'Space Mono', monospace"
              wordBreak="break-all"
              flex={1}
            >
              {d.value}
            </Text>
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

// ---------------------
// Tuning Tab (Placeholder — full implementation when FloatingLab is absorbed)
// ---------------------

const TuningTab = () => {
  return (
    <VStack py={12} gap={2} textAlign="center">
      <LuLayers size={20} color="var(--chakra-colors-gray-300)" />
      <Text fontSize="11px" color="gray.400" fontWeight="500">
        Interactive tuning coming soon
      </Text>
      <Text fontSize="10px" color="gray.300" maxW="180px" mx="auto">
        Color channels, font pickers, and spacing controls will appear here
      </Text>
    </VStack>
  );
};

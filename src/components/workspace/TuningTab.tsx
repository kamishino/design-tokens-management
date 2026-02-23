import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { LuPalette, LuType, LuUndo2, LuRedo2 } from "react-icons/lu";
import { StudioColorPicker } from "../playground/panels/StudioColorPicker";
import { getPrioritizedTokenMap } from "../../utils/token-graph";
import { Button } from "../ui/button";
import type { TokenDoc } from "../../utils/token-parser";
import type { TokenOverrides } from "../../schemas/manifest";

const SEMANTIC_CHANNELS = [
  {
    id: "primary",
    variable: "--brand-primary",
    label: "Primary",
    token: "brand.primary",
  },
  {
    id: "secondary",
    variable: "--brand-secondary",
    label: "Secondary",
    token: "brand.secondary",
  },
  {
    id: "accent",
    variable: "--brand-accent",
    label: "Accent",
    token: "brand.accent",
  },
  {
    id: "text",
    variable: "--text-primary",
    label: "Text",
    token: "text.primary",
  },
  {
    id: "bg",
    variable: "--bg-canvas",
    label: "Background",
    token: "bg.canvas",
  },
];

const FONT_ROLES = [
  {
    id: "heading",
    variable: "--font-family-base",
    label: "Heading",
    token: "font.family.base",
  },
  {
    id: "body",
    variable: "--font-family-body",
    label: "Body",
    token: "font.family.base",
  },
  {
    id: "code",
    variable: "--font-family-mono",
    label: "Code",
    token: "font.family.mono",
  },
];

interface TuningTabProps {
  overrides: TokenOverrides;
  updateOverride: (
    newValues: Record<string, string | number>,
    label?: string,
  ) => void;
  globalTokens: TokenDoc[];
  projectPath: string;
  onReset: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const TuningTab = ({
  overrides,
  updateOverride,
  globalTokens,
  projectPath,
  onReset,
  undo,
  redo,
  canUndo,
  canRedo,
}: TuningTabProps) => {
  const prioritizedMap = useMemo(() => {
    if (!projectPath || !globalTokens.length)
      return new Map<string, TokenDoc>();
    return getPrioritizedTokenMap(globalTokens, projectPath);
  }, [projectPath, globalTokens]);

  const getEffectiveValue = useCallback(
    (cssVar: string, tokenKey: string, fallback: string) => {
      if (overrides[cssVar] !== undefined) return overrides[cssVar] as string;
      const graphValue = prioritizedMap.get(tokenKey)?.resolvedValue;
      return graphValue !== undefined && graphValue !== null
        ? String(graphValue)
        : fallback;
    },
    [overrides, prioritizedMap],
  );

  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <VStack align="stretch" gap={0} h="full" overflowY="auto">
      {/* Color Channels */}
      <Box p={3} borderBottom="1px solid" borderColor="gray.50">
        <HStack gap={1.5} mb={3}>
          <LuPalette size={12} color="var(--chakra-colors-gray-400)" />
          <Text
            fontSize="9px"
            fontWeight="700"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Semantic Colors
          </Text>
        </HStack>

        <VStack align="stretch" gap={2}>
          {SEMANTIC_CHANNELS.map((channel) => {
            const color = getEffectiveValue(
              channel.variable,
              channel.token,
              "#000000",
            );
            return (
              <HStack key={channel.id} gap={2}>
                <StudioColorPicker
                  variant="button"
                  label={channel.label}
                  color={color}
                  onChange={(c) =>
                    updateOverride(
                      { [channel.variable]: c },
                      `Changed ${channel.label}`,
                    )
                  }
                />
              </HStack>
            );
          })}
        </VStack>
      </Box>

      {/* Font Preview */}
      <Box p={3} borderBottom="1px solid" borderColor="gray.50">
        <HStack gap={1.5} mb={3}>
          <LuType size={12} color="var(--chakra-colors-gray-400)" />
          <Text
            fontSize="9px"
            fontWeight="700"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Typography
          </Text>
        </HStack>

        <VStack align="stretch" gap={2}>
          {FONT_ROLES.map((font) => {
            const value = getEffectiveValue(
              font.variable,
              font.token,
              "Inter, sans-serif",
            );
            const shortName = (value || "Inter")
              .split(",")[0]
              .replace(/['"]/g, "");
            return (
              <HStack
                key={font.id}
                py={1.5}
                px={2}
                borderRadius="md"
                bg="gray.50"
                gap={2}
              >
                <Text
                  fontSize="10px"
                  fontWeight="600"
                  color="gray.400"
                  minW="50px"
                >
                  {font.label}
                </Text>
                <Text
                  fontSize="11px"
                  fontFamily={value}
                  color="gray.700"
                  flex={1}
                  truncate
                >
                  {shortName}
                </Text>
              </HStack>
            );
          })}
        </VStack>
      </Box>

      {/* Actions */}
      {hasOverrides && (
        <Box p={3}>
          <HStack gap={2} mb={2}>
            <Button
              size="xs"
              variant="ghost"
              onClick={undo}
              disabled={!canUndo}
              color="gray.500"
            >
              <LuUndo2 size={12} />
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={redo}
              disabled={!canRedo}
              color="gray.500"
            >
              <LuRedo2 size={12} />
            </Button>
            <Box flex={1} />
            <Button
              size="xs"
              variant="outline"
              onClick={onReset}
              colorPalette="red"
            >
              Reset All
            </Button>
          </HStack>
          <Text fontSize="9px" color="gray.300" textAlign="center">
            {Object.keys(overrides).length} override(s) active
          </Text>
        </Box>
      )}
    </VStack>
  );
};

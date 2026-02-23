import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Popover,
  Portal,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { LuPalette, LuType, LuUndo2, LuRedo2, LuCheck } from "react-icons/lu";
import { StudioColorPicker } from "../playground/panels/StudioColorPicker";
import { getPrioritizedTokenMap } from "../../utils/token-graph";
import { prependFont } from "../../utils/fonts";
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
    variable: "--font-family-heading",
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

const FONT_OPTIONS = [
  { name: "Inter", category: "Sans" },
  { name: "Roboto", category: "Sans" },
  { name: "Open Sans", category: "Sans" },
  { name: "Montserrat", category: "Sans" },
  { name: "Poppins", category: "Sans" },
  { name: "Lato", category: "Sans" },
  { name: "Outfit", category: "Sans" },
  { name: "Playfair Display", category: "Serif" },
  { name: "Merriweather", category: "Serif" },
  { name: "Lora", category: "Serif" },
  { name: "Source Code Pro", category: "Mono" },
  { name: "JetBrains Mono", category: "Mono" },
  { name: "IBM Plex Mono", category: "Mono" },
  { name: "Fira Code", category: "Mono" },
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

  const handleFontSelect = (font: (typeof FONT_ROLES)[0], family: string) => {
    const currentStack = getEffectiveValue(
      font.variable,
      font.token,
      "Inter, sans-serif",
    );
    const newStack = prependFont(family, currentStack);
    updateOverride({ [font.variable]: newStack }, `Changed ${font.label} font`);
  };

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

      {/* Font Picker */}
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
              .replace(/['"]/g, "")
              .trim();
            return (
              <FontPickerRow
                key={font.id}
                font={font}
                currentFont={shortName}
                onSelect={(family) => handleFontSelect(font, family)}
              />
            );
          })}
        </VStack>
      </Box>

      {/* Type Scale */}
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
            Type Scale
          </Text>
        </HStack>

        <VStack align="stretch" gap={3}>
          {/* Base Size */}
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="10px" fontWeight="600" color="gray.500">
                Base Size
              </Text>
              <Text
                fontSize="10px"
                fontWeight="700"
                color="gray.700"
                fontFamily="'Space Mono', monospace"
              >
                {Number(overrides["--font-size-root"]) || 16}px
              </Text>
            </HStack>
            <Input
              type="range"
              min={12}
              max={24}
              step={1}
              value={Number(overrides["--font-size-root"]) || 16}
              onChange={(e) =>
                updateOverride(
                  { "--font-size-root": Number(e.target.value) },
                  `Base size: ${e.target.value}px`,
                )
              }
              h="20px"
              p={0}
              border="none"
              cursor="pointer"
            />
          </Box>

          {/* Scale Ratio */}
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="10px" fontWeight="600" color="gray.500">
                Scale Ratio
              </Text>
              <Text
                fontSize="10px"
                fontWeight="700"
                color="gray.700"
                fontFamily="'Space Mono', monospace"
              >
                {Number(overrides["--typography-config-scale-ratio"]) || 1.25}
              </Text>
            </HStack>
            <VStack align="stretch" gap={0.5}>
              {[
                { label: "Minor Second", value: 1.067 },
                { label: "Major Second", value: 1.125 },
                { label: "Minor Third", value: 1.2 },
                { label: "Major Third", value: 1.25 },
                { label: "Perfect Fourth", value: 1.333 },
                { label: "Aug. Fourth", value: 1.414 },
                { label: "Perfect Fifth", value: 1.5 },
                { label: "Golden Ratio", value: 1.618 },
              ].map((ratio) => {
                const current =
                  Number(overrides["--typography-config-scale-ratio"]) || 1.25;
                const isActive = Math.abs(current - ratio.value) < 0.01;
                return (
                  <HStack
                    key={ratio.value}
                    px={2}
                    py={1}
                    borderRadius="sm"
                    cursor="pointer"
                    bg={isActive ? "blue.50" : "transparent"}
                    color={isActive ? "blue.600" : "gray.600"}
                    _hover={{ bg: isActive ? "blue.50" : "gray.50" }}
                    onClick={() =>
                      updateOverride(
                        { "--typography-config-scale-ratio": ratio.value },
                        `Scale: ${ratio.label}`,
                      )
                    }
                    transition="all 0.1s"
                  >
                    <Text
                      fontSize="10px"
                      fontWeight={isActive ? "700" : "500"}
                      flex={1}
                    >
                      {ratio.label}
                    </Text>
                    <Text
                      fontSize="10px"
                      fontFamily="'Space Mono', monospace"
                      fontWeight={isActive ? "700" : "400"}
                    >
                      {ratio.value}
                    </Text>
                    {isActive && <LuCheck size={10} />}
                  </HStack>
                );
              })}
            </VStack>
          </Box>
        </VStack>
      </Box>
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

// ---------------------
// Font Picker Row
// ---------------------

interface FontPickerRowProps {
  font: { id: string; label: string };
  currentFont: string;
  onSelect: (family: string) => void;
}

const FontPickerRow = ({ font, currentFont, onSelect }: FontPickerRowProps) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      FONT_OPTIONS.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <Popover.Root positioning={{ placement: "left-start", gutter: 8 }}>
      <Popover.Trigger asChild>
        <HStack
          py={1.5}
          px={2}
          borderRadius="md"
          bg="gray.50"
          gap={2}
          cursor="pointer"
          _hover={{ bg: "blue.50", borderColor: "blue.200" }}
          border="1px solid"
          borderColor="transparent"
          transition="all 0.15s"
        >
          <Text fontSize="10px" fontWeight="600" color="gray.400" minW="50px">
            {font.label}
          </Text>
          <Text
            fontSize="11px"
            fontFamily={currentFont}
            color="gray.700"
            flex={1}
            truncate
          >
            {currentFont}
          </Text>
        </HStack>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            w="220px"
            boxShadow="xl"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            overflow="hidden"
          >
            <Box p={2} borderBottom="1px solid" borderColor="gray.100">
              <Input
                size="xs"
                placeholder="Search fonts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </Box>
            <VStack align="stretch" gap={0} maxH="200px" overflowY="auto" p={1}>
              {filtered.map((f) => (
                <HStack
                  key={f.name}
                  px={2}
                  py={1.5}
                  borderRadius="md"
                  cursor="pointer"
                  bg={f.name === currentFont ? "blue.50" : "transparent"}
                  _hover={{ bg: "blue.50" }}
                  onClick={() => {
                    onSelect(f.name);
                    setSearch("");
                  }}
                  gap={2}
                >
                  <Text
                    fontSize="11px"
                    fontFamily={`'${f.name}', sans-serif`}
                    color="gray.700"
                    flex={1}
                  >
                    {f.name}
                  </Text>
                  <Text fontSize="9px" color="gray.300">
                    {f.category}
                  </Text>
                  {f.name === currentFont && (
                    <LuCheck size={12} color="var(--chakra-colors-blue-500)" />
                  )}
                </HStack>
              ))}
              {filtered.length === 0 && (
                <Text fontSize="10px" color="gray.400" p={2} textAlign="center">
                  No fonts match
                </Text>
              )}
            </VStack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

import {
  Box,
  HStack,
  Text,
  VStack,
  Badge,
  Portal,
  Button,
  Popover,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useMemo, useCallback } from "react";

import { prependFont } from "../../utils/fonts";
import { findReference } from "../../utils/token-parser";
import { getPrioritizedTokenMap } from "../../utils/token-graph";
import { StudioColorPicker } from "./panels/StudioColorPicker";
import { FontExplorer } from "./panels/FontExplorer";
import { TypeScaleSelector } from "./panels/TypeScaleSelector";
import { CommitCenter } from "./panels/CommitCenter";
import type { TokenOverrides } from "../../schemas/manifest";
import type { TokenDoc } from "../../utils/token-parser";
import { LuScanEye, LuX, LuLayoutGrid, LuHistory } from "react-icons/lu";
import type { Manifest } from "../../schemas/manifest";

import { toaster } from "../ui/toaster";

interface FloatingLabProps {
  manifest?: Manifest | null;
  recentProjects?: string[];
  onProjectSelect?: (key: string) => void;
  clientId?: string;
  projectId?: string;
  projectPath?: string; // New: For prioritized lookup
  overrides?: TokenOverrides;
  updateOverride?: (
    newValues: Record<string, string | number>,
    label?: string,
  ) => void;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  globalTokens?: TokenDoc[];
  filteredIds?: string[];
  onClearFilter?: () => void;
  onReset?: () => void;
  hasOverrides?: boolean;
}

// ... existing SEMANTIC_CHANNELS ...
const SEMANTIC_CHANNELS = [
  { id: "primary", variable: "--brandPrimary", label: "Primary" },
  { id: "secondary", variable: "--brandSecondary", label: "Secondary" },
  { id: "accent", variable: "--brandAccent", label: "Accent" },
  { id: "text", variable: "--textPrimary", label: "Text" },
  { id: "bg", variable: "--bgCanvas", label: "Background" },
];

export const FloatingLab = ({
  manifest,
  recentProjects = [],
  onProjectSelect = () => {},
  projectId = "",
  projectPath = "",
  overrides = {},
  updateOverride = () => {},
  undo = () => {},
  redo = () => {},
  canUndo = false,
  canRedo = false,
  globalTokens = [],
  filteredIds,
  onClearFilter,
  onReset = () => {},
  hasOverrides = false,
}: FloatingLabProps) => {
  // 1. Build prioritized lookup map for the current project
  const prioritizedMap = useMemo(() => {
    if (!projectPath || !globalTokens.length) return new Map();
    return getPrioritizedTokenMap(globalTokens, projectPath);
  }, [projectPath, globalTokens]);

  // 2. Helper to get the "Current Reality" value (Override > Graph > Fallback)
  const getEffectiveValue = useCallback(
    (cssVar: string, tokenKey: string, fallback: string | number) => {
      if (overrides[cssVar] !== undefined) return overrides[cssVar] as string;
      const graphValue = prioritizedMap.get(tokenKey)?.resolvedValue;
      return graphValue !== undefined && graphValue !== null
        ? String(graphValue)
        : String(fallback);
    },
    [overrides, prioritizedMap],
  );

  const handleFontSelect = (family: string, role: string) => {
    const varMap: Record<string, string> = {
      heading: "--fontFamilyHeading",
      body: "--fontFamilyBody",
      code: "--fontFamilyCode",
    };
    const targetVar = varMap[role] || "--fontFamilyBody";

    // Use effective value as the base for prepending
    const tokenKeyMap: Record<string, string> = {
      "--fontFamilyHeading": "font.family.base",
      "--fontFamilyBody": "font.family.base",
      "--fontFamilyCode": "font.family.mono",
    };
    const currentStack = getEffectiveValue(
      targetVar,
      tokenKeyMap[targetVar],
      "Inter, sans-serif",
    );

    const newStack = prependFont(family, currentStack);
    updateOverride({ [targetVar]: newStack }, `Changed ${role} Font`);
  };

  const getShortName = (stack: string) =>
    (stack || "Inter").split(",")[0].replace(/['"]/g, "");

  const handleApply = async () => {
    // RAM-only persistence per user request
    toaster.success({
      title: "Session Applied",
      description: "Tuned tokens are active in your browser session!",
    });
  };

  // 3. Responsive Values
  const bannerText = useBreakpointValue({
    base: `${filteredIds?.length || 0}`,
    md: `Inspecting ${filteredIds?.length || 0} tokens`,
  });

  // 🏠 Home Screen (Empty State)
  if (!projectId) {
    return (
      <Portal>
        <Box
          position="fixed"
          bottom="8"
          left="50%"
          transform="translateX(-50%)"
          zIndex={3000}
          bg="rgba(255, 255, 255, 0.9)"
          backdropFilter="blur(15px)"
          p={4}
          px={8}
          borderRadius="2xl"
          boxShadow="2xl"
          border="1px solid"
          borderColor="blue.200"
          w="fit-content"
          minW="400px"
        >
          <VStack gap={4}>
            <HStack gap={3} w="full">
              <Box p={2} bg="blue.50" borderRadius="lg">
                <LuLayoutGrid size={20} color="var(--chakra-colors-blue-600)" />
              </Box>
              <VStack align="start" gap={0}>
                <Text fontSize="sm" fontWeight="bold">
                  Studio Home
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Select a project to start tuning tokens
                </Text>
              </VStack>
            </HStack>

            {recentProjects.length > 0 && (
              <VStack w="full" align="start" gap={2}>
                <Text
                  fontSize="10px"
                  fontWeight="bold"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Recent Projects
                </Text>
                <HStack gap={2} w="full">
                  {recentProjects.map((key) => {
                    const p = manifest?.projects[key];
                    if (!p) return null;
                    return (
                      <Button
                        key={key}
                        size="xs"
                        variant="outline"
                        borderColor="blue.100"
                        _hover={{ bg: "blue.50", borderColor: "blue.300" }}
                        onClick={() => onProjectSelect(key)}
                      >
                        {p.client} / {p.project}
                      </Button>
                    );
                  })}
                </HStack>
              </VStack>
            )}

            {recentProjects.length === 0 && (
              <Box
                p={4}
                bg="gray.50"
                borderRadius="md"
                w="full"
                textAlign="center"
              >
                <Text fontSize="xs" color="gray.400" fontStyle="italic">
                  No recent projects. Use the selector in the toolbar above.
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </Portal>
    );
  }

  const hFont = getEffectiveValue(
    "--fontFamilyHeading",
    "font.family.base",
    "Inter, sans-serif",
  );
  const bFont = getEffectiveValue(
    "--fontFamilyBody",
    "font.family.base",
    "Inter, sans-serif",
  );
  const cFont = getEffectiveValue(
    "--fontFamilyCode",
    "font.family.mono",
    "IBM Plex Mono, monospace",
  );
  const scaleRatio = Number(
    getEffectiveValue(
      "--typographyConfigScaleRatio",
      "typography.config.scale-ratio",
      1.25,
    ),
  );
  const baseSize = parseFloat(
    getEffectiveValue("--fontSizeRoot", "font.size.root", 16),
  );

  return (
    <Portal>
      <VStack
        position="fixed"
        bottom="8"
        left="50%"
        transform="translateX(-50%)"
        zIndex={3000}
        gap={0}
        alignItems="center"
        w="fit-content"
      >
        {/* Inspector Banner */}
        {filteredIds && (
          <HStack
            bg="blue.600"
            px={{ base: 2, md: 4 }}
            py={1.5}
            borderRadius="t-lg"
            w="100%"
            justifyContent="space-between"
            boxShadow="md"
            mb="-1px"
            zIndex={1001}
          >
            <HStack gap={2}>
              <LuScanEye size={14} color="white" />
              <Text fontSize="xs" fontWeight="bold" color="white">
                {bannerText}
              </Text>
            </HStack>
            <IconButton
              aria-label="Clear Filter"
              size="xs"
              variant="ghost"
              colorPalette="whiteAlpha"
              onClick={onClearFilter}
              h="18px"
              minW="18px"
            >
              <LuX size={12} />
            </IconButton>
          </HStack>
        )}

        <Box
          position="relative"
          zIndex={1000}
          bg="rgba(255, 255, 255, 0.9)"
          backdropFilter="blur(15px)"
          p={2}
          px={6}
          borderRadius={filteredIds ? "b-2xl" : "full"} // Square top if banner present
          boxShadow="2xl"
          border="1px solid"
          borderColor="gray.200"
          w="fit-content"
          maxW="95vw"
        >
          <HStack gap={{ base: 2, md: 4 }} h="52px">
            {/* ... existing content ... */}
            {/* GROUP 1: HISTORY - Hide on mobile */}
            <HStack
              gap={1}
              bg="gray.50"
              p={1}
              borderRadius="full"
              display={{ base: "none", md: "flex" }}
            >
              <Button
                size="xs"
                variant="ghost"
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                borderRadius="full"
              >
                ↺
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                borderRadius="full"
              >
                ↻
              </Button>
            </HStack>

            <Box
              w="1px"
              h="24px"
              bg="gray.200"
              display={{ base: "none", md: "block" }}
            />

            {/* GROUP 2: COLORS */}
            <HStack gap={{ base: 1, md: 4 }}>
              {SEMANTIC_CHANNELS.map((channel) => {
                const tokenKeyMap: Record<string, string> = {
                  primary: "brand.primary",
                  secondary: "brand.secondary",
                  accent: "brand.accent",
                  text: "text.primary",
                  bg: "bg.canvas",
                };
                const activeColor = getEffectiveValue(
                  channel.variable,
                  tokenKeyMap[channel.id],
                  "#000000",
                );

                return (
                  <Popover.Root
                    key={channel.id}
                    positioning={{ placement: "top", gutter: 12 }}
                    lazyMount
                    unmountOnExit
                  >
                    <Popover.Trigger asChild>
                      <HStack
                        gap={2}
                        cursor="pointer"
                        p={1}
                        pl={2}
                        borderRadius="full"
                        _hover={{ bg: "gray.100" }}
                        // Highlight if part of inspection
                        bg={
                          filteredIds &&
                          filteredIds.some((id) => id.includes(channel.id))
                            ? "blue.50"
                            : "transparent"
                        }
                        border={
                          filteredIds &&
                          filteredIds.some((id) => id.includes(channel.id))
                            ? "1px solid"
                            : "none"
                        }
                        borderColor="blue.200"
                      >
                        <Box
                          w={{ base: "16px", md: "24px" }}
                          h={{ base: "16px", md: "24px" }}
                          bg={activeColor}
                          borderRadius="full"
                          border="2px solid white"
                          boxShadow="xs"
                        />
                        <VStack align="start" gap={0}>
                          <Text
                            fontSize="8px"
                            fontWeight="bold"
                            color="gray.400"
                            textTransform="uppercase"
                          >
                            {channel.label}
                          </Text>
                          <HStack gap={1}>
                            <Text
                              fontSize="10px"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {activeColor.toUpperCase()}
                            </Text>
                            {findReference(activeColor, globalTokens) && (
                              <Badge
                                variant="subtle"
                                colorScheme="gray"
                                fontSize="8px"
                                borderRadius="xs"
                              >
                                {findReference(activeColor, globalTokens)
                                  ?.id.split(".")
                                  .pop()}
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>
                    </Popover.Trigger>
                    <Portal>
                      <Popover.Positioner>
                        <Popover.Content
                          w="auto"
                          borderRadius="2xl"
                          boxShadow="2xl"
                          overflow="hidden"
                          border="none"
                        >
                          <StudioColorPicker
                            label={channel.label}
                            color={activeColor}
                            onChange={(c) =>
                              updateOverride(
                                { [channel.variable]: c },
                                `Changed ${channel.label}`,
                              )
                            }
                          />
                        </Popover.Content>
                      </Popover.Positioner>
                    </Portal>
                  </Popover.Root>
                );
              })}
            </HStack>

            <Box
              w="1px"
              h="24px"
              bg="gray.200"
              display={{ base: "none", sm: "block" }}
            />

            {/* GROUP 3: TYPOGRAPHY (Scale + Font) */}
            <HStack gap={{ base: 2, md: 4 }}>
              <Popover.Root
                positioning={{ placement: "top", gutter: 12 }}
                lazyMount
                unmountOnExit
              >
                <Popover.Trigger asChild>
                  <Button
                    size="xs"
                    variant="outline"
                    borderRadius="full"
                    px={{ base: 2, md: 4 }}
                    minW={{ base: "auto", md: "80px" }}
                    h="32px"
                  >
                    <VStack gap={0} align="start">
                      <Text
                        fontSize="8px"
                        fontWeight="bold"
                        color="gray.400"
                        textTransform="uppercase"
                        display={{ base: "none", md: "block" }}
                      >
                        Ratio
                      </Text>
                      <Text
                        fontSize={{ base: "xs", md: "10px" }}
                        fontWeight="bold"
                        color="purple.600"
                      >
                        {scaleRatio.toFixed(3)}
                      </Text>
                    </VStack>
                  </Button>
                </Popover.Trigger>
                <Portal>
                  <Popover.Positioner>
                    <Popover.Content
                      w="auto"
                      borderRadius="xl"
                      boxShadow="2xl"
                      overflow="hidden"
                      border="none"
                    >
                      <TypeScaleSelector
                        activeRatio={scaleRatio}
                        baseSize={baseSize}
                        onSelect={(val) =>
                          updateOverride(
                            { "--typographyConfigScaleRatio": val },
                            "Changed Type Scale",
                          )
                        }
                        onBaseSizeChange={(val) =>
                          updateOverride(
                            { "--fontSizeRoot": `${val}px` },
                            "Changed Base Font Size",
                          )
                        }
                      />
                    </Popover.Content>
                  </Popover.Positioner>
                </Portal>
              </Popover.Root>

              <Popover.Root
                positioning={{ placement: "top", gutter: 12 }}
                lazyMount
                unmountOnExit
              >
                <Popover.Trigger asChild>
                  <Button
                    size={{ base: "xs", md: "xs" }}
                    variant="outline"
                    borderRadius="full"
                    px={{ base: 2, md: 4 }}
                    minW={{ base: "auto", md: "120px" }}
                    h="32px"
                  >
                    <VStack gap={0} align="start">
                      <HStack gap={1}>
                        <Text fontSize="9px" fontWeight="bold" color="blue.600">
                          {getShortName(hFont)}
                        </Text>
                        <Text fontSize="8px" color="gray.400">
                          /
                        </Text>
                        <Text fontSize="9px" fontWeight="bold" color="blue.600">
                          {getShortName(bFont)}
                        </Text>
                      </HStack>
                      <Text
                        fontSize="8px"
                        color="gray.400"
                        fontWeight="medium"
                        display={{ base: "none", md: "block" }}
                      >
                        Code: {getShortName(cFont)}
                      </Text>
                    </VStack>
                  </Button>
                </Popover.Trigger>
                <Portal>
                  <Popover.Positioner>
                    <Popover.Content
                      w="auto"
                      borderRadius="xl"
                      boxShadow="2xl"
                      overflow="hidden"
                      border="none"
                    >
                      <FontExplorer
                        headingFamily={hFont}
                        bodyFamily={bFont}
                        codeFamily={cFont}
                        onSelect={handleFontSelect}
                      />
                    </Popover.Content>
                  </Popover.Positioner>
                </Portal>
              </Popover.Root>
            </HStack>

            <Box flex={1} minW={4} />

            {/* GROUP 5: ACTIONS */}
            <HStack gap={{ base: 1, md: 3 }}>
              <Button
                variant="ghost"
                colorPalette="red"
                size={{ base: "xs", md: "sm" }}
                onClick={onReset}
                disabled={!hasOverrides}
                fontSize="xs"
                borderRadius="full"
              >
                Reset
              </Button>
              
              <Popover.Root
                positioning={{ placement: "top", gutter: 12 }}
                lazyMount
                unmountOnExit
              >
                <Popover.Trigger asChild>
                  <Button
                    colorPalette="blue"
                    size={{ base: "xs", md: "sm" }}
                    borderRadius="full"
                    px={{ base: 3, md: 6 }}
                    boxShadow="0 4px 14px 0 rgba(0,118,255,0.39)"
                    disabled={!hasOverrides}
                  >
                    <LuHistory size={14} style={{ marginRight: 8 }} />
                    Commit
                  </Button>
                </Popover.Trigger>
                <Portal>
                  <Popover.Positioner>
                    <Popover.Content
                      w="320px"
                      borderRadius="xl"
                      boxShadow="2xl"
                      overflow="hidden"
                      border="none"
                    >
                      <CommitCenter 
                        overrides={overrides}
                        globalTokens={globalTokens}
                        onCommitSuccess={() => {
                          // Clear staging area? For now, we just toast and keep overrides
                          // until a formal "Sync/Refresh" happens.
                          toaster.success({ title: "Disk Synced" });
                        }}
                      />
                    </Popover.Content>
                  </Popover.Positioner>
                </Portal>
              </Popover.Root>

              <Button
                variant="outline"
                size={{ base: "xs", md: "sm" }}
                borderRadius="full"
                px={{ base: 3, md: 6 }}
                onClick={handleApply}
              >
                Apply
              </Button>
            </HStack>
          </HStack>
        </Box>
      </VStack>
    </Portal>
  );
};

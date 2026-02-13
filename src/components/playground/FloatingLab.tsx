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
  Tabs,
  SimpleGrid,
  Heading
} from "@chakra-ui/react";
import { useMemo, useCallback, useState } from "react";

import { prependFont } from "../../utils/fonts";
import { findReference } from "../../utils/token-parser";
import { getPrioritizedTokenMap } from "../../utils/token-graph";
import { StudioColorPicker } from "./panels/StudioColorPicker";
import { FontExplorer } from "./panels/FontExplorer";
import { TypeScaleSelector } from "./panels/TypeScaleSelector";
import { CommitCenter } from "./panels/CommitCenter";
import type { TokenOverrides } from "../../schemas/manifest";
import type { TokenDoc } from "../../utils/token-parser";
import { LuScanEye, LuX, LuLayoutGrid, LuHistory, LuPalette, LuType } from "react-icons/lu";
import type { Manifest } from "../../schemas/manifest";

import { toaster } from "../ui/toaster";

interface FloatingLabProps {
  manifest?: Manifest | null;
  recentProjects?: string[];
  onProjectSelect?: (key: string) => void;
  clientId?: string;
  projectId?: string;
  projectPath?: string;
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
  variant?: 'floating' | 'static';
}

const SEMANTIC_CHANNELS = [
  { id: "primary", variable: "--brandPrimary", label: "Primary" },
  { id: "secondary", variable: "--brandSecondary", label: "Secondary" },
  { id: "accent", variable: "--brandAccent", label: "Accent" },
  { id: "text", variable: "--textPrimary", label: "Text" },
  { id: "bg", variable: "--bgCanvas", label: "Background" },
];

export const FloatingLab = (props: FloatingLabProps) => {
  const {
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
    variant = 'floating',
  } = props;

  // --- DATA LOGIC ---
  const prioritizedMap = useMemo(() => {
    if (!projectPath || !globalTokens.length) return new Map();
    return getPrioritizedTokenMap(globalTokens, projectPath);
  }, [projectPath, globalTokens]);

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
    toaster.success({
      title: "Session Applied",
      description: "Tuned tokens are active in your browser session!",
    });
  };

  const bannerText = useBreakpointValue({
    base: `${filteredIds?.length || 0}`,
    md: `Inspecting ${filteredIds?.length || 0} tokens`,
  });

  // Derived Values
  const hFont = getEffectiveValue("--fontFamilyHeading", "font.family.base", "Inter, sans-serif");
  const bFont = getEffectiveValue("--fontFamilyBody", "font.family.base", "Inter, sans-serif");
  const cFont = getEffectiveValue("--fontFamilyCode", "font.family.mono", "IBM Plex Mono, monospace");
  const scaleRatio = Number(getEffectiveValue("--typographyConfigScaleRatio", "typography.config.scale-ratio", 1.25));
  const baseSize = parseFloat(getEffectiveValue("--fontSizeRoot", "font.size.root", 16));

  // --- HOME SCREEN (No Project Selected) ---
  if (!projectId) {
    const Wrapper = variant === 'floating' ? Portal : Box;
    const homeStyles = variant === 'floating' ? {
      position: "fixed", bottom: "8", left: "50%", transform: "translateX(-50%)", zIndex: 3000,
    } : {
      position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center",
    };

    return (
      <Wrapper>
        <Box {...homeStyles} bg="rgba(255, 255, 255, 0.9)" backdropFilter="blur(15px)" p={4} px={8} borderRadius="2xl" boxShadow="2xl" border="1px solid" borderColor="blue.200" w="fit-content" minW="400px">
          <VStack gap={4}>
            <HStack gap={3} w="full">
              <Box p={2} bg="blue.50" borderRadius="lg"><LuLayoutGrid size={20} color="var(--chakra-colors-blue-600)" /></Box>
              <VStack align="start" gap={0}>
                <Text fontSize="sm" fontWeight="bold">Studio Home</Text>
                <Text fontSize="xs" color="gray.500">Select a project to start tuning tokens</Text>
              </VStack>
            </HStack>
            {recentProjects.length > 0 ? (
              <VStack w="full" align="start" gap={2}>
                <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider">Recent Projects</Text>
                <HStack gap={2} w="full">
                  {recentProjects.map((key) => {
                    const p = manifest?.projects[key];
                    if (!p) return null;
                    return (
                      <Button key={key} size="xs" variant="outline" borderColor="blue.100" _hover={{ bg: "blue.50", borderColor: "blue.300" }} onClick={() => onProjectSelect(key)}>{p.client} / {p.project}</Button>
                    );
                  })}
                </HStack>
              </VStack>
            ) : (
              <Box p={4} bg="gray.50" borderRadius="md" w="full" textAlign="center"><Text fontSize="xs" color="gray.400" fontStyle="italic">No recent projects.</Text></Box>
            )}
          </VStack>
        </Box>
      </Wrapper>
    );
  }

  // --- LAYOUT SWITCH ---
  if (variant === 'static') {
    return (
      <LabDashboard 
        {...props}
        // Pass derived values
        hFont={hFont} bFont={bFont} cFont={cFont}
        scaleRatio={scaleRatio} baseSize={baseSize}
        getEffectiveValue={getEffectiveValue}
        handleFontSelect={handleFontSelect}
        handleApply={handleApply}
      />
    );
  }

  // Default Floating Bar
  return (
    <Portal>
      <VStack position="fixed" bottom="8" left="50%" transform="translateX(-50%)" zIndex={3000} gap={0} alignItems="center" w="fit-content">
        {filteredIds && (
          <HStack bg="blue.600" px={{ base: 2, md: 4 }} py={1.5} borderRadius="t-lg" w="100%" justify="space-between" boxShadow="md" mb="-1px" zIndex={1001}>
            <HStack gap={2}><LuScanEye size={14} color="white" /><Text fontSize="xs" fontWeight="bold" color="white">{bannerText}</Text></HStack>
            <IconButton aria-label="Clear" size="xs" variant="ghost" colorPalette="whiteAlpha" onClick={onClearFilter} h="18px" minW="18px"><LuX size={12} /></IconButton>
          </HStack>
        )}
        <Box position="relative" zIndex={1000} bg="rgba(255, 255, 255, 0.9)" backdropFilter="blur(15px)" p={2} px={6} borderRadius={filteredIds ? "b-2xl" : "full"} boxShadow="2xl" border="1px solid" borderColor="gray.200" w="fit-content" maxW="95vw">
          <LabFloatingBarContent {...props} hFont={hFont} bFont={bFont} cFont={cFont} scaleRatio={scaleRatio} baseSize={baseSize} getEffectiveValue={getEffectiveValue} handleFontSelect={handleFontSelect} getShortName={getShortName} handleApply={handleApply} />
        </Box>
      </VStack>
    </Portal>
  );
};

// --- SUB-COMPONENTS ---

const LabDashboard = (props: any) => {
  const { globalTokens, updateOverride, getEffectiveValue, handleFontSelect, scaleRatio, baseSize, hFont, bFont, cFont, onReset, undo, redo, canUndo, canRedo, handleApply, hasOverrides } = props;

  return (
    <Tabs.Root defaultValue="colors" orientation="vertical" h="full" w="full" display="flex">
      <Tabs.List w="200px" bg="gray.50" borderRight="1px solid" borderColor="gray.200" p={4} gap={2}>
        <Tabs.Trigger value="colors" justifyContent="flex-start" px={4} py={2} borderRadius="md" _selected={{ bg: "white", color: "blue.600", shadow: "sm" }}>
          <LuPalette style={{ marginRight: 8 }} /> Colors
        </Tabs.Trigger>
        <Tabs.Trigger value="typography" justifyContent="flex-start" px={4} py={2} borderRadius="md" _selected={{ bg: "white", color: "blue.600", shadow: "sm" }}>
          <LuType style={{ marginRight: 8 }} /> Typography
        </Tabs.Trigger>
        <Tabs.Trigger value="actions" justifyContent="flex-start" px={4} py={2} borderRadius="md" _selected={{ bg: "white", color: "blue.600", shadow: "sm" }}>
          <LuHistory style={{ marginRight: 8 }} /> Actions
        </Tabs.Trigger>
      </Tabs.List>

      <Box flex={1} overflowY="auto" bg="white" p={8}>
        <Tabs.Content value="colors" p={0}>
          <Heading size="sm" mb={6}>Semantic Colors</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
            {SEMANTIC_CHANNELS.map((channel) => {
              const tokenKeyMap: Record<string, string> = {
                primary: "brand.primary", secondary: "brand.secondary", accent: "brand.accent", text: "text.primary", bg: "bg.canvas",
              };
              const activeColor = getEffectiveValue(channel.variable, tokenKeyMap[channel.id], "#000000");
              
              return (
                <StudioColorPicker 
                  key={channel.id} 
                  variant="button" 
                  label={channel.label} 
                  color={activeColor} 
                  onChange={(c) => updateOverride({ [channel.variable]: c }, `Changed ${channel.label}`)} 
                />
              );
            })}
          </SimpleGrid>
        </Tabs.Content>

        <Tabs.Content value="typography" p={0}>
          <VStack align="stretch" gap={8}>
            <Box>
              <Heading size="sm" mb={4}>Type Scale</Heading>
              <Box p={4} border="1px solid" borderColor="gray.100" borderRadius="lg">
                <TypeScaleSelector activeRatio={scaleRatio} baseSize={baseSize} onSelect={(val) => updateOverride({ "--typographyConfigScaleRatio": val }, "Changed Type Scale")} onBaseSizeChange={(val) => updateOverride({ "--fontSizeRoot": `${val}px` }, "Changed Base Font Size")} />
              </Box>
            </Box>
            <Box>
              <Heading size="sm" mb={4}>Font Families</Heading>
              <Box p={4} border="1px solid" borderColor="gray.100" borderRadius="lg" h="600px">
                <FontExplorer variant="expanded" headingFamily={hFont} bodyFamily={bFont} codeFamily={cFont} onSelect={handleFontSelect} />
              </Box>
            </Box>
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="actions" p={0}>
          <Heading size="sm" mb={6}>Session History</Heading>
          <VStack align="start" gap={4}>
            <HStack>
              <Button size="sm" variant="outline" onClick={undo} disabled={!canUndo}>Undo</Button>
              <Button size="sm" variant="outline" onClick={redo} disabled={!canRedo}>Redo</Button>
            </HStack>
            <HStack>
              <Button size="sm" colorPalette="red" variant="subtle" onClick={onReset} disabled={!hasOverrides}>Reset All Overrides</Button>
              <Button size="sm" colorPalette="blue" variant="solid" onClick={handleApply}>Apply to Session</Button>
            </HStack>
          </VStack>
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
}

const LabFloatingBarContent = (props: any) => {
  const { getShortName, hFont, bFont, cFont, scaleRatio, baseSize, updateOverride, getEffectiveValue, handleFontSelect, onReset, hasOverrides, undo, redo, canUndo, canRedo, globalTokens, filteredIds, handleApply } = props;
  
  return (
    <HStack gap={{ base: 2, md: 4 }} h="52px">
      <HStack gap={1} bg="gray.50" p={1} borderRadius="full" display={{ base: "none", md: "flex" }}>
        <Button size="xs" variant="ghost" onClick={undo} disabled={!canUndo} borderRadius="full">↺</Button>
        <Button size="xs" variant="ghost" onClick={redo} disabled={!canRedo} borderRadius="full">↻</Button>
      </HStack>
      <Box w="1px" h="24px" bg="gray.200" display={{ base: "none", md: "block" }} />
      
      {/* COLORS */}
      <HStack gap={{ base: 1, md: 4 }}>
        {SEMANTIC_CHANNELS.map((channel) => {
          const tokenKeyMap: Record<string, string> = { primary: "brand.primary", secondary: "brand.secondary", accent: "brand.accent", text: "text.primary", bg: "bg.canvas" };
          const activeColor = getEffectiveValue(channel.variable, tokenKeyMap[channel.id], "#000000");
          return (
            <Popover.Root key={channel.id} positioning={{ placement: "top", gutter: 12 }} lazyMount unmountOnExit>
              <Popover.Trigger asChild>
                <HStack gap={2} cursor="pointer" p={1} pl={2} borderRadius="full" _hover={{ bg: "gray.100" }} bg={filteredIds && filteredIds.some((id: string) => id.includes(channel.id)) ? "blue.50" : "transparent"} border={filteredIds && filteredIds.some((id: string) => id.includes(channel.id)) ? "1px solid" : "none"} borderColor="blue.200">
                  <Box w={{ base: "16px", md: "24px" }} h={{ base: "16px", md: "24px" }} bg={activeColor} borderRadius="full" border="2px solid white" boxShadow="xs" />
                  <VStack align="start" gap={0}>
                    <Text fontSize="8px" fontWeight="bold" color="gray.400" textTransform="uppercase">{channel.label}</Text>
                    <HStack gap={1}>
                      <Text fontSize="10px" fontWeight="bold" fontFamily="monospace">{activeColor.toUpperCase()}</Text>
                      {findReference(activeColor, globalTokens) && <Badge variant="subtle" colorScheme="gray" fontSize="8px" borderRadius="xs">{findReference(activeColor, globalTokens)?.id.split(".").pop()}</Badge>}
                    </HStack>
                  </VStack>
                </HStack>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content w="auto" borderRadius="2xl" boxShadow="2xl" overflow="hidden" border="none">
                    <StudioColorPicker label={channel.label} color={activeColor} onChange={(c) => updateOverride({ [channel.variable]: c }, `Changed ${channel.label}`)} />
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
          );
        })}
      </HStack>

      <Box w="1px" h="24px" bg="gray.200" display={{ base: "none", sm: "block" }} />

      {/* TYPOGRAPHY */}
      <HStack gap={{ base: 2, md: 4 }}>
        <Popover.Root positioning={{ placement: "top", gutter: 12 }} lazyMount unmountOnExit>
          <Popover.Trigger asChild>
            <Button size="xs" variant="outline" borderRadius="full" px={{ base: 2, md: 4 }} minW={{ base: "auto", md: "80px" }} h="32px">
              <VStack gap={0} align="start">
                <Text fontSize="8px" fontWeight="bold" color="gray.400" textTransform="uppercase" display={{ base: "none", md: "block" }}>Ratio</Text>
                <Text fontSize={{ base: "xs", md: "10px" }} fontWeight="bold" color="purple.600">{scaleRatio.toFixed(3)}</Text>
              </VStack>
            </Button>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content w="auto" borderRadius="xl" boxShadow="2xl" overflow="hidden" border="none">
                <TypeScaleSelector activeRatio={scaleRatio} baseSize={baseSize} onSelect={(val) => updateOverride({ "--typographyConfigScaleRatio": val }, "Changed Type Scale")} onBaseSizeChange={(val) => updateOverride({ "--fontSizeRoot": `${val}px` }, "Changed Base Font Size")} />
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>

        <Popover.Root positioning={{ placement: "top", gutter: 12 }} lazyMount unmountOnExit>
          <Popover.Trigger asChild>
            <Button size={{ base: "xs", md: "xs" }} variant="outline" borderRadius="full" px={{ base: 2, md: 4 }} minW={{ base: "auto", md: "120px" }} h="32px">
              <VStack gap={0} align="start">
                <HStack gap={1}>
                  <Text fontSize="9px" fontWeight="bold" color="blue.600">{getShortName(hFont)}</Text>
                  <Text fontSize="8px" color="gray.400">/</Text>
                  <Text fontSize="9px" fontWeight="bold" color="blue.600">{getShortName(bFont)}</Text>
                </HStack>
                <Text fontSize="8px" color="gray.400" fontWeight="medium" display={{ base: "none", md: "block" }}>Code: {getShortName(cFont)}</Text>
              </VStack>
            </Button>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content w="auto" borderRadius="xl" boxShadow="2xl" overflow="hidden" border="none">
                <FontExplorer headingFamily={hFont} bodyFamily={bFont} codeFamily={cFont} onSelect={handleFontSelect} />
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      </HStack>

      <Box flex={1} minW={4} />

      {/* ACTIONS */}
      <HStack gap={{ base: 1, md: 3 }}>
        <Button variant="ghost" colorPalette="red" size={{ base: "xs", md: "sm" }} onClick={onReset} disabled={!hasOverrides} fontSize="xs" borderRadius="full">Reset</Button>
        <Button variant="outline" size={{ base: "xs", md: "sm" }} borderRadius="full" px={{ base: 3, md: 6 }} onClick={handleApply}>Apply</Button>
      </HStack>
    </HStack>
  );
}

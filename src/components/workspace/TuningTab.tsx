import {
  Box,
  VStack,
  HStack,
  Text,
  Popover,
  Portal,
  Table,
  Input,
  Badge,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { LuPalette, LuType, LuUndo2, LuRedo2, LuCheck } from "react-icons/lu";
import { Slider } from "../ui/slider";
import { parse, converter, wcagContrast, formatHex } from "culori";
// @ts-expect-error apca-w3 has no type declarations
import { APCAcontrast, sRGBtoY } from "apca-w3";
import { StudioColorPicker } from "../playground/panels/StudioColorPicker";
import { getPrioritizedTokenMap } from "../../utils/token-graph";
import { prependFont } from "../../utils/fonts";
import { Button } from "../ui/button";
import type { TokenDoc } from "../../utils/token-parser";
import type { TokenOverrides } from "../../schemas/manifest";

// --- Color Science Utilities (culori + APCA) ---
const toOklch = converter("oklch");
const toRgb = converter("rgb");

const getColorInfo = (hex: string) => {
  const parsed = parse(hex);
  if (!parsed)
    return { l: 0, c: 0, h: 0, contrastW: 1, contrastB: 21, apcaLc: 0 };
  const oklch = toOklch(parsed);
  const contrastW = wcagContrast(parsed, "white");
  const contrastB = wcagContrast(parsed, "black");
  const rgb = toRgb(parsed);
  const r = Math.round((rgb.r ?? 0) * 255);
  const g = Math.round((rgb.g ?? 0) * 255);
  const b = Math.round((rgb.b ?? 0) * 255);
  const apcaLcW = APCAcontrast(sRGBtoY([r, g, b]), sRGBtoY([255, 255, 255]));
  const apcaLcB = APCAcontrast(sRGBtoY([r, g, b]), sRGBtoY([0, 0, 0]));
  return {
    l: Math.round((oklch.l ?? 0) * 100),
    c: Math.round((oklch.c ?? 0) * 1000) / 1000,
    h: Math.round(oklch.h ?? 0),
    contrastW: Math.round(contrastW * 100) / 100,
    contrastB: Math.round(contrastB * 100) / 100,
    apcaLc: Math.round(
      Math.abs(apcaLcW) >= Math.abs(apcaLcB) ? apcaLcW : apcaLcB,
    ),
  };
};

const getWcagBadge = (ratio: number) => {
  if (ratio >= 7) return { label: "AAA", colorPalette: "green" };
  if (ratio >= 4.5) return { label: "AA", colorPalette: "green" };
  if (ratio >= 3) return { label: "AA18", colorPalette: "yellow" };
  return { label: "Fail", colorPalette: "red" };
};

const getApcaBadge = (lc: number) => {
  const absLc = Math.abs(lc);
  if (absLc >= 75) return { label: "Lc75+", colorPalette: "green" };
  if (absLc >= 60) return { label: "Lc60+", colorPalette: "green" };
  if (absLc >= 45) return { label: "Lc45", colorPalette: "yellow" };
  return { label: "Lc<45", colorPalette: "red" };
};

// --- Constants ---
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
    token: "font.family.heading",
  },
  {
    id: "body",
    variable: "--font-family-base",
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

// --- OKLCH Harmony Utilities ---
const oklchToHex = (l: number, c: number, h: number): string => {
  const clamped = {
    mode: "oklch" as const,
    l: Math.max(0, Math.min(1, l)),
    c: Math.max(0, c),
    h: ((h % 360) + 360) % 360,
  };
  return formatHex(clamped) ?? "#000000";
};

interface HarmonyPalette {
  name: string;
  secondary: string;
  accent: string;
}

const generateHarmoniesOklch = (primary: string): HarmonyPalette[] => {
  const parsed = parse(primary);
  if (!parsed) return [];
  const { l, c, h } = toOklch(parsed);
  const hh = h ?? 0;
  return [
    {
      name: "Triadic",
      secondary: oklchToHex(l, c, hh + 120),
      accent: oklchToHex(l, c, hh + 240),
    },
    {
      name: "Complementary",
      secondary: oklchToHex(Math.min(l + 0.08, 0.9), c, hh + 180),
      accent: oklchToHex(l, c, hh + 180),
    },
    {
      name: "Analogous",
      secondary: oklchToHex(l, c, hh + 30),
      accent: oklchToHex(l, c, hh - 30),
    },
    {
      name: "Split-Comp",
      secondary: oklchToHex(l, c, hh + 150),
      accent: oklchToHex(l, c, hh + 210),
    },
  ];
};

/** Simple seeded PRNG (0-1 range) for deterministic but varied results */
const seededRandom = (seed: number, idx: number) => {
  const x = Math.sin(seed * 9301 + idx * 4973) * 49297;
  return x - Math.floor(x);
};

const generateVariant = (
  palette: HarmonyPalette,
  _primary: string,
  seed: number,
): HarmonyPalette => {
  const tweakColor = (hex: string, idx: number) => {
    const p = parse(hex);
    if (!p) return hex;
    const { l, c, h } = toOklch(p);
    const dL = (seededRandom(seed, idx) - 0.5) * 0.2; // ±10% lightness
    const dC = (seededRandom(seed, idx + 7) - 0.5) * 0.08; // ±0.04 chroma
    return oklchToHex(l + dL, c + dC, h ?? 0);
  };
  return {
    name: palette.name + " Var",
    secondary: tweakColor(palette.secondary, 0),
    accent: tweakColor(palette.accent, 1),
  };
};

// --- Harmony Lab Component ---
const HarmonyLabSection = ({
  primaryColor,
  onApply,
}: {
  primaryColor: string;
  onApply: (secondary: string, accent: string) => void;
}) => {
  const harmonies = useMemo(
    () => generateHarmoniesOklch(primaryColor),
    [primaryColor],
  );
  const [selected, setSelected] = useState(0);
  const [showVariant, setShowVariant] = useState(false);
  const [variantSeed, setVariantSeed] = useState(1);

  const displayPalettes = useMemo(() => {
    if (!showVariant) return harmonies;
    return harmonies.map((h) => generateVariant(h, primaryColor, variantSeed));
  }, [harmonies, showVariant, primaryColor, variantSeed]);

  const primaryInfo = useMemo(() => {
    const p = parse(primaryColor);
    if (!p) return { l: 0, c: 0, h: 0 };
    const oklch = toOklch(p);
    return {
      l: Math.round((oklch.l ?? 0) * 100),
      c: Math.round((oklch.c ?? 0) * 1000) / 1000,
      h: Math.round(oklch.h ?? 0),
    };
  }, [primaryColor]);

  return (
    <VStack align="stretch" gap={2}>
      <HStack gap={1} mb={1}>
        <Box
          w="16px"
          h="16px"
          borderRadius="sm"
          bg={primaryColor}
          border="1px solid rgba(0,0,0,0.1)"
        />
        <Text fontSize="8px" fontFamily="monospace" color="gray.400">
          L:{primaryInfo.l}% C:{primaryInfo.c} H:{primaryInfo.h}°
        </Text>
      </HStack>
      <HStack gap={1}>
        <Box
          as="button"
          px={2}
          py={0.5}
          borderRadius="md"
          fontSize="9px"
          fontWeight="600"
          bg={!showVariant ? "blue.500" : "gray.100"}
          color={!showVariant ? "white" : "gray.600"}
          cursor="pointer"
          onClick={() => setShowVariant(false)}
          transition="all 0.1s"
        >
          Standard
        </Box>
        <Box
          as="button"
          px={2}
          py={0.5}
          borderRadius="md"
          fontSize="9px"
          fontWeight="600"
          bg={showVariant ? "purple.500" : "gray.100"}
          color={showVariant ? "white" : "gray.600"}
          cursor="pointer"
          onClick={() => {
            if (showVariant) {
              setVariantSeed((s) => s + 1);
            } else {
              setShowVariant(true);
            }
          }}
          transition="all 0.1s"
        >
          Variant
        </Box>
      </HStack>
      {displayPalettes.map((h, i) => (
        <HStack
          key={h.name}
          px={2}
          py={1.5}
          borderRadius="md"
          cursor="pointer"
          bg={selected === i ? "blue.50" : "transparent"}
          border={selected === i ? "1px solid" : "1px solid transparent"}
          borderColor={selected === i ? "blue.200" : "transparent"}
          _hover={{ bg: selected === i ? "blue.50" : "gray.50" }}
          onClick={() => setSelected(i)}
          transition="all 0.15s"
        >
          <Text
            fontSize="10px"
            fontWeight={selected === i ? "700" : "500"}
            flex={1}
            color={selected === i ? "blue.700" : "gray.600"}
          >
            {h.name}
          </Text>
          <HStack gap={1}>
            <Box
              w="18px"
              h="18px"
              borderRadius="sm"
              bg={primaryColor}
              border="1px solid rgba(0,0,0,0.1)"
              title="Primary"
            />
            <Box
              w="18px"
              h="18px"
              borderRadius="sm"
              bg={h.secondary}
              border="1px solid rgba(0,0,0,0.1)"
              title="Secondary"
            />
            <Box
              w="18px"
              h="18px"
              borderRadius="sm"
              bg={h.accent}
              border="1px solid rgba(0,0,0,0.1)"
              title="Accent"
            />
          </HStack>
        </HStack>
      ))}
      <Box
        as="button"
        mt={1}
        py={1.5}
        px={3}
        borderRadius="md"
        bg="blue.500"
        color="white"
        fontSize="10px"
        fontWeight="700"
        textAlign="center"
        cursor="pointer"
        _hover={{ bg: "blue.600" }}
        transition="all 0.1s"
        onClick={() =>
          onApply(
            displayPalettes[selected].secondary,
            displayPalettes[selected].accent,
          )
        }
      >
        Apply {displayPalettes[selected].name}
      </Box>
    </VStack>
  );
};

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
  const [tuningSubTab, setTuningSubTab] = useState<
    "colors" | "typography" | "harmony"
  >("colors");

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
    <VStack align="stretch" gap={0} h="full" overflow="hidden">
      {/* Sub-tab bar */}
      <HStack
        px={2}
        py={1.5}
        gap={0.5}
        borderBottom="1px solid"
        borderColor="gray.100"
        flexShrink={0}
      >
        {(["colors", "typography", "harmony"] as const).map((tab) => {
          const labels = {
            colors: "🎨 Colors",
            typography: "🔤 Typo",
            harmony: "🎯 Harmony",
          };
          return (
            <Box
              key={tab}
              as="button"
              px={2.5}
              py={1}
              borderRadius="md"
              fontSize="10px"
              fontWeight="600"
              color={tuningSubTab === tab ? "blue.600" : "gray.400"}
              bg={tuningSubTab === tab ? "blue.50" : "transparent"}
              cursor="pointer"
              _hover={{ bg: tuningSubTab === tab ? "blue.50" : "gray.50" }}
              transition="all 0.1s"
              onClick={() => setTuningSubTab(tab)}
            >
              {labels[tab]}
            </Box>
          );
        })}
        <Box flex={1} />
        {hasOverrides && (
          <HStack gap={0.5}>
            <Box
              as="button"
              p={1}
              borderRadius="sm"
              color={canUndo ? "gray.500" : "gray.200"}
              cursor={canUndo ? "pointer" : "default"}
              onClick={undo}
              _hover={canUndo ? { color: "blue.500" } : {}}
            >
              <LuUndo2 size={11} />
            </Box>
            <Box
              as="button"
              p={1}
              borderRadius="sm"
              color={canRedo ? "gray.500" : "gray.200"}
              cursor={canRedo ? "pointer" : "default"}
              onClick={redo}
              _hover={canRedo ? { color: "blue.500" } : {}}
            >
              <LuRedo2 size={11} />
            </Box>
          </HStack>
        )}
      </HStack>

      <Box flex={1} overflowY="auto">
        {/* Color Channels */}
        {tuningSubTab === "colors" && (
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
                const info = getColorInfo(color);
                const bestContrast =
                  info.contrastW >= info.contrastB
                    ? info.contrastW
                    : info.contrastB;
                const wcag = getWcagBadge(bestContrast);
                const apca = getApcaBadge(info.apcaLc);
                return (
                  <VStack key={channel.id} gap={0.5} align="stretch">
                    <HStack gap={2}>
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
                    <HStack gap={1} pl={1} flexWrap="wrap">
                      <Text
                        fontSize="8px"
                        fontFamily="monospace"
                        color="gray.400"
                      >
                        L:{info.l}%
                      </Text>
                      <Text
                        fontSize="8px"
                        fontFamily="monospace"
                        color="gray.400"
                      >
                        C:{info.c}
                      </Text>
                      <Text
                        fontSize="8px"
                        fontFamily="monospace"
                        color="gray.400"
                      >
                        H:{info.h}°
                      </Text>
                      <Badge
                        size="xs"
                        variant="subtle"
                        colorPalette={wcag.colorPalette}
                        fontSize="7px"
                        px={1}
                        py={0}
                      >
                        {wcag.label} {bestContrast}:1
                      </Badge>
                      <Badge
                        size="xs"
                        variant="subtle"
                        colorPalette={apca.colorPalette}
                        fontSize="7px"
                        px={1}
                        py={0}
                      >
                        APCA {apca.label}
                      </Badge>
                    </HStack>
                  </VStack>
                );
              })}
            </VStack>

            {/* 60/30/10 Proportion Guide */}
            <Box mt={3}>
              <Text
                fontSize="9px"
                fontWeight="700"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="wider"
                mb={1.5}
              >
                60 / 30 / 10 Rule
              </Text>
              <HStack
                gap={0}
                h="20px"
                borderRadius="md"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
              >
                <Box
                  w="60%"
                  h="full"
                  bg={getEffectiveValue(
                    "--brand-primary",
                    "brand.primary",
                    "#2B4D86",
                  )}
                  position="relative"
                >
                  <Text
                    fontSize="7px"
                    fontWeight="700"
                    color="white"
                    position="absolute"
                    left="50%"
                    top="50%"
                    transform="translate(-50%, -50%)"
                    textShadow="0 1px 2px rgba(0,0,0,0.4)"
                  >
                    60%
                  </Text>
                </Box>
                <Box
                  w="30%"
                  h="full"
                  bg={getEffectiveValue(
                    "--brand-secondary",
                    "brand.secondary",
                    "#4A6DA7",
                  )}
                  position="relative"
                >
                  <Text
                    fontSize="7px"
                    fontWeight="700"
                    color="white"
                    position="absolute"
                    left="50%"
                    top="50%"
                    transform="translate(-50%, -50%)"
                    textShadow="0 1px 2px rgba(0,0,0,0.4)"
                  >
                    30%
                  </Text>
                </Box>
                <Box
                  w="10%"
                  h="full"
                  bg={getEffectiveValue(
                    "--brand-accent",
                    "brand.accent",
                    "#1F8055",
                  )}
                  position="relative"
                >
                  <Text
                    fontSize="7px"
                    fontWeight="700"
                    color="white"
                    position="absolute"
                    left="50%"
                    top="50%"
                    transform="translate(-50%, -50%)"
                    textShadow="0 1px 2px rgba(0,0,0,0.4)"
                  >
                    10%
                  </Text>
                </Box>
              </HStack>
              <HStack gap={0} mt={1} justifyContent="space-between">
                <Text
                  fontSize="7px"
                  color="gray.400"
                  w="60%"
                  textAlign="center"
                >
                  Dominant
                </Text>
                <Text
                  fontSize="7px"
                  color="gray.400"
                  w="30%"
                  textAlign="center"
                >
                  Supporting
                </Text>
                <Text
                  fontSize="7px"
                  color="gray.400"
                  w="10%"
                  textAlign="center"
                >
                  CTA
                </Text>
              </HStack>
            </Box>
          </Box>
        )}

        {/* Harmony Lab */}
        {tuningSubTab === "harmony" && (
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
                🎨 Harmony Lab
              </Text>
            </HStack>

            <HarmonyLabSection
              primaryColor={getEffectiveValue(
                "--brand-primary",
                "brand.primary",
                "#4A6DA7",
              )}
              onApply={(secondary, accent) =>
                updateOverride(
                  { "--brand-secondary": secondary, "--brand-accent": accent },
                  `Harmony palette applied`,
                )
              }
            />
          </Box>
        )}

        {/* Font Picker */}
        {tuningSubTab === "typography" && (
          <>
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
                {/* Base Size Slider */}
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
                  <Slider
                    min={12}
                    max={24}
                    step={1}
                    value={[Number(overrides["--font-size-root"]) || 16]}
                    onValueChange={(details) =>
                      updateOverride(
                        { "--font-size-root": details.value[0] },
                        `Base size: ${details.value[0]}px`,
                      )
                    }
                    size="sm"
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
                      {Number(overrides["--typography-config-scale-ratio"]) ||
                        1.25}
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
                        Number(overrides["--typography-config-scale-ratio"]) ||
                        1.25;
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
                              {
                                "--typography-config-scale-ratio": ratio.value,
                              },
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

                {/* Computed Sizes Preview Table */}
                <Box mt={2}>
                  <Text
                    fontSize="9px"
                    fontWeight="700"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb={2}
                  >
                    Preview
                  </Text>
                  <Table.Root size="sm" variant="outline">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader
                          fontSize="9px"
                          color="gray.400"
                          py={1}
                          px={2}
                        >
                          Step
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          fontSize="9px"
                          color="gray.400"
                          py={1}
                          px={2}
                        >
                          Size
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          fontSize="9px"
                          color="gray.400"
                          py={1}
                          px={2}
                        >
                          REM
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {[6, 5, 4, 3, 2, 1, 0, -1, -2].map((step) => {
                        const base =
                          Number(overrides["--font-size-root"]) || 16;
                        const ratio =
                          Number(
                            overrides["--typography-config-scale-ratio"],
                          ) || 1.25;
                        const size =
                          Math.round(base * Math.pow(ratio, step) * 100) / 100;
                        const rem = Math.round((size / 16) * 1000) / 1000;
                        const isBase = step === 0;
                        return (
                          <Table.Row key={step}>
                            <Table.Cell py={0.5} px={2}>
                              <Text
                                fontSize="9px"
                                fontFamily="monospace"
                                color={isBase ? "blue.600" : "gray.500"}
                              >
                                {step}
                              </Text>
                            </Table.Cell>
                            <Table.Cell py={0.5} px={2}>
                              <Text
                                fontSize="9px"
                                fontFamily="'Space Mono', monospace"
                                fontWeight="600"
                                color={isBase ? "blue.600" : "gray.700"}
                              >
                                {size}px
                              </Text>
                            </Table.Cell>
                            <Table.Cell py={0.5} px={2}>
                              <Text
                                fontSize="9px"
                                fontFamily="'Space Mono', monospace"
                                fontWeight="500"
                                color={isBase ? "blue.600" : "gray.500"}
                              >
                                {rem}rem
                              </Text>
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table.Root>
                </Box>
              </VStack>
            </Box>
          </>
        )}
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

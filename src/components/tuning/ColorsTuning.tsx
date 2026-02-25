import React, { useMemo, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Popover,
  Portal,
} from "@chakra-ui/react";
import { parse, converter, wcagContrast, formatHex } from "culori";
// @ts-expect-error apca-w3 has no type declarations
import { APCAcontrast, sRGBtoY } from "apca-w3";
import { StudioColorPicker } from "../playground/panels/StudioColorPicker";
import { ColorScalePanel } from "../workspace/ColorScalePanel";
import { CollapsibleSection } from "./CollapsibleSection";

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
    {
      name: "Monochrome",
      secondary: oklchToHex(Math.max(0.2, l - 0.2), c, hh),
      accent: oklchToHex(Math.min(0.9, l + 0.2), c, hh),
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

  // Hover preview — temporarily inject CSS vars, revert on mouse-out
  const applyPreview = (secondary: string, accent: string) => {
    const root = document.documentElement;
    root.style.setProperty("--brand-secondary", secondary);
    root.style.setProperty("--brand-accent", accent);
  };

  const revertPreview = () => {
    document.documentElement.style.removeProperty("--brand-secondary");
    document.documentElement.style.removeProperty("--brand-accent");
  };

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
        <Text fontSize="10px" fontFamily="monospace" color="gray.400">
          L:{primaryInfo.l}% C:{primaryInfo.c} H:{primaryInfo.h}°
        </Text>
      </HStack>
      <HStack gap={1}>
        <Box
          as="button"
          px={2}
          py={0.5}
          borderRadius="md"
          fontSize="10px"
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
          fontSize="10px"
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
          onMouseEnter={() => applyPreview(h.secondary, h.accent)}
          onMouseLeave={revertPreview}
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

interface ColorsTuningProps {
  getEffectiveValue: (
    cssVar: string,
    tokenKey: string,
    fallback: string,
  ) => string;
  updateOverride: (
    newValues: Record<string, string | number>,
    label?: string,
  ) => void;
  getScaleSeed: (id: string, currentHex: string) => string;
  refreshScaleSeed: (id: string, hex: string) => void;
  /** Current active overrides — used to show "modified" state on swatches */
  overrides?: Record<string, string | number>;
}

export const ColorsTuning = React.memo(
  ({
    getEffectiveValue,
    updateOverride,
    getScaleSeed,
    refreshScaleSeed,
    overrides = {},
  }: ColorsTuningProps) => {
    return (
      <>
        <CollapsibleSection
          label="Semantic Colors"
          storageKey="colors-semantic"
          defaultOpen={true}
          modifiedCount={
            SEMANTIC_CHANNELS.filter(
              (c) => getEffectiveValue(c.variable, c.token, "") !== "",
            ).length
          }
        >
          <Box p={3}>
            {/* 2-column swatch grid */}
            <Box
              display="grid"
              gridTemplateColumns="repeat(2, 1fr)"
              gap={2}
              mb={3}
            >
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
                const isModified = !!overrides?.[channel.variable];

                return (
                  <Box key={channel.id} position="relative">
                    <Popover.Root positioning={{ placement: "right" }}>
                      <Popover.Trigger asChild>
                        <Box
                          as="button"
                          w="full"
                          borderRadius="lg"
                          overflow="hidden"
                          border="2px solid"
                          borderColor={isModified ? "blue.300" : "gray.150"}
                          cursor="pointer"
                          _hover={{
                            borderColor: "blue.400",
                            transform: "translateY(-1px)",
                            boxShadow: "md",
                          }}
                          transition="all 0.15s"
                          title={`${channel.label}: ${color}`}
                        >
                          {/* Color block */}
                          <Box h="52px" bg={color} position="relative">
                            {/* WCAG badge overlay */}
                            <Badge
                              position="absolute"
                              top="4px"
                              right="4px"
                              colorPalette={wcag.colorPalette}
                              variant="solid"
                              fontSize="7px"
                              px={1}
                              py={0}
                              borderRadius="sm"
                              opacity={0.9}
                            >
                              {wcag.label}
                            </Badge>
                          </Box>

                          {/* Label row */}
                          <Box px={2} py={1.5} bg="white">
                            <Text
                              fontSize="9px"
                              fontWeight="700"
                              color="gray.600"
                              truncate
                            >
                              {channel.label}
                            </Text>
                            <Text
                              fontSize="8px"
                              color="gray.400"
                              fontFamily="'Space Mono', monospace"
                              truncate
                            >
                              {color}
                            </Text>
                          </Box>
                        </Box>
                      </Popover.Trigger>

                      <Portal>
                        <Popover.Positioner>
                          <Popover.Content p={3} w="220px" shadow="xl">
                            {/* Color details */}
                            <HStack gap={2} mb={2}>
                              <Box
                                w="24px"
                                h="24px"
                                borderRadius="md"
                                bg={color}
                                border="1px solid"
                                borderColor="gray.200"
                                flexShrink={0}
                              />
                              <VStack gap={0} align="start">
                                <Text
                                  fontSize="10px"
                                  fontWeight="700"
                                  color="gray.700"
                                >
                                  {channel.label}
                                </Text>
                                <Text
                                  fontSize="9px"
                                  color="gray.400"
                                  fontFamily="monospace"
                                >
                                  L:{info.l}% C:{info.c} H:{info.h}°
                                </Text>
                              </VStack>
                              <HStack gap={1} ml="auto">
                                <Badge
                                  colorPalette={wcag.colorPalette}
                                  variant="subtle"
                                  fontSize="8px"
                                  px={1}
                                >
                                  {wcag.label}
                                </Badge>
                                <Badge
                                  colorPalette={apca.colorPalette}
                                  variant="subtle"
                                  fontSize="8px"
                                  px={1}
                                >
                                  {apca.label}
                                </Badge>
                              </HStack>
                            </HStack>

                            <StudioColorPicker
                              variant="expanded"
                              label={channel.label}
                              color={color}
                              onChange={(c) =>
                                updateOverride(
                                  { [channel.variable]: c },
                                  `Changed ${channel.label}`,
                                )
                              }
                            />

                            {isModified && (
                              <Box
                                as="button"
                                mt={2}
                                w="full"
                                py={1}
                                borderRadius="md"
                                fontSize="9px"
                                fontWeight="600"
                                color="orange.600"
                                bg="orange.50"
                                border="1px solid"
                                borderColor="orange.200"
                                cursor="pointer"
                                _hover={{ bg: "orange.100" }}
                                onClick={() =>
                                  updateOverride(
                                    {
                                      [channel.variable]: getEffectiveValue(
                                        channel.variable,
                                        channel.token,
                                        "#000000",
                                      ),
                                    },
                                    `Reset ${channel.label}`,
                                  )
                                }
                              >
                                ↺ Reset to base
                              </Box>
                            )}
                          </Popover.Content>
                        </Popover.Positioner>
                      </Portal>
                    </Popover.Root>
                  </Box>
                );
              })}
            </Box>

            <Box mt={3}>
              <Text
                fontSize="9px"
                fontWeight="700"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="wider"
                mb={1.5}
              >
                Shade Scales
              </Text>
              <ColorScalePanel
                colors={SEMANTIC_CHANNELS.filter((c) =>
                  [
                    "--brand-primary",
                    "--brand-secondary",
                    "--brand-accent",
                  ].includes(c.variable),
                ).map((c) => ({
                  id: c.id,
                  label: c.label,
                  hex: getScaleSeed(
                    c.id,
                    getEffectiveValue(c.variable, c.token, "#000000"),
                  ),
                  variable: c.variable,
                }))}
                onSelectShade={(variable, hex, label) =>
                  updateOverride({ [variable]: hex }, label)
                }
                onRefreshScale={(id: string) => {
                  const channel = SEMANTIC_CHANNELS.find((c) => c.id === id);
                  if (channel) {
                    const currentHex = getEffectiveValue(
                      channel.variable,
                      channel.token,
                      "#000000",
                    );
                    refreshScaleSeed(id, currentHex);
                  }
                }}
              />
            </Box>

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
                h="28px"
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
                    fontSize="10px"
                    fontWeight="700"
                    color="white"
                    position="absolute"
                    left="50%"
                    top="50%"
                    transform="translate(-50%, -50%)"
                    textShadow="0 1px 2px rgba(0,0,0,0.4)"
                    whiteSpace="nowrap"
                  >
                    Primary · 60%
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
                    fontSize="10px"
                    fontWeight="700"
                    color="white"
                    position="absolute"
                    left="50%"
                    top="50%"
                    transform="translate(-50%, -50%)"
                    textShadow="0 1px 2px rgba(0,0,0,0.4)"
                    whiteSpace="nowrap"
                  >
                    Secondary · 30%
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
                  title="Accent · 10%"
                />
              </HStack>
            </Box>
          </Box>
        </CollapsibleSection>

        <CollapsibleSection
          label="Harmony Lab"
          storageKey="colors-harmony"
          defaultOpen={true}
        >
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
        </CollapsibleSection>
      </>
    );
  },
);

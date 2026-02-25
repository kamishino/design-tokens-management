import React, { useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Popover,
  Portal,
} from "@chakra-ui/react";

import { LuType, LuCheck } from "react-icons/lu";

// --- Scale Presets from tokens/global/base/scale.json ---
const SCALE_PRESETS: { key: string; label: string; value: number }[] = [
  { key: "minor-second", label: "Minor Second", value: 1.067 },
  { key: "major-second", label: "Major Second", value: 1.125 },
  { key: "minor-third", label: "Minor Third", value: 1.2 },
  { key: "major-third", label: "Major Third", value: 1.25 },
  { key: "fourth", label: "Perfect Fourth", value: 1.333 },
  { key: "augmented-fourth", label: "Aug. Fourth", value: 1.414 },
  { key: "fifth", label: "Perfect Fifth", value: 1.5 },
  { key: "minor-sixth", label: "Minor Sixth", value: 1.6 },
  { key: "major-sixth", label: "Major Sixth", value: 1.667 },
  { key: "golden", label: "Golden Ratio φ", value: 1.618 },
  { key: "minor-seventh", label: "Minor Seventh", value: 1.778 },
  { key: "major-seventh", label: "Major Seventh", value: 1.875 },
  { key: "octave", label: "Octave", value: 2 },
  { key: "major-tenth", label: "Major Tenth", value: 2.5 },
  { key: "major-eleventh", label: "Major Eleventh", value: 2.667 },
  { key: "major-twelfth", label: "Major Twelfth", value: 3 },
  { key: "double-octave", label: "Double Octave", value: 4 },
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

interface TypographyTuningProps {
  overrides: Record<string, string | number>;
  getEffectiveValue: (
    cssVar: string,
    tokenKey: string,
    fallback: string,
  ) => string;
  updateOverride: (
    newValues: Record<string, string | number>,
    label?: string,
  ) => void;
  handleFontSelect: (
    font: { id: string; variable: string; label: string; token: string },
    family: string,
  ) => void;
}

export const TypographyTuning = React.memo(
  ({
    overrides,
    getEffectiveValue,
    updateOverride,
    handleFontSelect,
  }: TypographyTuningProps) => {
    const [sampleText, setSampleText] = useState(
      "The quick brown fox jumps over the lazy dog",
    );

    return (
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

          <VStack align="stretch" gap={3}>
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

              const weightVar = `--font-weight-${font.id}`;
              const lhVar = `--line-height-${font.id}`;
              const lsVar = `--letter-spacing-${font.id}`;

              const currentWeight =
                Number(overrides[weightVar]) ||
                (font.id === "heading" ? 700 : 400);
              const currentLH =
                Number(overrides[lhVar]) || (font.id === "heading" ? 1.2 : 1.5);
              const currentLS = Number(overrides[lsVar]) || 0;

              return (
                <Box
                  key={font.id}
                  p={2}
                  bg="gray.25"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.100"
                >
                  <FontPickerRow
                    font={font}
                    currentFont={shortName}
                    onSelect={(family) => handleFontSelect(font, family)}
                  />

                  <HStack mt={2} gap={2} flexWrap="wrap">
                    <VStack gap={0.5} align="start">
                      <Text
                        fontSize="8px"
                        color="gray.400"
                        fontWeight="600"
                        textTransform="uppercase"
                      >
                        Weight
                      </Text>
                      <HStack gap={0}>
                        {[300, 400, 500, 600, 700, 800, 900].map((w) => {
                          const isActive = currentWeight === w;
                          return (
                            <Box
                              key={w}
                              as="button"
                              px={1}
                              py={0.5}
                              fontSize="8px"
                              fontFamily="'Space Mono', monospace"
                              fontWeight={isActive ? "700" : "400"}
                              bg={isActive ? "blue.50" : "transparent"}
                              color={isActive ? "blue.600" : "gray.500"}
                              borderRadius="sm"
                              cursor="pointer"
                              _hover={{ bg: isActive ? "blue.50" : "gray.50" }}
                              onClick={() =>
                                updateOverride(
                                  { [weightVar]: w },
                                  `${font.label} weight: ${w}`,
                                )
                              }
                              transition="all 0.1s"
                            >
                              {w}
                            </Box>
                          );
                        })}
                      </HStack>
                    </VStack>

                    <VStack gap={0.5} align="start">
                      <Text
                        fontSize="8px"
                        color="gray.400"
                        fontWeight="600"
                        textTransform="uppercase"
                      >
                        LH
                      </Text>
                      <Input
                        type="number"
                        min={0.8}
                        max={3.0}
                        step={0.05}
                        value={currentLH}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (v >= 0.8 && v <= 3.0)
                            updateOverride(
                              { [lhVar]: v },
                              `${font.label} line-height: ${v}`,
                            );
                        }}
                        size="xs"
                        w="48px"
                        textAlign="center"
                        fontFamily="'Space Mono', monospace"
                        fontSize="9px"
                        fontWeight="600"
                        borderRadius="sm"
                        bg="white"
                      />
                    </VStack>

                    <VStack gap={0.5} align="start">
                      <Text
                        fontSize="8px"
                        color="gray.400"
                        fontWeight="600"
                        textTransform="uppercase"
                      >
                        LS
                      </Text>
                      <HStack gap={0.5}>
                        <Input
                          type="number"
                          min={-0.1}
                          max={0.5}
                          step={0.005}
                          value={currentLS}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (v >= -0.1 && v <= 0.5)
                              updateOverride(
                                { [lsVar]: v },
                                `${font.label} letter-spacing: ${v}em`,
                              );
                          }}
                          size="xs"
                          w="56px"
                          textAlign="center"
                          fontFamily="'Space Mono', monospace"
                          fontSize="9px"
                          fontWeight="600"
                          borderRadius="sm"
                          bg="white"
                        />
                        <Text fontSize="8px" color="gray.400">
                          em
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        </Box>

        <Box p={3} borderBottom="1px solid" borderColor="gray.50">
          {/* Type Scale section header + sample text input */}
          <HStack justify="space-between" align="center" mb={3}>
            <HStack gap={1.5}>
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

            {/* Sample Text input */}
            <HStack gap={1} flex={1} ml={3}>
              <Input
                size="xs"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Preview text…"
                fontSize="9px"
                fontFamily="'Space Mono', monospace"
                borderRadius="md"
                bg="gray.50"
                _focus={{ bg: "white", borderColor: "blue.300" }}
              />
            </HStack>
          </HStack>

          <VStack align="stretch" gap={3}>
            <HStack justify="space-between" align="center">
              <Text fontSize="10px" fontWeight="600" color="gray.500">
                Base Size
              </Text>
              <HStack gap={1}>
                <Input
                  type="number"
                  min={10}
                  max={32}
                  step={1}
                  value={Number(overrides["--font-size-root"]) || 16}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 10 && v <= 32)
                      updateOverride(
                        { "--font-size-root": v },
                        `Base size: ${v}px`,
                      );
                  }}
                  size="xs"
                  w="52px"
                  textAlign="center"
                  fontFamily="'Space Mono', monospace"
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="md"
                />
                <Text fontSize="9px" color="gray.400">
                  px
                </Text>
              </HStack>
            </HStack>

            <HStack justify="space-between" align="center">
              <Text fontSize="10px" fontWeight="600" color="gray.500">
                Scale Ratio
              </Text>
              <HStack gap={1}>
                {/* Preset dropdown from scale.json — native select avoids type conflicts */}
                <Box position="relative" display="flex" alignItems="center">
                  <select
                    value={(() => {
                      const current =
                        Number(overrides["--font-scale-ratio"]) || 1.25;
                      const match = SCALE_PRESETS.find(
                        (p) => Math.abs(p.value - current) < 0.001,
                      );
                      return match ? match.key : "custom";
                    })()}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const preset = SCALE_PRESETS.find(
                        (p) => p.key === e.target.value,
                      );
                      if (preset)
                        updateOverride(
                          { "--font-scale-ratio": preset.value },
                          `Scale ratio: ${preset.label}`,
                        );
                    }}
                    style={{
                      fontSize: "9px",
                      fontFamily: "'Space Mono', monospace",
                      fontWeight: 600,
                      color: "var(--chakra-colors-gray-500)",
                      background: "var(--chakra-colors-gray-50)",
                      border: "1px solid var(--chakra-colors-gray-200)",
                      borderRadius: "6px",
                      padding: "2px 20px 2px 6px",
                      height: "24px",
                      cursor: "pointer",
                      appearance: "none",
                      minWidth: "118px",
                    }}
                  >
                    <option value="custom">— Custom —</option>
                    {SCALE_PRESETS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label} ({p.value})
                      </option>
                    ))}
                  </select>
                  <Box
                    position="absolute"
                    right="5px"
                    pointerEvents="none"
                    color="gray.400"
                    fontSize="8px"
                    lineHeight={1}
                  >
                    ▾
                  </Box>
                </Box>

                {/* Manual input */}
                <Input
                  type="number"
                  min={1.05}
                  max={4}
                  step={0.001}
                  value={Number(overrides["--font-scale-ratio"]) || 1.25}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 1.05 && v <= 4)
                      updateOverride(
                        { "--font-scale-ratio": v },
                        `Scale ratio: ${v}`,
                      );
                  }}
                  size="xs"
                  w="60px"
                  textAlign="center"
                  fontFamily="'Space Mono', monospace"
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="md"
                />
                <Text fontSize="9px" color="gray.400">
                  x
                </Text>
              </HStack>
            </HStack>

            <Box
              mt={2}
              pt={2}
              borderTop="1px dashed"
              borderColor="gray.200"
              overflow="hidden"
            >
              {/* Column headers: Role | px | rem | Preview */}
              <HStack px={2} mb={1} gap={0}>
                <Text
                  fontSize="7px"
                  fontWeight="700"
                  color="gray.300"
                  textTransform="uppercase"
                  w="36px"
                  flexShrink={0}
                >
                  Role
                </Text>
                <Text
                  fontSize="7px"
                  fontWeight="700"
                  color="gray.300"
                  textTransform="uppercase"
                  w="44px"
                  flexShrink={0}
                >
                  px
                </Text>
                <Text
                  fontSize="7px"
                  fontWeight="700"
                  color="gray.300"
                  textTransform="uppercase"
                  w="44px"
                  flexShrink={0}
                >
                  rem
                </Text>
                <Text
                  fontSize="7px"
                  fontWeight="700"
                  color="gray.300"
                  textTransform="uppercase"
                  flex={1}
                >
                  Preview
                </Text>
              </HStack>

              {[
                { step: 6, role: "h1", label: "Heading 1", family: "heading" },
                { step: 5, role: "h2", label: "Heading 2", family: "heading" },
                { step: 4, role: "h3", label: "Heading 3", family: "heading" },
                { step: 3, role: "h4", label: "Heading 4", family: "heading" },
                { step: 2, role: "h5", label: "Heading 5", family: "heading" },
                { step: 1, role: "h6", label: "Heading 6", family: "heading" },
                { step: 0, role: "body", label: "Body", family: "body" },
                { step: -1, role: "sm", label: "Small", family: "body" },
                { step: -2, role: "xs", label: "Extra Small", family: "body" },
              ].map(({ step, role, label, family }) => {
                const base = Number(overrides["--font-size-root"]) || 16;
                const ratio = Number(overrides["--font-scale-ratio"]) || 1.25;
                const sizeRaw = base * Math.pow(ratio, step);
                const sizePx = Math.round(sizeRaw * 100) / 100;
                const sizeRem = Math.round((sizeRaw / 16) * 100) / 100;
                const isBase = step === 0;
                const fontVar =
                  family === "heading"
                    ? "--font-family-heading"
                    : "--font-family-base";
                const fontTok =
                  family === "heading"
                    ? "font.family.heading"
                    : "font.family.base";
                const fontFam = getEffectiveValue(fontVar, fontTok, "Inter");
                const lhVar =
                  family === "heading"
                    ? "--line-height-heading"
                    : "--line-height-body";
                const lhTok = family === "heading" ? "1.2" : "1.5";
                const lineH = Number(overrides[lhVar]) || Number(lhTok);
                const previewText = sampleText.trim() || label;
                const capSize = Math.min(sizePx, 40); // cap rendering so h1 doesn't overflow

                return (
                  <HStack
                    key={step}
                    px={2}
                    py={1}
                    gap={0}
                    borderRadius="md"
                    bg={isBase ? "blue.50" : "transparent"}
                    _hover={{ bg: isBase ? "blue.50" : "gray.50" }}
                    transition="background 0.1s"
                    align="center"
                  >
                    {/* Role chip */}
                    <Box w="36px" flexShrink={0}>
                      <Box
                        display="inline-block"
                        px={1}
                        py={0.5}
                        borderRadius="sm"
                        bg={isBase ? "blue.100" : "gray.100"}
                        fontSize="8px"
                        fontWeight="700"
                        color={isBase ? "blue.600" : "gray.400"}
                        fontFamily="'Space Mono', monospace"
                        lineHeight={1}
                      >
                        {role}
                      </Box>
                    </Box>

                    {/* Col 2: px — 44px */}
                    <Text
                      w="44px"
                      flexShrink={0}
                      fontSize="9px"
                      fontFamily="'Space Mono', monospace"
                      fontWeight="700"
                      color={isBase ? "blue.700" : "gray.600"}
                      lineHeight={1}
                    >
                      {sizePx}
                    </Text>

                    {/* Col 3: rem — 44px */}
                    <Text
                      w="44px"
                      flexShrink={0}
                      fontSize="9px"
                      fontFamily="'Space Mono', monospace"
                      fontWeight="600"
                      color={isBase ? "blue.500" : "gray.400"}
                      lineHeight={1}
                    >
                      {sizeRem}
                    </Text>

                    {/* Col 4: Live preview — flex */}
                    <Box flex={1} overflow="hidden">
                      <Text
                        fontSize={`${capSize}px`}
                        fontFamily={fontFam}
                        fontWeight={
                          family === "heading"
                            ? Number(overrides["--font-weight-heading"]) || 700
                            : Number(overrides["--font-weight-body"]) || 400
                        }
                        lineHeight={lineH}
                        color={isBase ? "blue.800" : "gray.700"}
                        truncate
                      >
                        {previewText}
                      </Text>
                    </Box>
                  </HStack>
                );
              })}
            </Box>
          </VStack>
        </Box>
      </>
    );
  },
  (prev, next) => prev.overrides === next.overrides,
);

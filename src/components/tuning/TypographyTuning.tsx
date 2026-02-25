import React from 'react';
import { Box, VStack, HStack, Text, Input, Badge } from "@chakra-ui/react";
import { LuType } from "react-icons/lu";

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
  getEffectiveValue: (cssVar: string, tokenKey: string, fallback: string) => string;
  updateOverride: (newValues: Record<string, string | number>, label?: string) => void;
  handleFontSelect: (font: any, family: string) => void;
}

export const TypographyTuning = React.memo(({
  overrides,
  getEffectiveValue,
  updateOverride,
  handleFontSelect
}: TypographyTuningProps) => {
  return (
    <>
      <Box p={3} borderBottom="1px solid" borderColor="gray.50">
        <HStack gap={1.5} mb={3}>
          <LuType size={12} color="var(--chakra-colors-gray-400)" />
          <Text fontSize="9px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider">
            Typography
          </Text>
        </HStack>

        <VStack align="stretch" gap={3}>
          {FONT_ROLES.map((font) => {
            const value = getEffectiveValue(font.variable, font.token, "Inter, sans-serif");
            const shortName = (value || "Inter").split(",")[0].replace(/['"]/g, "").trim();

            const weightVar = `--font-weight-${font.id}`;
            const lhVar = `--line-height-${font.id}`;
            const lsVar = `--letter-spacing-${font.id}`;

            const currentWeight = Number(overrides[weightVar]) || (font.id === "heading" ? 700 : 400);
            const currentLH = Number(overrides[lhVar]) || (font.id === "heading" ? 1.2 : 1.5);
            const currentLS = Number(overrides[lsVar]) || 0;

            return (
              <Box key={font.id} p={2} bg="gray.25" borderRadius="md" border="1px solid" borderColor="gray.100">
                <FontPickerRow font={font} currentFont={shortName} onSelect={(family) => handleFontSelect(font, family)} />

                <HStack mt={2} gap={2} flexWrap="wrap">
                  <VStack gap={0.5} align="start">
                    <Text fontSize="8px" color="gray.400" fontWeight="600" textTransform="uppercase">Weight</Text>
                    <HStack gap={0}>
                      {[300, 400, 500, 600, 700, 800, 900].map((w) => {
                        const isActive = currentWeight === w;
                        return (
                          <Box
                            key={w} as="button" px={1} py={0.5} fontSize="8px" fontFamily="'Space Mono', monospace"
                            fontWeight={isActive ? "700" : "400"} bg={isActive ? "blue.50" : "transparent"} color={isActive ? "blue.600" : "gray.500"}
                            borderRadius="sm" cursor="pointer" _hover={{ bg: isActive ? "blue.50" : "gray.50" }}
                            onClick={() => updateOverride({ [weightVar]: w }, `${font.label} weight: ${w}`)} transition="all 0.1s"
                          >
                            {w}
                          </Box>
                        );
                      })}
                    </HStack>
                  </VStack>

                  <VStack gap={0.5} align="start">
                    <Text fontSize="8px" color="gray.400" fontWeight="600" textTransform="uppercase">LH</Text>
                    <Input
                      type="number" min={0.8} max={3.0} step={0.05} value={currentLH}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (v >= 0.8 && v <= 3.0) updateOverride({ [lhVar]: v }, `${font.label} line-height: ${v}`);
                      }}
                      size="xs" w="48px" textAlign="center" fontFamily="'Space Mono', monospace" fontSize="9px" fontWeight="600" borderRadius="sm" bg="white"
                    />
                  </VStack>

                  <VStack gap={0.5} align="start">
                    <Text fontSize="8px" color="gray.400" fontWeight="600" textTransform="uppercase">LS</Text>
                    <HStack gap={0.5}>
                      <Input
                        type="number" min={-0.1} max={0.5} step={0.005} value={currentLS}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (v >= -0.1 && v <= 0.5) updateOverride({ [lsVar]: v }, `${font.label} letter-spacing: ${v}em`);
                        }}
                        size="xs" w="56px" textAlign="center" fontFamily="'Space Mono', monospace" fontSize="9px" fontWeight="600" borderRadius="sm" bg="white"
                      />
                      <Text fontSize="8px" color="gray.400">em</Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </Box>

      <Box p={3} borderBottom="1px solid" borderColor="gray.50">
        <HStack gap={1.5} mb={3}>
          <LuType size={12} color="var(--chakra-colors-gray-400)" />
          <Text fontSize="9px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider">
            Type Scale
          </Text>
        </HStack>

        <VStack align="stretch" gap={3}>
          <HStack justify="space-between" align="center">
            <Text fontSize="10px" fontWeight="600" color="gray.500">Base Size</Text>
            <HStack gap={1}>
              <Input
                type="number" min={10} max={32} step={1} value={Number(overrides["--font-size-root"]) || 16}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= 10 && v <= 32) updateOverride({ "--font-size-root": v }, `Base size: ${v}px`);
                }}
                size="xs" w="52px" textAlign="center" fontFamily="'Space Mono', monospace" fontSize="10px" fontWeight="700" borderRadius="md"
              />
              <Text fontSize="9px" color="gray.400">px</Text>
            </HStack>
          </HStack>

          <HStack justify="space-between" align="center">
            <Text fontSize="10px" fontWeight="600" color="gray.500">Scale Ratio</Text>
            <HStack gap={1}>
              <Input
                type="number" min={1.05} max={1.618} step={0.05} value={Number(overrides["--font-scale-ratio"]) || 1.25}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= 1.05 && v <= 1.618) updateOverride({ "--font-scale-ratio": v }, `Scale ratio: ${v}`);
                }}
                size="xs" w="52px" textAlign="center" fontFamily="'Space Mono', monospace" fontSize="10px" fontWeight="700" borderRadius="md"
              />
              <Text fontSize="9px" color="gray.400">x</Text>
            </HStack>
          </HStack>

          <Box mt={2} pt={2} borderTop="1px dashed" borderColor="gray.200">
            <HStack>
              <Text fontSize="8px" fontWeight="700" color="gray.400" w="20px">STEP</Text>
              <Text fontSize="8px" fontWeight="700" color="gray.400" w="40px">SIZE</Text>
              <Text fontSize="8px" fontWeight="700" color="gray.400">PREVIEW</Text>
            </HStack>
            {[6, 5, 4, 3, 2, 1, 0, -1, -2].map((step) => {
              const base = Number(overrides["--font-size-root"]) || 16;
              const ratio = Number(overrides["--font-scale-ratio"]) || 1.25;
              const size = Math.round(base * Math.pow(ratio, step) * 100) / 100;
              return (
                <HStack key={step} mt={1} align="center">
                  <Badge size="xs" colorPalette="blue" variant="subtle" w="20px" justifyContent="center" fontSize="8px">{step > 0 ? `+${step}` : step}</Badge>
                  <Text fontSize="9px" fontFamily="'Space Mono', monospace" color="gray.600" w="40px">{size}px</Text>
                  <Text fontSize="${size}px" fontFamily={getEffectiveValue("--font-family-base", "font.family.base", "Inter").split(',')[0]} lineHeight="1" color="gray.800" truncate>
                    Ag
                  </Text>
                </HStack>
              );
            })}
          </Box>
        </VStack>
      </Box>
    </>
  );
}, (prev, next) => prev.overrides === next.overrides);

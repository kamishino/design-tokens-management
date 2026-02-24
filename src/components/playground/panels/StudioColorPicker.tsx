import { HexColorPicker } from "react-colorful";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  SimpleGrid,
  Tabs,
  Input,
  Popover,
  Portal,
  Center,
} from "@chakra-ui/react";
import { useState, useMemo, memo, useEffect, type RefObject } from "react";
import { isOutofGamut, getContrastMetrics } from "../../../utils/colors";
import baseColors from "../../../../tokens/global/base/colors.json";
import { PrecisionSlider } from "../../ui/precision-slider";
import { useColorSync } from "../../../hooks/useColorSync";
import { useRecentColors } from "../../../hooks/useRecentColors";
import { hslToHex, oklchToHex } from "../../../utils/colors";
import { LuPencil } from "react-icons/lu";

interface StudioColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
  label: string;
  variant?: "compact" | "expanded" | "button";
  containerRef?: RefObject<HTMLElement | null>;
}

export const StudioColorPicker = memo(
  ({
    color,
    onChange,
    label,
    variant = "compact",
    containerRef,
  }: StudioColorPickerProps) => {
    const { coords, updateFromHex, updateFromHSL, updateFromOklch } =
      useColorSync(color);
    const { addColor } = useRecentColors(20);
    const [search, setSearch] = useState("");
    const [hexInput, setHexInput] = useState(color.toUpperCase());

    useEffect(() => {
      setHexInput(color.toUpperCase());
    }, [color]);

    const contrast = getContrastMetrics(color, "#ffffff");
    const outOfGamut = coords?.oklch
      ? isOutofGamut("oklch", coords.oklch)
      : false;

    const hslHueGradient = useMemo(() => {
      const stops = [0, 60, 120, 180, 240, 300, 360].map((h) =>
        hslToHex(h, coords.hsl.s, coords.hsl.l),
      );
      return `linear-gradient(to right, ${stops.join(", ")})`;
    }, [coords.hsl.s, coords.hsl.l]);

    const hslSatGradient = useMemo(() => {
      const start = hslToHex(coords.hsl.h, 0, coords.hsl.l);
      const end = hslToHex(coords.hsl.h, 100, coords.hsl.l);
      return `linear-gradient(to right, ${start}, ${end})`;
    }, [coords.hsl.h, coords.hsl.l]);

    const oklchHueGradient = useMemo(() => {
      const stops = [0, 60, 120, 180, 240, 300, 360].map((h) =>
        oklchToHex(coords.oklch.l, coords.oklch.c, h),
      );
      return `linear-gradient(to right, ${stops.join(", ")})`;
    }, [coords.oklch.l, coords.oklch.c]);

    const oklchChromaGradient = useMemo(() => {
      const start = oklchToHex(coords.oklch.l, 0, coords.oklch.h);
      const end = oklchToHex(coords.oklch.l, 0.5, coords.oklch.h);
      return `linear-gradient(to right, ${start}, ${end})`;
    }, [coords.oklch.l, coords.oklch.h]);

    const swatches = useMemo(() => {
      const flat: { id: string; hex: string; group: string; name: string }[] =
        [];
      interface ColorToken {
        $value?: string;
        value?: string;
        [key: string]: unknown;
      }
      interface ColorGroup {
        [key: string]: ColorToken | ColorGroup | unknown;
      }

      Object.entries(baseColors.color).forEach(([groupName, group]) => {
        const typedGroup = group as ColorGroup;
        if (
          typeof typedGroup === "object" &&
          typedGroup !== null &&
          !("$value" in typedGroup)
        ) {
          Object.entries(typedGroup).forEach(([name, data]) => {
            const typedData = data as ColorToken;
            const hex = typedData.$value || typedData.value;
            if (hex && typeof hex === "string") {
              flat.push({
                id: `${groupName}.${name}`,
                hex,
                group: groupName,
                name,
              });
            }
          });
        }
      });
      return flat;
    }, []);

    const filteredSwatches = swatches.filter(
      (s) =>
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.hex.toLowerCase().includes(search.toLowerCase()),
    );

    const handleHexChange = (val: string) => {
      setHexInput(val);
      const hex = val.startsWith("#") ? val : `#${val}`;
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        updateFromHex(hex);
        onChange(hex);
        addColor(hex);
      }
    };

    const handleColorChange = (hex: string) => {
      updateFromHex(hex);
      onChange(hex);
      addColor(hex);
    };

    const isExpanded = variant === "expanded";

    // --- CONTENT ---
    const Content = (
      <HStack
        p={0}
        gap={0}
        align="stretch"
        w={isExpanded ? "full" : "560px"}
        bg="white"
        borderRadius="md"
        boxShadow={isExpanded ? "sm" : "none"}
        border={isExpanded ? "1px solid" : "none"}
        borderColor="gray.100"
        overflow="hidden"
      >
        {/* Left Column: Primary Picker */}
        <VStack
          p={4}
          w={isExpanded ? "300px" : "240px"}
          borderRight="1px solid"
          borderColor="gray.100"
          gap={4}
          align="stretch"
          bg="gray.50/30"
        >
          <HStack justify="space-between">
            <Heading
              size="xs"
              textTransform="uppercase"
              color="gray.500"
              truncate
            >
              {label}
            </Heading>
            {outOfGamut && (
              <Badge colorScheme="orange" size="xs">
                Gamut
              </Badge>
            )}
          </HStack>

          <HexColorPicker
            color={color}
            onChange={handleColorChange}
            style={{ width: "100%", height: "140px" }}
          />

          <VStack align="stretch" gap={2}>
            <HStack gap={3}>
              <VStack align="start" flex={1} gap={0.5}>
                <Text fontSize="8px" fontWeight="bold" color="gray.400">
                  HEX
                </Text>
                <Input
                  size="xs"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  fontFamily="monospace"
                  fontWeight="bold"
                  borderRadius="md"
                  textAlign="center"
                  bg="white"
                  borderColor={
                    /^#[0-9A-Fa-f]{6}$/.test(
                      hexInput.startsWith("#") ? hexInput : `#${hexInput}`,
                    )
                      ? "gray.200"
                      : "red.300"
                  }
                />
              </VStack>
              <VStack align="start" flex={1} gap={0.5}>
                <Text fontSize="8px" fontWeight="bold" color="gray.400">
                  CONTRAST
                </Text>
                <HStack gap={1}>
                  <Text fontSize="xs" fontWeight="bold" fontFamily="monospace">
                    {contrast.wcag.toFixed(1)}
                  </Text>
                  <Badge
                    colorPalette={contrast.isAccessible ? "green" : "red"}
                    size="xs"
                    variant="solid"
                    fontSize="8px"
                  >
                    {contrast.isAccessible ? "PASS" : "FAIL"}
                  </Badge>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </VStack>

        {/* Right Column: Refinement Tabs */}
        <Box flex={1} display="flex" flexDirection="column">
          <Tabs.Root
            defaultValue="oklch"
            size="sm"
            variant="subtle"
            flex={1}
            display="flex"
            flexDirection="column"
          >
            <Tabs.List
              bg="gray.50"
              p={1}
              gap={1}
              borderBottom="1px solid"
              borderColor="gray.100"
            >
              <Tabs.Trigger
                value="oklch"
                flex={1}
                fontWeight="bold"
                fontSize="10px"
              >
                OKLCH
              </Tabs.Trigger>
              <Tabs.Trigger
                value="hsl"
                flex={1}
                fontWeight="bold"
                fontSize="10px"
              >
                HSL
              </Tabs.Trigger>
              <Tabs.Trigger
                value="swatches"
                flex={1}
                fontWeight="bold"
                fontSize="10px"
              >
                Swatches
              </Tabs.Trigger>
            </Tabs.List>

            <Box p={4} flex={1} overflowY="auto">
              <Tabs.Content value="hsl" p={0}>
                <VStack gap={3} align="stretch">
                  <PrecisionSlider
                    label="Hue"
                    value={[Math.round(coords.hsl.h)]}
                    unit="°"
                    min={0}
                    max={360}
                    trackBg={hslHueGradient}
                    onValueChange={(v) =>
                      onChange(
                        updateFromHSL(v.value[0], coords.hsl.s, coords.hsl.l),
                      )
                    }
                  />
                  <PrecisionSlider
                    label="Saturation"
                    value={[Math.round(coords.hsl.s)]}
                    unit="%"
                    min={0}
                    max={100}
                    trackBg={hslSatGradient}
                    onValueChange={(v) =>
                      onChange(
                        updateFromHSL(coords.hsl.h, v.value[0], coords.hsl.l),
                      )
                    }
                  />
                  <PrecisionSlider
                    label="Lightness"
                    value={[Math.round(coords.hsl.l)]}
                    unit="%"
                    min={0}
                    max={100}
                    trackBg="linear-gradient(to right, #000, #fff)"
                    onValueChange={(v) =>
                      onChange(
                        updateFromHSL(coords.hsl.h, coords.hsl.s, v.value[0]),
                      )
                    }
                  />
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="oklch" p={0}>
                <VStack gap={3} align="stretch">
                  <PrecisionSlider
                    label="Lightness"
                    value={[coords.oklch.l]}
                    min={0}
                    max={1}
                    step={0.01}
                    displayValue={Math.round(coords.oklch.l * 100)}
                    unit="%"
                    trackBg="linear-gradient(to right, #000, #fff)"
                    onValueChange={(v) =>
                      onChange(
                        updateFromOklch(
                          v.value[0],
                          coords.oklch.c,
                          coords.oklch.h,
                        ),
                      )
                    }
                  />
                  <PrecisionSlider
                    label="Chroma"
                    value={[coords.oklch.c]}
                    min={0}
                    max={0.3}
                    step={0.001}
                    displayValue={coords.oklch.c.toFixed(3)}
                    trackBg={oklchChromaGradient}
                    onValueChange={(v) =>
                      onChange(
                        updateFromOklch(
                          coords.oklch.l,
                          v.value[0],
                          coords.oklch.h,
                        ),
                      )
                    }
                  />
                  <PrecisionSlider
                    label="Hue"
                    value={[Math.round(coords.oklch.h)]}
                    min={0}
                    max={360}
                    displayValue={coords.oklch.h.toFixed(1)}
                    unit="°"
                    trackBg={oklchHueGradient}
                    onValueChange={(v) =>
                      onChange(
                        updateFromOklch(
                          coords.oklch.l,
                          coords.oklch.c,
                          v.value[0],
                        ),
                      )
                    }
                  />
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="swatches" p={0}>
                <VStack gap={3} align="stretch">
                  <Input
                    placeholder="Search tokens..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="xs"
                    borderRadius="md"
                  />
                  <Box maxH="180px" overflowY="auto" pr={2}>
                    <SimpleGrid columns={isExpanded ? 8 : 6} gap={1.5}>
                      {filteredSwatches.map((s) => (
                        <Box
                          key={s.id}
                          title={s.id}
                          w="full"
                          h="24px"
                          bg={s.hex}
                          borderRadius="sm"
                          cursor="pointer"
                          border={
                            color.toLowerCase() === s.hex.toLowerCase()
                              ? "2px solid black"
                              : "1px solid rgba(0,0,0,0.1)"
                          }
                          _hover={{ transform: "scale(1.1)", zIndex: 1 }}
                          transition="transform 0.1s"
                          onClick={() => handleColorChange(s.hex)}
                        />
                      ))}
                    </SimpleGrid>
                  </Box>
                </VStack>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Box>
      </HStack>
    );

    // --- BUTTON WRAPPER ---
    if (variant === "button") {
      return (
        <Popover.Root
          positioning={{
            placement: "bottom-start",
            gutter: 4,
            flip: true,
            strategy: "fixed",
          }}
          lazyMount
          unmountOnExit
        >
          <Popover.Trigger asChild>
            <Box
              p={3}
              className="group"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="lg"
              cursor="pointer"
              bg="white"
              position="relative"
              _hover={{ borderColor: "blue.400", shadow: "md" }}
              transition="all 0.2s"
            >
              <HStack>
                <Box
                  w="40px"
                  h="40px"
                  bg={color}
                  borderRadius="md"
                  border="1px solid rgba(0,0,0,0.1)"
                  boxShadow="inner"
                />
                <VStack align="start" gap={0}>
                  <Text
                    fontWeight="bold"
                    fontSize="xs"
                    textTransform="uppercase"
                    color="gray.500"
                  >
                    {label}
                  </Text>
                  <Text
                    fontSize="sm"
                    fontFamily="monospace"
                    fontWeight="bold"
                    color="gray.800"
                  >
                    {color.toUpperCase()}
                  </Text>
                </VStack>
              </HStack>

              <Center
                position="absolute"
                inset={0}
                bg="blackAlpha.600"
                borderRadius="lg"
                opacity={0}
                _groupHover={{ opacity: 1 }}
                transition="all 0.2s"
              >
                <LuPencil color="white" size={20} />
              </Center>
            </Box>
          </Popover.Trigger>
          <Portal container={containerRef}>
            <Popover.Positioner style={{ zIndex: "9999 !important" as any }}>
              <Popover.Content
                borderRadius="xl"
                boxShadow="2xl"
                border="none"
                w="auto"
                maxH="500px"
              >
                {/* Force compact mode inside Popover */}
                <StudioColorPicker
                  color={color}
                  onChange={onChange}
                  label={label}
                  variant="compact"
                  containerRef={containerRef}
                />
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      );
    }

    return Content;
  },
);

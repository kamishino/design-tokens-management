import { HexColorPicker } from "react-colorful";
import { 
  Box, VStack, HStack, Text,
  Heading, Badge, SimpleGrid, Tabs, Input,
  IconButton, Popover, Portal, Circle, Button,
  Center, Icon
} from "@chakra-ui/react";
import { useState, useMemo, memo, useEffect, useCallback } from 'react';
import { 
  isOutofGamut,
  getContrastMetrics 
} from '../../../utils/colors';
import baseColors from '../../../../tokens/global/base/colors.json';
import { PrecisionSlider } from "../../ui/precision-slider";
import { Switch } from "../../ui/switch";
import { useColorSync } from "../../../hooks/useColorSync";
import { useRecentColors } from "../../../hooks/useRecentColors";
import { hslToHex, oklchToHex } from "../../../utils/colors";
import { LuDice5, LuRotateCcw, LuPencil } from "react-icons/lu";

interface StudioColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
  label: string;
  variant?: 'compact' | 'expanded' | 'button';
}

const HARMONY_METHODS = [
  { id: 'complementary', label: 'Complementary' },
  { id: 'analogous', label: 'Analogous' },
  { id: 'triadic', label: 'Triadic' },
  { id: 'tetradic', label: 'Tetradic' },
  { id: 'split', label: 'Split Comp.' },
  { id: 'square', label: 'Square' },
  { id: 'double-split', label: 'Double Split' },
  { id: 'clash', label: 'Clash' },
  { id: 'monochromatic', label: 'Monochrome' },
  { id: 'random', label: 'Random Mix' }
];

export const StudioColorPicker = memo(({ color, onChange, label, variant = 'compact' }: StudioColorPickerProps) => {
  const { coords, updateFromHex, updateFromHSL, updateFromOklch } = useColorSync(color);
  const { recentColors, addColor } = useRecentColors(20);
  const [search, setSearch] = useState('');
  const [hexInput, setHexInput] = useState(color.toUpperCase());
  const [isVibrant, setIsVibrant] = useState(false);
  const [harmonySwatches, setHarmonySwatches] = useState<string[]>([]);
  
  useEffect(() => {
    setHexInput(color.toUpperCase());
  }, [color]);

  const generateHarmony = useCallback((method: string) => {
    const { l, c, h } = coords.oklch;
    const offsets: Record<string, number[]> = {
      'complementary': [180],
      'analogous': [-30, 30],
      'triadic': [120, 240],
      'tetradic': [60, 180, 240],
      'split': [150, 210],
      'square': [90, 180, 270],
      'double-split': [30, 150, 210, 330],
      'clash': [90],
      'monochromatic': [0, 0, 0],
      'random': Array.from({ length: 3 }, () => Math.random() * 360)
    };

    const resultHues = offsets[method] || [];
    
    const colors = resultHues.map(offset => {
      const nextH = (h + offset + 360) % 360;
      let nextL = l;
      let nextC = c;

      if (method === 'monochromatic') {
        nextL = Math.max(0.1, Math.min(0.9, l + (Math.random() - 0.5) * 0.4));
        nextC = Math.max(0, Math.min(0.3, c + (Math.random() - 0.5) * 0.2));
      }

      if (isVibrant) {
        nextL = Math.max(0, Math.min(1, nextL + (Math.random() - 0.5) * 0.1));
        nextC = Math.max(0, Math.min(0.3, nextC + (Math.random() - 0.5) * 0.05));
      }

      return oklchToHex(nextL, nextC, nextH);
    });

    setHarmonySwatches(colors);
  }, [coords.oklch, isVibrant]);

  const contrast = getContrastMetrics(color, '#ffffff');
  const outOfGamut = coords?.oklch ? isOutofGamut('oklch', coords.oklch) : false;

  const hslHueGradient = useMemo(() => {
    const stops = [0, 60, 120, 180, 240, 300, 360].map(h => hslToHex(h, coords.hsl.s, coords.hsl.l));
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }, [coords.hsl.s, coords.hsl.l]);

  const hslSatGradient = useMemo(() => {
    const start = hslToHex(coords.hsl.h, 0, coords.hsl.l);
    const end = hslToHex(coords.hsl.h, 100, coords.hsl.l);
    return `linear-gradient(to right, ${start}, ${end})`;
  }, [coords.hsl.h, coords.hsl.l]);

  const oklchHueGradient = useMemo(() => {
    const stops = [0, 60, 120, 180, 240, 300, 360].map(h => oklchToHex(coords.oklch.l, coords.oklch.c, h));
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }, [coords.oklch.l, coords.oklch.c]);

  const oklchChromaGradient = useMemo(() => {
    const start = oklchToHex(coords.oklch.l, 0, coords.oklch.h);
    const end = oklchToHex(coords.oklch.l, 0.5, coords.oklch.h);
    return `linear-gradient(to right, ${start}, ${end})`;
  }, [coords.oklch.l, coords.oklch.h]);

  const swatches = useMemo(() => {
    const flat: { id: string; hex: string; group: string; name: string }[] = [];
    interface ColorToken { $value?: string; value?: string; [key: string]: unknown }
    interface ColorGroup { [key: string]: ColorToken | ColorGroup | unknown }

    Object.entries(baseColors.color).forEach(([groupName, group]) => {
      const typedGroup = group as ColorGroup;
      if (typeof typedGroup === 'object' && typedGroup !== null && !('$value' in typedGroup)) {
        Object.entries(typedGroup).forEach(([name, data]) => {
          const typedData = data as ColorToken;
          const hex = typedData.$value || typedData.value;
          if (hex && typeof hex === 'string') {
            flat.push({ id: `${groupName}.${name}`, hex, group: groupName, name });
          }
        });
      }
    });
    return flat;
  }, []);

  const filteredSwatches = swatches.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase()) || 
    s.hex.toLowerCase().includes(search.toLowerCase())
  );

  const handleHexChange = (val: string) => {
    setHexInput(val);
    const hex = val.startsWith('#') ? val : `#${val}`;
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

  const isExpanded = variant === 'expanded';

  // --- CONTENT ---
  const Content = (
    <VStack p={0} gap={0} align="stretch" w={isExpanded ? "full" : "320px"} bg="white" borderRadius="md" boxShadow={isExpanded ? "sm" : "none"} border={isExpanded ? "1px solid" : "none"} borderColor="gray.100">
      <Box p={isExpanded ? 6 : 4} borderBottom="1px solid" borderColor="gray.100">
        <HStack justify="space-between" mb={3}>
          <Heading size="xs" textTransform="uppercase" color="gray.500">{label}</Heading>
          {outOfGamut && <Badge colorScheme="orange">Out of Gamut</Badge>}
        </HStack>
        
        <HStack gap={4}>
          <VStack align="start" flex={1} gap={1}>
            <Text fontSize="8px" fontWeight="bold" color="gray.400">HEX</Text>
            <Input 
              size="sm" 
              value={hexInput} 
              onChange={(e) => handleHexChange(e.target.value)}
              fontFamily="monospace"
              fontWeight="bold"
              borderRadius="md"
              textAlign="center"
              bg="gray.50"
              borderColor={/^#[0-9A-Fa-f]{6}$/.test(hexInput.startsWith('#') ? hexInput : `#${hexInput}`) ? "gray.200" : "red.300"}
            />
            {/* Harmony Popover (Nested) */}
            <Box position="relative" w="full" h="32px" bg={color} borderRadius="md" border="1px solid rgba(0,0,0,0.1)" mt={1}>
              <Popover.Root positioning={{ placement: 'right-start', gutter: 12 }}>
                <Popover.Trigger asChild>
                  <IconButton 
                    aria-label="Color Harmonies"
                    icon={<LuDice5 />} 
                    size="xs" 
                    variant="solid" 
                    bg="white" 
                    color="gray.600"
                    position="absolute"
                    top="50%"
                    right="2"
                    transform="translateY(-50%)"
                    borderRadius="full"
                    boxShadow="sm"
                    _hover={{ transform: "translateY(-50%) scale(1.1)", bg: "blue.50", color: "blue.600" }}
                  />
                </Popover.Trigger>
                <Portal>
                  <Popover.Positioner zIndex={2500}>
                    <Popover.Content w="240px" p={4} borderRadius="xl" boxShadow="2xl" border="none">
                      <VStack align="stretch" gap={4}>
                        <HStack justify="space-between">
                          <Heading size="xs">Harmony Lab</Heading>
                          <HStack gap={2}>
                            <Text fontSize="9px" fontWeight="bold" color="gray.400">VIBRANT</Text>
                            <Switch size="xs" colorPalette="blue" checked={isVibrant} onCheckedChange={(e) => setIsVibrant(e.checked)} />
                          </HStack>
                        </HStack>
                        <SimpleGrid columns={2} gap={2}>
                          {HARMONY_METHODS.map(m => (
                            <Button key={m.id} size="xs" variant="outline" fontSize="9px" onClick={() => generateHarmony(m.id)} _hover={{ bg: "blue.50", borderColor: "blue.200" }}>{m.label}</Button>
                          ))}
                        </SimpleGrid>
                        {harmonySwatches.length > 0 && (
                          <VStack align="stretch" gap={2} pt={2} borderTop="1px solid" borderColor="gray.100">
                            <Text fontSize="9px" fontWeight="bold" color="gray.400">GENERATED SWATCHES</Text>
                            <HStack gap={2} flexWrap="wrap">
                              {harmonySwatches.map((c, i) => (
                                <Circle key={`${c}-${i}`} size="32px" bg={c} cursor="pointer" border="2px solid white" boxShadow="sm" _hover={{ transform: "scale(1.1)", boxShadow: "md" }} onClick={() => handleColorChange(c)} />
                              ))}
                              <IconButton aria-label="Clear" icon={<LuRotateCcw />} size="xs" variant="ghost" onClick={() => setHarmonySwatches([])} />
                            </HStack>
                          </VStack>
                        )}
                      </VStack>
                    </Popover.Content>
                  </Popover.Positioner>
                </Portal>
              </Popover.Root>
            </Box>
          </VStack>
          <Box w="1px" h="40px" bg="gray.100" />
          <VStack align="start" flex={1}>
            <Text fontSize="8px" fontWeight="bold" color="gray.400">CONTRAST</Text>
            <HStack align="baseline" gap={1}>
              <Heading size="md" fontFamily="'Space Mono', monospace">{contrast.wcag.toFixed(1)}</Heading>
              <Text fontSize="10px" fontWeight="bold" color="gray.400">:1</Text>
            </HStack>
            <Badge colorScheme={contrast.isAccessible ? "green" : "red"} size="xs" variant="solid">
              {contrast.isAccessible ? "PASS" : "FAIL"}
            </Badge>
          </VStack>
        </HStack>
      </Box>

      <Tabs.Root defaultValue="oklch" size="sm" variant="subtle">
        <Tabs.List bg="gray.50" p={1} gap={1}>
          <Tabs.Trigger value="oklch" flex={1} fontWeight="bold">OKLCH</Tabs.Trigger>
          <Tabs.Trigger value="hsl" flex={1} fontWeight="bold">HSL</Tabs.Trigger>
          <Tabs.Trigger value="swatches" flex={1} fontWeight="bold">Swatches</Tabs.Trigger>
        </Tabs.List>

        <Box p={isExpanded ? 6 : 4}>
          <Tabs.Content value="hsl">
            <VStack gap={4} align="stretch">
              {/* Conditional Layout for Expanded */}
              {isExpanded ? (
                <HStack align="start" gap={6}>
                  <Box flex={1}><HexColorPicker color={color} onChange={handleColorChange} style={{ width: '100%', height: '150px' }} /></Box>
                  <VStack flex={1.5} gap={4}>
                    <PrecisionSlider label="Hue" value={[Math.round(coords.hsl.h)]} unit="°" min={0} max={360} trackBg={hslHueGradient} onValueChange={(v) => onChange(updateFromHSL(v.value[0], coords.hsl.s, coords.hsl.l))} />
                    <PrecisionSlider label="Saturation" value={[Math.round(coords.hsl.s)]} unit="%" min={0} max={100} trackBg={hslSatGradient} onValueChange={(v) => onChange(updateFromHSL(coords.hsl.h, v.value[0], coords.hsl.l))} />
                    <PrecisionSlider label="Lightness" value={[Math.round(coords.hsl.l)]} unit="%" min={0} max={100} trackBg="linear-gradient(to right, #000, #fff)" onValueChange={(v) => onChange(updateFromHSL(coords.hsl.h, coords.hsl.s, v.value[0]))} />
                  </VStack>
                </HStack>
              ) : (
                <>
                  <HexColorPicker color={color} onChange={handleColorChange} style={{ width: '100%' }} />
                  <VStack gap={3} align="stretch" pt={2}>
                    <PrecisionSlider label="Hue" value={[Math.round(coords.hsl.h)]} unit="°" min={0} max={360} trackBg={hslHueGradient} onValueChange={(v) => onChange(updateFromHSL(v.value[0], coords.hsl.s, coords.hsl.l))} />
                    <PrecisionSlider label="Saturation" value={[Math.round(coords.hsl.s)]} unit="%" min={0} max={100} trackBg={hslSatGradient} onValueChange={(v) => onChange(updateFromHSL(coords.hsl.h, v.value[0], coords.hsl.l))} />
                    <PrecisionSlider label="Lightness" value={[Math.round(coords.hsl.l)]} unit="%" min={0} max={100} trackBg="linear-gradient(to right, #000, #fff)" onValueChange={(v) => onChange(updateFromHSL(coords.hsl.h, coords.hsl.s, v.value[0]))} />
                  </VStack>
                </>
              )}
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="oklch">
            <VStack gap={4} align="stretch">
              {isExpanded ? (
                <HStack align="start" gap={6}>
                  <Box flex={1}><HexColorPicker color={color} onChange={handleColorChange} style={{ width: '100%', height: '150px' }} /></Box>
                  <VStack flex={1.5} gap={4}>
                    <PrecisionSlider label="Lightness" value={[coords.oklch.l]} min={0} max={1} step={0.01} displayValue={Math.round(coords.oklch.l * 100)} unit="%" trackBg="linear-gradient(to right, #000, #fff)" onValueChange={(v) => onChange(updateFromOklch(v.value[0], coords.oklch.c, coords.oklch.h))} />
                    <PrecisionSlider label="Chroma" value={[coords.oklch.c]} min={0} max={0.3} step={0.001} displayValue={coords.oklch.c.toFixed(3)} trackBg={oklchChromaGradient} onValueChange={(v) => onChange(updateFromOklch(coords.oklch.l, v.value[0], coords.oklch.h))} />
                    <PrecisionSlider label="Hue" value={[Math.round(coords.oklch.h)]} min={0} max={360} displayValue={coords.oklch.h.toFixed(1)} unit="°" trackBg={oklchHueGradient} onValueChange={(v) => onChange(updateFromOklch(coords.oklch.l, coords.oklch.c, v.value[0]))} />
                  </VStack>
                </HStack>
              ) : (
                <>
                  <HexColorPicker color={color} onChange={handleColorChange} style={{ width: '100%' }} />
                  <VStack gap={3} align="stretch" pt={2}>
                    <PrecisionSlider label="Lightness" value={[coords.oklch.l]} min={0} max={1} step={0.01} displayValue={Math.round(coords.oklch.l * 100)} unit="%" trackBg="linear-gradient(to right, #000, #fff)" onValueChange={(v) => onChange(updateFromOklch(v.value[0], coords.oklch.c, coords.oklch.h))} />
                    <PrecisionSlider label="Chroma" value={[coords.oklch.c]} min={0} max={0.3} step={0.001} displayValue={coords.oklch.c.toFixed(3)} trackBg={oklchChromaGradient} onValueChange={(v) => onChange(updateFromOklch(coords.oklch.l, v.value[0], coords.oklch.h))} />
                    <PrecisionSlider label="Hue" value={[Math.round(coords.oklch.h)]} min={0} max={360} displayValue={coords.oklch.h.toFixed(1)} unit="°" trackBg={oklchHueGradient} onValueChange={(v) => onChange(updateFromOklch(coords.oklch.l, coords.oklch.c, v.value[0]))} />
                  </VStack>
                </>
              )}
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="swatches">
            <VStack gap={3} align="stretch">
              <Text fontSize="9px" fontWeight="bold" color="gray.400">BASE TOKENS</Text>
              <Input placeholder="Search base colors..." value={search} onChange={(e) => setSearch(e.target.value)} size="xs" />
              <Box maxH="150px" overflowY="auto">
                <SimpleGrid columns={isExpanded ? 8 : 5} gap={2}>
                  {filteredSwatches.map(s => (
                    <Box key={s.id} title={s.id} w="full" h="30px" bg={s.hex} borderRadius="sm" cursor="pointer" border={color.toLowerCase() === s.hex.toLowerCase() ? "2px solid black" : "1px solid rgba(0,0,0,0.1)"} onClick={() => handleColorChange(s.hex)} />
                  ))}
                </SimpleGrid>
              </Box>
            </VStack>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </VStack>
  );

  // --- BUTTON WRAPPER ---
  if (variant === 'button') {
    return (
      <Popover.Root positioning={{ placement: 'bottom-start', gutter: 4 }} lazyMount unmountOnExit>
        <Popover.Trigger asChild>
          <Box 
            p={3} 
            className="group"
            borderWidth="1px" borderColor="gray.200" 
            borderRadius="lg" cursor="pointer" 
            bg="white"
            position="relative"
            _hover={{ borderColor: "blue.400", shadow: "md" }}
            transition="all 0.2s"
          >
            <HStack>
              <Box w="40px" h="40px" bg={color} borderRadius="md" border="1px solid rgba(0,0,0,0.1)" boxShadow="inner" />
              <VStack align="start" gap={0}>
                <Text fontWeight="bold" fontSize="xs" textTransform="uppercase" color="gray.500">{label}</Text>
                <Text fontSize="sm" fontFamily="monospace" fontWeight="bold" color="gray.800">{color.toUpperCase()}</Text>
              </VStack>
            </HStack>
            
            <Center 
              position="absolute" inset={0} bg="blackAlpha.600" borderRadius="lg"
              opacity={0} _groupHover={{ opacity: 1 }} transition="all 0.2s"
            >
              <Icon as={LuPencil} color="white" fontSize="xl" />
            </Center>
          </Box>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner zIndex={9999}>
            <Popover.Content borderRadius="xl" boxShadow="2xl" border="none" w="auto">
              {/* Force compact mode inside Popover */}
              <StudioColorPicker color={color} onChange={onChange} label={label} variant="compact" />
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    );
  }

  return Content;
});

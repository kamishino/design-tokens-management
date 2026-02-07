import { HexColorPicker } from "react-colorful";
import { 
  Box, VStack, HStack, Text,
  Heading, Badge, SimpleGrid, Tabs, Input
} from "@chakra-ui/react";
import { useState, useMemo, memo, useEffect } from 'react';
import { 
  isOutofGamut,
  getContrastMetrics 
} from '../../../utils/colors';
import baseColors from '../../../../tokens/global/base/colors.json';
import { Slider } from "../../ui/slider";
import { useColorSync } from "../../../hooks/useColorSync";
import { useRecentColors } from "../../../hooks/useRecentColors";

interface StudioColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
  label: string;
}

export const StudioColorPicker = memo(({ color, onChange, label }: StudioColorPickerProps) => {
  const { coords, updateFromHex, updateFromHSL, updateFromOklch } = useColorSync(color);
  const { recentColors, addColor } = useRecentColors(20);
  const [search, setSearch] = useState('');
  const [hexInput, setHexInput] = useState(color.toUpperCase());
  
  // Sync internal input with external prop
  useEffect(() => {
    setHexInput(color.toUpperCase());
  }, [color]);

  const contrast = getContrastMetrics(color, '#ffffff');
  const outOfGamut = coords?.oklch ? isOutofGamut('oklch', coords.oklch) : false;

  const swatches = useMemo(() => {
    const flat: { id: string; hex: string; group: string; name: string }[] = [];
    Object.entries(baseColors.color).forEach(([groupName, group]: [string, any]) => {
      if (typeof group === 'object' && !group.$value) {
        Object.entries(group).forEach(([name, data]: [string, any]) => {
          if (data.$value) {
            flat.push({ id: `${groupName}.${name}`, hex: data.$value as string, group: groupName, name });
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

  return (
    <VStack p={0} gap={0} align="stretch" w="320px" bg="white">
      <Box p={4} borderBottom="1px solid" borderColor="gray.100">
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
            <Box w="full" h="8px" bg={color} borderRadius="sm" border="1px solid rgba(0,0,0,0.1)" mt={1} />
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

      <Tabs.Root defaultValue="hsl" size="sm" variant="subtle">
        <Tabs.List bg="gray.50" p={1} gap={1}>
          <Tabs.Trigger value="hsl" flex={1} fontWeight="bold">HSL</Tabs.Trigger>
          <Tabs.Trigger value="oklch" flex={1} fontWeight="bold">OKLCH</Tabs.Trigger>
          <Tabs.Trigger value="swatches" flex={1} fontWeight="bold">Swatches</Tabs.Trigger>
        </Tabs.List>

        <Box p={4}>
          <Tabs.Content value="hsl">
            <VStack gap={4} align="stretch">
              <HexColorPicker color={color} onChange={handleColorChange} style={{ width: '100%' }} />
              
              <VStack gap={3} align="stretch" pt={2}>
                <SliderControl 
                  label="Hue" value={Math.round(coords.hsl.h)} unit="°" min={0} max={360} 
                  bg="linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"
                  onValueChange={(v) => onChange(updateFromHSL(v, coords.hsl.s, coords.hsl.l))}
                />
                <SliderControl 
                  label="Saturation" value={Math.round(coords.hsl.s)} unit="%" min={0} max={100}
                  onValueChange={(v) => onChange(updateFromHSL(coords.hsl.h, v, coords.hsl.l))}
                />
                <SliderControl 
                  label="Lightness" value={Math.round(coords.hsl.l)} unit="%" min={0} max={100}
                  bg="linear-gradient(to right, #000, #fff)"
                  onValueChange={(v) => onChange(updateFromHSL(coords.hsl.h, coords.hsl.s, v))}
                />
              </VStack>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="oklch">
            <VStack gap={4} align="stretch">
              <HexColorPicker color={color} onChange={handleColorChange} style={{ width: '100%' }} />
              <VStack gap={3} align="stretch" pt={2}>
                <SliderControl 
                  label="Lightness" value={Math.round(coords.oklch.l * 100)} unit="%" min={0} max={1} step={0.01}
                  bg="linear-gradient(to right, #000, #fff)"
                  onValueChange={(v) => onChange(updateFromOklch(v, coords.oklch.c, coords.oklch.h))}
                />
                <SliderControl 
                  label="Chroma" value={Number(coords.oklch.c.toFixed(3))} min={0} max={0.3} step={0.001}
                  onValueChange={(v) => onChange(updateFromOklch(coords.oklch.l, v, coords.oklch.h))}
                />
                <SliderControl 
                  label="Hue" value={Math.round(coords.oklch.h)} unit="°" min={0} max={360}
                  bg="linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"
                  onValueChange={(v) => onChange(updateFromOklch(coords.oklch.l, coords.oklch.c, v))}
                />
              </VStack>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="swatches">
            <VStack gap={3} align="stretch">
              {recentColors.length > 0 && (
                <>
                  <Text fontSize="9px" fontWeight="bold" color="gray.400">RECENT COLORS</Text>
                  <SimpleGrid columns={5} gap={2}>
                    {recentColors.map(c => (
                      <Box 
                        key={c} w="full" h="30px" bg={c} borderRadius="sm" cursor="pointer"
                        border={color.toLowerCase() === c.toLowerCase() ? "2px solid black" : "1px solid rgba(0,0,0,0.1)"}
                        onClick={() => handleColorChange(c)}
                      />
                    ))}
                  </SimpleGrid>
                  <Box borderTop="1px solid" borderColor="gray.100" my={1} />
                </>
              )}
              
              <Text fontSize="9px" fontWeight="bold" color="gray.400">BASE TOKENS</Text>
              <Input 
                placeholder="Search base colors..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                size="xs"
              />
              <Box maxH="150px" overflowY="auto">
                <SimpleGrid columns={5} gap={2}>
                  {filteredSwatches.map(s => (
                    <Box 
                      key={s.id} title={s.id}
                      w="full" h="30px" bg={s.hex} borderRadius="sm" cursor="pointer"
                      border={color.toLowerCase() === s.hex.toLowerCase() ? "2px solid black" : "1px solid rgba(0,0,0,0.1)"}
                      onClick={() => handleColorChange(s.hex)}
                    />
                  ))}
                </SimpleGrid>
              </Box>
            </VStack>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </VStack>
  );
});

interface SliderControlProps {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  bg?: string;
  onValueChange: (val: number) => void;
}

const SliderControl = ({ label, value, unit = '', min, max, step, bg, onValueChange }: SliderControlProps) => (
  <VStack align="stretch" gap={1}>
    <HStack justify="space-between">
      <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">{label}</Text>
      <Text fontSize="10px" fontWeight="bold" fontFamily="monospace" color="blue.600">{value}{unit}</Text>
    </HStack>
    <Slider 
      min={min} max={max} step={step} 
      value={[value]} 
      onValueChange={(v) => onValueChange(v.value[0])}
      css={bg ? { '& .chakra-slider__track': { background: bg } } : undefined}
    />
  </VStack>
);
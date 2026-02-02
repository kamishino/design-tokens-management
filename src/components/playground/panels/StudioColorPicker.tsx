import { HexColorPicker } from "react-colorful";
import { 
  Box, VStack, HStack, Text,
  Input, Heading, Badge, Tabs
} from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import { 
  hexToOklch, oklchToHex, 
  hexToHsl, hslToHex, 
  isOutofGamut, getSafeHex,
  getContrastMetrics 
} from '../../../utils/colors';

interface StudioColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
  label: string;
}

export const StudioColorPicker = ({ color, onChange, label }: StudioColorPickerProps) => {
  const [oklch, setOklch] = useState(hexToOklch(color));
  const [hsl, setHsl] = useState(hexToHsl(color));
  
  const contrast = getContrastMetrics(color, '#ffffff');
  const outOfGamut = isOutofGamut('oklch', oklch);
  const safeHex = getSafeHex('oklch', oklch);

  // Sync internal states when external HEX changes
  useEffect(() => {
    const newOklch = hexToOklch(color);
    const newHsl = hexToHsl(color);
    setOklch(newOklch);
    setHsl(newHsl);
  }, [color]);

  const handleOklchChange = (key: 'l' | 'c' | 'h', val: number) => {
    const updated = { ...oklch, [key]: val };
    setOklch(updated);
    const hex = oklchToHex(updated.l, updated.c, updated.h);
    if (hex) onChange(hex);
  };

  const handleHslChange = (key: 'h' | 's' | 'l', val: number) => {
    const updated = { ...hsl, [key]: val };
    setHsl(updated);
    const hex = hslToHex(updated.h, updated.s, updated.l);
    if (hex) onChange(hex);
  };

  return (
    <VStack p={4} gap={4} align="stretch" w="300px" bg="white">
      <HStack justify="space-between">
        <Heading size="xs" textTransform="uppercase" color="gray.500">{label}</Heading>
        {outOfGamut && (
          <Badge colorScheme="orange" variant="subtle" title={`sRGB fallback: ${safeHex}`}>
            ⚠️ Out of Gamut
          </Badge>
        )}
      </HStack>
      
      <Box className="custom-picker">
        <HexColorPicker color={color} onChange={onChange} style={{ width: '100%' }} />
      </Box>

      <Tabs.Root defaultValue="oklch" size="sm" variant="subtle">
        <Tabs.List bg="gray.50" p={1} borderRadius="md" mb={4}>
          <Tabs.Trigger value="oklch" flex={1}>Oklch</Tabs.Trigger>
          <Tabs.Trigger value="hsl" flex={1}>HSL</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="oklch">
          <VStack gap={3} align="stretch">
            <Box>
              <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">LIGHTNESS</Text><Text fontSize="2xs">{Math.round(oklch.l * 100)}%</Text></HStack>
              <input type="range" min="0" max="1" step="0.01" value={oklch.l} onChange={(e) => handleOklchChange('l', parseFloat(e.target.value))} style={{ width: '100%' }} />
            </Box>
            <Box>
              <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">CHROMA</Text><Text fontSize="2xs">{oklch.c.toFixed(3)}</Text></HStack>
              <input type="range" min="0" max="0.4" step="0.001" value={oklch.c} onChange={(e) => handleOklchChange('c', parseFloat(e.target.value))} style={{ width: '100%' }} />
            </Box>
            <Box>
              <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">HUE</Text><Text fontSize="2xs">{Math.round(oklch.h)}°</Text></HStack>
              <input type="range" min="0" max="360" step="1" value={oklch.h} onChange={(e) => handleOklchChange('h', parseFloat(e.target.value))} style={{ width: '100%' }} />
            </Box>
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="hsl">
          <VStack gap={3} align="stretch">
            <Box>
              <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">HUE</Text><Text fontSize="2xs">{Math.round(hsl.h)}°</Text></HStack>
              <input type="range" min="0" max="360" step="1" value={hsl.h} onChange={(e) => handleHslChange('h', parseFloat(e.target.value))} style={{ width: '100%' }} />
            </Box>
            <Box>
              <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">SATURATION</Text><Text fontSize="2xs">{Math.round(hsl.s)}%</Text></HStack>
              <input type="range" min="0" max="100" step="1" value={hsl.s} onChange={(e) => handleHslChange('s', parseFloat(e.target.value))} style={{ width: '100%' }} />
            </Box>
            <Box>
              <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">LIGHTNESS</Text><Text fontSize="2xs">{Math.round(hsl.l)}%</Text></HStack>
              <input type="range" min="0" max="100" step="1" value={hsl.l} onChange={(e) => handleHslChange('l', parseFloat(e.target.value))} style={{ width: '100%' }} />
            </Box>
          </VStack>
        </Tabs.Content>
      </Tabs.Root>

      <Box pt={2} borderTop="1px solid" borderColor="gray.100">
        <HStack justify="space-between">
          <VStack align="start" gap={0}>
            <Text fontSize="2xs" fontWeight="bold" color="gray.400">HEX {outOfGamut && '(Clamped)'}</Text>
            <Input size="xs" value={color.toUpperCase()} onChange={(e) => onChange(e.target.value)} fontFamily="monospace" w="100px" />
          </VStack>
          <VStack align="end" gap={0}>
            <Text fontSize="2xs" fontWeight="bold" color="gray.400">Contrast</Text>
            <Badge colorScheme={contrast.isAccessible ? "green" : "red"}>{contrast.wcag.toFixed(1)}:1</Badge>
          </VStack>
        </HStack>
      </Box>
    </VStack>
  );
};

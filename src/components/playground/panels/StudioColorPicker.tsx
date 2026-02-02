import { HexColorPicker } from "react-colorful";
import { 
  Box, VStack, HStack, Text,
  Input, Heading, Badge, Tabs, SimpleGrid
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from 'react';
import { 
  hexToOklch, oklchToHex, 
  hexToHsl, hslToHex, 
  isOutofGamut,
  getContrastMetrics 
} from '../../../utils/colors';
import baseColors from '../../../../tokens/global/base/colors.json';

interface StudioColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
  label: string;
}

export const StudioColorPicker = ({ color, onChange, label }: StudioColorPickerProps) => {
  const [oklch, setOklch] = useState(hexToOklch(color));
  const [search, setSearch] = useState('');
  
  const contrast = getContrastMetrics(color, '#ffffff');
  const outOfGamut = isOutofGamut('oklch', oklch);

  const swatches = useMemo(() => {
    const flat: any[] = [];
    Object.entries(baseColors.color).forEach(([groupName, group]: [string, any]) => {
      if (typeof group === 'object' && !group.$value) {
        Object.entries(group).forEach(([name, data]: [string, any]) => {
          if (data.$value) {
            flat.push({
              id: `${groupName}.${name}`,
              hex: data.$value,
              group: groupName,
              name: name
            });
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

  useEffect(() => {
    const newOklch = hexToOklch(color);
    setOklch(newOklch);
  }, [color]);

  const handleOklchChange = (key: 'l' | 'c' | 'h', val: number) => {
    const updated = { ...oklch, [key]: val };
    setOklch(updated);
    const hex = oklchToHex(updated.l, updated.c, updated.h);
    if (hex) onChange(hex);
  };

  const handleHslChange = (key: 'h' | 's' | 'l', val: number) => {
    const currentHsl = hexToHsl(color);
    const updated = { ...currentHsl, [key]: val };
    const hex = hslToHex(updated.h, updated.s, updated.l);
    if (hex) onChange(hex);
  };

  return (
    <VStack p={0} gap={0} align="stretch" w="320px" bg="white">
      <Box p={4} borderBottom="1px solid" borderColor="gray.100">
        <HStack justify="space-between">
          <VStack align="start" gap={0}>
            <Heading size="xs" textTransform="uppercase" color="gray.500">{label}</Heading>
            <Text fontSize="lg" fontWeight="bold" fontFamily="monospace">{color.toUpperCase()}</Text>
          </VStack>
          {outOfGamut && (
            <Badge colorScheme="orange" variant="subtle">Out of Gamut</Badge>
          )}
        </HStack>
      </Box>

      <Tabs.Root defaultValue="oklch" size="sm" variant="subtle">
        <Tabs.List bg="gray.50" p={1} gap={1}>
          <Tabs.Trigger value="oklch" flex={1}>Oklch</Tabs.Trigger>
          <Tabs.Trigger value="hsl" flex={1}>HSL</Tabs.Trigger>
          <Tabs.Trigger value="swatches" flex={1}>Swatches</Tabs.Trigger>
        </Tabs.List>

        <Box p={4}>
          <Tabs.Content value="oklch">
            <VStack gap={4} align="stretch">
              <HexColorPicker color={color} onChange={onChange} style={{ width: '100%' }} />
              <VStack gap={2} align="stretch">
                <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">L</Text><Text fontSize="2xs">{Math.round(oklch.l * 100)}%</Text></HStack>
                <input type="range" min="0" max="1" step="0.01" value={oklch.l} onChange={(e) => handleOklchChange('l', parseFloat(e.target.value))} style={{ width: '100%' }} />
                <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">C</Text><Text fontSize="2xs">{oklch.c.toFixed(3)}</Text></HStack>
                <input type="range" min="0" max="0.4" step="0.001" value={oklch.c} onChange={(e) => handleOklchChange('c', parseFloat(e.target.value))} style={{ width: '100%' }} />
                <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">h</Text><Text fontSize="2xs">{Math.round(oklch.h)}°</Text></HStack>
                <input type="range" min="0" max="360" step="1" value={oklch.h} onChange={(e) => handleOklchChange('h', parseFloat(e.target.value))} style={{ width: '100%' }} />
              </VStack>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="hsl">
            <VStack gap={4} align="stretch">
              <HexColorPicker color={color} onChange={onChange} style={{ width: '100%' }} />
              <VStack gap={2} align="stretch">
                <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">H</Text></HStack>
                <input type="range" min="0" max="360" step="1" value={hexToHsl(color).h} onChange={(e) => handleHslChange('h', parseInt(e.target.value))} style={{ width: '100%' }} />
                <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">S</Text></HStack>
                <input type="range" min="0" max="100" step="1" value={hexToHsl(color).s} onChange={(e) => handleHslChange('s', parseInt(e.target.value))} style={{ width: '100%' }} />
                <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">L</Text></HStack>
                <input type="range" min="0" max="100" step="1" value={hexToHsl(color).l} onChange={(e) => handleHslChange('l', parseInt(e.target.value))} style={{ width: '100%' }} />
              </VStack>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="swatches">
            <VStack gap={3} align="stretch">
              <Input 
                size="xs" placeholder="Search base colors..." 
                value={search} onChange={(e) => setSearch(e.target.value)} 
              />
              <Box maxH="200px" overflowY="auto" className="custom-scrollbar">
                <SimpleGrid columns={5} gap={2}>
                  {filteredSwatches.map(s => (
                    <Box 
                      key={s.id} title={s.id}
                      w="full" h="30px" bg={s.hex} borderRadius="sm" cursor="pointer"
                      border={color.toLowerCase() === s.hex.toLowerCase() ? "2px solid black" : "1px solid rgba(0,0,0,0.1)"}
                      onClick={() => onChange(s.hex)}
                    />
                  ))}
                </SimpleGrid>
              </Box>
            </VStack>
          </Tabs.Content>
        </Box>
      </Tabs.Root>

      <Box p={4} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
        <HStack justify="space-between">
          <VStack align="start" gap={0}>
            <Text fontSize="10px" fontWeight="bold" color="gray.400">WCAG 2.1</Text>
            <Badge colorScheme={contrast.isAccessible ? "green" : "red"}>{contrast.wcag.toFixed(1)}:1</Badge>
          </VStack>
          <VStack align="end" gap={0}>
            <Text fontSize="10px" fontWeight="bold" color="gray.400">WCAG 3.0 (APCA)</Text>
            <Badge variant="outline" colorScheme="blue">Lc {contrast.apca}</Badge>
          </VStack>
        </HStack>
      </Box>
    </VStack>
  );
};

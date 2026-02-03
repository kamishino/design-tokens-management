import { HexColorPicker } from "react-colorful";
import { 
  Box, VStack, HStack, Text,
  Heading, Badge, SimpleGrid, Tabs, Input
} from "@chakra-ui/react";
import { useState, useEffect, useMemo, memo } from 'react';
import { 
  isOutofGamut,
  getContrastMetrics 
} from '../../../utils/colors';
import { useColorWorker } from '../../../hooks/useColorWorker';
import baseColors from '../../../../tokens/global/base/colors.json';
import { Slider } from "../../ui/slider";

interface StudioColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
  label: string;
}

export const StudioColorPicker = memo(({ color, onChange, label }: StudioColorPickerProps) => {
  const [coords, setCoords] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { convert, suggestSwatches } = useColorWorker();
  
  const contrast = getContrastMetrics(color, '#ffffff');
  const outOfGamut = coords?.oklch ? isOutofGamut('oklch', coords.oklch) : false;

  const swatches = useMemo(() => {
    const flat: any[] = [];
    Object.entries(baseColors.color).forEach(([groupName, group]: [string, any]) => {
      if (typeof group === 'object' && !group.$value) {
        Object.entries(group).forEach(([name, data]: [string, any]) => {
          if (data.$value) {
            flat.push({ id: `${groupName}.${name}`, hex: data.$value, group: groupName, name });
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
    convert(color).then(res => setCoords(res));
    suggestSwatches(color, swatches, 'text').then((res: any) => setSuggestions(res));
  }, [color, convert, swatches, suggestSwatches]);

  return (
    <VStack p={0} gap={0} align="stretch" w="320px" bg="white">
      <Box p={4} borderBottom="1px solid" borderColor="gray.100">
        <HStack justify="space-between" mb={3}>
          <Heading size="xs" textTransform="uppercase" color="gray.500">{label}</Heading>
          {outOfGamut && <Badge colorScheme="orange">Out of Gamut</Badge>}
        </HStack>
        
        <HStack gap={2}>
          <VStack align="start" flex={1}>
            <Text fontSize="8px" fontWeight="bold" color="gray.400">CURRENT</Text>
            <Box w="full" h="40px" bg={color} borderRadius="md" border="1px solid rgba(0,0,0,0.1)" />
            <Text fontSize="10px" fontWeight="bold" fontFamily="monospace">{color.toUpperCase()}</Text>
          </VStack>
          <Box w="1px" h="40px" bg="gray.100" mt={4} />
          <VStack align="start" flex={1}>
            <Text fontSize="8px" fontWeight="bold" color="gray.400">WCAG 2.1</Text>
            <Heading size="md">{contrast.wcag.toFixed(1)}</Heading>
            <Badge colorScheme={contrast.isAccessible ? "green" : "red"} size="xs">
              {contrast.isAccessible ? "PASS" : "FAIL"}
            </Badge>
          </VStack>
        </HStack>
      </Box>

      <Tabs.Root defaultValue="oklch" size="sm" variant="subtle">
        <Tabs.List bg="gray.50" p={1} gap={1}>
          <Tabs.Trigger value="oklch" flex={1} fontWeight="bold">Oklch</Tabs.Trigger>
          <Tabs.Trigger value="swatches" flex={1} fontWeight="bold">Swatches</Tabs.Trigger>
          <Tabs.Trigger value="suggest" flex={1} fontWeight="bold">Smart ✨</Tabs.Trigger>
        </Tabs.List>

        <Box p={4}>
          <Tabs.Content value="oklch">
            <VStack gap={4} align="stretch">
              <HexColorPicker color={color} onChange={onChange} style={{ width: '100%' }} />
              {coords?.oklch && (
                <VStack gap={2} align="stretch">
                  <HStack justify="space-between"><Text fontSize="2xs" fontWeight="bold">LIGHTNESS</Text><Text fontSize="2xs">{Math.round(coords.oklch.l * 100)}%</Text></HStack>
                  <Slider 
                    min={0} max={1} step={0.01} 
                    value={[coords.oklch.l]} 
                    disabled 
                    size="sm"
                  />
                  <Text fontSize="8px" color="gray.400">Optimized background processing active</Text>
                </VStack>
              )}
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="swatches">
            <VStack gap={3} align="stretch">
              <Input 
                placeholder="Search base colors..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                size="xs"
              />
              <Box maxH="180px" overflowY="auto">
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

          <Tabs.Content value="suggest">
            <VStack align="stretch" gap={3}>
              <Text fontSize="xs" fontWeight="bold" color="blue.600">High Contrast Alternatives</Text>
              {suggestions.length > 0 ? (
                suggestions.map(s => (
                  <HStack 
                    key={s.id} p={2} borderRadius="md" border="1px solid" borderColor="gray.100" 
                    cursor="pointer" _hover={{ bg: "blue.50" }}
                    onClick={() => onChange(s.hex)}
                  >
                    <Box w={8} h={8} bg={s.hex} borderRadius="sm" />
                    <VStack align="start" gap={0} flex={1}>
                      <Text fontSize="xs" fontWeight="bold">{s.id.split('.').pop()}</Text>
                      <Text fontSize="10px" color="gray.500">{s.group}</Text>
                    </VStack>
                    <Badge colorScheme="green" variant="solid" size="sm">{s.wcag.toFixed(1)}</Badge>
                  </HStack>
                ))
              ) : (
                <Text fontSize="xs" color="gray.400">Searching for accessible alternatives...</Text>
              )}
            </VStack>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </VStack>
  );
});
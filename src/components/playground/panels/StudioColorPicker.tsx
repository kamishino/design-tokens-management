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
import { TechValue } from "../../ui/TechValue";
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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { suggestSwatches } = useColorWorker();
  
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
    suggestSwatches(color, swatches, 'text').then((res: any) => setSuggestions(res as any[]));
  }, [color, swatches, suggestSwatches]);

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
        
        <HStack gap={2}>
          <VStack align="start" flex={1}>
            <Text fontSize="8px" fontWeight="bold" color="gray.400">CURRENT</Text>
            <Box w="full" h="40px" bg={color} borderRadius="md" border="1px solid rgba(0,0,0,0.1)" />
            <Box mt={1}>
              <TechValue label="HEX" value={color.toUpperCase()} />
            </Box>
          </VStack>
          <Box w="1px" h="40px" bg="gray.100" mt={4} />
          <VStack align="start" flex={1}>
            <Text fontSize="8px" fontWeight="bold" color="gray.400">WCAG 2.1</Text>
            <Heading size="md" fontFamily="'Space Mono', monospace">{contrast.wcag.toFixed(1)}</Heading>
            <Badge colorScheme={contrast.isAccessible ? "green" : "red"} size="xs">
              {contrast.isAccessible ? "PASS" : "FAIL"}
            </Badge>
          </VStack>
        </HStack>
      </Box>

      <Tabs.Root defaultValue="sliders" size="sm" variant="subtle">
        <Tabs.List bg="gray.50" p={1} gap={1}>
          <Tabs.Trigger value="sliders" flex={1} fontWeight="bold">Sliders</Tabs.Trigger>
          <Tabs.Trigger value="swatches" flex={1} fontWeight="bold">Swatches</Tabs.Trigger>
          <Tabs.Trigger value="suggest" flex={1} fontWeight="bold">Smart ✨</Tabs.Trigger>
        </Tabs.List>

        <Box p={4}>
          <Tabs.Content value="sliders">
            <VStack gap={4} align="stretch">
              <HexColorPicker color={color} onChange={handleColorChange} style={{ width: '100%' }} />
              
              <VStack gap={3} align="stretch" pt={2}>
                <VStack align="stretch" gap={1}>
                  <TechValue label="Oklch L" value={Math.round(coords.oklch.l * 100)} unit="%" />
                  <Slider 
                    min={0} max={1} step={0.01} 
                    value={[coords.oklch.l]} 
                    onValueChange={(v) => onChange(updateFromOklch(v.value[0], coords.oklch.c, coords.oklch.h))}
                  />
                </VStack>
                
                <VStack align="stretch" gap={1}>
                  <TechValue label="HSL Hue" value={Math.round(coords.hsl.h)} unit="°" />
                  <Slider 
                    min={0} max={360} step={1} 
                    value={[coords.hsl.h]} 
                    onValueChange={(v) => onChange(updateFromHSL(v.value[0], coords.hsl.s, coords.hsl.l))}
                  />
                </VStack>

                <VStack align="stretch" gap={1}>
                  <TechValue label="HSL Sat" value={Math.round(coords.hsl.s)} unit="%" />
                  <Slider 
                    min={0} max={100} step={1} 
                    value={[coords.hsl.s]} 
                    onValueChange={(v) => onChange(updateFromHSL(coords.hsl.h, v.value[0], coords.hsl.l))}
                  />
                </VStack>
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

          <Tabs.Content value="suggest">
            <VStack align="stretch" gap={3}>
              <Text fontSize="xs" fontWeight="bold" color="blue.600">Smart Alternatives ✨</Text>
              <Box maxH="250px" overflowY="auto">
                <VStack align="stretch" gap={2}>
                  {suggestions.map((s: any) => (
                    <HStack 
                      key={s.id} p={2} borderRadius="md" border="1px solid" borderColor="gray.100" 
                      cursor="pointer" _hover={{ bg: "blue.50" }}
                      onClick={() => handleColorChange(s.hex)}
                    >
                      <Box w={8} h={8} bg={s.hex} borderRadius="sm" />
                      <VStack align="start" gap={0} flex={1}>
                        <TechValue label={s.id.split('.').pop()} value={s.hex.toUpperCase()} />
                        <Text fontSize="9px" color="gray.400">{s.group}</Text>
                      </VStack>
                      <Badge colorScheme="green" variant="solid" size="sm" fontFamily="monospace">
                        {s.wcag.toFixed(1)}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </VStack>
  );
});
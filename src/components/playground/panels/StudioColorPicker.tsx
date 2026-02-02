import { HexColorPicker } from "react-colorful";
import { 
  Box, VStack, HStack, Text,
  Input, Heading, Badge
} from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import { hexToOkhsl, okhslToHex, getContrastMetrics } from '../../../utils/colors';

interface StudioColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
  label: string;
}

export const StudioColorPicker = ({ color, onChange, label }: StudioColorPickerProps) => {
  const [okhsl, setOkhsl] = useState(hexToOkhsl(color));
  const contrast = getContrastMetrics(color, '#ffffff');

  useEffect(() => {
    const newOkhsl = hexToOkhsl(color);
    if (Math.abs(newOkhsl.h - okhsl.h) > 0.1 || Math.abs(newOkhsl.l - okhsl.l) > 0.01) {
      setOkhsl(newOkhsl);
    }
  }, [color]);

  const handleOkhslChange = (key: 'h' | 's' | 'l', val: number) => {
    const updated = { ...okhsl, [key]: val };
    setOkhsl(updated);
    const hex = okhslToHex(updated.h, updated.s, updated.l);
    if (hex) onChange(hex);
  };

  return (
    <VStack p={4} gap={4} align="stretch" w="280px" bg="white">
      <Heading size="xs" textTransform="uppercase" color="gray.500">{label}</Heading>
      
      <Box className="custom-picker">
        <HexColorPicker color={color} onChange={onChange} style={{ width: '100%' }} />
      </Box>

      <VStack gap={3} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xs" fontWeight="bold">OKHSL LUMINANCE</Text>
          <Text fontSize="2xs" fontFamily="monospace">{Math.round(okhsl.l * 100)}%</Text>
        </HStack>
        <input 
          type="range" min="0" max="1" step="0.01" value={okhsl.l} 
          onChange={(e) => handleOkhslChange('l', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />

        <HStack justify="space-between" mt={2}>
          <Text fontSize="2xs" fontWeight="bold">HEX</Text>
          <Input 
            size="xs" value={color.toUpperCase()} 
            onChange={(e) => onChange(e.target.value)} 
            fontFamily="monospace" w="100px" textAlign="right"
          />
        </HStack>
      </VStack>

      <Box pt={2} borderTop="1px solid" borderColor="gray.100">
        <HStack justify="space-between">
          <Text fontSize="xs" fontWeight="bold">Contrast on White</Text>
          <Badge colorScheme={contrast.isAccessible ? "green" : "red"}>
            {contrast.wcag.toFixed(1)}:1
          </Badge>
        </HStack>
      </Box>
    </VStack>
  );
};
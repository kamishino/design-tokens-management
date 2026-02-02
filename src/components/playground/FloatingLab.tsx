import { 
  Box, HStack, Text, VStack, Button, Badge
} from "@chakra-ui/react";
import { useState } from 'react';
import { getContrastMetrics } from '../../utils/colors';

interface FloatingLabProps {
  clientId: string;
  projectId: string;
  onUpdate: (name: string, value: string | number) => void;
}

export const FloatingLab = ({ clientId, projectId, onUpdate }: FloatingLabProps) => {
  const [primary, setPrimary] = useState('#a0544f');
  const background = '#ffffff';
  
  const contrast = getContrastMetrics(primary, background);

  const handleApply = async () => {
    const response = await fetch('/api/save-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        projectId,
        tokens: {
          'brand.primary': { '$value': primary, '$type': 'color' }
        }
      })
    });
    const result = await response.json();
    if (result.success) {
      alert('✅ Tokens permanently saved to project JSON!');
    }
  };

  return (
    <Box 
      position="fixed" bottom="8" left="50%" transform="translateX(-50%)" 
      zIndex={1000} bg="rgba(255, 255, 255, 0.8)" backdropFilter="blur(10px)"
      p={4} borderRadius="2xl" boxShadow="xl" border="1px solid" borderColor="gray.200"
      w="800px"
    >
      <HStack gap={8} justify="space-between">
        <HStack gap={6}>
          <VStack align="start" gap={0}>
            <Text fontSize="2xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Primary Color</Text>
            <HStack>
              <input 
                type="color" value={primary} 
                onChange={(e) => {
                  setPrimary(e.target.value);
                  onUpdate('--brandPrimary', e.target.value);
                }} 
                style={{ width: '32px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              />
              <Text fontSize="xs" fontFamily="monospace">{primary.toUpperCase()}</Text>
            </HStack>
          </VStack>

          <VStack align="start" gap={0}>
            <Text fontSize="2xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Contrast (on White)</Text>
            <HStack>
              <Badge colorScheme={contrast.isAccessible ? "green" : "red"} title="WCAG 2.1 Ratio">
                {contrast.wcag.toFixed(1)}:1
              </Badge>
              <Badge variant="outline" colorScheme="blue" title="APCA Lc Score">
                Lc {contrast.apca}
              </Badge>
            </HStack>
          </VStack>
        </HStack>

        <HStack gap={4}>
          <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>Discard</Button>
          <Button colorScheme="blue" size="sm" borderRadius="full" px={6} onClick={handleApply}>
            Apply to Project
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};
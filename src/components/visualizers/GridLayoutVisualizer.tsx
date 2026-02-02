import { 
  Box, VStack, HStack, Heading, SimpleGrid, Text
} from "@chakra-ui/react";
import { useState, useEffect } from 'react';

interface GridLayoutVisualizerProps {
  onUpdate: (newValues: Record<string, any>, label?: string) => void;
}

export const GridLayoutVisualizer = ({ onUpdate }: GridLayoutVisualizerProps) => {
  const [columns, setColumns] = useState(12);
  const [gutter, setGutter] = useState(24);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    onUpdate({
      '--gridColumns': columns,
      '--gridGutterDesktop': `${gutter}px`,
      '--gridGutterMobile': `${gutter * 0.6}px`,
      '--gridGutterTablet': `${gutter * 0.8}px`
    }, 'Adjusted Grid System');
  }, [columns, gutter, onUpdate]);

  return (
    <VStack align="stretch" gap={8} w="full">
      <HStack justify="space-between" align="start">
        <VStack align="start" gap={0}>
          <Heading size="md">Grid System Visualizer</Heading>
          <Text fontSize="sm" color="gray.500">Preview 12-Column Grid with Gutter: {gutter}px</Text>
        </VStack>
        
        <Box display="flex" alignItems="center" bg="red.50" p={2} borderRadius="md">
          <label style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '8px', cursor: 'pointer' }}>
            Show Global Overlay
            <input 
              type="checkbox" 
              checked={showOverlay} 
              onChange={(e) => setShowOverlay(e.target.checked)}
              style={{ marginLeft: '8px' }}
            />
          </label>
        </Box>
      </HStack>

      <Box position="relative" borderWidth="1px" borderRadius="lg" p={4} bg="gray.50" overflow="hidden">
        <SimpleGrid columns={columns} gap={`${gutter}px`} h="200px">
          {Array.from({ length: columns }).map((_, i) => (
            <Box key={i} bg="blue.100" border="1px dashed" borderColor="blue.300" display="flex" alignItems="center" justifyContent="center">
              <Text fontSize="xs" color="blue.600" fontWeight="bold">{i + 1}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <HStack gap={10} p={6} bg="white" borderWidth="1px" borderRadius="lg" flexDirection={{ base: 'column', md: 'row' }}>
        <Box flex={1} w="full">
          <Text fontSize="xs" fontWeight="bold" mb={2}>Number of Columns ({columns})</Text>
          <input 
            type="range" min="4" max="16" step="1" value={columns} 
            onChange={(e) => setColumns(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </Box>

        <Box flex={1} w="full">
          <Text fontSize="xs" fontWeight="bold" mb={2}>Gutter Size ({gutter}px)</Text>
          <input 
            type="range" min="0" max="64" step="4" value={gutter} 
            onChange={(e) => setGutter(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </Box>
      </HStack>

      {showOverlay && (
        <Box 
          position="fixed" 
          top={0} left={0} right={0} bottom={0} 
          pointerEvents="none" 
          zIndex={9999}
          px={8}
        >
          <SimpleGrid columns={columns} gap={`${gutter}px`} h="full">
            {Array.from({ length: columns }).map((_, i) => (
              <Box key={i} bg="rgba(255, 0, 0, 0.05)" h="full" borderLeft="1px solid" borderRight="1px solid" borderColor="rgba(255, 0, 0, 0.1)" />
            ))}
          </SimpleGrid>
        </Box>
      )}
    </VStack>
  );
};
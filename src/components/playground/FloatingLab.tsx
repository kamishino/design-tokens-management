import { 
  Box, HStack, Text, VStack, Button, Badge, 
  Popover, Portal
} from "@chakra-ui/react";
import { useState } from 'react';
import { getContrastMetrics } from '../../utils/colors';
import { prependFont } from '../../utils/fonts';
import { StudioColorPicker } from './panels/StudioColorPicker';
import { FontExplorer } from './panels/FontExplorer';

interface FloatingLabProps {
  clientId: string;
  projectId: string;
  onUpdate: (name: string, value: string | number) => void;
}

export const FloatingLab = ({ clientId, projectId, onUpdate }: FloatingLabProps) => {
  const [primary, setPrimary] = useState('#a0544f');
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
  const [spacingBase, setSpacingBase] = useState(4);
  
  const contrast = getContrastMetrics(primary, '#ffffff');

  const handleApply = async () => {
    const response = await fetch('/api/save-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        projectId,
        tokens: {
          'brand.primary': { '$value': primary, '$type': 'color' },
          'fontFamily.base': { '$value': fontFamily, '$type': 'fontFamily' },
          'spacing.base': { '$value': `${spacingBase}px`, '$type': 'dimension' }
        }
      })
    });
    const result = await response.json();
    if (result.success) {
      alert('✅ Studio changes permanently saved to project JSON!');
    }
  };

  const handleFontSelect = (family: string) => {
    const newStack = prependFont(family, fontFamily);
    setFontFamily(newStack);
    onUpdate('--fontFamilyBase', newStack);
  };

  return (
    <Box 
      position="fixed" bottom="8" left="50%" transform="translateX(-50%)" 
      zIndex={1000} bg="rgba(255, 255, 255, 0.9)" backdropFilter="blur(15px)"
      p={3} borderRadius="full" boxShadow="2xl" border="1px solid" borderColor="gray.200"
      w="auto" minW="600px"
    >
      <HStack gap={6} px={2}>
        {/* Color Control */}
        <Popover.Root positioning={{ gutter: 20 }}>
          <Popover.Trigger asChild>
            <HStack cursor="pointer" p={1} borderRadius="full" _hover={{ bg: "gray.100" }}>
              <Box w="32px" h="32px" bg={primary} borderRadius="full" border="2px solid white" boxShadow="sm" />
              <VStack align="start" gap={0} pr={2}>
                <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">Primary</Text>
                <Text fontSize="xs" fontWeight="bold">{primary.toUpperCase()}</Text>
              </VStack>
            </HStack>
          </Popover.Trigger>
          <Portal>
            <Popover.Content w="auto" borderRadius="xl" boxShadow="2xl" overflow="hidden" bg="white">
              <StudioColorPicker label="Brand Primary" color={primary} onChange={(c) => { setPrimary(c); onUpdate('--brandPrimary', c); }} />
            </Popover.Content>
          </Portal>
        </Popover.Root>

        <Box w="1px" h="30px" bg="gray.200" />

        {/* Font Control */}
        <Popover.Root positioning={{ gutter: 20 }}>
          <Popover.Trigger asChild>
            <VStack align="start" gap={0} cursor="pointer" p={1} px={3} borderRadius="md" _hover={{ bg: "gray.100" }} maxW="150px">
              <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">Typography</Text>
              <Text fontSize="xs" fontWeight="bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                {fontFamily.split(',')[0]}
              </Text>
            </VStack>
          </Popover.Trigger>
          <Portal>
            <Popover.Content w="auto" borderRadius="xl" boxShadow="2xl" overflow="hidden" bg="white">
              <FontExplorer currentFamily={fontFamily} onSelect={handleFontSelect} />
            </Popover.Content>
          </Portal>
        </Popover.Root>

        <Box w="1px" h="30px" bg="gray.200" />

        {/* Spacing Control */}
        <VStack align="start" gap={0} px={3}>
          <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">Spacing</Text>
          <HStack gap={3}>
            <input 
              type="range" min="2" max="8" step="1" value={spacingBase} 
              onChange={(e) => { setSpacingBase(parseInt(e.target.value)); onUpdate('--spacingBase', `${e.target.value}px`); }}
              style={{ width: '60px' }}
            />
            <Text fontSize="xs" fontWeight="bold" w="30px">{spacingBase}px</Text>
          </HStack>
        </VStack>

        <Box w="1px" h="30px" bg="gray.200" />

        {/* Contrast Badge */}
        <VStack align="center" gap={0}>
          <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">Contrast</Text>
          <Badge colorScheme={contrast.isAccessible ? "green" : "red"} borderRadius="full" px={2}>
            {contrast.wcag.toFixed(1)}
          </Badge>
        </VStack>

        <Button 
          colorScheme="blue" size="sm" borderRadius="full" px={6} ml={2}
          onClick={handleApply}
          boxShadow="0 4px 14px 0 rgba(0,118,255,0.39)"
        >
          Apply
        </Button>
      </HStack>
    </Box>
  );
};
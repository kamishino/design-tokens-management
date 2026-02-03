import { 
  Box, HStack, Text, VStack, Badge, Portal, Button, Popover
} from "@chakra-ui/react";
import { useMemo } from 'react';
import { getContrastMetrics } from '../../utils/colors';
import { prependFont } from '../../utils/fonts';
import { findReference } from '../../utils/token-parser';
import { StudioColorPicker } from './panels/StudioColorPicker';
import { FontExplorer } from './panels/FontExplorer';
import { TypeScaleSelector } from './panels/TypeScaleSelector';

import { toaster } from "../ui/toaster";

interface FloatingLabProps {
  clientId: string;
  projectId: string;
  overrides: Record<string, any>;
  updateOverride: (newValues: Record<string, any>, label?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  globalTokens: any[];
}

const SEMANTIC_CHANNELS = [
  { id: 'primary', variable: '--brandPrimary', label: 'Primary' },
  { id: 'secondary', variable: '--brandSecondary', label: 'Secondary' },
  { id: 'accent', variable: '--brandAccent', label: 'Accent' },
  { id: 'text', variable: '--textPrimary', label: 'Text' },
  { id: 'bg', variable: '--bgCanvas', label: 'Background' }
];

export const FloatingLab = ({ 
  clientId, projectId, overrides, updateOverride, 
  undo, redo, canUndo, canRedo, globalTokens
}: FloatingLabProps) => {
  
  const mainContrast = useMemo(() => {
    const fg = overrides['--brandPrimary'] || '#a0544f';
    const bg = overrides['--bgCanvas'] || '#ffffff';
    return getContrastMetrics(fg, bg);
  }, [overrides['--brandPrimary'], overrides['--bgCanvas']]);

  const handleApply = async () => {
    const response = await fetch('/api/save-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        projectId,
        tokens: {
          'brand.primary': { '$value': overrides['--brandPrimary'] },
          'brand.secondary': { '$value': overrides['--brandSecondary'] },
          'brand.accent': { '$value': overrides['--brandAccent'] },
          'text.primary': { '$value': overrides['--textPrimary'] },
          'bg.canvas': { '$value': overrides['--bgCanvas'] },
          'fontFamily.base': { '$value': overrides['--fontFamilyBase'] },
          'typography.config.scaleRatio': { '$value': overrides['--typographyConfigScaleRatio'] }
        }
      })
    });
    const result = await response.json();
    if (result.success) {
      toaster.success({
        title: "Tokens Saved",
        description: "Studio changes permanently saved to project JSON!",
      });
    }
  };

  const handleFontSelect = (family: string) => {
    const newStack = prependFont(family, overrides['--fontFamilyBase'] || 'Inter, sans-serif');
    updateOverride({ '--fontFamilyBase': newStack }, 'Changed Font');
  };

  return (
    <Box 
      position="fixed" bottom="8" left="50%" transform="translateX(-50%)" 
      zIndex={1000} bg="rgba(255, 255, 255, 0.9)" backdropFilter="blur(15px)"
      p={2} px={6} borderRadius="full" boxShadow="2xl" border="1px solid" borderColor="gray.200"
      w="fit-content" maxW="95vw"
    >
      <HStack gap={4} h="52px">
        {/* GROUP 1: HISTORY */}
        <HStack gap={1} bg="gray.50" p={1} borderRadius="full">
          <Button size="xs" variant="ghost" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" borderRadius="full">↺</Button>
          <Button size="xs" variant="ghost" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)" borderRadius="full">↻</Button>
        </HStack>

        <Box w="1px" h="24px" bg="gray.200" />

        {/* GROUP 2: COLORS */}
        <HStack gap={4}>
          {SEMANTIC_CHANNELS.map(channel => (
            <Popover.Root key={channel.id} positioning={{ placement: 'top', gutter: 12 }} lazyMount unmountOnExit>
              <Popover.Trigger asChild>
                <HStack gap={2} cursor="pointer" p={1} pl={2} borderRadius="full" _hover={{ bg: "gray.100" }}>
                  <Box 
                    w="24px" h="24px" 
                    bg={`var(${channel.variable})`} 
                    borderRadius="full" border="2px solid white" boxShadow="xs" 
                  />
                  <VStack align="start" gap={0}>
                    <Text fontSize="8px" fontWeight="bold" color="gray.400" textTransform="uppercase">{channel.label}</Text>
                    <HStack gap={1}>
                      <Text fontSize="10px" fontWeight="bold" fontFamily="monospace">
                        {(overrides[channel.variable] || '').toUpperCase() || '...'}
                      </Text>
                      {findReference(overrides[channel.variable], globalTokens) && (
                        <Badge variant="subtle" colorScheme="gray" fontSize="8px" borderRadius="xs">
                          {findReference(overrides[channel.variable], globalTokens)?.id.split('.').pop()}
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                </HStack>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content w="auto" borderRadius="2xl" boxShadow="2xl" overflow="hidden" border="none">
                    <StudioColorPicker 
                      label={channel.label} 
                      color={overrides[channel.variable] || '#000000'} 
                      onChange={(c) => updateOverride({ [channel.variable]: c }, `Changed ${channel.label}`)} 
                    />
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
          ))}
        </HStack>

        <Box w="1px" h="24px" bg="gray.200" />

        {/* GROUP 3: TYPOGRAPHY (Scale + Font) */}
        <HStack gap={4}>
          <TypeScaleSelector 
            activeRatio={Number(overrides['--typographyConfigScaleRatio']) || 1.25}
            onSelect={(val) => updateOverride({ '--typographyConfigScaleRatio': val }, 'Changed Type Scale')}
          />
          
          <Popover.Root positioning={{ placement: 'top', gutter: 12 }} lazyMount unmountOnExit>
            <Popover.Trigger asChild>
              <Button size="xs" variant="outline" borderRadius="full">Font</Button>
            </Popover.Trigger>
            <Portal>
              <Popover.Positioner>
                <Popover.Content w="auto" borderRadius="xl" boxShadow="2xl" overflow="hidden" border="none">
                  <FontExplorer 
                    currentFamily={overrides['--fontFamilyBase'] || 'Inter, sans-serif'} 
                    onSelect={handleFontSelect} 
                  />
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover.Root>
        </HStack>

        <Box w="1px" h="24px" bg="gray.200" />

        {/* GROUP 4: VALIDATION */}
        <VStack align="start" gap={0}>
          <Text fontSize="8px" fontWeight="bold" color="gray.400" textTransform="uppercase">Main Contrast</Text>
          <HStack gap={1}>
            <Badge colorScheme={mainContrast.isAccessible ? "green" : "red"} size="sm" borderRadius="sm">
              {mainContrast.wcag.toFixed(1)}:1
            </Badge>
            <Badge variant="outline" colorScheme="blue" size="sm" borderRadius="sm">
              Lc {mainContrast.apca}
            </Badge>
          </HStack>
        </VStack>

        <Box flex={1} minW={4} />

        {/* GROUP 5: ACTIONS */}
        <Button 
          colorScheme="blue" size="sm" borderRadius="full" px={6}
          onClick={handleApply}
          boxShadow="0 4px 14px 0 rgba(0,118,255,0.39)"
        >
          Apply
        </Button>
      </HStack>
    </Box>
  );
};

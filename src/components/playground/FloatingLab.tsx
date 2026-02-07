import { 
  Box, HStack, Text, VStack, Badge, Portal, Button, Popover, IconButton
} from "@chakra-ui/react";
import { useMemo } from 'react';
import { getContrastMetrics } from '../../utils/colors';
import { prependFont } from '../../utils/fonts';
import { findReference } from '../../utils/token-parser';
import { StudioColorPicker } from './panels/StudioColorPicker';
import { FontExplorer } from './panels/FontExplorer';
import { TypeScaleSelector } from './panels/TypeScaleSelector';
import type { TokenOverrides } from "../../schemas/manifest";
import type { TokenDoc } from "../../utils/token-parser";
import { LuScanEye, LuX } from "react-icons/lu";

import { toaster } from "../ui/toaster";

interface FloatingLabProps {
  clientId?: string;
  projectId?: string;
  overrides?: TokenOverrides;
  updateOverride?: (newValues: Record<string, any>, label?: string) => void;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  globalTokens?: TokenDoc[];
  filteredIds?: string[]; // New: Filter prop
  onClearFilter?: () => void; // New: Clear handler
}

// ... existing SEMANTIC_CHANNELS ...
const SEMANTIC_CHANNELS = [
  { id: 'primary', variable: '--brandPrimary', label: 'Primary' },
  { id: 'secondary', variable: '--brandSecondary', label: 'Secondary' },
  { id: 'accent', variable: '--brandAccent', label: 'Accent' },
  { id: 'text', variable: '--textPrimary', label: 'Text' },
  { id: 'bg', variable: '--bgCanvas', label: 'Background' }
];

export const FloatingLab = ({ 
  clientId = 'default', 
  projectId = 'default', 
  overrides = {}, 
  updateOverride = () => {}, 
  undo = () => {}, 
  redo = () => {}, 
  canUndo = false, 
  canRedo = false, 
  globalTokens = [],
  filteredIds,
  onClearFilter
}: FloatingLabProps) => {
  
  // ... existing logic ...
  const mainContrast = useMemo(() => {
    const fg = (overrides['--brandPrimary'] as string) || '#a0544f';
    const bg = (overrides['--bgCanvas'] as string) || '#ffffff';
    return getContrastMetrics(fg, bg);
  }, [overrides['--brandPrimary'], overrides['--bgCanvas']]);

  const handleApply = async () => {
    // ... existing handleApply ...
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
    const currentStack = (overrides['--fontFamilyBase'] as string) || 'Inter, sans-serif';
    const newStack = prependFont(family, currentStack);
    updateOverride({ '--fontFamilyBase': newStack }, 'Changed Font');
  };

  return (
    <VStack gap={0} alignItems="center">
      {/* Inspector Banner */}
      {filteredIds && (
        <HStack 
          bg="blue.600" px={4} py={1.5} borderRadius="t-lg" w="100%"
          justifyContent="space-between" boxShadow="md" mb="-1px" zIndex={1001}
        >
          <HStack gap={2}>
            <LuScanEye size={14} color="white" />
            <Text fontSize="xs" fontWeight="bold" color="white">
              Inspecting {filteredIds.length} tokens
            </Text>
          </HStack>
          <IconButton 
            aria-label="Clear Filter" 
            size="xs" variant="ghost" colorPalette="whiteAlpha"
            onClick={onClearFilter} h="18px" minW="18px"
          >
            <LuX size={12} />
          </IconButton>
        </HStack>
      )}

      <Box 
        position="relative" 
        zIndex={1000} bg="rgba(255, 255, 255, 0.9)" backdropFilter="blur(15px)"
        p={2} px={6} 
        borderRadius={filteredIds ? "b-2xl" : "full"} // Square top if banner present
        boxShadow="2xl" border="1px solid" borderColor="gray.200"
        w="fit-content" maxW="95vw"
      >
        <HStack gap={4} h="52px">
          {/* ... existing content ... */}
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
                  <HStack 
                    gap={2} cursor="pointer" p={1} pl={2} borderRadius="full" 
                    _hover={{ bg: "gray.100" }}
                    // Highlight if part of inspection
                    bg={filteredIds && filteredIds.some(id => id.includes(channel.id)) ? "blue.50" : "transparent"}
                    border={filteredIds && filteredIds.some(id => id.includes(channel.id)) ? "1px solid" : "none"}
                    borderColor="blue.200"
                  >
                    <Box 
                      w="24px" h="24px" 
                      bg={`var(${channel.variable})`} 
                      borderRadius="full" border="2px solid white" boxShadow="xs" 
                    />
                    <VStack align="start" gap={0}>
                      <Text fontSize="8px" fontWeight="bold" color="gray.400" textTransform="uppercase">{channel.label}</Text>
                      <HStack gap={1}>
                        <Text fontSize="10px" fontWeight="bold" fontFamily="monospace">
                          {((overrides[channel.variable] as string) || '').toUpperCase() || '...'}
                        </Text>
                        {findReference(overrides[channel.variable] as string, globalTokens) && (
                          <Badge variant="subtle" colorScheme="gray" fontSize="8px" borderRadius="xs">
                            {findReference(overrides[channel.variable] as string, globalTokens)?.id.split('.').pop()}
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
                        color={(overrides[channel.variable] as string) || '#000000'} 
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
                      currentFamily={(overrides['--fontFamilyBase'] as string) || 'Inter, sans-serif'} 
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
    </VStack>
  );
};
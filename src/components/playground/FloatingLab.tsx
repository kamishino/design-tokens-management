import { 
  Box, HStack, Text, VStack, Button, 
  Popover, Portal
} from "@chakra-ui/react";
import { StudioColorPicker } from './panels/StudioColorPicker';
import { FontExplorer } from './panels/FontExplorer';
import { TypeScaleSelector } from './panels/TypeScaleSelector';

interface FloatingLabProps {
  clientId: string;
  projectId: string;
  overrides: Record<string, any>;
  updateOverride: (newValues: Record<string, any>, label?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
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
  undo, redo, canUndo, canRedo 
}: FloatingLabProps) => {
  
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
          'spacing.base': { '$value': overrides['--spacingBase'] },
          'typography.config.scaleRatio': { '$value': overrides['--typographyConfigScaleRatio'] }
        }
      })
    });
    const result = await response.json();
    if (result.success) {
      alert('✅ All tokens permanently saved to project JSON!');
    }
  };

  return (
    <Box 
      position="fixed" bottom="8" left="50%" transform="translateX(-50%)" 
      zIndex={1000} bg="rgba(255, 255, 255, 0.9)" backdropFilter="blur(15px)"
      p={2} borderRadius="full" boxShadow="2xl" border="1px solid" borderColor="gray.200"
      w="auto" minW="800px"
    >
      <HStack gap={4} px={2} h="50px">
        <HStack gap={1}>
          <Button size="xs" variant="ghost" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">↺</Button>
          <Button size="xs" variant="ghost" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">↻</Button>
        </HStack>

        <Box w="1px" h="24px" bg="gray.200" />

        <HStack gap={3}>
          {SEMANTIC_CHANNELS.map(channel => (
            <Popover.Root key={channel.id} positioning={{ placement: 'top', gutter: 12 }}>
              <Popover.Trigger asChild>
                <VStack gap={0} cursor="pointer" p={1} borderRadius="md" _hover={{ bg: "gray.50" }} align="center">
                  <Box 
                    w="24px" h="24px" 
                    bg={`var(${channel.variable})`} 
                    borderRadius="full" border="2px solid white" boxShadow="sm" 
                  />
                  <Text fontSize="8px" fontWeight="bold" color="gray.400" textTransform="uppercase">{channel.label}</Text>
                </VStack>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content w="auto" borderRadius="xl" boxShadow="2xl" overflow="hidden" border="none">
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

        <TypeScaleSelector 
          activeRatio={Number(overrides['--typographyConfigScaleRatio']) || 1.25}
          onSelect={(val) => updateOverride({ '--typographyConfigScaleRatio': val }, 'Changed Type Scale')}
        />

        <Box w="1px" h="24px" bg="gray.200" />

        <HStack gap={4}>
          <Popover.Root positioning={{ placement: 'top', gutter: 12 }}>
            <Popover.Trigger asChild>
              <Button size="xs" variant="outline" borderRadius="full">Font</Button>
            </Popover.Trigger>
            <Portal>
              <Popover.Positioner>
                <Popover.Content w="auto" borderRadius="xl" boxShadow="2xl" overflow="hidden" border="none">
                  <FontExplorer 
                    currentFamily={overrides['--fontFamilyBase'] || 'Inter, sans-serif'} 
                    onSelect={(f) => updateOverride({ '--fontFamilyBase': f }, 'Changed Font')} 
                  />
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover.Root>

          <VStack align="start" gap={0}>
            <Text fontSize="8px" fontWeight="bold" color="gray.400" textTransform="uppercase">Spacing</Text>
            <HStack gap={2}>
              <input 
                type="range" min="2" max="8" step="1" 
                value={parseInt(overrides['--spacingBase']) || 4} 
                onChange={(e) => updateOverride({ '--spacingBase': `${e.target.value}px` }, 'Changed Spacing')}
                style={{ width: '50px' }}
              />
              <Text fontSize="xs" fontWeight="bold">{parseInt(overrides['--spacingBase']) || 4}px</Text>
            </HStack>
          </VStack>
        </HStack>

        <Box flex={1} />

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

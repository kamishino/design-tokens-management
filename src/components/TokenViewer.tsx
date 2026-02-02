import { 
  Box, SimpleGrid, Text, VStack, Heading, Badge,
  Button, HStack, Tabs 
} from "@chakra-ui/react"
import { TypographyVisualizer } from './visualizers/TypographyVisualizer';
import { GridLayoutVisualizer } from './visualizers/GridLayoutVisualizer';

interface Manifest {
  projects: {
    [key: string]: {
      name: string;
      path: string;
      client: string;
      project: string;
    }
  }
}

interface TokenViewerProps {
  manifest: Manifest;
  selectedProject: string;
  onProjectChange: (val: string) => void;
  onEnterStudio: () => void;
  overrides: any;
  updateOverride: (newValues: Record<string, any>, label?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetOverrides: () => void;
}

const defaultColors = [
  { name: '--colorBlue500', label: 'Blue 500' },
  { name: '--colorRed500', label: 'Red 500' },
  { name: '--brandPrimary', label: 'Brand Primary' },
];

export const TokenViewer = ({ 
  manifest, selectedProject, onProjectChange, onEnterStudio, 
  overrides, updateOverride, resetOverrides 
}: TokenViewerProps) => {

  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <VStack align="stretch" gap={8} p={8} bg="#f7fafc" minH="100vh" pb="120px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <VStack align="start" gap={0}>
          <Heading size="xl">Design Token Manager</Heading>
          <HStack mt={1}>
            <Text fontSize="lg" color="gray.600">Token Explorer & Playground</Text>
            {hasOverrides && <Badge colorScheme="orange">Playground Mode Active</Badge>}
          </HStack>
        </VStack>

        <HStack gap={4}>
          <Button colorScheme="blue" size="sm" borderRadius="full" onClick={onEnterStudio}>
            Open Design Studio 🚀
          </Button>
          <Box w="250px">
            <Text fontSize="10px" mb={1} fontWeight="bold" color="gray.400" textTransform="uppercase">Project Target</Text>
            <select 
              value={selectedProject} 
              onChange={(e) => onProjectChange(e.target.value)}
              style={{ 
                width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: 'white', fontSize: '14px'
              }}
            >
              {manifest && Object.keys(manifest.projects).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </Box>
          <Button 
            colorScheme="red" 
            variant="outline" 
            size="sm" 
            onClick={resetOverrides}
            disabled={!hasOverrides}
          >
            Reset
          </Button>
        </HStack>
      </Box>

      <Tabs.Root defaultValue="colors" variant="enclosed" bg="white" p={6} borderRadius="xl" boxShadow="sm">
        <Tabs.List>
          <Tabs.Trigger value="colors" fontWeight="bold">Colors</Tabs.Trigger>
          <Tabs.Trigger value="typography" fontWeight="bold">Typography</Tabs.Trigger>
          <Tabs.Trigger value="layout" fontWeight="bold">Grid & Layout</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="colors" pt={8}>
          <SimpleGrid columns={[1, 2, 3, 4]} gap={6}>
            {defaultColors.map((token) => (
              <Box key={token.name} borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="sm">
                <Box h="120px" bg={`var(${token.name})`} display="flex" alignItems="center" justifyContent="center" transition="all 0.3s">
                  <Text color="white" fontWeight="bold">Preview</Text>
                </Box>
                <Box p={4} bg="white">
                  <Text fontWeight="bold" fontSize="sm">{token.label}</Text>
                  <Text fontFamily="monospace" fontSize="xs" color="gray.500">{token.name}</Text>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Tabs.Content>

        <Tabs.Content value="typography" pt={8}>
          <TypographyVisualizer onUpdate={updateOverride} />
        </Tabs.Content>

        <Tabs.Content value="layout" pt={8}>
          <GridLayoutVisualizer onUpdate={updateOverride} />
        </Tabs.Content>
      </Tabs.Root>
    </VStack>
  )
}

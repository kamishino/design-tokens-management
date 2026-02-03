import { 
  Box, Text, VStack, Heading, Badge,
  HStack, Tabs, Spinner, Center, Input, IconButton,
  createListCollection
} from "@chakra-ui/react"
import { useState, useMemo } from 'react';
import { TypographyVisualizer } from './visualizers/TypographyVisualizer';
import { GridLayoutVisualizer } from './visualizers/GridLayoutVisualizer';
import { useGlobalTokens } from '../hooks/useGlobalTokens';
import { groupTokensByFile } from '../utils/token-grouping';
import { CategoryAccordion } from './explorer/CategoryAccordion';
import { ToCOutline } from './explorer/ToCOutline';
import { SettingsModal } from './explorer/SettingsModal';
import { LuSearch, LuChevronDown, LuChevronUp, LuSettings } from "react-icons/lu";
import { Button } from "./ui/button";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "./ui/select";

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
  resetOverrides: () => void;
}

export const TokenViewer = ({ 
  manifest, selectedProject, onProjectChange, onEnterStudio, 
  overrides, updateOverride, resetOverrides
}: TokenViewerProps) => {

  const { globalTokens, loading } = useGlobalTokens();
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>(['colors.json']);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const hasOverrides = Object.keys(overrides).length > 0;

  const categories = useMemo(() => 
    groupTokensByFile(globalTokens, searchTerm), 
    [globalTokens, searchTerm]
  );

  const expandAll = () => setOpenItems(categories.map(c => c.id));
  const collapseAll = () => setOpenItems([]);

  const projectCollection = useMemo(() => {
    return createListCollection({
      items: Object.keys(manifest?.projects || {}).map(key => ({
        label: key,
        value: key
      }))
    });
  }, [manifest]);

  if (loading) return <Center h="100vh"><Spinner size="xl" /></Center>;

  return (
    <VStack align="stretch" gap={0} bg="#f7fafc" minH="100vh" pb="120px">
      {/* Premium Sticky Header */}
      <Box 
        position="sticky" top={0} zIndex={1000}
        bg="rgba(255, 255, 255, 0.85)" backdropFilter="blur(12px)"
        borderBottom="1px solid" borderColor="gray.200"
        px={8} py={3} boxShadow="sm"
      >
        <HStack gap={8} align="center">
          {/* Identity Cluster */}
          <VStack align="start" gap={0} minW="max-content">
            <Heading size="md" letterSpacing="tight" fontWeight="extrabold" color="gray.800">Design Token Manager</Heading>
            <HStack mt={0.5}>
              <Text fontSize="10px" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">Explorer</Text>
              {hasOverrides && <Badge colorScheme="orange" variant="solid" fontSize="8px" px={1.5} borderRadius="full">Live</Badge>}
            </HStack>
          </VStack>

          {/* Context Cluster */}
          <HStack gap={3} bg="gray.50" px={3} py={1.5} borderRadius="lg" border="1px solid" borderColor="gray.100">
            <Text fontSize="9px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest">Target:</Text>
            <Box w="160px">
              <SelectRoot 
                collection={projectCollection} 
                size="sm"
                value={[selectedProject]}
                onValueChange={(e) => onProjectChange(e.value[0])}
                positioning={{ sameWidth: true, strategy: "fixed" }}
                variant="ghost"
              >
                <SelectTrigger px={0}>
                  <SelectValueText placeholder="Project" fontSize="xs" fontWeight="bold" />
                </SelectTrigger>
                <SelectContent zIndex={2001}>
                  {projectCollection.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Box>
          </HStack>

          {/* Discovery Cluster (Center) */}
          <Box flex={1} display="flex" justifyContent="center">
            <HStack w="full" maxW="400px" position="relative">
              <Box position="absolute" left={3} color="gray.400" zIndex={1}>
                <LuSearch size={14} />
              </Box>
              <Input 
                placeholder="Search tokens across categories..." 
                pl={9} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="sm"
                borderRadius="full"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
              />
            </HStack>
          </Box>

          {/* Action Cluster */}
          <HStack gap={3}>
            <Button colorScheme="blue" size="sm" borderRadius="full" px={5} onClick={onEnterStudio}>
              Studio 🚀
            </Button>
            <Box w="1px" h="20px" bg="gray.200" />
            <HStack gap={1}>
              <Button 
                colorScheme="red" 
                variant="ghost" 
                size="sm" 
                onClick={resetOverrides}
                disabled={!hasOverrides}
                fontSize="xs"
              >
                Reset
              </Button>
              <IconButton 
                aria-label="Settings" 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsSettingsOpen(true)}
              >
                <LuSettings />
              </IconButton>
            </HStack>
          </HStack>
        </HStack>
      </Box>

      <Box p={8}>
        <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

        <Tabs.Root defaultValue="global" variant="enclosed" bg="white" p={6} borderRadius="xl" boxShadow="sm">
          <Tabs.List>
            <Tabs.Trigger value="global" fontWeight="bold">Global Primitives</Tabs.Trigger>
            <Tabs.Trigger value="typography" fontWeight="bold">Typography</Tabs.Trigger>
            <Tabs.Trigger value="layout" fontWeight="bold">Grid & Layout</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="global" pt={8}>
            <VStack align="stretch" gap={6}>
              <HStack justify="flex-end">
                <HStack gap={2}>
                  <Button size="xs" variant="ghost" onClick={expandAll} color="gray.500">
                    <LuChevronDown /> Expand All
                  </Button>
                  <Button size="xs" variant="ghost" onClick={collapseAll} color="gray.500">
                    <LuChevronUp /> Collapse All
                  </Button>
                </HStack>
              </HStack>

              <HStack align="start" gap={10}>
                <Box flex={1}>
                  <CategoryAccordion 
                    categories={categories} 
                    value={openItems} 
                    onValueChange={setOpenItems} 
                  />
                </Box>
                <Box w="200px">
                  <ToCOutline categories={categories} />
                </Box>
              </HStack>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="typography" pt={8}>
            <TypographyVisualizer onUpdate={updateOverride} />
          </Tabs.Content>

          <Tabs.Content value="layout" pt={8}>
            <GridLayoutVisualizer onUpdate={updateOverride} />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </VStack>
  )
}


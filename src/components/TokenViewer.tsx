import { 
  Box, Text, VStack, Heading, Badge,
  HStack, Tabs, Spinner, Center, Input, IconButton
} from "@chakra-ui/react"
import { useState, useMemo, useEffect, useCallback } from 'react';
import { TypographyVisualizer } from './visualizers/TypographyVisualizer';
import { GridLayoutVisualizer } from './visualizers/GridLayoutVisualizer';
import { useGlobalTokens } from '../hooks/useGlobalTokens';
import { groupTokensByFile } from '../utils/token-grouping';
import { CategoryAccordion } from './explorer/CategoryAccordion';
import { ToCOutline } from './explorer/ToCOutline';
import { SettingsModal } from './explorer/SettingsModal';
import { LuSearch, LuChevronDown, LuChevronUp, LuSettings, LuX, LuInfo } from "react-icons/lu";
import { Button } from "./ui/button";
import { FileExplorer } from "./explorer/FileExplorer";
import { ActivityBar } from "./explorer/ActivityBar";
import { findSourceFileForToken } from "../utils/token-graph";
import type { Manifest, TokenOverrides, SidebarPanelId } from "../schemas/manifest";

interface TokenViewerProps {
  manifest: Manifest;
  selectedProject: string;
  onProjectChange: (val: string) => void;
  onEnterStudio: () => void;
  overrides: TokenOverrides;
  updateOverride: (newValues: Record<string, unknown>, label?: string) => void;
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
  
  const [activePanel, setActivePanel] = useState<SidebarPanelId>(() => {
    if (typeof window === 'undefined') return 'explorer';
    return (localStorage.getItem('ide_active_panel') as SidebarPanelId) || 'explorer';
  });

  const hasOverrides = Object.keys(overrides).length > 0;

  const categories = useMemo(() =>
    groupTokensByFile(globalTokens, searchTerm),
    [globalTokens, searchTerm]
  );

  const isJsonFocus = selectedProject.endsWith('.json');
  
  const displayCategories = useMemo(() => {
    if (!isJsonFocus) return categories;
    return categories.filter(cat => selectedProject.toLowerCase().includes(cat.id.toLowerCase()));
  }, [categories, selectedProject, isJsonFocus]);

  const focusedFilename = useMemo(() => {
    if (!isJsonFocus) return null;
    return selectedProject.split('/').pop() || selectedProject;
  }, [selectedProject, isJsonFocus]);

  const expandAll = () => setOpenItems(displayCategories.map(c => c.id));
  const collapseAll = () => setOpenItems([]);

  // Task 3.1: Jump Logic
  const handleJump = useCallback((tokenId: string) => {
    const sourceFile = findSourceFileForToken(tokenId, globalTokens);
    if (sourceFile) {
      setActivePanel('primitives');
      onProjectChange(sourceFile);
      
      // Allow time for DOM to render the new file
      setTimeout(() => {
        const element = document.getElementById(`token-${tokenId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.style.transition = 'background-color 0.5s';
          element.style.backgroundColor = 'var(--chakra-colors-blue-50)';
          setTimeout(() => {
            element.style.backgroundColor = '';
          }, 2000);
        }
      }, 300);
    }
  }, [globalTokens, onProjectChange]);

  useEffect(() => {
    localStorage.setItem('ide_active_panel', activePanel);
  }, [activePanel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key.toLowerCase() === 'e') { e.preventDefault(); setActivePanel('explorer'); }
        if (e.key.toLowerCase() === 'g') { e.preventDefault(); setActivePanel('primitives'); }
        if (e.key.toLowerCase() === 'f') { e.preventDefault(); setActivePanel('search'); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) return <Center h="100vh"><Spinner size="xl" /></Center>;

  return (
    <HStack align="stretch" gap={0} bg="white" h="100vh" overflow="hidden">
      <ActivityBar activePanel={activePanel} onPanelChange={setActivePanel} />

      <FileExplorer 
        manifest={manifest} 
        context={activePanel}
        activePath={selectedProject} 
        onSelect={(_, key) => onProjectChange(key)} 
      />

      <VStack flex={1} align="stretch" gap={0} bg="#f7fafc" overflowY="auto" pb="120px">
        <Box
          position="sticky" top={0} zIndex={1000}
          bg="rgba(255, 255, 255, 0.85)" backdropFilter="blur(12px)"
          borderBottom="1px solid" borderColor="gray.200"
          px={8} py={3} boxShadow="sm"
        >
          <HStack gap={8} align="center">
            <VStack align="start" gap={0} minW="max-content">
              <Heading size="md" letterSpacing="tight" fontWeight="extrabold" color="gray.800">Design Token Manager</Heading>
              <HStack mt={0.5}>
                <Text fontSize="10px" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">Explorer</Text>  
                {hasOverrides && <Badge colorScheme="orange" variant="solid" fontSize="8px" px={1.5} borderRadius="full">Live</Badge>}     
              </HStack>
            </VStack>

            <HStack gap={3} bg="gray.50" px={3} py={1.5} borderRadius="lg" border="1px solid" borderColor="gray.100">
              <Text fontSize="9px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest">Active:</Text>      
              <Text fontSize="xs" fontWeight="bold" color="blue.600">{selectedProject || 'None Selected'}</Text>
            </HStack>

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
              <Tabs.Trigger value="global" fontWeight="bold">Project Tokens</Tabs.Trigger>
              <Tabs.Trigger value="typography" fontWeight="bold">Typography</Tabs.Trigger>
              <Tabs.Trigger value="layout" fontWeight="bold">Grid & Layout</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="global" pt={8}>
              <VStack align="stretch" gap={6}>
                {isJsonFocus && (
                  <HStack 
                    bg="blue.50" p={3} borderRadius="lg" border="1px solid" borderColor="blue.100" 
                    justify="space-between" mb={2}
                  >
                    <HStack gap={3}>
                      <Box color="blue.500"><LuInfo size={18} /></Box>
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" fontWeight="bold" color="blue.700">Focus Mode Active</Text>
                        <Text fontSize="10px" color="blue.600">Showing only tokens from: <b>{focusedFilename}</b></Text>
                      </VStack>
                    </HStack>
                    <Button 
                      size="xs" variant="ghost" colorScheme="blue" 
                      onClick={() => onProjectChange('')}
                    >
                      <LuX style={{ marginRight: '4px' }} /> Show All Primitives
                    </Button>
                  </HStack>
                )}

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

                <HStack gap={8} align="flex-start" px={0} pb={20}>
                  <Box flex={1} minW={0}>
                    {displayCategories.length > 0 ? (
                      <CategoryAccordion
                        categories={displayCategories}
                        value={openItems}
                        onValueChange={setOpenItems}
                        onJump={handleJump}
                      />
                    ) : (
                      <Center p={20} bg="gray.50" borderRadius="xl" border="2px dashed" borderColor="gray.200">
                        <VStack gap={2}>
                          <Text color="gray.400" fontWeight="bold">No categories matched this file.</Text>
                          <Button size="xs" variant="link" onClick={() => onProjectChange('')}>Clear Filter</Button>
                        </VStack>
                      </Center>
                    )}
                  </Box>
                  <Box w="240px" display={{ base: 'none', lg: 'block' }}>
                    <ToCOutline categories={displayCategories} />
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
    </HStack>
  )
}

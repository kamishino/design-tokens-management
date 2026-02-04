import { 
  Box, Text, VStack, Heading, Badge,
  HStack, Spinner, Center, Input, IconButton
} from "@chakra-ui/react"
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useGlobalTokens } from '../hooks/useGlobalTokens';
import { groupTokensByFile } from '../utils/token-grouping';
import { CategoryAccordion } from './explorer/CategoryAccordion';
import { ToCOutline } from './explorer/ToCOutline';
import { SettingsModal } from './explorer/SettingsModal';
import { LuSearch, LuChevronDown, LuChevronUp, LuSettings, LuX, LuDatabase, LuLayers, LuArrowRight } from "react-icons/lu";
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

/**
 * Master Section Component for better organization
 */
const MasterSection = ({ 
  title, icon: Icon, count, categories, color, openItems, onToggle, onJump 
}: { 
  title: string, icon: any, count: number, categories: any[], color: string, openItems: string[], onToggle: any, onJump: any 
}) => {
  if (categories.length === 0) return null;

  return (
    <VStack align="stretch" gap={4} mb={12}>
      <HStack 
        position="sticky" top="60px" zIndex={10} py={2} 
        bg="rgba(247, 250, 252, 0.95)" backdropFilter="blur(8px)"
        justify="space-between" borderBottom="1px solid" borderColor={`${color}.100`}
      >
        <HStack gap={3}>
          <Box p={1.5} bg={`${color}.50`} borderRadius="md" color={`${color}.500`}>
            <Icon size={18} />
          </Box>
          <VStack align="start" gap={0}>
            <Heading size="xs" textTransform="uppercase" letterSpacing="widest" color={`${color}.700`}>
              {title}
            </Heading>
            <Text fontSize="10px" color={`${color}.500`} fontWeight="bold">
              {count} {count === 1 ? 'file' : 'files'} mapped
            </Text>
          </VStack>
        </HStack>
        <Badge colorScheme={color} variant="subtle" fontSize="9px" px={2} borderRadius="full">
          {title === 'Semantic' ? 'Application Layer' : 'System Layer'}
        </Badge>
      </HStack>

      <CategoryAccordion
        categories={categories}
        value={openItems}
        onValueChange={onToggle}
        onJump={onJump}
      />
    </VStack>
  );
};

export const TokenViewer = ({
  manifest, selectedProject, onProjectChange, onEnterStudio,
  overrides, resetOverrides
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

  const { semanticCats, foundationCats } = useMemo(() => {
    return {
      semanticCats: displayCategories.filter(cat => !cat.id.includes('global/base')),
      foundationCats: displayCategories.filter(cat => cat.id.includes('global/base'))
    };
  }, [displayCategories]);

  const focusedFilename = useMemo(() => {
    if (!isJsonFocus) return null;
    return selectedProject.split('/').pop() || selectedProject;
  }, [selectedProject, isJsonFocus]);

  const expandAll = () => setOpenItems(displayCategories.map(c => c.id));
  const collapseAll = () => setOpenItems([]);

  const handleJump = useCallback((tokenId: string) => {
    const sourceFile = findSourceFileForToken(tokenId, globalTokens);
    if (sourceFile) {
      setActivePanel('primitives');
      onProjectChange(sourceFile);
      
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

          <VStack align="stretch" gap={10}>
            <HStack justify="space-between" bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100">
              <HStack gap={6}>
                <VStack align="start" gap={0}>
                  <Text fontSize="10px" fontWeight="bold" color="gray.400">PROJECT CONTEXT</Text>
                  <HStack gap={2}>
                    <Text fontWeight="bold" fontSize="sm">{focusedFilename || 'All Files'}</Text>
                    {isJsonFocus && <LuArrowRight size={12} color="gray" />}
                    {isJsonFocus && <Badge colorScheme="blue" size="xs">Focused</Badge>}
                  </HStack>
                </VStack>
              </HStack>
              <HStack gap={2}>
                <Button size="xs" variant="ghost" onClick={expandAll} color="gray.500">
                  <LuChevronDown /> Expand All
                </Button>
                <Button size="xs" variant="ghost" onClick={collapseAll} color="gray.500">
                  <LuChevronUp /> Collapse All
                </Button>
                {isJsonFocus && (
                  <Button size="xs" variant="subtle" colorScheme="blue" onClick={() => onProjectChange('')}>
                    <LuX style={{ marginRight: '4px' }} /> Clear Focus
                  </Button>
                )}
              </HStack>
            </HStack>

            <HStack gap={8} align="flex-start">
              <Box flex={1} minW={0}>
                {displayCategories.length > 0 ? (
                  <VStack align="stretch" gap={0}>
                    <MasterSection 
                      title="Semantic" 
                      icon={LuLayers} 
                      count={semanticCats.length} 
                      categories={semanticCats} 
                      color="purple"
                      openItems={openItems}
                      onToggle={setOpenItems}
                      onJump={handleJump}
                    />

                    <MasterSection 
                      title="Foundation" 
                      icon={LuDatabase} 
                      count={foundationCats.length} 
                      categories={foundationCats} 
                      color="blue"
                      openItems={openItems}
                      onToggle={setOpenItems}
                      onJump={handleJump}
                    />
                  </VStack>
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
        </Box>
      </VStack>
    </HStack>
  )
}
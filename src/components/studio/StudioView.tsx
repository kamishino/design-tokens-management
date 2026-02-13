import { 
  Box, HStack, Button, Text, Heading, 
  createListCollection, Portal, IconButton
} from "@chakra-ui/react";
import { useState, useMemo, useEffect } from 'react';
import { LandingPage } from './templates/LandingPage';
import { Dashboard } from './templates/Dashboard';
import { ProductDetail } from './templates/ProductDetail';
import { StyleAtlas } from './templates/StyleAtlas';
import { ComponentCatalog } from './templates/ComponentCatalog';
import { AppSelectRoot } from "../ui/AppSelect";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValueText,
} from "../ui/select";
import { generateStudioMockData } from './templates/shared/mock-data';
import { LuScanEye, LuInfo, LuArrowRight, LuSettings, LuX } from "react-icons/lu";
import type { Manifest, TokenOverrides } from "../../schemas/manifest";
import type { TokenDoc } from "../../utils/token-parser";
import { TokenViewer } from "../TokenViewer";

interface StudioViewProps {
  manifest: Manifest | null;
  globalTokens: TokenDoc[];
  selectedProject: string;
  onProjectChange: (val: string) => void;
  onExit: () => void;
  onOpenDocs: () => void;
  onInspectChange: (tokens: string[] | undefined) => void;
  overrides: TokenOverrides;
  updateOverride: (newValues: Record<string, string | number>, label?: string) => void;
}

const templates = createListCollection({
  items: [
    { label: "Component Catalog", value: "catalog" },
    { label: "Design System Atlas", value: "atlas" },
    { label: "SaaS Landing Page", value: "landing" },
    { label: "Admin Dashboard", value: "dashboard" },
    { label: "E-commerce Product", value: "ecommerce" },
  ],
})

export const StudioView = ({ 
  manifest, globalTokens, selectedProject, onProjectChange, onExit, onInspectChange, overrides, updateOverride 
}: StudioViewProps) => {
  const [template, setTemplate] = useState('catalog');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [hoveredRect, setHoveredRect] = useState<{top: number, left: number, width: number, height: number, tokens?: string[]} | null>(null);

  // Project Collection
  const projectCollection = useMemo(() => {
    if (!manifest) return createListCollection({ items: [] });
    return createListCollection({
      items: Object.entries(manifest.projects).map(([key, p]) => ({
        label: `${p.client} - ${p.project}`,
        value: key
      }))
    });
  }, [manifest]);

  // Generate new mock data whenever refreshKey changes
  const mockData = useMemo(() => {
    return generateStudioMockData();
  }, [refreshKey]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  // Inspector Logic
  useEffect(() => {
    if (!isInspectMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const inspectable = target.closest('[data-tokens]');
      
      if (inspectable) {
        const rect = inspectable.getBoundingClientRect();
        const tokens = inspectable.getAttribute('data-tokens')?.split(',').map(t => t.trim()) || [];
        setHoveredRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          tokens
        });
      } else {
        setHoveredRect(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!isInspectMode) return;
      const target = e.target as HTMLElement;
      
      if (target.closest('.studio-toolbar')) return;

      const inspectable = target.closest('[data-tokens]');
      if (inspectable) {
        e.preventDefault();
        e.stopPropagation();
        const tokens = inspectable.getAttribute('data-tokens')?.split(',').map(t => t.trim()) || [];
        onInspectChange(tokens.length > 0 ? tokens : undefined);
      } else {
        onInspectChange(undefined);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick, true); // Capture phase

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick, true);
      setHoveredRect(null); // Clean up outline when mode exits or component unmounts
    };
  }, [isInspectMode, onInspectChange]);

  return (
    <Box position="relative" bg="white" minH="100vh" cursor={isInspectMode ? 'crosshair' : 'default'}>
      {/* Inspector Overlay */}
      {isInspectMode && hoveredRect && (
        <Box
          position="fixed"
          top={hoveredRect.top}
          left={hoveredRect.left}
          width={hoveredRect.width}
          height={hoveredRect.height}
          border="2px solid"
          borderColor="blue.400"
          bg="rgba(66, 153, 225, 0.1)"
          pointerEvents="none"
          zIndex={1900}
          transition="all 0.1s"
        >
          {hoveredRect.tokens && hoveredRect.tokens.length > 0 && (
            <Box
              position="absolute"
              top="-32px"
              left="0"
              bg="blue.600"
              color="white"
              px={2}
              py={1}
              borderRadius="md"
              fontSize="10px"
              whiteSpace="nowrap"
              boxShadow="lg"
              display="flex"
              alignItems="center"
              gap={2}
            >
              {hoveredRect.tokens.map((tokenId, idx) => {
                const token = globalTokens.find(t => t.id === tokenId);
                const lineage = token?.lineage || [];
                return (
                  <HStack key={tokenId} gap={1}>
                    <Text fontWeight="bold">{tokenId}</Text>
                    {lineage.length > 0 && (
                      <>
                        <LuArrowRight size={10} />
                        <Text opacity={0.8}>{lineage.join(' → ')}</Text>
                      </>
                    )}
                    {idx < hoveredRect.tokens!.length - 1 && (
                      <Box w="1px" h="10px" bg="whiteAlpha.400" mx={2} />
                    )}
                  </HStack>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* Studio Toolbar */}
      <Box 
        className="studio-toolbar"
        position="sticky" top={0} left={0} right={0} zIndex={2000}
        bg="rgba(255, 255, 255, 0.9)" backdropFilter="blur(10px)"
        borderBottom="1px solid" borderColor="gray.200" px={8} h="60px"
        display="flex" alignItems="center" justifyContent="space-between"
      >
        <HStack gap={4}>
          <Heading size="sm">Design Studio</Heading>
          <Box w="1px" h="20px" bg="gray.300" />
          
          <HStack gap={2}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">Project:</Text>
            <Box w="220px">
              <AppSelectRoot 
                collection={projectCollection} 
                size="sm"
                value={[selectedProject]}
                onValueChange={(e) => onProjectChange(e.value[0])}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent zIndex={2001}>
                  {projectCollection.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </AppSelectRoot>
            </Box>
          </HStack>

          <Box w="1px" h="20px" bg="gray.300" />

          <HStack gap={2}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">Template:</Text>
            <Box w="180px">
              <AppSelectRoot 
                collection={templates} 
                size="sm"
                value={[template]}
                onValueChange={(e) => setTemplate(e.value[0])}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Select Template" />
                </SelectTrigger>
                <SelectContent zIndex={2001}>
                  {templates.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </AppSelectRoot>
            </Box>
          </HStack>
          <Button size="xs" variant="ghost" onClick={handleRefresh} title="Regenerate Mock Data">
            Refresh Data ✨
          </Button>
        </HStack>

        <HStack gap={3}>
           <Button 
            size="xs" 
            variant={isInspectMode ? "solid" : "outline"} 
            colorScheme={isInspectMode ? "blue" : "gray"}
            onClick={() => {
              setIsInspectMode(!isInspectMode);
              if (isInspectMode) onInspectChange(undefined); // Clear on exit
            }}
          >
            <LuScanEye size={14} style={{ marginRight: 6 }} />
            {isInspectMode ? "Exit Inspect" : "Inspect Mode"}
          </Button>

          <Button size="xs" variant="outline" onClick={onExit}>
            Exit Studio
          </Button>
        </HStack>
      </Box>

      {/* Inspect Mode Instructions */}
      {isInspectMode && (
        <HStack 
          bg="blue.600" color="white" px={8} py={2} gap={3}
          position="sticky" top="60px" zIndex={1999}
          boxShadow="lg"
        >
          <LuInfo size={16} />
          <Text fontSize="sm" fontWeight="bold">
            Inspector Active: Click any outlined element to edit its design tokens in the Floating Bar.
          </Text>
        </HStack>
      )}

      {/* Manager Overlay */}
      {isManagerOpen && manifest && (
        <Portal>
          <Box 
            position="fixed" inset={0} zIndex={3000} bg="white"
            animation="fade-in 0.2s"
          >
            <Box position="absolute" top={4} right={4} zIndex={3001}>
              <IconButton 
                size="sm" variant="ghost" 
                onClick={() => setIsManagerOpen(false)}
                title="Close Manager"
              >
                <LuX />
              </IconButton>
            </Box>
            <TokenViewer 
              manifest={manifest}
              selectedProject={selectedProject}
              onProjectChange={onProjectChange}
              onEnterStudio={() => setIsManagerOpen(false)}
              overrides={overrides}
              updateOverride={updateOverride}
            />
          </Box>
        </Portal>
      )}

      {/* Floating Manager Trigger (Bottom Left) */}
      <Box position="fixed" bottom={6} left={6} zIndex={1800}>
        <Button 
          size="md" 
          colorScheme="gray" 
          variant="surface"
          onClick={() => setIsManagerOpen(true)}
          boxShadow="lg"
          border="1px solid" borderColor="gray.200"
        >
          <LuSettings style={{ marginRight: 8 }} /> Manage Tokens
        </Button>
      </Box>

      {/* Template Preview Area */}
      <Box pointerEvents={isInspectMode ? 'none' : 'auto'} sx={{ '& [data-tokens]': { pointerEvents: 'auto' } }}>
        {template === 'catalog' && <ComponentCatalog />}
        {template === 'atlas' && <StyleAtlas data={mockData} />}
        {template === 'landing' && <LandingPage data={mockData} />}
        {template === 'dashboard' && <Dashboard data={mockData} />}
        {template === 'ecommerce' && <ProductDetail data={mockData} />}
      </Box>
    </Box>
  );
};
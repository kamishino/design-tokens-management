import { 
  Box, HStack, Button, Text, Heading, 
  createListCollection, IconButton 
} from "@chakra-ui/react";
import { useState, useMemo, useEffect } from 'react';
import { LandingPage } from './templates/LandingPage';
import { Dashboard } from './templates/Dashboard';
import { ProductDetail } from './templates/ProductDetail';
import { AppSelectRoot } from "../ui/AppSelect";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValueText,
} from "../ui/select";
import { generateStudioMockData } from './templates/shared/mock-data';
import { LuScanEye, LuX } from "react-icons/lu";
import { FloatingLab } from "../playground/FloatingLab";

interface StudioViewProps {
  onExit: () => void;
  onOpenDocs: () => void;
}

const templates = createListCollection({
  items: [
    { label: "SaaS Landing Page", value: "landing" },
    { label: "Admin Dashboard", value: "dashboard" },
    { label: "E-commerce Product", value: "ecommerce" },
  ],
})

export const StudioView = ({ onExit, onOpenDocs }: StudioViewProps) => {
  const [template, setTemplate] = useState('landing');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [inspectedTokens, setInspectedTokens] = useState<string[] | undefined>(undefined);
  const [hoveredRect, setHoveredRect] = useState<{top: number, left: number, width: number, height: number} | null>(null);

  // Generate new mock data whenever refreshKey or template changes
  const mockData = useMemo(() => generateStudioMockData(), [refreshKey]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  // Inspector Logic
  useEffect(() => {
    if (!isInspectMode) {
      setHoveredRect(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const inspectable = target.closest('[data-tokens]');
      
      if (inspectable) {
        const rect = inspectable.getBoundingClientRect();
        // Adjust for scroll if necessary, but fixed position overlay usually relative to viewport
        setHoveredRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      } else {
        setHoveredRect(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!isInspectMode) return;
      const target = e.target as HTMLElement;
      // Ignore clicks on toolbar or lab
      if (target.closest('.studio-toolbar') || target.closest('.floating-lab')) return;

      const inspectable = target.closest('[data-tokens]');
      if (inspectable) {
        e.preventDefault();
        e.stopPropagation();
        const tokens = inspectable.getAttribute('data-tokens')?.split(',').map(t => t.trim()) || [];
        setInspectedTokens(tokens.length > 0 ? tokens : undefined);
      } else {
        // Clear selection if clicking empty space
        setInspectedTokens(undefined);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick, true); // Capture phase

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick, true);
    };
  }, [isInspectMode]);

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
        />
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
            <Text fontSize="xs" fontWeight="bold" color="gray.500">Template:</Text>
            <Box w="200px">
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
              if (isInspectMode) setInspectedTokens(undefined); // Clear on exit
            }}
          >
            <LuScanEye size={14} style={{ marginRight: 6 }} />
            {isInspectMode ? "Exit Inspect" : "Inspect Mode"}
          </Button>

          <Button size="xs" variant="solid" colorScheme="blue" onClick={onOpenDocs}>
            View Documentation 📚
          </Button>
          <Button size="xs" variant="outline" onClick={onExit}>
            Exit Studio
          </Button>
        </HStack>
      </Box>

      {/* Template Preview Area */}
      <Box pointerEvents={isInspectMode ? 'none' : 'auto'} sx={{ '& [data-tokens]': { pointerEvents: 'auto' } }}>
        {template === 'landing' && <LandingPage data={mockData} />}
        {template === 'dashboard' && <Dashboard data={mockData} />}
        {template === 'ecommerce' && <ProductDetail data={mockData} />}
      </Box>

      {/* Floating Lab Integration */}
      <Box className="floating-lab">
        <FloatingLab 
          filteredIds={inspectedTokens} 
          onClearFilter={() => setInspectedTokens(undefined)}
        />
      </Box>
    </Box>
  );
};
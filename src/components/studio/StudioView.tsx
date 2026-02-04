import { 
  Box, HStack, Button, Text, Heading, 
  createListCollection 
} from "@chakra-ui/react";
import { useState, useMemo } from 'react';
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

  // Generate new mock data whenever refreshKey or template changes
  const mockData = useMemo(() => generateStudioMockData(), [refreshKey]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <Box position="relative" bg="white" minH="100vh">
      {/* Studio Toolbar */}
      <Box 
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
          <Button size="xs" variant="solid" colorScheme="blue" onClick={onOpenDocs}>
            View Documentation 📚
          </Button>
          <Button size="xs" variant="outline" onClick={onExit}>
            Exit Studio
          </Button>
        </HStack>
      </Box>

      {/* Template Preview Area */}
      <Box>
        {template === 'landing' && <LandingPage data={mockData} />}
        {template === 'dashboard' && <Dashboard data={mockData} />}
        {template === 'ecommerce' && <ProductDetail data={mockData} />}
      </Box>
    </Box>
  );
};
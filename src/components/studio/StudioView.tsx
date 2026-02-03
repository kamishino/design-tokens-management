import { 
  Box, HStack, Button, Text, Heading, 
  createListCollection 
} from "@chakra-ui/react";
import { useState } from 'react';
import { LandingPage } from './templates/LandingPage';
import { Dashboard } from './templates/Dashboard';
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "../ui/select";

interface StudioViewProps {
  onExit: () => void;
  onOpenDocs: () => void;
}

const templates = createListCollection({
  items: [
    { label: "SaaS Landing Page", value: "landing" },
    { label: "Admin Dashboard", value: "dashboard" },
  ],
})

export const StudioView = ({ onExit, onOpenDocs }: StudioViewProps) => {
  const [template, setTemplate] = useState('landing');

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
              <SelectRoot 
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
              </SelectRoot>
            </Box>
          </HStack>
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
        {template === 'landing' ? <LandingPage /> : <Dashboard />}
      </Box>
    </Box>
  );
};
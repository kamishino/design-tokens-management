import { Box, HStack, Button, Text, Heading } from "@chakra-ui/react";
import { useState } from 'react';
import { LandingPage } from './templates/LandingPage';
import { Dashboard } from './templates/Dashboard';

interface StudioViewProps {
  onExit: () => void;
}

export const StudioView = ({ onExit }: StudioViewProps) => {
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
            <select 
              value={template} 
              onChange={(e) => setTemplate(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '13px' }}
            >
              <option value="landing">SaaS Landing Page</option>
              <option value="dashboard">Admin Dashboard</option>
            </select>
          </HStack>
        </HStack>

        <Button size="xs" variant="outline" onClick={onExit}>
          Exit Studio
        </Button>
      </Box>

      {/* Template Preview Area */}
      <Box>
        {template === 'landing' ? <LandingPage /> : <Dashboard />}
      </Box>
    </Box>
  );
};
import { Box, SimpleGrid, Text, VStack, Heading, Select, Spinner, Center } from "@chakra-ui/react"
import { useState, useEffect } from 'react';
import { useTokenLoader } from '../hooks/useTokenLoader';

interface Manifest {
  projects: {
    [key: string]: {
      name: string;
      path: string;
    }
  }
}

const defaultTokens = [
  { name: '--colorBlue500', label: 'Blue 500' },
  { name: '--colorRed500', label: 'Red 500' },
  { name: '--brandPrimary', label: 'Brand Primary' },
];

export const TokenViewer = () => {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch manifest on mount
  useEffect(() => {
    fetch('/tokens/manifest.json')
      .then(res => res.json())
      .then(data => {
        setManifest(data);
        const firstProject = Object.keys(data.projects)[0];
        if (firstProject) setSelectedProject(firstProject);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load manifest:', err);
        setLoading(false);
      });
  }, []);

  // Use dynamic loader
  const currentPath = manifest?.projects[selectedProject]?.path;
  useTokenLoader(currentPath);

  if (loading) return <Center h="100vh"><Spinner size="xl" /></Center>;

  return (
    <VStack align="stretch" gap={8} p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <VStack align="start" gap={0}>
          <Heading size="xl">Design Token Manager</Heading>
          <Text fontSize="lg" color="gray.600">Dynamic Asset Loading Demo</Text>
        </VStack>

        <Box w="300px">
          <Text fontSize="sm" mb={2} fontWeight="bold">Select Project Target:</Text>
          <select 
            value={selectedProject} 
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #E2E8F0',
              backgroundColor: 'white'
            }}
          >
            {manifest && Object.keys(manifest.projects).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </Box>
      </Box>
      
      <SimpleGrid columns={[1, 2, 3]} gap={6}>
        {defaultTokens.map((token) => (
          <Box key={token.name} borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="sm">
            <Box 
              h="120px" 
              bg={`var(${token.name})`} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              transition="background-color 0.3s ease"
            >
              <Text color="white" fontWeight="bold" textShadow="0 1px 2px rgba(0,0,0,0.5)">
                Preview
              </Text>
            </Box>
            <Box p={4} bg="white">
              <Text fontWeight="bold">{token.label}</Text>
              <Text fontFamily="monospace" fontSize="sm" color="gray.500">{token.name}</Text>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  )
}
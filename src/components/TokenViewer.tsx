import { Box, SimpleGrid, Text, VStack, Heading } from "@chakra-ui/react"

const tokens = [
  { name: '--color-blue-500', label: 'Blue 500' },
  { name: '--color-red-500', label: 'Red 500' },
  { name: '--brand-primary', label: 'Brand Primary (Overridden)' },
];

export const TokenViewer = () => {
  return (
    <VStack align="stretch" gap={8} p={8}>
      <Heading size="xl">Design Token Manager</Heading>
      <Text fontSize="lg" color="gray.600">SSOT Architecture Demo</Text>
      
      <SimpleGrid columns={[1, 2, 3]} gap={6}>
        {tokens.map((token) => (
          <Box key={token.name} borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="sm">
            <Box 
              h="120px" 
              bg={`var(${token.name})`} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
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

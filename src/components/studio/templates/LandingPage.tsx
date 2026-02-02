import { Box, Heading, Text, Button, SimpleGrid, VStack, Container, HStack } from "@chakra-ui/react";

export const LandingPage = () => {
  return (
    <Box bg="white" minH="100vh" fontFamily="var(--fontFamilyBase)">
      {/* Hero Section */}
      <Box pt={20} pb={32} px={8}>
        <Container maxW="container.xl">
          <VStack gap={8} align="center" textAlign="center">
            <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={4} py={1} textTransform="uppercase" letterSpacing="widest">
              v0.1.0 Alpha
            </Badge>
            <Heading as="h1" fontSize="var(--fontSizeScale6)" fontWeight="var(--fontWeightExtrabold)" lineHeight="var(--fontLeadingTight)">
              Design Systems, <Box as="span" color="var(--brandPrimary)">Simplified</Box>.
            </Heading>
            <Text fontSize="var(--fontSizeScale1)" color="gray.600" maxW="2xl">
              The ultimate Single Source of Truth for your design tokens. Manage, automate, and synchronize across all your platforms with zero effort.
            </Text>
            <HStack gap={4}>
              <Button size="lg" bg="var(--brandPrimary)" color="white" px={10} borderRadius="var(--radius2)" _hover={{ opacity: 0.9 }}>
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" borderColor="var(--brandPrimary)" color="var(--brandPrimary)" px={10} borderRadius="var(--radius2)">
                View Docs
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Feature Grid */}
      <Box bg="gray.50" py={24} px={8}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={12}>
            {[
              { title: "Real-time Sync", desc: "Update your tokens in the browser and see changes reflected in your codebase instantly." },
              { title: "W3C Standard", desc: "Built on the latest Design Token Community Group specifications for maximum compatibility." },
              { title: "Hierarchical Build", desc: "Support for Global, Client, and Project levels with smart inheritance and overrides." }
            ].map((f, i) => (
              <VStack key={i} align="start" gap={4} p={8} bg="white" borderRadius="var(--radius3)" boxShadow="sm">
                <Box w={12} h={12} bg="var(--brandPrimary)" opacity={0.1} borderRadius="lg" />
                <Heading size="md">{f.title}</Heading>
                <Text color="gray.500" fontSize="sm">{f.desc}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={12} borderTop="1px solid" borderColor="gray.100">
        <Container maxW="container.xl">
          <HStack justify="space-between">
            <Text fontWeight="bold">Design Token Manager</Text>
            <HStack gap={8}>
              <Text fontSize="sm" color="gray.500">Privacy</Text>
              <Text fontSize="sm" color="gray.500">Terms</Text>
              <Text fontSize="sm" color="gray.500">Twitter</Text>
            </HStack>
          </HStack>
        </Container>
      </Box>
    </Box>
  );
};

// Internal Badge for demo
const Badge = ({ children, colorScheme, ...props }: any) => (
  <Box 
    bg={`${colorScheme}.50`} 
    color={`${colorScheme}.600`} 
    fontSize="xs" 
    fontWeight="bold" 
    {...props}
  >
    {children}
  </Box>
);

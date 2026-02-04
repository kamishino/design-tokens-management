import { Box, Heading, Text, Button, SimpleGrid, VStack, Container, HStack } from "@chakra-ui/react";
import { StudioMockData } from "./shared/mock-data";

export const LandingPage = ({ data }: { data: StudioMockData }) => {
  return (
    <Box bg="white" minH="100vh" fontFamily="var(--fontFamilyBase)">
      {/* Hero Section with Gradient */}
      <Box 
        pt={32} pb={40} px={8} 
        position="relative"
        overflow="hidden"
        bg="white"
      >
        {/* Background Gradient Blob */}
        <Box 
          position="absolute" top="-10%" right="-5%" w="600px" h="600px"
          bg="var(--brandPrimary)" opacity={0.05} filter="blur(100px)" borderRadius="full"
        />
        <Box 
          position="absolute" bottom="-10%" left="-5%" w="400px" h="400px"
          bg="var(--brandPrimary)" opacity={0.03} filter="blur(80px)" borderRadius="full"
        />

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack gap={10} align="center" textAlign="center">
            <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={4} py={1} textTransform="uppercase" letterSpacing="widest">
              {data.brand.tagline}
            </Badge>
            <Heading 
              as="h1" 
              fontSize="var(--fontSizeScale7)" 
              fontWeight="var(--fontWeightExtrabold)" 
              lineHeight="var(--fontLeadingTight)"
              maxW="4xl"
              letterSpacing="tight"
            >
              {data.brand.heroTitle} <Box as="span" color="var(--brandPrimary)" display="block" bgClip="text" bgGradient="to-r" gradientFrom="var(--brandPrimary)" gradientTo="blue.400">Simplified.</Box>
            </Heading>
            <Text fontSize="var(--fontSizeScale1)" color="gray.600" maxW="2xl" lineHeight="tall">
              {data.brand.heroDesc}
            </Text>
            <HStack gap={4}>
              <Button 
                size="xl" bg="var(--brandPrimary)" color="white" px={12} 
                borderRadius="var(--radius3)" boxShadow="0 20px 40px -10px var(--brandPrimary)"
                _hover={{ transform: "translateY(-2px)", opacity: 0.9 }}
                transition="all 0.2s"
              >
                Get Started Free
              </Button>
              <Button 
                size="xl" variant="outline" borderColor="var(--brandPrimary)" color="var(--brandPrimary)" 
                px={12} borderRadius="var(--radius3)"
                _hover={{ bg: "gray.50" }}
              >
                View Docs
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Feature Grid with Glassmorphism */}
      <Box bg="gray.50" py={32} px={8}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            {[
              { title: "Real-time Sync", desc: "Update your tokens in the browser and see changes reflected in your codebase instantly." },
              { title: "W3C Standard", desc: "Built on the latest Design Token Community Group specifications for maximum compatibility." },
              { title: "Hierarchical Build", desc: "Support for Global, Client, and Project levels with smart inheritance and overrides." }
            ].map((f, i) => (
              <VStack 
                key={i} align="start" gap={6} p={10} 
                bg="rgba(255, 255, 255, 0.7)" 
                backdropFilter="blur(10px)"
                border="1px solid" borderColor="white"
                borderRadius="var(--radius4)" 
                boxShadow="0 10px 30px -5px rgba(0,0,0,0.05)"
                _hover={{ transform: "translateY(-5px)", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
                transition="all 0.3s"
              >
                <Box w={14} h={14} bg="var(--brandPrimary)" opacity={0.1} borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                   <Box w={6} h={6} borderRadius="full" bg="var(--brandPrimary)" />
                </Box>
                <VStack align="start" gap={2}>
                  <Heading size="md" letterSpacing="tight">{f.title}</Heading>
                  <Text color="gray.500" fontSize="sm" lineHeight="relaxed">{f.desc}</Text>
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={16} borderTop="1px solid" borderColor="gray.100">
        <Container maxW="container.xl">
          <HStack justify="space-between">
            <VStack align="start" gap={1}>
              <Text fontWeight="bold" fontSize="lg">Design Token Manager</Text>
              <Text fontSize="xs" color="gray.400">© 2026 KamiFlow Pro</Text>
            </VStack>
            <HStack gap={10}>
              <Text fontSize="sm" fontWeight="medium" color="gray.600" cursor="pointer" _hover={{ color: "var(--brandPrimary)" }}>Privacy</Text>
              <Text fontSize="sm" fontWeight="medium" color="gray.600" cursor="pointer" _hover={{ color: "var(--brandPrimary)" }}>Terms</Text>
              <Text fontSize="sm" fontWeight="medium" color="gray.600" cursor="pointer" _hover={{ color: "var(--brandPrimary)" }}>Twitter</Text>
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
    fontSize="10px"
    fontWeight="extrabold"
    borderRadius="full"
    px={3} py={1}
    {...props}
  >
    {children}
  </Box>
);
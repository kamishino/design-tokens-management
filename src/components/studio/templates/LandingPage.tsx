import { 
  Box, Heading, Text, Button, SimpleGrid, VStack, 
  Container, HStack, Badge, Image, Separator,
  Icon, List, Float
} from "@chakra-ui/react";
import { 
  LuCheck, LuZap, LuShield, LuGlobe, 
  LuChevronRight, LuMessageSquare, LuStar 
} from "react-icons/lu";
import type { StudioMockData } from "./shared/mock-data";
import { Tabs } from "@chakra-ui/react";

/**
 * High-Fidelity Landing Page Template
 * Stress-tests: Typography Scale, Brand Colors, Radius, Spacing
 */
export const LandingPage = ({ data }: { data: StudioMockData }) => {
  return (
    <Box bg="var(--bgCanvas)" minH="100vh" fontFamily="var(--fontFamilyBase)" color="var(--textPrimary)">
      {/* 1. Sticky Navbar */}
      <Box 
        position="sticky" top={0} zIndex={100} 
        bg="rgba(255, 255, 255, 0.8)" backdropFilter="blur(12px)"
        borderBottom="1px solid" borderColor="var(--brandSecondary)"
      >
        <Container maxW="container.xl" py={4}>
          <HStack justify="space-between">
            <HStack gap={8}>
              <HStack gap={2}>
                <Box w={8} h={8} bg="var(--brandPrimary)" borderRadius="var(--radius2)" />
                <Text fontWeight="var(--fontWeightExtrabold)" fontSize="lg" letterSpacing="tight" color="var(--textPrimary)">
                  {data.brand.name}
                </Text>
              </HStack>
              <HStack gap={6} display={{ base: 'none', md: 'flex' }}>
                {['Features', 'Pricing', 'Testimonials', 'Docs'].map(item => (
                  <Text key={item} fontSize="sm" fontWeight="medium" color="var(--textPrimary)" opacity={0.7} cursor="pointer" _hover={{ color: "var(--brandPrimary)", opacity: 1 }}>
                    {item}
                  </Text>
                ))}
              </HStack>
            </HStack>
            <HStack gap={4}>
              <Button variant="ghost" size="sm" color="var(--textPrimary)">Log in</Button>
              <Button bg="var(--brandPrimary)" color="white" size="sm" borderRadius="var(--radius2)" px={6}>
                Get Started
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* 2. Hero Section */}
      <Box 
        pt={24} pb={32} position="relative" overflow="hidden"
        data-tokens="bg.canvas"
        data-inspect="Hero Container"
      >
        <Box 
          position="absolute" top="-10%" right="-5%" w="600px" h="600px"
          bg="var(--brandAccent)" opacity={0.05} filter="blur(100px)" borderRadius="full"
          data-tokens="brand.primary"
          data-inspect="Hero Glow Effect"
        />
        <Container maxW="container.xl">
          <VStack gap={10} align="center" textAlign="center">
            <Badge 
              variant="solid" bg="var(--brandAccent)" color="white" borderRadius="full" px={4} py={1} 
              textTransform="uppercase" letterSpacing="widest" fontSize="10px" fontWeight="bold"
              data-tokens="brand.secondary"
              data-inspect="Tagline Badge"
            >
              {data.brand.tagline}
            </Badge>
            <Heading 
              as="h1" 
              fontSize="var(--fontSizeScale7)" 
              fontWeight="var(--fontWeightExtrabold)" 
              lineHeight="1.1"
              maxW="4xl"
              letterSpacing="tight"
              data-tokens="text.primary,fontFamily.base"
              data-inspect="Main Heading"
              color="var(--textPrimary)"
            >
              {data.brand.heroTitle} <Box as="span" color="var(--brandPrimary)" data-tokens="brand.primary" data-inspect="Heading Highlight">Simplified.</Box>
            </Heading>
            <Text 
              fontSize="var(--fontSizeScale1)" color="var(--textPrimary)" opacity={0.8} maxW="2xl" lineHeight="tall"
              data-tokens="text.secondary,fontFamily.base"
              data-inspect="Subheading"
            >
              {data.brand.heroDesc}
            </Text>
            <HStack gap={4}>
              <Button 
                size="xl" bg="var(--brandPrimary)" color="white" px={12} 
                borderRadius="var(--radius3)" boxShadow="0 20px 40px -10px var(--brandPrimary)"
                _hover={{ transform: "translateY(-2px)", opacity: 0.9 }}
                transition="all 0.2s"
                data-tokens="brand.primary,text.inverse"
                data-inspect="Primary CTA"
              >
                Start Building <LuChevronRight />
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* 3. Logo Cloud */}
      <Box py={16} bg="gray.50/50" borderTop="1px solid" borderBottom="1px solid" borderColor="var(--brandSecondary)">
        <Container maxW="container.xl">
          <VStack gap={8}>
            <Text fontSize="xs" fontWeight="bold" color="var(--textPrimary)" opacity={0.4} textTransform="uppercase" letterSpacing="widest">
              Trusted by design teams at
            </Text>
            <HStack justify="space-around" w="full" opacity={0.4} filter="grayscale(1)" color="var(--textPrimary)">
              {['Adobe', 'Figma', 'Stripe', 'Vercel', 'Linear'].map(logo => (
                <Heading key={logo} size="md" fontWeight="bold">{logo}</Heading>
              ))}
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* 4. Interactive Feature Tabs */}
      <Box py={32}>
        <Container maxW="container.xl">
          <VStack gap={16}>
            <VStack gap={4} textAlign="center">
              <Heading size="2xl" letterSpacing="tight" color="var(--textPrimary)">Everything you need to scale</Heading>
              <Text color="var(--textPrimary)" opacity={0.6} maxW="2xl">Our platform provides the tools to manage tokens from initial concept to global distribution.</Text>
            </VStack>

            <Tabs.Root defaultValue="sync" variant="enclosed" w="full" colorPalette="blue">
              <Tabs.List justifyContent="center" border="none" gap={4} mb={12}>
                <Tabs.Trigger value="sync" px={8} py={3} borderRadius="var(--radius2)" fontSize="sm" fontWeight="bold" color="var(--textPrimary)">
                  <LuZap style={{ marginRight: '8px' }} /> Real-time Sync
                </Tabs.Trigger>
                <Tabs.Trigger value="security" px={8} py={3} borderRadius="var(--radius2)" fontSize="sm" fontWeight="bold" color="var(--textPrimary)">
                  <LuShield style={{ marginRight: '8px' }} /> Enterprise Security
                </Tabs.Trigger>
                <Tabs.Trigger value="global" px={8} py={3} borderRadius="var(--radius2)" fontSize="sm" fontWeight="bold" color="var(--textPrimary)">
                  <LuGlobe style={{ marginRight: '8px' }} /> Global Delivery
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="sync" p={0}>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={12} alignItems="center">
                  <Box bg="gray.100" h="400px" borderRadius="var(--radius4)" position="relative" overflow="hidden" border="1px solid" borderColor="var(--brandSecondary)">
                    <Box position="absolute" top="10%" left="10%" right="10%" bottom="10%" bg="var(--bgCanvas)" borderRadius="var(--radius3)" boxShadow="2xl" p={8}>
                       <VStack align="start" gap={4}>
                         <Box w="40%" h="12px" bg="var(--brandAccent)" opacity={0.2} borderRadius="full" />
                         <Box w="90%" h="12px" bg="var(--brandSecondary)" opacity={0.1} borderRadius="full" />
                         <Box w="70%" h="12px" bg="var(--brandSecondary)" opacity={0.1} borderRadius="full" />
                         <Separator my={4} borderColor="var(--brandSecondary)" />
                         <HStack gap={4}>
                           <Box w="32px" h="32px" bg="var(--brandPrimary)" borderRadius="var(--radius1)" />
                           <VStack align="start" gap={1}>
                             <Box w="60px" h="8px" bg="var(--textPrimary)" opacity={0.2} borderRadius="full" />
                             <Box w="40px" h="8px" bg="var(--textPrimary)" opacity={0.1} borderRadius="full" />
                           </VStack>
                         </HStack>
                       </VStack>
                    </Box>
                  </Box>
                  <VStack align="start" gap={6}>
                    <Heading size="xl" letterSpacing="tight" color="var(--textPrimary)">Instant preview in your browser</Heading>
                    <Text color="var(--textPrimary)" opacity={0.7} lineHeight="tall">
                      Make changes to your brand colors or spacing and see them reflected immediately in our high-fidelity templates. No more waiting for builds to complete.
                    </Text>
                    <List.Root gap={3} variant="plain">
                      <List.Item display="flex" alignItems="center" gap={3}>
                        <Icon as={LuCheck} color="var(--brandAccent)" /> <Text fontSize="sm" color="var(--textPrimary)">Automatic Style Dictionary builds</Text>
                      </List.Item>
                      <List.Item display="flex" alignItems="center" gap={3}>
                        <Icon as={LuCheck} color="var(--brandAccent)" /> <Text fontSize="sm" color="var(--textPrimary)">Hot Module Replacement for CSS</Text>
                      </List.Item>
                    </List.Root>
                  </VStack>
                </SimpleGrid>
              </Tabs.Content>
              {/* Other contents simplified for brevity but structured */}
              <Tabs.Content value="security" p={10} textAlign="center" bg="gray.50" borderRadius="var(--radius4)" border="1px solid" borderColor="var(--brandSecondary)">
                <Heading size="lg" color="var(--textPrimary)">Enterprise-grade protection for your brand assets.</Heading>
              </Tabs.Content>
              <Tabs.Content value="global" p={10} textAlign="center" bg="gray.50" borderRadius="var(--radius4)" border="1px solid" borderColor="var(--brandSecondary)">
                <Heading size="lg" color="var(--textPrimary)">Distribute tokens via NPM, CDN, or direct API integration.</Heading>
              </Tabs.Content>
            </Tabs.Root>
          </VStack>
        </Container>
      </Box>

      {/* 5. Pricing Grid */}
      <Box py={32} bg="gray.900" color="white">
        <Container maxW="container.xl">
          <VStack gap={16}>
            <VStack gap={4} textAlign="center">
              <Heading size="2xl" letterSpacing="tight">Simple, transparent pricing</Heading>
              <Text color="gray.400">Scale your design system without breaking the bank.</Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} w="full">
              {data.pricing.map((tier) => (
                <VStack 
                  key={tier.name} 
                  align="start" gap={8} p={10} 
                  bg={tier.isPopular ? "whiteAlpha.100" : "transparent"}
                  border="1px solid" borderColor={tier.isPopular ? "var(--brandPrimary)" : "whiteAlpha.200"}
                  borderRadius="var(--radius4)"
                  position="relative"
                >
                  {tier.isPopular && (
                    <Float placement="top-center" translateY="-50%">
                      <Badge bg="var(--brandAccent)" color="white" borderRadius="full" px={4} py={1}>Most Popular</Badge>
                    </Float>
                  )}
                  <VStack align="start" gap={2}>
                    <Text fontWeight="bold" color="var(--brandPrimary)" fontSize="sm" textTransform="uppercase">{tier.name}</Text>
                    <HStack align="baseline">
                      <Heading size="3xl">{tier.price}</Heading>
                      <Text color="gray.400" fontSize="sm">/{tier.interval}</Text>
                    </HStack>
                    <Text color="gray.400" fontSize="sm">{tier.description}</Text>
                  </VStack>
                  <Separator borderColor="whiteAlpha.200" />
                  <List.Root gap={4} variant="plain">
                    {tier.features.map(f => (
                      <List.Item key={f} display="flex" alignItems="center" gap={3}>
                        <Icon as={LuCheck} color="var(--brandPrimary)" /> <Text fontSize="sm">{f}</Text>
                      </List.Item>
                    ))}
                  </List.Root>
                  <Button 
                    w="full" size="lg" 
                    bg={tier.isPopular ? "var(--brandPrimary)" : "whiteAlpha.200"} 
                    color="white"
                    borderRadius="var(--radius2)"
                    _hover={{ opacity: 0.9 }}
                  >
                    Get Started
                  </Button>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 6. Testimonials */}
      <Box py={32}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            {data.testimonials.map((t, i) => (
              <VStack 
                key={i} align="start" gap={6} p={8} 
                bg="var(--bgCanvas)" border="1px solid" borderColor="var(--brandSecondary)" 
                borderRadius="var(--radius3)" boxShadow="sm"
              >
                <HStack color="orange.400" gap={1}>
                  {[1,2,3,4,5].map(s => <LuStar key={s} size={14} fill="currentColor" />)}
                </HStack>
                <Text fontSize="md" color="var(--textPrimary)" opacity={0.8} fontStyle="italic">"{t.content}"</Text>
                <HStack gap={4}>
                  <Image src={t.avatar} w={10} h={10} borderRadius="full" />
                  <VStack align="start" gap={0}>
                    <Text fontWeight="bold" fontSize="sm" color="var(--textPrimary)">{t.user}</Text>
                    <Text fontSize="xs" color="gray.400">{t.role} @ {t.company}</Text>
                  </VStack>
                </HStack>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* 7. Footer */}
      <Box py={24} bg="gray.50" borderTop="1px solid" borderColor="var(--brandSecondary)">
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 2, md: 5 }} gap={12}>
            <VStack align="start" gap={6} gridColumn={{ base: "span 2", md: "span 2" }}>
              <HStack gap={2}>
                <Box w={6} h={6} bg="var(--brandPrimary)" borderRadius="var(--radius1)" />
                <Text fontWeight="var(--fontWeightExtrabold)" fontSize="lg" color="var(--textPrimary)">{data.brand.name}</Text>
              </HStack>
              <Text color="var(--textPrimary)" opacity={0.6} fontSize="sm" maxW="xs">
                The leading platform for design token management and cross-platform distribution.
              </Text>
              <HStack gap={4}>
                <LuMessageSquare size={20} color="gray" />
                <LuGlobe size={20} color="gray" />
              </HStack>
            </VStack>
            {['Product', 'Resources', 'Company'].map(cat => (
              <VStack key={cat} align="start" gap={4}>
                <Text fontWeight="bold" fontSize="xs" textTransform="uppercase" color="gray.400">{cat}</Text>
                <VStack align="start" gap={2}>
                  {['Features', 'Pricing', 'Security', 'Enterprise'].map(item => (
                    <Text key={item} fontSize="sm" color="var(--textPrimary)" opacity={0.7} cursor="pointer" _hover={{ color: "var(--brandPrimary)", opacity: 1 }}>{item}</Text>
                  ))}
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
          <Separator my={16} borderColor="var(--brandSecondary)" />
          <HStack justify="space-between" w="full">
            <Text fontSize="xs" color="gray.400">© 2026 {data.brand.name}. All rights reserved.</Text>
            <HStack gap={6}>
              <Text fontSize="xs" color="gray.400" cursor="pointer">Privacy Policy</Text>
              <Text fontSize="xs" color="gray.400" cursor="pointer">Terms of Service</Text>
            </HStack>
          </HStack>
        </Container>
      </Box>
    </Box>
  );
};

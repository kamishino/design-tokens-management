import { 
  Box, Heading, Text, SimpleGrid, VStack, 
  HStack, Container, Button, Input, 
  Link
} from "@chakra-ui/react";
import { 
  LuZap, LuShield, LuMail
} from "react-icons/lu";
import { Field } from "../../ui/field";
import type { StudioMockData } from "./shared/mock-data";

/**
 * Design System Atlas (Kitchen Sink)
 * The ultimate "Style Auditor" for design tokens.
 */
export const StyleAtlas = ({ data }: { data: StudioMockData }) => {
  const sections = [
    { id: 'typography', label: 'Typography' },
    { id: 'colors', label: 'Color System' },
    { id: 'buttons', label: 'Action Suite' },
    { id: 'forms', label: 'Form Elements' },
    { id: 'elevation', label: 'Elevation & Shape' }
  ];

  return (
    <Box bg="var(--bg-canvas)" minH="100vh" color="var(--text-primary)" pb={32}>
      <Container maxW="container.xl" py={12}>
        <HStack align="flex-start" gap={12}>
          
          {/* 1. Sticky Navigator */}
          <VStack 
            position="sticky" top="100px" align="start" w="200px" 
            display={{ base: "none", lg: "flex" }} gap={4}
          >
            <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest">
              Atlas Navigator
            </Text>
            {sections.map(s => (
              <Link 
                key={s.id} href={`#${s.id}`} fontSize="sm" fontWeight="bold" color="gray.500"
                _hover={{ color: "var(--brand-primary)", textDecoration: "none" }}
              >
                {s.label}
              </Link>
            ))}
          </VStack>

          {/* 2. Content Area */}
          <VStack flex={1} align="stretch" gap={24}>
            
            {/* --- SECTION: TYPOGRAPHY --- */}
            <VStack id="typography" align="stretch" gap={10}>
              <VStack align="start" gap={2}>
                <Heading size="2xl" fontFamily="var(--font-family-heading)">Typography Foundations</Heading>
                <Text color="gray.500">Validation for {data.brand.name} Type Scale and pairings.</Text>
              </VStack>

              {/* Ladder */}
              <Box p={8} bg="white" borderRadius="var(--radius3)" border="1px solid" borderColor="gray.100" boxShadow="sm">
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={8} textTransform="uppercase">The Scale Ladder</Text>
                <VStack align="start" gap={6}>
                  {[7, 6, 5, 4, 3, 2, 1, 0, -1].map(step => (
                    <HStack key={step} gap={8} w="full">
                      <Text w="80px" fontSize="10px" fontFamily="monospace" color="gray.400">Step {step}</Text>
                      <Text 
                        style={{ fontSize: `var(--font-size-scale-${step === 0 ? '' : step})` }} 
                        fontFamily="var(--font-family-heading)" 
                        fontWeight="black"
                        lineClamp={1}
                      >
                        Visual Hierarchy Aa
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>

              {/* Composition */}
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
                <VStack align="start" gap={6} p={8} bg="white" borderRadius="var(--radius3)" border="1px solid" borderColor="gray.100">
                  <Heading as="h1" fontSize="var(--font-size-scale-6)" fontFamily="var(--font-family-heading)">Main Header</Heading>
                  <Text fontSize="var(--font-size-scale-)" fontFamily="var(--font-family-body)" lineHeight="tall">
                    Our platform provides the tools to manage tokens from initial concept to global distribution. 
                     stop manually syncing JSON files. Our engine handles the complexity of 3-level inheritance.
                  </Text>
                </VStack>
                <VStack align="start" gap={6} p={8} bg="white" borderRadius="var(--radius3)" border="1px solid" borderColor="gray.100">
                  <Heading as="h3" fontSize="var(--font-size-scale-3)" fontFamily="var(--font-family-heading)">Section Subheader</Heading>
                  <Text fontSize="var(--font-size-scale--1)" fontFamily="var(--font-family-body)" color="gray.500">
                    The leading platform for design token management and cross-platform distribution.
                    Built for pragmatic indie builders and elite design teams.
                  </Text>
                </VStack>
              </SimpleGrid>
            </VStack>

            {/* --- SECTION: COLORS --- */}
            <VStack id="colors" align="stretch" gap={10}>
              <VStack align="start" gap={2}>
                <Heading size="xl" fontFamily="var(--font-family-heading)">Color System</Heading>
                <Text color="gray.500">Semantic channel validation.</Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 3, xl: 5 }} gap={4}>
                {[
                  { id: 'primary', var: '--brand-primary', token: 'brand.primary', label: 'Primary' },
                  { id: 'secondary', var: '--brand-secondary', token: 'brand.secondary', label: 'Secondary' },
                  { id: 'accent', var: '--brand-accent', token: 'brand.accent', label: 'Accent' },
                  { id: 'text', var: '--text-primary', token: 'text.primary', label: 'Text' },
                  { id: 'bg', var: '--bg-canvas', token: 'bg.canvas', label: 'Background' }
                ].map(c => (
                  <VStack key={c.id} p={4} bg="white" borderRadius="var(--radius2)" border="1px solid" borderColor="gray.100" align="start" data-tokens={c.token}>
                    <Box w="full" h="80px" bg={`var(${c.var})`} borderRadius="var(--radius1)" border="1px solid rgba(0,0,0,0.05)" />
                    <VStack align="start" gap={0} mt={2}>
                      <Text fontSize="xs" fontWeight="bold">{c.label}</Text>
                      <Text fontSize="10px" fontFamily="monospace" color="gray.400">{c.var}</Text>
                    </VStack>
                  </VStack>
                ))}
              </SimpleGrid>
            </VStack>

            {/* --- SECTION: ACTIONS --- */}
            <VStack id="buttons" align="stretch" gap={10}>
              <VStack align="start" gap={2}>
                <Heading size="xl" fontFamily="var(--font-family-heading)">Action Suite</Heading>
                <Text color="gray.500">Button variants and interaction states.</Text>
              </VStack>

              <Box p={8} bg="white" borderRadius="var(--radius3)" border="1px solid" borderColor="gray.100">
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={12}>
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2}>SOLID</Text>
                    <Button bg="var(--brand-primary)" color="white" borderRadius="var(--radius2)">Primary Action</Button>
                    <Button bg="var(--brand-secondary)" color="var(--text-primary)" borderRadius="var(--radius2)">Secondary Action</Button>
                    <Button bg="var(--brand-accent)" color="white" borderRadius="var(--radius2)">Accent Action</Button>
                  </VStack>
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2}>OUTLINE</Text>
                    <Button variant="outline" borderColor="var(--brand-primary)" color="var(--brand-primary)" borderRadius="var(--radius2)">Primary Outline</Button>
                    <Button variant="outline" borderColor="var(--brand-secondary)" color="var(--text-primary)" borderRadius="var(--radius2)">Secondary Outline</Button>
                    <Button variant="outline" borderColor="var(--brand-accent)" color="var(--brand-accent)" borderRadius="var(--radius2)">Accent Outline</Button>
                  </VStack>
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2}>GHOST & ICON</Text>
                    <Button variant="ghost" color="var(--brand-primary)" borderRadius="var(--radius2)">Ghost Action</Button>
                    <HStack>
                      <Button bg="var(--brand-primary)" color="white" borderRadius="full" w={10} h={10} p={0}><LuZap /></Button>
                      <Button variant="outline" borderColor="gray.200" borderRadius="full" w={10} h={10} p={0}><LuShield /></Button>
                    </HStack>
                  </VStack>
                </SimpleGrid>
              </Box>
            </VStack>

            {/* --- SECTION: FORMS --- */}
            <VStack id="forms" align="stretch" gap={10}>
              <VStack align="start" gap={2}>
                <Heading size="xl" fontFamily="var(--font-family-heading)">Form Elements</Heading>
                <Text color="gray.500">Inputs, states, and validation styles.</Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
                <VStack align="stretch" gap={6} p={8} bg="white" borderRadius="var(--radius3)" border="1px solid" borderColor="gray.100">
                  <VStack align="start" gap={1}>
                    <Text fontSize="xs" fontWeight="bold">Default Input</Text>
                    <Input placeholder="Enter username..." borderRadius="var(--radius2)" border="1px solid" borderColor="var(--brand-secondary)" />
                  </VStack>
                  <VStack align="start" gap={1}>
                    <Text fontSize="xs" fontWeight="bold">Icon Input</Text>
                    <HStack w="full" px={3} border="1px solid" borderColor="var(--brand-secondary)" borderRadius="var(--radius2)">
                      <LuMail color="gray" size={14} />
                      <Input variant="plain" placeholder="Email address" size="sm" />
                    </HStack>
                  </VStack>
                </VStack>
                <VStack align="stretch" gap={6} p={8} bg="white" borderRadius="var(--radius3)" border="1px solid" borderColor="gray.100">
                  <Field label="Error State" invalid errorText="This value is invalid." colorPalette="red">
                    <Input placeholder="Invalid value" borderRadius="var(--radius2)" />
                  </Field>
                  <VStack align="start" gap={1}>
                    <Text fontSize="xs" fontWeight="bold" color="var(--brand-primary)">Focus Style (Simulated)</Text>
                    <Input placeholder="Focused input" borderRadius="var(--radius2)" border="2px solid" borderColor="var(--brand-primary)" boxShadow="0 0 0 4px var(--brand-secondary)" />
                  </VStack>
                </VStack>
              </SimpleGrid>
            </VStack>

            {/* --- SECTION: ELEVATION --- */}
            <VStack id="elevation" align="stretch" gap={10}>
              <VStack align="start" gap={2}>
                <Heading size="xl" fontFamily="var(--font-family-heading)">Elevation & Shape</Heading>
                <Text color="gray.500">Testing radius and shadow intensity.</Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 4 }} gap={6}>
                {[1, 2, 3, 4].map(i => (
                  <VStack 
                    key={i} p={8} bg="white" align="center" justify="center"
                    borderRadius={`var(--radius${i})`} 
                    boxShadow="xl" // We use standard XL but test the RADIUS here
                    border="1px solid" borderColor="gray.50"
                  >
                    <Text fontSize="xs" fontWeight="bold">Radius {i}</Text>
                    <Text fontSize="10px" color="gray.400">var(--radius{i})</Text>
                  </VStack>
                ))}
              </SimpleGrid>

              <Box p={12} bg="gray.50" borderRadius="var(--radius4)">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={12}>
                  <Box p={10} bg="white" borderRadius="var(--radius2)" boxShadow="sm">
                    <Text fontWeight="bold">Subtle Shadow</Text>
                    <Text fontSize="xs" color="gray.400">boxShadow="sm"</Text>
                  </Box>
                  <Box p={10} bg="white" borderRadius="var(--radius2)" boxShadow="2xl">
                    <Text fontWeight="bold">Deep Elevation</Text>
                    <Text fontSize="xs" color="gray.400">boxShadow="2xl"</Text>
                  </Box>
                </SimpleGrid>
              </Box>
            </VStack>

          </VStack>
        </HStack>
      </Container>
    </Box>
  );
};

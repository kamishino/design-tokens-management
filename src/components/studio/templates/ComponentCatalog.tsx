import { 
  Box, VStack, HStack, Text, Button, Heading, 
  SimpleGrid, Input, Checkbox, Switch, 
  Badge, Stack
} from "@chakra-ui/react";
import { Card } from "../../ui/card";

export const ComponentCatalog = () => {
  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack gap={12} align="stretch">
        {/* Header */}
        <VStack align="start" gap={2}>
          <Heading size="2xl">Component Catalog</Heading>
          <Text color="gray.500">
            Testing your design tokens against atomic UI components.
          </Text>
        </VStack>

        {/* Buttons */}
        <VStack align="start" gap={6}>
          <Heading size="md" borderBottom="2px solid" borderColor="var(--brand-primary)" pb={2}>
            Buttons
          </Heading>
          <HStack gap={4} wrap="wrap">
            <Button variant="solid" bg="var(--brand-primary)" color="var(--bg-canvas)" data-tokens="brand.primary, bg.canvas">Primary Button</Button>
            <Button variant="outline" borderColor="var(--brand-primary)" color="var(--brand-primary)" data-tokens="brand.primary">Outline Button</Button>
            <Button variant="solid" bg="var(--brand-secondary)" color="var(--bg-canvas)" data-tokens="brand.secondary, bg.canvas">Secondary</Button>
            <Button variant="solid" bg="var(--brand-accent)" color="var(--bg-canvas)" data-tokens="brand.accent, bg.canvas">Accent Action</Button>
            <Button variant="ghost" color="var(--text-primary)" data-tokens="text.primary">Ghost</Button>
            <Button disabled>Disabled</Button>
          </HStack>
        </VStack>

        {/* Inputs & Forms */}
        <VStack align="start" gap={6}>
          <Heading size="md" borderBottom="2px solid" borderColor="var(--brand-primary)" pb={2}>
            Forms & Inputs
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} w="full">
            <VStack align="start" gap={4}>
              <Text fontSize="sm" fontWeight="bold">Text Input</Text>
              <Input placeholder="Placeholder text..." borderColor="var(--brand-secondary)" />
              <Input defaultValue="Focused state value" borderColor="var(--brand-primary)" borderWidth="2px" />
            </VStack>
            <VStack align="start" gap={4}>
              <Text fontSize="sm" fontWeight="bold">Selection</Text>
              <HStack gap={6}>
                <Checkbox.Root defaultChecked colorPalette="blue">
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>Checkbox</Checkbox.Label>
                </Checkbox.Root>
                
                <Switch.Root defaultChecked colorPalette="blue">
                  <Switch.HiddenInput />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Switch.Label>Switch</Switch.Label>
                </Switch.Root>
              </HStack>
            </VStack>
          </SimpleGrid>
        </VStack>

        {/* Cards & Containers */}
        <VStack align="start" gap={6}>
          <Heading size="md" borderBottom="2px solid" borderColor="var(--brand-primary)" pb={2}>
            Cards & Surface
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="full">
            <Card.Root bg="var(--bg-canvas)" border="1px solid" borderColor="gray.200" boxShadow="sm">
              <Card.Body gap={3}>
                <Badge alignSelf="start" bg="var(--brand-accent)" color="white">New</Badge>
                <Heading size="sm">Standard Card</Heading>
                <Text fontSize="xs" color="var(--text-primary)">
                  This card uses canvas background and primary text tokens.
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root bg="gray.50" border="1px solid" borderColor="var(--brand-primary)" boxShadow="md">
              <Card.Body gap={3}>
                <Heading size="sm" color="var(--brand-primary)">Branded Card</Heading>
                <Text fontSize="xs">
                  Highlighting a specific feature with primary borders.
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root bg="var(--brand-primary)" color="var(--bg-canvas)" boxShadow="xl">
              <Card.Body gap={3}>
                <Heading size="sm" color="inherit">Inverted Card</Heading>
                <Text fontSize="xs" color="inherit" opacity={0.9}>
                  Testing text contrast against primary background.
                </Text>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </VStack>

        {/* Typography */}
        <VStack align="start" gap={6}>
          <Heading size="md" borderBottom="2px solid" borderColor="var(--brand-primary)" pb={2}>
            Typography Scale
          </Heading>
          <Stack gap={4}>
            <Text fontSize="var(--font-size-scale-8)" fontWeight="bold" data-tokens="typography.scale.8">Heading 8 (Scale)</Text>
            <Text fontSize="var(--font-size-scale-5)" fontWeight="bold" data-tokens="typography.scale.5">Heading 5 (Scale)</Text>
            <Text fontSize="var(--font-size-scale-2)" fontWeight="bold" data-tokens="typography.scale.2">Heading 2 (Scale)</Text>
            <Text fontSize="var(--font-size-scale-0)" data-tokens="typography.scale.0">Body text (Scale 0)</Text>
            <Text fontSize="var(--font-size-scale-minus-1)" color="gray.500" data-tokens="typography.scale.-1">Small text (Scale -1)</Text>
            <Text fontSize="var(--font-size-scale-minus-2)" color="gray.400" fontFamily="var(--font-family-code)" data-tokens="typography.scale.-2, font.family.mono">Code snippet (Scale -2)</Text>
          </Stack>
        </VStack>
      </VStack>
    </Box>
  );
};

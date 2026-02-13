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
          <Heading size="md" borderBottom="2px solid" borderColor="var(--brandPrimary)" pb={2}>
            Buttons
          </Heading>
          <HStack gap={4} wrap="wrap">
            <Button variant="solid" bg="var(--brandPrimary)" color="var(--bgCanvas)">Primary Button</Button>
            <Button variant="outline" borderColor="var(--brandPrimary)" color="var(--brandPrimary)">Outline Button</Button>
            <Button variant="solid" bg="var(--brandSecondary)" color="var(--bgCanvas)">Secondary</Button>
            <Button variant="solid" bg="var(--brandAccent)" color="var(--bgCanvas)">Accent Action</Button>
            <Button variant="ghost" color="var(--textPrimary)">Ghost</Button>
            <Button disabled>Disabled</Button>
          </HStack>
        </VStack>

        {/* Inputs & Forms */}
        <VStack align="start" gap={6}>
          <Heading size="md" borderBottom="2px solid" borderColor="var(--brandPrimary)" pb={2}>
            Forms & Inputs
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} w="full">
            <VStack align="start" gap={4}>
              <Text fontSize="sm" fontWeight="bold">Text Input</Text>
              <Input placeholder="Placeholder text..." borderColor="var(--brandSecondary)" />
              <Input defaultValue="Focused state value" borderColor="var(--brandPrimary)" borderWidth="2px" />
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
          <Heading size="md" borderBottom="2px solid" borderColor="var(--brandPrimary)" pb={2}>
            Cards & Surface
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="full">
            <Card.Root bg="var(--bgCanvas)" border="1px solid" borderColor="gray.200" boxShadow="sm">
              <Card.Body gap={3}>
                <Badge alignSelf="start" bg="var(--brandAccent)" color="white">New</Badge>
                <Heading size="sm">Standard Card</Heading>
                <Text fontSize="xs" color="var(--textPrimary)">
                  This card uses canvas background and primary text tokens.
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root bg="gray.50" border="1px solid" borderColor="var(--brandPrimary)" boxShadow="md">
              <Card.Body gap={3}>
                <Heading size="sm" color="var(--brandPrimary)">Branded Card</Heading>
                <Text fontSize="xs">
                  Highlighting a specific feature with primary borders.
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root bg="var(--brandPrimary)" color="var(--bgCanvas)" boxShadow="xl">
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
          <Heading size="md" borderBottom="2px solid" borderColor="var(--brandPrimary)" pb={2}>
            Typography Scale
          </Heading>
          <Stack gap={4}>
            <Text fontSize="var(--fontSizeScale8)" fontWeight="bold">Heading 8 (Scale)</Text>
            <Text fontSize="var(--fontSizeScale5)" fontWeight="bold">Heading 5 (Scale)</Text>
            <Text fontSize="var(--fontSizeScale2)" fontWeight="bold">Heading 2 (Scale)</Text>
            <Text fontSize="var(--fontSizeScale0)">Body text (Scale 0)</Text>
            <Text fontSize="var(--fontSizeScaleMinus1)" color="gray.500">Small text (Scale -1)</Text>
            <Text fontSize="var(--fontSizeScaleMinus2)" color="gray.400" fontFamily="var(--fontFamilyCode)">Code snippet (Scale -2)</Text>
          </Stack>
        </VStack>
      </VStack>
    </Box>
  );
};

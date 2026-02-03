import { 
  Box, Text, VStack, HStack, Heading, Table
} from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import { Slider } from "../ui/slider";

interface TypographyVisualizerProps {
  onUpdate: (newValues: Record<string, any>, label?: string) => void;
}

const STEPS = ["minus2", "minus1", "0", "1", "2", "3", "4", "5", "6", "7", "8"];

export const TypographyVisualizer = ({ onUpdate }: TypographyVisualizerProps) => {
  const [base, setBase] = useState(16);
  const [ratio, setRatio] = useState(1.25);

  useEffect(() => {
    const updates: Record<string, any> = {};
    STEPS.forEach((stepStr) => {
      const step = stepStr.startsWith('minus') ? -parseInt(stepStr.replace('minus', '')) : parseInt(stepStr);
      const val = Math.round(base * Math.pow(ratio, step));
      updates[`--fontSizeScale${stepStr.charAt(0).toUpperCase() + stepStr.slice(1)}`] = `${val}px`;
    });
    updates['--typographyConfigScaleRatio'] = ratio;
    updates['--fontSizeRoot'] = `${base}px`;
    onUpdate(updates, 'Recalculated Typography Scale');
  }, [base, ratio, onUpdate]);

  return (
    <HStack align="start" gap={10} w="full" flexDirection={{ base: 'column', lg: 'row' }}>
      <VStack flex={1} align="stretch" gap={6} w="full">
        <Heading size="md">Typography Spec Sheet</Heading>
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Table.Root size="sm" variant="outline">
            <Table.Header bg="gray.50">
              <Table.Row>
                <Table.ColumnHeader>Step</Table.ColumnHeader>
                <Table.ColumnHeader>Variable</Table.ColumnHeader>
                <Table.ColumnHeader>Preview</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {STEPS.map((step) => (
                <Table.Row key={step}>
                  <Table.Cell fontWeight="bold">{step}</Table.Cell>
                  <Table.Cell fontFamily="monospace" fontSize="xs" color="gray.500">
                    --fontSizeScale{step.charAt(0).toUpperCase() + step.slice(1)}
                  </Table.Cell>
                  <Table.Cell>
                    <Text 
                      fontSize={`var(--fontSizeScale${step.charAt(0).toUpperCase() + step.slice(1)})`}
                      whiteSpace="nowrap"
                    >
                      The quick brown fox...
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </VStack>

      <VStack w={{ base: 'full', lg: '300px' }} align="stretch" gap={8} p={6} bg="gray.50" borderRadius="lg">
        <Heading size="sm">Playground Controls</Heading>
        
        <Box>
          <Text fontSize="xs" fontWeight="bold" mb={4}>Base Font Size ({base}px)</Text>
          <Slider 
            min={10} max={24} step={1} 
            value={[base]} 
            onValueChange={(e) => setBase(e.value[0])}
            colorScheme="blue"
          />
        </Box>

        <Box>
          <Text fontSize="xs" fontWeight="bold" mb={4}>Modular Ratio ({ratio})</Text>
          <Slider 
            min={1.0} max={2.0} step={0.01} 
            value={[ratio]} 
            onValueChange={(e) => setRatio(e.value[0])}
            colorScheme="blue"
          />
          <HStack justify="space-between" mt={4}>
            <Text fontSize="2xs" color="blue.500" cursor="pointer" onClick={() => setRatio(1.25)} _hover={{ textDecoration: 'underline' }}>1.25 (Major Third)</Text>
            <Text fontSize="2xs" color="blue.500" cursor="pointer" onClick={() => setRatio(1.618)} _hover={{ textDecoration: 'underline' }}>1.618 (Golden)</Text>
          </HStack>
        </Box>
      </VStack>
    </HStack>
  );
};
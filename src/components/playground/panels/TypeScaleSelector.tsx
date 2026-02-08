import { Text, VStack, createListCollection, Box, Table, HStack, Heading, Badge } from "@chakra-ui/react";
import scaleData from '../../../../tokens/global/base/scale.json';
import { useMemo } from 'react';
import { AppSelectRoot } from "../../ui/AppSelect";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValueText,
} from "../../ui/select";

interface TypeScaleSelectorProps {
  activeRatio: number;
  onSelect: (val: number) => void;
}

const STEPS = [
  { id: 5, label: 'h1', token: '7' },
  { id: 4, label: 'h2', token: '6' },
  { id: 3, label: 'h3', token: '5' },
  { id: 2, label: 'h4', token: '4' },
  { id: 1, label: 'h5', token: '3' },
  { id: 0, label: 'body', token: 'base' },
  { id: -1, label: 'sm', token: 'xs' },
];

export const TypeScaleSelector = ({ activeRatio, onSelect }: TypeScaleSelectorProps) => {
  const scales = useMemo(() => {
    return Object.entries(scaleData.scale).map(([key, data]) => ({
      label: `${key.replace(/-/g, ' ')} (${data.$value})`,
      value: data.$value.toString()
    }));
  }, []);

  const collection = useMemo(() => createListCollection({ items: scales }), [scales]);

  const calculatedSteps = useMemo(() => {
    return STEPS.map(step => {
      const px = 16 * Math.pow(activeRatio, step.id);
      const rem = px / 16;
      return { ...step, px, rem };
    });
  }, [activeRatio]);

  return (
    <VStack p={4} gap={6} align="stretch" w="280px" bg="white">
      <VStack align="start" gap={2}>
        <HStack justify="space-between" w="full">
          <Heading size="xs" textTransform="uppercase" color="gray.500">Scale Inspector</Heading>
          <Badge variant="subtle" colorPalette="purple" size="xs">{activeRatio.toFixed(3)}</Badge>
        </HStack>
        <Box w="full">
          <AppSelectRoot 
            collection={collection} 
            size="sm"
            value={[activeRatio.toString()]}
            onValueChange={(e) => onSelect(parseFloat(e.value[0]))}
          >
            <SelectTrigger>
              <SelectValueText placeholder="Select Scale" />
            </SelectTrigger>
            <SelectContent zIndex={2100}>
              {collection.items.map((item) => (
                <SelectItem item={item} key={item.label}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </AppSelectRoot>
        </Box>
      </VStack>

      <Box bg="gray.50" p={4} borderRadius="lg" overflow="hidden">
        <VStack gap={2} align="start">
          <Text fontSize="8px" fontWeight="bold" color="gray.400" mb={2} textTransform="uppercase">Visual Hierarchy</Text>
          {calculatedSteps.slice(0, 5).map(step => (
            <Text 
              key={step.id} 
              style={{ fontSize: `${step.px}px`, fontFamily: 'var(--fontFamilyBody)' }}
              color="gray.800"
              lineClamp={1}
              fontWeight="bold"
            >
              Aa
            </Text>
          ))}
        </VStack>
      </Box>

      <Box>
        <Text fontSize="8px" fontWeight="bold" color="gray.400" mb={2} textTransform="uppercase">Calculated Values (Base 16px)</Text>
        <Table.Root size="sm" variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader fontSize="9px">Step</Table.ColumnHeader>
              <Table.ColumnHeader fontSize="9px">PX</Table.ColumnHeader>
              <Table.ColumnHeader fontSize="9px">REM</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {calculatedSteps.map((step) => (
              <Table.Row key={step.id}>
                <Table.Cell>
                  <HStack gap={1}>
                    <Text fontSize="10px" fontWeight="bold" color="blue.600">{step.label}</Text>
                    <Text fontSize="9px" color="gray.400">({step.token})</Text>
                  </HStack>
                </Table.Cell>
                <Table.Cell fontSize="10px" fontFamily="monospace" fontWeight="medium">
                  {step.px.toFixed(1)}px
                </Table.Cell>
                <Table.Cell fontSize="10px" fontFamily="monospace" color="gray.500">
                  {step.rem.toFixed(3)}rem
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </VStack>
  );
};

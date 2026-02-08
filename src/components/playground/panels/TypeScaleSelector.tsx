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
import { PrecisionSlider } from "../../ui/precision-slider";

interface TypeScaleSelectorProps {
  activeRatio: number;
  baseSize: number;
  onSelect: (val: number) => void;
  onBaseSizeChange: (val: number) => void;
}

const STEPS = [
  { id: 8, label: 'hero', token: '8' },
  { id: 7, label: 'disp', token: '7' },
  { id: 6, label: 'h1', token: '6' },
  { id: 5, label: 'h2', token: '5' },
  { id: 4, label: 'h3', token: '4' },
  { id: 3, label: 'h4', token: '3' },
  { id: 0, label: 'body', token: '0' },
  { id: -2, label: 'xs', token: '-2' },
];

const toTitleCase = (str: string) => {
  return str
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const TypeScaleSelector = ({ 
  activeRatio, baseSize, onSelect, onBaseSizeChange 
}: TypeScaleSelectorProps) => {
  const scales = useMemo(() => {
    return Object.entries(scaleData.scale).map(([key, data]) => ({
      label: `${toTitleCase(key)} (${data.$value})`,
      value: data.$value.toString()
    }));
  }, []);

  const collection = useMemo(() => createListCollection({ items: scales }), [scales]);

  const calculatedSteps = useMemo(() => {
    return STEPS.map(step => {
      const px = baseSize * Math.pow(activeRatio, step.id);
      const rem = px / 16;
      return { ...step, px, rem };
    });
  }, [activeRatio, baseSize]);

  return (
    <VStack p={4} gap={6} align="stretch" w="280px" bg="white">
      <VStack align="stretch" gap={4}>
        <Heading size="xs" textTransform="uppercase" color="gray.500">Scale Inspector</Heading>
        
        <VStack align="start" gap={1}>
          <Text fontSize="8px" fontWeight="bold" color="gray.400" textTransform="uppercase">Ratio</Text>
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
                  <SelectItem item={item} key={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </AppSelectRoot>
          </Box>
        </VStack>

        <VStack align="stretch" gap={1}>
          <PrecisionSlider 
            label="Base Size" 
            value={[baseSize]} 
            unit="px" 
            min={12} max={18} step={1}
            onValueChange={(v) => onBaseSizeChange(v.value[0])}
          />
        </VStack>
      </VStack>

      <Box>
        <Text fontSize="8px" fontWeight="bold" color="gray.400" mb={2} textTransform="uppercase">Calculated Values</Text>
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
                  {Math.round(step.px)}px
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

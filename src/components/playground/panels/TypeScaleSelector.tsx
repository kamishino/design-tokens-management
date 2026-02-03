import { Text, VStack, createListCollection, Box } from "@chakra-ui/react";
import scaleData from '../../../../tokens/global/base/scale.json';
import { useMemo } from 'react';
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "../../ui/select";

interface TypeScaleSelectorProps {
  activeRatio: number;
  onSelect: (val: number) => void;
}

export const TypeScaleSelector = ({ activeRatio, onSelect }: TypeScaleSelectorProps) => {
  const scales = useMemo(() => {
    return Object.entries(scaleData.scale).map(([key, data]) => ({
      label: `${key.replace(/-/g, ' ')} (${data.$value})`,
      value: data.$value.toString()
    }));
  }, []);

  const collection = useMemo(() => createListCollection({ items: scales }), [scales]);

  return (
    <VStack align="start" gap={0}>
      <Text fontSize="8px" fontWeight="bold" color="gray.400" textTransform="uppercase">Type Scale</Text>
      <Box w="140px">
        <SelectRoot 
          collection={collection} 
          size="xs"
          value={[activeRatio.toString()]}
          onValueChange={(e) => onSelect(parseFloat(e.value[0]))}
          variant="ghost"
        >
          <SelectTrigger px={0}>
            <SelectValueText placeholder="Select Scale" fontSize="12px" fontWeight="bold" />
          </SelectTrigger>
          <SelectContent zIndex={2100}>
            {collection.items.map((item) => (
              <SelectItem item={item} key={item.label}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Box>
    </VStack>
  );
};

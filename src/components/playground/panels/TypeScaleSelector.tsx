import { Text, VStack } from "@chakra-ui/react";
import scaleData from '../../../../tokens/global/base/scale.json';

interface TypeScaleSelectorProps {
  activeRatio: number;
  onSelect: (val: number) => void;
}

export const TypeScaleSelector = ({ activeRatio, onSelect }: TypeScaleSelectorProps) => {
  const scales = Object.entries(scaleData.scale).map(([key, data]) => ({
    name: key.replace(/-/g, ' '),
    value: parseFloat(data.$value),
    description: data.$description
  }));

  return (
    <VStack align="start" gap={0}>
      <Text fontSize="8px" fontWeight="bold" color="gray.400" textTransform="uppercase">Type Scale</Text>
      <select 
        value={activeRatio}
        onChange={(e) => onSelect(parseFloat(e.target.value))}
        style={{ 
          fontSize: '12px', fontWeight: 'bold', border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none'
        }}
      >
        {scales.map(s => (
          <option key={s.name} value={s.value}>{s.name} ({s.value})</option>
        ))}
      </select>
    </VStack>
  );
};
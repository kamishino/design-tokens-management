import { Text, HStack } from "@chakra-ui/react";

interface TechValueProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

export const TechValue = ({ label, value, unit, color = "gray.600" }: TechValueProps) => {
  return (
    <HStack justify="space-between" w="full">
      <Text 
        fontSize="9px" 
        fontWeight="bold" 
        color="gray.400" 
        textTransform="uppercase"
        letterSpacing="wider"
      >
        {label}
      </Text>
      <HStack gap={0.5}>
        <Text 
          fontSize="11px" 
          fontFamily="'Space Mono', monospace" 
          fontWeight="bold" 
          color={color}
        >
          {value}
        </Text>
        {unit && (
          <Text fontSize="9px" fontWeight="bold" color="gray.400" mt={0.5}>
            {unit}
          </Text>
        )}
      </HStack>
    </HStack>
  );
};

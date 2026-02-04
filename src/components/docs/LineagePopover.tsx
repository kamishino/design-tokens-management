import { 
  VStack, HStack, Text, Badge, Popover, Portal
} from "@chakra-ui/react";
import { LuNetwork, LuArrowRight } from "react-icons/lu";

interface LineagePopoverProps {
  ids: string[];
  label: string;
  colorScheme: string;
}

export const LineagePopover = ({ ids, label, colorScheme }: LineagePopoverProps) => {
  if (ids.length === 0) return null;

  return (
    <Popover.Root positioning={{ placement: 'top-start' }} lazyMount unmountOnExit>
      <Popover.Trigger asChild>
        <Badge 
          colorScheme={colorScheme} 
          variant="subtle" 
          size="xs" 
          cursor="pointer"
          display="flex" 
          gap={1} 
          alignItems="center"
          _hover={{ opacity: 0.8 }}
        >
          <LuNetwork size={10} />
          {ids.length} {label}
        </Badge>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content bg="white" boxShadow="2xl" borderRadius="lg" p={4} border="1px solid" borderColor="gray.100">
            <VStack align="stretch" gap={3}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                {label.toUpperCase()} ({ids.length})
              </Text>
              <VStack align="stretch" gap={1} maxH="200px" overflowY="auto">
                {ids.map(id => (
                  <HStack key={id} gap={2} p={1.5} borderRadius="md" _hover={{ bg: "gray.50" }}>
                    <LuArrowRight size={10} color="gray" />
                    <Text fontSize="11px" fontWeight="bold" fontFamily="'Space Mono', monospace">
                      {id}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};
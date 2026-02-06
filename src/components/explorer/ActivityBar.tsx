import { Box, VStack, IconButton, Tooltip } from "@chakra-ui/react";
import { LuFiles, LuGlobe, LuSearch } from "react-icons/lu";
import type { SidebarPanelId } from "../../schemas/manifest";

interface ActivityBarProps {
  activePanel: SidebarPanelId;
  onPanelChange: (id: SidebarPanelId) => void;
}

const ITEMS = [
  { id: 'explorer' as const, icon: LuFiles, label: 'Explorer (Projects)' },
  { id: 'primitives' as const, icon: LuGlobe, label: 'Global Primitives' },
  { id: 'search' as const, icon: LuSearch, label: 'Search' },
];

export const ActivityBar = ({ activePanel, onPanelChange }: ActivityBarProps) => {
  return (
    <VStack 
      w="48px" 
      minW="48px" 
      h="full" 
      bg="gray.900" 
      py={4} 
      gap={4} 
      align="center"
      zIndex={1100}
    >
      {ITEMS.map((item) => {
        const isActive = activePanel === item.id;
        return (
          <Box key={item.id} position="relative" w="full" display="flex" justifyContent="center">
            {isActive && (
              <Box 
                position="absolute" left={0} top="20%" bottom="20%" w="2px" 
                bg="blue.400" borderRadius="full" 
              />
            )}
            <Tooltip.Root positioning={{ placement: 'right' }} openDelay={500}>
              <Tooltip.Trigger asChild>
                <IconButton
                  aria-label={item.label}
                  variant="ghost"
                  color={isActive ? "white" : "gray.500"}
                  _hover={{ color: "white", bg: "whiteAlpha.100" }}
                  onClick={() => onPanelChange(item.id)}
                  size="sm"
                >
                  <item.icon size={20} />
                </IconButton>
              </Tooltip.Trigger>
              <Tooltip.Content bg="gray.800" color="white" fontSize="xs" px={2} py={1} borderRadius="md">
                {item.label}
              </Tooltip.Content>
            </Tooltip.Root>
          </Box>
        );
      })}

      <Box flex={1} />
    </VStack>
  );
};

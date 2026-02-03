import { 
  MenuRoot, MenuTrigger, MenuContent, MenuItem,
  IconButton, Link, Box
} from "@chakra-ui/react";
import { LuCode, LuChevronDown } from "react-icons/lu";
import { SUPPORTED_IDES, useAppSettings } from "../../hooks/useAppSettings";

interface IdeMenuButtonProps {
  filename: string;
}

/**
 * Optimized IDE Menu Button with stable layout.
 * Uses a single border-boxed container to prevent layout shifts when opening the menu.
 */
export const IdeMenuButton = ({ filename }: IdeMenuButtonProps) => {
  const { settings, getFullIdePath } = useAppSettings();
  
  const preferredIde = SUPPORTED_IDES.find(i => i.id === settings.preferredIde) || SUPPORTED_IDES[0];

  return (
    <Box 
      onClick={(e) => e.stopPropagation()}
      display="inline-flex"
      alignItems="stretch"
      borderRadius="md"
      border="1px solid"
      borderColor="blue.100"
      bg="white"
      overflow="hidden"
      h="24px" // Fixed height for total stability
    >
      {/* Primary Action Button */}
      <Link 
        href={getFullIdePath(filename)} 
        onClick={(e) => e.stopPropagation()}
        display="flex"
      >
        <IconButton 
          size="xs" 
          variant="ghost" 
          color="blue.500"
          _hover={{ bg: "blue.50" }}
          borderRadius={0}
          title={`Open in ${preferredIde.name}`}
          w="28px"
          h="full"
        >
          <LuCode />
        </IconButton>
      </Link>

      {/* Vertical Divider */}
      <Box w="1px" bg="blue.100" />

      {/* Menu Trigger */}
      <MenuRoot positioning={{ placement: "bottom-end", strategy: "fixed" }}>
        <MenuTrigger asChild>
          <IconButton 
            size="xs" 
            variant="ghost" 
            color="blue.500"
            _hover={{ bg: "blue.50" }}
            borderRadius={0}
            w="20px"
            h="full"
          >
            <LuChevronDown />
          </IconButton>
        </MenuTrigger>
        <MenuContent minW="180px" zIndex={2100}>
          {SUPPORTED_IDES.map((ide) => (
            <MenuItem 
              key={ide.id} 
              value={ide.id}
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = getFullIdePath(filename, ide.id);
              }}
            >
              Open in {ide.name}
            </MenuItem>
          ))}
        </MenuContent>
      </MenuRoot>
    </Box>
  );
};
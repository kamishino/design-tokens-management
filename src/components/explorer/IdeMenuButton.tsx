import { 
  MenuTrigger, MenuContent, MenuItem,
  IconButton, Link, Box
} from "@chakra-ui/react";
import { LuCode, LuChevronDown } from "react-icons/lu";
import { SUPPORTED_IDES, useAppSettings } from "../../hooks/useAppSettings";
import { AppMenuRoot } from "../ui/AppMenu";

interface IdeMenuButtonProps {
  filename: string;
}

/**
 * Optimized IDE Menu Button with a "Frozen" Grid layout.
 * Uses a fixed grid to ensure opening the menu content has 0.0px impact on the trigger's size.
 */
export const IdeMenuButton = ({ filename }: IdeMenuButtonProps) => {
  const { settings, getFullIdePath } = useAppSettings();
  
  const preferredIde = SUPPORTED_IDES.find(i => i.id === settings.preferredIde) || SUPPORTED_IDES[0];

  return (
    <Box 
      onClick={(e) => e.stopPropagation()}
      display="inline-grid"
      gridTemplateColumns="28px 1px 24px" // Strictly defined columns
      alignItems="stretch"
      borderRadius="md"
      border="1px solid"
      borderColor="blue.100"
      bg="white"
      overflow="hidden"
      h="24px"
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
      <AppMenuRoot positioning={{ placement: "bottom-end" }}>
        <MenuTrigger asChild>
          <IconButton 
            size="xs" 
            variant="ghost" 
            color="blue.500"
            _hover={{ bg: "blue.50" }}
            borderRadius={0}
            w="24px"
            h="full"
          >
            <LuChevronDown />
          </IconButton>
        </MenuTrigger>
        <MenuContent 
          minW="180px" 
          zIndex={2100}
          css={{ position: "fixed !important" }} // Force fixed position to bypass local context
        >
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
      </AppMenuRoot>
    </Box>
  );
};

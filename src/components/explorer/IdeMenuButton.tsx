import { 
  MenuTrigger, MenuContent, MenuItem,
  IconButton, MenuRoot, Box
} from "@chakra-ui/react";
import { LuEllipsis } from "react-icons/lu";
import { SUPPORTED_IDES, useAppSettings } from "../../hooks/useAppSettings";

interface IdeMenuButtonProps {
  filename: string;
}

/**
 * Simplified IDE Menu Button.
 * A single "More Actions" trigger that integrates cleanly into list rows.
 */
export const IdeMenuButton = ({ filename }: IdeMenuButtonProps) => {
  const { getFullIdePath } = useAppSettings();
  
  return (
    <MenuRoot positioning={{ strategy: "absolute", placement: "bottom-end" }}>
      <Box position="relative">
        <MenuTrigger asChild>
          <IconButton 
            size="xs" 
            variant="ghost" 
            color="gray.400"
            _hover={{ bg: "gray.100", color: "gray.700" }}
            title="Open in IDE"
            aria-label="Open in IDE"
          >
            <LuEllipsis />
          </IconButton>
        </MenuTrigger>
        <MenuContent 
          minW="180px" 
          portalled={false} 
          zIndex={10}
          position="absolute"
          top="100%"
          right="0"
          mt="2"
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
      </Box>
    </MenuRoot>
  );
};

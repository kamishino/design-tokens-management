import { 
  MenuTrigger, MenuContent, MenuItem,
  IconButton
} from "@chakra-ui/react";
import { LuEllipsis } from "react-icons/lu";
import { SUPPORTED_IDES, useAppSettings } from "../../hooks/useAppSettings";
import { AppMenuRoot } from "../ui/AppMenu";

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
    <AppMenuRoot positioning={{ placement: "bottom-end" }}>
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
  );
};

import { 
  MenuRoot, MenuTrigger, MenuContent, MenuItem,
  HStack, IconButton, Link
} from "@chakra-ui/react";
import { LuCode, LuChevronDown } from "react-icons/lu";
import { SUPPORTED_IDES, useAppSettings } from "../../hooks/useAppSettings";

interface IdeMenuButtonProps {
  filename: string;
}

export const IdeMenuButton = ({ filename }: IdeMenuButtonProps) => {
  const { settings, getFullIdePath } = useAppSettings();
  
  const preferredIde = SUPPORTED_IDES.find(i => i.id === settings.preferredIde) || SUPPORTED_IDES[0];

  return (
    <HStack gap={0}>
      {/* Primary Action Button */}
      <Link href={getFullIdePath(filename)} onClick={(e) => e.stopPropagation()}>
        <IconButton 
          size="xs" 
          variant="ghost" 
          color="blue.500"
          _hover={{ bg: "blue.50" }}
          borderRightRadius={0}
          title={`Open in ${preferredIde.name}`}
        >
          <LuCode />
        </IconButton>
      </Link>

      {/* Menu Trigger */}
      <MenuRoot positioning={{ placement: "bottom-end" }}>
        <MenuTrigger asChild>
          <IconButton 
            size="xs" 
            variant="ghost" 
            color="blue.500"
            _hover={{ bg: "blue.50" }}
            borderLeftRadius={0}
            ml="-1px"
            borderLeft="1px solid"
            borderColor="blue.100"
          >
            <LuChevronDown />
          </IconButton>
        </MenuTrigger>
        <MenuContent minW="180px">
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
    </HStack>
  );
};

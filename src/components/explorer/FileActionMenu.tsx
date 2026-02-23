import { IconButton, Box, Text } from "@chakra-ui/react";
import { MenuTrigger, MenuContent, MenuItem, MenuRoot } from "../ui/menu";
import { LuEllipsis, LuCopy, LuFileJson, LuTerminal } from "react-icons/lu";
import { SUPPORTED_IDES, useAppSettings } from "../../hooks/useAppSettings";

interface FileActionMenuProps {
  filename: string;
  displayName: string;
}

/**
 * Enhanced File Action Menu for the Sidebar.
 * Supports IDE integration and technical copy utilities.
 */
export const FileActionMenu = ({
  filename,
  displayName,
}: FileActionMenuProps) => {
  const { openInEditor } = useAppSettings();

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(filename);
  };

  const handleCopyName = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(displayName);
  };

  return (
    <MenuRoot
      positioning={{
        placement: "bottom-end",
        offset: { mainAxis: 4, crossAxis: 0 },
      }}
    >
      <Box position="relative">
        <MenuTrigger asChild>
          <IconButton
            size="xs"
            variant="ghost"
            color="gray.400"
            _hover={{ bg: "gray.200", color: "gray.700" }}
            title="File Actions"
            aria-label="File Actions"
          >
            <LuEllipsis />
          </IconButton>
        </MenuTrigger>
        <MenuContent minW="180px" zIndex={5000}>
          <Box px={3} py={2} borderBottom="1px solid" borderColor="gray.100">
            <Text
              fontSize="10px"
              fontWeight="bold"
              color="gray.400"
              textTransform="uppercase"
            >
              Open in IDE
            </Text>
          </Box>
          {SUPPORTED_IDES.map((ide) => (
            <MenuItem
              key={ide.id}
              value={ide.id}
              onClick={(e) => {
                e.stopPropagation();
                openInEditor(filename, ide.id);
              }}
            >
              <LuTerminal size={14} style={{ marginRight: "8px" }} />
              {ide.name}
            </MenuItem>
          ))}

          <Box px={3} py={2} borderTop="1px solid" borderColor="gray.100">
            <Text
              fontSize="10px"
              fontWeight="bold"
              color="gray.400"
              textTransform="uppercase"
            >
              Utilities
            </Text>
          </Box>
          <MenuItem value="copy-path" onClick={handleCopyPath}>
            <LuCopy size={14} style={{ marginRight: "8px" }} />
            Copy Path
          </MenuItem>
          <MenuItem value="copy-name" onClick={handleCopyName}>
            <LuFileJson size={14} style={{ marginRight: "8px" }} />
            Copy Name
          </MenuItem>
        </MenuContent>
      </Box>
    </MenuRoot>
  );
};

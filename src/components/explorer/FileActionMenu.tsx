import { IconButton, Box, Text, HStack, Badge } from "@chakra-ui/react";
import { MenuTrigger, MenuContent, MenuItem, MenuRoot } from "../ui/menu";
import {
  LuEllipsis,
  LuCopy,
  LuFileJson,
  LuPencil,
  LuCode,
  LuZap,
} from "react-icons/lu";
import { SUPPORTED_IDES, useAppSettings } from "../../hooks/useAppSettings";

interface FileActionMenuProps {
  filename: string;
  displayName: string;
  /** Called when user clicks "Edit Tokens" — passes the browser URL path of the file */
  onEditTokens?: (filePath: string) => void;
}

// Icon map per IDE id
const IDE_ICONS: Record<string, React.ReactNode> = {
  antigravity: <LuZap size={13} />,
  vscode: <LuCode size={13} />,
};

/**
 * File Action Menu in the Sidebar.
 * - "Edit Tokens" → filters the token tree to this file (Q2)
 * - "Open in IDE" → AntiGravity / VS Code (Q3, slim)
 * - Utilities → Copy Path / Copy Name
 */
export const FileActionMenu = ({
  filename,
  displayName,
  onEditTokens,
}: FileActionMenuProps) => {
  const { settings, openInEditor, updateSettings } = useAppSettings();

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(filename);
  };

  const handleCopyName = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(displayName);
  };

  const handleOpenIde = (e: React.MouseEvent, ideId: string) => {
    e.stopPropagation();
    updateSettings({ preferredIde: ideId });
    openInEditor(filename, ideId);
  };

  const isFile = filename.endsWith(".json");

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

        <MenuContent minW="190px" zIndex={5000}>
          {/* File name header */}
          <Box px={3} py={2} borderBottom="1px solid" borderColor="gray.100">
            <Text
              fontSize="10px"
              fontWeight="bold"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wider"
              truncate
            >
              {displayName}
            </Text>
          </Box>

          {/* Q2: Edit Tokens — only for JSON files */}
          {isFile && onEditTokens && (
            <MenuItem
              value="edit-tokens"
              onClick={(e) => {
                e.stopPropagation();
                onEditTokens(filename);
              }}
            >
              <HStack gap={2} flex={1}>
                <LuPencil size={13} />
                <Text fontSize="xs" fontWeight="600">
                  Edit Tokens
                </Text>
                <Badge
                  size="xs"
                  colorPalette="blue"
                  variant="subtle"
                  ml="auto"
                  fontSize="9px"
                >
                  inline
                </Badge>
              </HStack>
            </MenuItem>
          )}

          {/* Q3: Open in IDE — slim, 2 options, star = preferred */}
          <Box px={3} pt={2} pb={1}>
            <Text
              fontSize="9px"
              fontWeight="bold"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Open in
            </Text>
          </Box>

          {SUPPORTED_IDES.map((ide) => {
            const isPreferred = settings.preferredIde === ide.id;
            return (
              <MenuItem
                key={ide.id}
                value={ide.id}
                onClick={(e) => handleOpenIde(e, ide.id)}
              >
                <HStack gap={2} flex={1}>
                  <Box color={isPreferred ? "blue.500" : "gray.500"}>
                    {IDE_ICONS[ide.id] ?? <LuCode size={13} />}
                  </Box>
                  <Text
                    fontSize="xs"
                    fontWeight={isPreferred ? "700" : "500"}
                    color={isPreferred ? "blue.600" : "gray.700"}
                  >
                    {ide.name}
                  </Text>
                  {isPreferred && (
                    <Badge
                      size="xs"
                      colorPalette="blue"
                      variant="subtle"
                      ml="auto"
                      fontSize="9px"
                    >
                      default
                    </Badge>
                  )}
                </HStack>
              </MenuItem>
            );
          })}

          {/* Utilities */}
          <Box
            px={3}
            pt={2}
            pb={1}
            borderTop="1px solid"
            borderColor="gray.100"
            mt={1}
          >
            <Text
              fontSize="9px"
              fontWeight="bold"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Utilities
            </Text>
          </Box>

          <MenuItem value="copy-path" onClick={handleCopyPath}>
            <HStack gap={2}>
              <LuCopy size={13} />
              <Text fontSize="xs">Copy Path</Text>
            </HStack>
          </MenuItem>

          <MenuItem value="copy-name" onClick={handleCopyName}>
            <HStack gap={2}>
              <LuFileJson size={13} />
              <Text fontSize="xs">Copy Name</Text>
            </HStack>
          </MenuItem>
        </MenuContent>
      </Box>
    </MenuRoot>
  );
};

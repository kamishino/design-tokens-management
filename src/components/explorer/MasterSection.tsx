import { Box, Text, VStack, Heading, Badge, HStack } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import type { IconType } from "react-icons";
import { Button } from "../ui/button";
import { TokenTable } from "../docs/TokenTable";
import type { TokenDoc } from "../../utils/token-parser";

interface MasterSectionProps {
  id?: string;
  title: string;
  icon: IconType;
  count: number;
  tokens: TokenDoc[];
  color: string;
  onHover: (
    token: TokenDoc | null,
    pos: { x: number; y: number } | null,
  ) => void;
  editMode: boolean;
  onCreate: () => void;
  onEdit?: (token: TokenDoc) => void;
  onDelete?: (token: TokenDoc) => void;
}

export const MasterSection = ({
  id,
  title,
  icon: Icon,
  count,
  tokens,
  color,
  onHover,
  editMode,
  onCreate,
  onEdit,
  onDelete,
}: MasterSectionProps) => {
  if (tokens.length === 0) return null;

  return (
    <VStack id={id} align="stretch" gap={4} mb={16} scrollMarginTop="80px">
      <HStack
        position="sticky"
        top="60px"
        zIndex={10}
        py={3}
        bg="white"
        justify="space-between"
        borderBottom="2px solid"
        borderColor={`${color}.200`}
      >
        <HStack gap={3}>
          <Box
            p={2}
            bg={`${color}.500`}
            borderRadius="lg"
            color="white"
            boxShadow="md"
          >
            <Icon size={20} />
          </Box>
          <VStack align="start" gap={0}>
            <Heading
              size="sm"
              textTransform="uppercase"
              letterSpacing="wider"
              color="gray.800"
            >
              {title}
            </Heading>
            <Text fontSize="11px" color={`${color}.600`} fontWeight="bold">
              {count} {count === 1 ? "token" : "tokens"} mapped
            </Text>
          </VStack>
        </HStack>
        <HStack gap={3}>
          {editMode && (
            <Button
              size="xs"
              variant="subtle"
              colorPalette={color}
              onClick={onCreate}
              gap={1.5}
            >
              <LuPlus size={14} /> Add Token
            </Button>
          )}
          <Badge
            colorScheme={color}
            variant="solid"
            fontSize="10px"
            px={3}
            py={0.5}
            borderRadius="full"
          >
            {title === "Semantic" ? "Application Layer" : "Foundation Layer"}
          </Badge>
        </HStack>
      </HStack>

      <TokenTable
        tokens={tokens}
        onHover={onHover}
        showSource={true}
        editMode={editMode}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </VStack>
  );
};

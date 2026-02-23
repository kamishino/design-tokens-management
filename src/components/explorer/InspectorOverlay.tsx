import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  Portal,
  Clipboard,
} from "@chakra-ui/react";
import { LuCopy, LuCheck } from "react-icons/lu";
import type { TokenDoc } from "../../utils/token-parser";

interface InspectorOverlayProps {
  token: TokenDoc | null;
  pos: { x: number; y: number } | null;
}

/**
 * Inspector Overlay Singleton with Mouse Follow and Copy utility
 */
export const InspectorOverlay = ({ token, pos }: InspectorOverlayProps) => {
  if (!token || !pos) return null;

  const terminalValue =
    typeof token.resolvedValue === "object"
      ? JSON.stringify(token.resolvedValue)
      : String(token.resolvedValue);

  return (
    <Portal>
      <Box
        position="fixed"
        top={`${pos.y - 12}px`}
        left={`${pos.x + 12}px`}
        transform="translateY(-100%)"
        bg="gray.900"
        color="white"
        p={3}
        borderRadius="lg"
        boxShadow="2xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        zIndex={3000}
        maxW="340px"
        pointerEvents="auto"
      >
        <VStack align="start" gap={3}>
          <HStack gap={3} w="full" justify="space-between">
            <HStack gap={3}>
              {token.type === "color" && (
                <Box
                  w="32px"
                  h="32px"
                  bg={
                    typeof token.resolvedValue === "string"
                      ? token.resolvedValue
                      : undefined
                  }
                  borderRadius="md"
                  border="2px solid"
                  borderColor="whiteAlpha.300"
                  boxShadow="inner"
                />
              )}
              <VStack align="start" gap={0}>
                <Text
                  fontSize="9px"
                  fontWeight="bold"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="widest"
                >
                  Terminal Root Value
                </Text>
                <Text
                  fontSize="13px"
                  fontFamily="'Space Mono', monospace"
                  fontWeight="bold"
                  color="blue.300"
                >
                  {terminalValue}
                </Text>
              </VStack>
            </HStack>

            <Clipboard.Root value={terminalValue}>
              <Clipboard.Trigger asChild>
                <IconButton
                  size="xs"
                  variant="subtle"
                  colorScheme="blue"
                  borderRadius="md"
                >
                  <Clipboard.Indicator copied={<LuCheck size={14} />}>
                    <LuCopy size={14} />
                  </Clipboard.Indicator>
                </IconButton>
              </Clipboard.Trigger>
            </Clipboard.Root>
          </HStack>

          <Box h="1px" w="full" bg="whiteAlpha.100" />
          <VStack align="start" gap={1} w="full">
            <Text
              fontSize="9px"
              fontWeight="bold"
              color="gray.500"
              textTransform="uppercase"
            >
              Trace Path
            </Text>
            <Text
              fontSize="10px"
              color="whiteAlpha.600"
              lineClamp={2}
              fontFamily="monospace"
            >
              {token.rawValue}
            </Text>
          </VStack>
        </VStack>
      </Box>
    </Portal>
  );
};

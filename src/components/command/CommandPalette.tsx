import {
  Box,
  Text,
  HStack,
  VStack,
  Input,
  Portal,
  Badge,
} from "@chakra-ui/react";
import { useRef, useEffect } from "react";
import {
  LuSearch,
  LuCornerDownLeft,
  LuArrowUp,
  LuArrowDown,
} from "react-icons/lu";
import type { CommandItem } from "../../hooks/useCommandPalette";

interface CommandPaletteProps {
  isOpen: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  results: CommandItem[];
  selectedIndex: number;
  onClose: () => void;
  onExecute: () => void;
  onMoveSelection: (direction: "up" | "down") => void;
}

const categoryLabel: Record<string, string> = {
  action: "Actions",
  token: "Tokens",
  navigation: "Navigation",
};

const categoryColor: Record<string, string> = {
  action: "purple",
  token: "blue",
  navigation: "green",
};

export const CommandPalette = ({
  isOpen,
  query,
  onQueryChange,
  results,
  selectedIndex,
  onClose,
  onExecute,
  onMoveSelection,
}: CommandPaletteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure Portal is mounted
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector("[data-selected='true']");
    selected?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        onMoveSelection("down");
        break;
      case "ArrowUp":
        e.preventDefault();
        onMoveSelection("up");
        break;
      case "Enter":
        e.preventDefault();
        onExecute();
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Group results by category
  const grouped = results.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, CommandItem[]>,
  );

  let globalIndex = -1;

  return (
    <Portal>
      {/* Backdrop */}
      <Box
        position="fixed"
        inset={0}
        bg="blackAlpha.500"
        backdropFilter="blur(4px)"
        zIndex={5000}
        onClick={onClose}
      />

      {/* Palette */}
      <Box
        position="fixed"
        top="20%"
        left="50%"
        transform="translateX(-50%)"
        w="full"
        maxW="560px"
        zIndex={5001}
        bg="white"
        borderRadius="xl"
        boxShadow="0 25px 60px -12px rgba(0,0,0,0.4)"
        border="1px solid"
        borderColor="gray.200"
        overflow="hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <HStack
          px={4}
          py={3}
          gap={3}
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <LuSearch size={16} color="var(--chakra-colors-gray-400)" />
          <Input
            ref={inputRef}
            placeholder="Search tokens, actions…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            variant="flushed"
            fontSize="15px"
            fontWeight="500"
            _placeholder={{ color: "gray.400" }}
          />
          <Badge
            fontSize="9px"
            px={1.5}
            py={0.5}
            borderRadius="md"
            bg="gray.100"
            color="gray.500"
            fontWeight="bold"
            whiteSpace="nowrap"
          >
            ESC
          </Badge>
        </HStack>

        {/* Results */}
        <Box ref={listRef} maxH="360px" overflowY="auto" py={1}>
          {results.length === 0 ? (
            <VStack py={8} gap={1}>
              <Text fontSize="sm" color="gray.400" fontWeight="500">
                {query.length > 0
                  ? "No results found"
                  : "Type to search tokens..."}
              </Text>
              {query.length === 1 && (
                <Text fontSize="xs" color="gray.300">
                  Type at least 2 characters for token search
                </Text>
              )}
            </VStack>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <Box key={category}>
                {/* Category Header */}
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  px={4}
                  pt={2}
                  pb={1}
                >
                  {categoryLabel[category] || category}
                </Text>

                {/* Items */}
                {items.map((item) => {
                  globalIndex++;
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <HStack
                      key={item.id}
                      data-selected={isSelected}
                      px={4}
                      py={2}
                      gap={3}
                      cursor="pointer"
                      bg={isSelected ? "blue.50" : "transparent"}
                      borderLeft="2px solid"
                      borderColor={isSelected ? "blue.400" : "transparent"}
                      _hover={{ bg: isSelected ? "blue.50" : "gray.50" }}
                      transition="all 0.1s"
                      onClick={() => item.action()}
                    >
                      {/* Icon / Swatch */}
                      {item.swatch ? (
                        <Box
                          w="16px"
                          h="16px"
                          minW="16px"
                          borderRadius="3px"
                          bg={item.swatch}
                          border="1px solid"
                          borderColor="blackAlpha.200"
                        />
                      ) : item.icon ? (
                        <Text fontSize="14px" minW="16px" textAlign="center">
                          {item.icon}
                        </Text>
                      ) : (
                        <Badge
                          size="xs"
                          colorPalette={categoryColor[item.category]}
                          variant="subtle"
                          fontSize="8px"
                          borderRadius="sm"
                          minW="16px"
                          textAlign="center"
                        >
                          T
                        </Badge>
                      )}

                      {/* Content */}
                      <VStack align="start" gap={0} flex={1} minW={0}>
                        <Text
                          fontSize="13px"
                          fontWeight={isSelected ? "600" : "400"}
                          color={isSelected ? "gray.800" : "gray.700"}
                          truncate
                          fontFamily={
                            item.category === "token"
                              ? "'Space Mono', monospace"
                              : "inherit"
                          }
                        >
                          {item.label}
                        </Text>
                        {item.description && (
                          <Text fontSize="11px" color="gray.400" truncate>
                            {item.description}
                          </Text>
                        )}
                      </VStack>

                      {/* Keyboard hint */}
                      {isSelected && (
                        <Badge
                          fontSize="9px"
                          px={1}
                          borderRadius="sm"
                          bg="gray.100"
                          color="gray.500"
                        >
                          <LuCornerDownLeft size={10} />
                        </Badge>
                      )}
                    </HStack>
                  );
                })}
              </Box>
            ))
          )}
        </Box>

        {/* Footer hints */}
        <HStack
          px={4}
          py={2}
          gap={4}
          borderTop="1px solid"
          borderColor="gray.100"
          bg="gray.50/80"
        >
          <HStack gap={1}>
            <Badge
              fontSize="8px"
              px={1}
              borderRadius="sm"
              bg="gray.200"
              color="gray.600"
            >
              <LuArrowUp size={8} />
            </Badge>
            <Badge
              fontSize="8px"
              px={1}
              borderRadius="sm"
              bg="gray.200"
              color="gray.600"
            >
              <LuArrowDown size={8} />
            </Badge>
            <Text fontSize="10px" color="gray.400">
              navigate
            </Text>
          </HStack>
          <HStack gap={1}>
            <Badge
              fontSize="8px"
              px={1}
              borderRadius="sm"
              bg="gray.200"
              color="gray.600"
            >
              ↵
            </Badge>
            <Text fontSize="10px" color="gray.400">
              select
            </Text>
          </HStack>
          <HStack gap={1}>
            <Badge
              fontSize="8px"
              px={1}
              borderRadius="sm"
              bg="gray.200"
              color="gray.600"
            >
              esc
            </Badge>
            <Text fontSize="10px" color="gray.400">
              close
            </Text>
          </HStack>
        </HStack>
      </Box>
    </Portal>
  );
};

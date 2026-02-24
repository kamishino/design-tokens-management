import { Box, Input, VStack, Text, HStack } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import type { TokenDoc } from "../../utils/token-parser";

interface TokenReferenceInputProps {
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  globalTokens: TokenDoc[];
  placeholder?: string;
  autoFocus?: boolean;
}

export const TokenReferenceInput = ({
  value,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  globalTokens,
  placeholder,
  autoFocus,
}: TokenReferenceInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract query text when user starts typing `{`
  const queryMatch = value.match(/\{([^}]*)$/);
  const query = queryMatch ? queryMatch[1].toLowerCase() : null;

  const suggestions =
    query !== null
      ? globalTokens
          .filter(
            (t) =>
              t.path.join(".").toLowerCase().includes(query) ||
              t.name.toLowerCase().includes(query) ||
              t.value.toString().toLowerCase().includes(query),
          )
          .slice(0, 15) // Limit to 15 suggestions
      : [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (token: TokenDoc) => {
    if (queryMatch) {
      const start = value.substring(0, queryMatch.index);
      const insert = `{${token.path.join(".")}}`;
      onChange(start + insert);
      setIsOpen(false);
    }
  };

  const handleInternalKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "Enter") onBlur?.();
      onKeyDown?.(e);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[focusedIndex]) {
        handleSelect(suggestions[focusedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else {
      onKeyDown?.(e);
    }
  };

  return (
    <Box position="relative" w="full" ref={containerRef}>
      <Input
        size="sm"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          const newVal = e.target.value;
          const q = newVal.match(/\{([^}]*)$/);
          if (q) {
            setIsOpen(true);
            setFocusedIndex(0);
          } else {
            setIsOpen(false);
          }
        }}
        onKeyDown={handleInternalKeyDown}
        onFocus={() => {
          onFocus?.();
          if (query !== null && suggestions.length > 0) setIsOpen(true);
        }}
        onBlur={() => {
          // Delay blur slightly so clicks on dropdown items can register first
          setTimeout(() => onBlur?.(), 150);
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        fontFamily="monospace"
        fontSize="xs"
      />

      {isOpen && suggestions.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={1}
          maxH="200px"
          overflowY="auto"
          bg="white"
          boxShadow="md"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
          zIndex={1400} // High z-index to hover over other fields
        >
          <VStack align="stretch" gap={0}>
            {suggestions.map((token, index) => {
              const isSelected = index === focusedIndex;
              return (
                <Box
                  key={token.id}
                  px={3}
                  py={1.5}
                  bg={isSelected ? "blue.50" : "transparent"}
                  cursor="pointer"
                  _hover={{ bg: "blue.50" }}
                  onMouseDown={(e) => {
                    // Prevent input blur before onClick fires
                    e.preventDefault();
                  }}
                  onClick={() => handleSelect(token)}
                >
                  <HStack justify="space-between">
                    <Text
                      fontSize="11px"
                      fontFamily="monospace"
                      fontWeight={isSelected ? "600" : "400"}
                      color={isSelected ? "blue.700" : "gray.700"}
                      truncate
                    >
                      {token.path.join(".")}
                    </Text>
                    {token.type === "color" && (
                      <Box
                        w={3}
                        h={3}
                        borderRadius="sm"
                        bg={token.resolvedValue as string}
                        border="1px solid"
                        borderColor="blackAlpha.200"
                      />
                    )}
                  </HStack>
                  {token.resolvedValue && (
                    <Text fontSize="10px" color="gray.400" truncate>
                      {String(token.resolvedValue)}
                    </Text>
                  )}
                </Box>
              );
            })}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

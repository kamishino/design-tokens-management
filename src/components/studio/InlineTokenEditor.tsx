import { Box, VStack, HStack, Text, Input } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { LuCheck, LuX, LuPencil } from "react-icons/lu";
import { toaster } from "../ui/toaster";
import type { TokenDoc } from "../../utils/token-parser";

interface InlineTokenEditorProps {
  /** The clicked element's bounding rect — used to position the popover */
  anchorRect: DOMRect;
  /** Token names extracted from data-tokens attribute */
  tokenNames: string[];
  /** All loaded tokens */
  globalTokens: TokenDoc[];
  /** Called when applying a value (before persisting) */
  onApplyOverride: (cssVar: string, value: string) => void;
  /** Called when the editor should close */
  onClose: () => void;
}

function tokenNameToCssVar(name: string): string {
  return `--${name.replace(/\./g, "-")}`;
}

export const InlineTokenEditor = ({
  anchorRect,
  tokenNames,
  globalTokens,
  onApplyOverride,
  onClose,
}: InlineTokenEditorProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const token = globalTokens.find((t) => t.id === tokenNames[selectedIndex]);

  useEffect(() => {
    if (token) {
      setValue(
        typeof token.value === "object"
          ? JSON.stringify(token.value)
          : String(token.value),
      );
    }
    inputRef.current?.focus();
  }, [selectedIndex, token]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && !e.shiftKey) handleSave();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleSave = async () => {
    if (!token || !value.trim()) return;
    setIsSaving(true);

    // Apply live preview immediately
    const cssVar = tokenNameToCssVar(token.id);
    onApplyOverride(cssVar, value.trim());

    try {
      const res = await fetch("/api/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetPath: token.sourceFile,
          tokenPath: token.id,
          valueObj: { $value: value.trim(), $type: token.type },
          action: "update",
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        toaster.success({
          title: "Token Saved",
          description: `"${token.id}" updated on disk.`,
        });
        onClose();
      } else {
        const msg =
          (json as { error?: string }).error || `Server error ${res.status}`;
        toaster.error({ title: "Save Failed", description: msg });
      }
    } catch (e) {
      toaster.error({
        title: "Save Failed",
        description: e instanceof Error ? e.message : "Network error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Position the popover below the clicked element, clamped to viewport
  const TOP_OFFSET = 8;
  const WIDTH = 280;
  let left = anchorRect.left;
  let top = anchorRect.bottom + TOP_OFFSET;

  // Clamp right edge
  if (left + WIDTH > window.innerWidth - 12) {
    left = window.innerWidth - WIDTH - 12;
  }
  // Flip above if not enough space below
  if (top + 160 > window.innerHeight) {
    top = anchorRect.top - 160 - TOP_OFFSET;
  }

  return (
    <Box
      position="fixed"
      left={`${left}px`}
      top={`${top}px`}
      w={`${WIDTH}px`}
      bg="white"
      borderRadius="xl"
      boxShadow="0 8px 32px rgba(0,0,0,0.18)"
      border="1px solid"
      borderColor="gray.200"
      zIndex={9000}
      overflow="hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <HStack
        px={3}
        py={2}
        bg="gray.50"
        borderBottom="1px solid"
        borderColor="gray.100"
        gap={2}
      >
        <LuPencil size={11} color="var(--chakra-colors-blue-500)" />
        <Text
          fontSize="10px"
          fontWeight="700"
          color="gray.600"
          flex={1}
          truncate
        >
          Edit Token
        </Text>
        <Box
          as="button"
          onClick={onClose}
          color="gray.400"
          _hover={{ color: "gray.700" }}
          cursor="pointer"
        >
          <LuX size={12} />
        </Box>
      </HStack>

      {/* Token selector (if multiple tokens on element) */}
      {tokenNames.length > 1 && (
        <HStack
          px={3}
          py={1.5}
          gap={1}
          borderBottom="1px solid"
          borderColor="gray.50"
          flexWrap="wrap"
        >
          {tokenNames.map((name, i) => (
            <Box
              key={name}
              as="button"
              px={2}
              py={0.5}
              borderRadius="md"
              fontSize="9px"
              fontWeight="600"
              bg={selectedIndex === i ? "blue.500" : "gray.100"}
              color={selectedIndex === i ? "white" : "gray.600"}
              cursor="pointer"
              onClick={() => setSelectedIndex(i)}
            >
              {name.split(".").pop()}
            </Box>
          ))}
        </HStack>
      )}

      {/* Token info + editor */}
      <VStack align="stretch" gap={0} p={3}>
        {token ? (
          <>
            <Text
              fontSize="9px"
              fontFamily="monospace"
              color="gray.400"
              mb={1}
              truncate
            >
              {token.id}
            </Text>
            <HStack gap={2}>
              {/* Color preview swatch */}
              {token.type === "color" && (
                <Box
                  w="28px"
                  h="28px"
                  borderRadius="md"
                  bg={value}
                  border="1px solid"
                  borderColor="gray.200"
                  flexShrink={0}
                />
              )}
              <Input
                ref={inputRef}
                size="sm"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                fontSize="12px"
                fontFamily="monospace"
                placeholder="New value..."
              />
            </HStack>
          </>
        ) : (
          <Text fontSize="11px" color="gray.400">
            Token &quot;{tokenNames[selectedIndex]}&quot; not found in loaded
            files.
          </Text>
        )}
      </VStack>

      {/* Footer */}
      <HStack px={3} pb={3} gap={2} justify="flex-end">
        <Box
          as="button"
          px={2.5}
          py={1}
          borderRadius="md"
          fontSize="11px"
          fontWeight="600"
          color="gray.500"
          bg="gray.100"
          cursor="pointer"
          _hover={{ bg: "gray.200" }}
          onClick={onClose}
        >
          Cancel
        </Box>
        <Box
          as="button"
          px={2.5}
          py={1}
          borderRadius="md"
          fontSize="11px"
          fontWeight="700"
          color="white"
          bg={isSaving ? "blue.300" : "blue.500"}
          cursor={isSaving ? "wait" : "pointer"}
          _hover={{ bg: "blue.600" }}
          display="flex"
          alignItems="center"
          gap={1}
          onClick={handleSave}
        >
          <LuCheck size={11} />
          {isSaving ? "Saving…" : "Save"}
        </Box>
      </HStack>
    </Box>
  );
};

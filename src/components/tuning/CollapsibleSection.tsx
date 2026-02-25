import { Box, HStack, Text, Badge } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { LuChevronDown } from "react-icons/lu";

interface CollapsibleSectionProps {
  /** Section label shown in the header */
  label: string;
  /** Icon to display next to the label */
  icon?: React.ReactNode;
  /** Number of active overrides in this section — displayed as a badge */
  modifiedCount?: number;
  /** Whether the section is open by default */
  defaultOpen?: boolean;
  /** LocalStorage key to persist collapse state across sessions */
  storageKey?: string;
  children: React.ReactNode;
}

/**
 * CollapsibleSection — A compact, chevron-toggled section wrapper for the Tuning panel.
 * - Persists open/closed state to localStorage (keyed by storageKey)
 * - Shows "N modified" badge when modifiedCount > 0
 * - CSS height:0 / overflow:hidden collapse, no unmount
 */
export const CollapsibleSection = ({
  label,
  icon,
  modifiedCount = 0,
  defaultOpen = true,
  storageKey,
  children,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (!storageKey) return defaultOpen;
    try {
      const saved = localStorage.getItem(`tuning-section:${storageKey}`);
      return saved !== null ? saved === "true" : defaultOpen;
    } catch {
      return defaultOpen;
    }
  });

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(`tuning-section:${storageKey}`, String(isOpen));
    } catch {
      // ignore storage errors
    }
  }, [isOpen, storageKey]);

  const toggle = () => setIsOpen((v) => !v);

  return (
    <Box borderBottom="1px solid" borderColor="gray.50">
      {/* Header row */}
      <HStack
        as="button"
        w="full"
        px={3}
        py={2}
        gap={1.5}
        align="center"
        cursor="pointer"
        onClick={toggle}
        _hover={{ bg: "gray.50" }}
        transition="background 0.1s"
      >
        {/* Chevron */}
        <Box
          color="gray.300"
          flexShrink={0}
          transition="transform 0.15s"
          style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          <LuChevronDown size={12} />
        </Box>

        {/* Icon slot */}
        {icon && (
          <Box color="gray.400" flexShrink={0}>
            {icon}
          </Box>
        )}

        {/* Label */}
        <Text
          flex={1}
          fontSize="9px"
          fontWeight="700"
          color="gray.500"
          textTransform="uppercase"
          letterSpacing="wider"
          textAlign="left"
        >
          {label}
        </Text>

        {/* Modified badge */}
        {modifiedCount > 0 && (
          <Badge
            colorPalette="blue"
            variant="solid"
            fontSize="7px"
            px={1}
            py={0}
            borderRadius="full"
            minW="16px"
            textAlign="center"
          >
            {modifiedCount}
          </Badge>
        )}
      </HStack>

      {/* Content — CSS collapse, never unmounts */}
      <Box
        overflow="hidden"
        maxH={isOpen ? "9999px" : "0px"}
        transition="max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      >
        {children}
      </Box>
    </Box>
  );
};

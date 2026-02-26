/**
 * HealthScoreBadge.tsx
 *
 * Compact, always-visible Design Health badge.
 * Shows score (0–100) as a colored pill + short label.
 * Animated: number ticks up/down via CSS transition on background.
 * Clicking the badge jumps to the Tips tab.
 */
import { Box, Text } from "@chakra-ui/react";

import { LuHeartPulse } from "react-icons/lu";

interface HealthScoreBadgeProps {
  score: number;
  label: string;
  color: string; // Chakra color palette name: "green" | "blue" | "orange" | "red"
  criticalCount: number;
  warningCount: number;
  onClick?: () => void;
}

const COLOR_PALETTES: Record<
  string,
  { bg: string; text: string; border: string; pulse: string }
> = {
  green: {
    bg: "var(--chakra-colors-green-50)",
    text: "var(--chakra-colors-green-700)",
    border: "var(--chakra-colors-green-200)",
    pulse: "var(--chakra-colors-green-400)",
  },
  blue: {
    bg: "var(--chakra-colors-blue-50)",
    text: "var(--chakra-colors-blue-700)",
    border: "var(--chakra-colors-blue-200)",
    pulse: "var(--chakra-colors-blue-400)",
  },
  orange: {
    bg: "var(--chakra-colors-orange-50)",
    text: "var(--chakra-colors-orange-700)",
    border: "var(--chakra-colors-orange-200)",
    pulse: "var(--chakra-colors-orange-400)",
  },
  red: {
    bg: "var(--chakra-colors-red-50)",
    text: "var(--chakra-colors-red-700)",
    border: "var(--chakra-colors-red-200)",
    pulse: "var(--chakra-colors-red-400)",
  },
};

export const HealthScoreBadge = ({
  score,
  label,
  color,
  criticalCount,
  warningCount,
  onClick,
}: HealthScoreBadgeProps) => {
  const palette = COLOR_PALETTES[color] ?? COLOR_PALETTES.blue;
  const hasIssues = criticalCount > 0 || warningCount > 0;

  return (
    <Box
      as={onClick ? "button" : "div"}
      display="inline-flex"
      alignItems="center"
      gap={1}
      px={2}
      py={0.5}
      borderRadius="full"
      border="1px solid"
      borderColor={palette.border}
      bg={palette.bg}
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.2s"
      _hover={onClick ? { opacity: 0.85, transform: "scale(1.02)" } : {}}
      onClick={onClick}
      title={`Design Health Score: ${score}/100 — ${label}${hasIssues ? `. ${criticalCount} error(s), ${warningCount} warning(s). Click to view.` : ""}`}
      flexShrink={0}
    >
      {/* Pulse icon */}
      <LuHeartPulse size={9} color={palette.pulse} style={{ flexShrink: 0 }} />

      {/* Score number */}
      <Text
        fontSize="8px"
        fontWeight="800"
        color={palette.text}
        fontFamily="'Space Mono', monospace"
        lineHeight={1}
        style={{ transition: "color 0.3s" }}
      >
        {score}
      </Text>

      {/* Divider */}
      <Box w="1px" h="8px" bg={palette.border} />

      {/* Label */}
      <Text fontSize="8px" fontWeight="600" color={palette.text} lineHeight={1}>
        {label}
      </Text>

      {/* Issue count chips */}
      {criticalCount > 0 && (
        <Box
          px={1}
          borderRadius="sm"
          bg="red.400"
          fontSize="7px"
          fontWeight="700"
          color="white"
          lineHeight="14px"
        >
          {criticalCount}
        </Box>
      )}
      {warningCount > 0 && (
        <Box
          px={1}
          borderRadius="sm"
          bg="orange.400"
          fontSize="7px"
          fontWeight="700"
          color="white"
          lineHeight="14px"
        >
          {warningCount}
        </Box>
      )}
    </Box>
  );
};

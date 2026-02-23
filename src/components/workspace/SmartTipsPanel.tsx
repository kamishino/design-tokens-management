/**
 * SmartTipsPanel (Phase L)
 *
 * On-demand "Analyze" button → runs design rules → shows suggestions
 * with 1-click apply, severity badges, and Design Health Score.
 */
import { Box, VStack, HStack, Text, Badge, IconButton } from "@chakra-ui/react";
import { useState, useCallback } from "react";
import {
  LuScan,
  LuCheck,
  LuTriangleAlert,
  LuInfo,
  LuCircleAlert,
  LuSparkles,
  LuWand,
} from "react-icons/lu";
import {
  analyzeDesign,
  computeHealthScore,
  getHealthLabel,
  type AnalysisContext,
  type Suggestion,
} from "../../utils/design-rules";
import { Button } from "../ui/button";

interface SmartTipsPanelProps {
  context: AnalysisContext;
  onApplyFix: (variable: string, value: string, label: string) => void;
}

export const SmartTipsPanel = ({
  context,
  onApplyFix,
}: SmartTipsPanelProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const runAnalysis = useCallback(() => {
    const results = analyzeDesign(context);
    setSuggestions(results);
    setScore(computeHealthScore(results));
  }, [context]);

  const fixAll = useCallback(() => {
    if (!suggestions) return;
    const fixable = suggestions.filter((s) => s.fix);
    for (const s of fixable) {
      if (s.fix) {
        onApplyFix(s.fix.variable, s.fix.value, `Fix: ${s.title}`);
      }
    }
    // Re-run analysis after fixes
    setTimeout(runAnalysis, 100);
  }, [suggestions, onApplyFix, runAnalysis]);

  const fixCount = suggestions?.filter((s) => s.fix).length ?? 0;

  return (
    <Box p={3} borderBottom="1px solid" borderColor="gray.50">
      <HStack gap={1.5} mb={3} justify="space-between">
        <HStack gap={1.5}>
          <LuSparkles size={12} color="var(--chakra-colors-gray-400)" />
          <Text
            fontSize="9px"
            fontWeight="700"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Smart Tips
          </Text>
        </HStack>

        {/* Score badge */}
        {score !== null && (
          <Badge
            colorPalette={getHealthLabel(score).color}
            variant="subtle"
            fontSize="8px"
            px={1.5}
            py={0}
            borderRadius="full"
          >
            {score}/100 — {getHealthLabel(score).label}
          </Badge>
        )}
      </HStack>

      {/* Analyze button */}
      {suggestions === null ? (
        <Button size="xs" w="full" variant="outline" onClick={runAnalysis}>
          <LuScan size={12} />
          <Text ml={1}>Analyze Design</Text>
        </Button>
      ) : (
        <VStack align="stretch" gap={2}>
          {/* Action bar */}
          <HStack justify="space-between">
            <Button size="xs" variant="ghost" onClick={runAnalysis}>
              <LuScan size={10} />
              <Text ml={1} fontSize="10px">
                Re-analyze
              </Text>
            </Button>
            {fixCount > 0 && (
              <Button
                size="xs"
                variant="solid"
                colorPalette="blue"
                onClick={fixAll}
              >
                <LuWand size={10} />
                <Text ml={1} fontSize="10px">
                  Fix All ({fixCount})
                </Text>
              </Button>
            )}
          </HStack>

          {/* Results */}
          {suggestions.length === 0 ? (
            <HStack
              gap={2}
              p={3}
              bg="green.50"
              borderRadius="md"
              border="1px solid"
              borderColor="green.100"
            >
              <LuCheck size={14} color="var(--chakra-colors-green-500)" />
              <Text fontSize="11px" color="green.700" fontWeight="500">
                All checks passed! Your design looks great.
              </Text>
            </HStack>
          ) : (
            <VStack align="stretch" gap={1.5}>
              {suggestions.map((s, i) => (
                <SuggestionCard
                  key={`${s.ruleId}-${i}`}
                  suggestion={s}
                  onApply={
                    s.fix
                      ? () =>
                          onApplyFix(
                            s.fix!.variable,
                            s.fix!.value,
                            `Fix: ${s.title}`,
                          )
                      : undefined
                  }
                />
              ))}
            </VStack>
          )}
        </VStack>
      )}
    </Box>
  );
};

// ─── Suggestion Card ──────────────────────────────────────────

function SuggestionCard({
  suggestion,
  onApply,
}: {
  suggestion: Suggestion;
  onApply?: () => void;
}) {
  const icons = {
    error: <LuCircleAlert size={12} color="var(--chakra-colors-red-500)" />,
    warning: (
      <LuTriangleAlert size={12} color="var(--chakra-colors-orange-500)" />
    ),
    info: <LuInfo size={12} color="var(--chakra-colors-blue-500)" />,
  };

  const borderColors = {
    error: "red.100",
    warning: "orange.100",
    info: "blue.50",
  };

  const bgColors = {
    error: "red.50",
    warning: "orange.50",
    info: "blue.50",
  };

  return (
    <Box
      p={2}
      borderRadius="md"
      border="1px solid"
      borderColor={borderColors[suggestion.severity]}
      bg={bgColors[suggestion.severity]}
    >
      <HStack justify="space-between" align="start">
        <HStack gap={1.5} align="start" flex={1}>
          <Box mt="2px">{icons[suggestion.severity]}</Box>
          <VStack align="start" gap={0.5} flex={1}>
            <Text fontSize="10px" fontWeight="700" color="gray.700">
              {suggestion.title}
            </Text>
            <Text fontSize="9px" color="gray.500" lineHeight="1.4">
              {suggestion.description}
            </Text>
          </VStack>
        </HStack>

        {onApply && (
          <IconButton
            aria-label="Apply fix"
            size="xs"
            variant="ghost"
            colorPalette="green"
            onClick={onApply}
            minW="24px"
            h="24px"
          >
            <LuCheck size={12} />
          </IconButton>
        )}
      </HStack>
    </Box>
  );
}

/**
 * SmartTipsPanel — Analyzer Pro
 *
 * Design System Assistant's deep audit panel (🥇 Best Bet feature).
 * - Auto-runs analysis on mount + when context changes (no manual click needed)
 * - Groups suggestions by category: Accessibility / Color Harmony / Typography / Consistency
 * - Category header with count badge + collapse toggle
 * - "Fix All in Category" CTA per group
 * - Expandable per-card detail with learnMoreUrl
 * - Health Score Overview at the top
 */
import { Box, VStack, HStack, Text, Badge, IconButton } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  LuShieldCheck,
  LuPalette,
  LuType,
  LuRuler,
  LuCheck,
  LuTriangleAlert,
  LuInfo,
  LuCircleAlert,
  LuChevronDown,
  LuWand,
  LuExternalLink,
  LuScan,
} from "react-icons/lu";
import {
  computeHealthScore,
  getHealthLabel,
  type AnalysisContext,
  type RuleCategory,
  type Suggestion,
} from "../../utils/design-rules";
import { Button } from "../ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SmartTipsPanelProps {
  context: AnalysisContext;
  onApplyFix: (variable: string, value: string, label: string) => void;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  RuleCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  accessibility: {
    label: "Accessibility",
    icon: <LuShieldCheck size={11} />,
    color: "red",
  },
  color: {
    label: "Color Harmony",
    icon: <LuPalette size={11} />,
    color: "purple",
  },
  typography: {
    label: "Typography",
    icon: <LuType size={11} />,
    color: "blue",
  },
  consistency: {
    label: "Consistency",
    icon: <LuRuler size={11} />,
    color: "teal",
  },
};

// Render order for categories
const CATEGORY_ORDER: RuleCategory[] = [
  "accessibility",
  "color",
  "typography",
  "consistency",
];

// ─── Main Panel ───────────────────────────────────────────────────────────────

export const SmartTipsPanel = ({
  context,
  onApplyFix,
}: SmartTipsPanelProps) => {
  // Use the shared analysis hook — inherits debouncing, violationsByVar, etc.
  // We replicate context as overrides since SmartTipsPanel receives AnalysisContext directly.
  // To avoid double-analysis, derive suggestions from context here via analyzeDesign.
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<
    Set<RuleCategory>
  >(new Set());

  // Auto-run on mount and when context changes
  useEffect(() => {
    import("../../utils/design-rules").then(({ analyzeDesign }) => {
      try {
        setSuggestions(analyzeDesign(context));
      } catch {
        setSuggestions([]);
      }
    });
  }, [context]);

  const score = suggestions ? computeHealthScore(suggestions) : null;
  const { label: scoreLabel, color: scoreColor } =
    score !== null ? getHealthLabel(score) : { label: "–", color: "gray" };

  const fixAll = (category: RuleCategory) => {
    if (!suggestions) return;
    const fixable = suggestions.filter((s) => s.category === category && s.fix);
    for (const s of fixable) {
      if (s.fix) onApplyFix(s.fix.variable, s.fix.value, `Fix: ${s.title}`);
    }
    // Re-run after applying fixes
    setTimeout(() => {
      import("../../utils/design-rules").then(({ analyzeDesign }) => {
        setSuggestions(analyzeDesign(context));
      });
    }, 100);
  };

  const toggleCategory = (cat: RuleCategory) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const rerun = () => {
    import("../../utils/design-rules").then(({ analyzeDesign }) => {
      setSuggestions(analyzeDesign(context));
    });
  };

  return (
    <VStack align="stretch" gap={0} h="full" overflow="hidden">
      {/* Header + score overview */}
      <Box
        px={3}
        py={2}
        borderBottom="1px solid"
        borderColor="gray.100"
        flexShrink={0}
      >
        <HStack justify="space-between" mb={score !== null ? 2 : 0}>
          <Text
            fontSize="9px"
            fontWeight="700"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Design Analyzer
          </Text>
          <Button size="xs" variant="ghost" onClick={rerun} h="20px">
            <LuScan size={9} />
            <Text fontSize="8px" ml={0.5}>
              Re-run
            </Text>
          </Button>
        </HStack>

        {/* Health score overview */}
        {score !== null && (
          <HStack
            gap={2}
            p={2}
            borderRadius="md"
            bg={`${scoreColor}.50`}
            border="1px solid"
            borderColor={`${scoreColor}.100`}
          >
            {/* Score ring */}
            <Box
              w="36px"
              h="36px"
              borderRadius="full"
              bg={`${scoreColor}.500`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Text
                fontSize="11px"
                fontWeight="800"
                color="white"
                fontFamily="monospace"
                lineHeight={1}
              >
                {score}
              </Text>
            </Box>
            <VStack align="start" gap={0} flex={1}>
              <Text
                fontSize="10px"
                fontWeight="700"
                color={`${scoreColor}.700`}
              >
                {scoreLabel}
              </Text>
              <Text fontSize="8px" color={`${scoreColor}.500`}>
                {suggestions?.filter((s) => s.severity === "error").length ?? 0}{" "}
                critical ·{" "}
                {suggestions?.filter((s) => s.severity === "warning").length ??
                  0}{" "}
                warnings
              </Text>
            </VStack>
          </HStack>
        )}

        {suggestions === null && (
          <Text fontSize="9px" color="gray.400">
            Analyzing…
          </Text>
        )}
      </Box>

      {/* Category groups */}
      <Box flex={1} overflowY="auto">
        {suggestions !== null &&
          CATEGORY_ORDER.map((cat) => {
            const catSuggestions = suggestions.filter(
              (s) => s.category === cat,
            );
            if (catSuggestions.length === 0) return null;

            const config = CATEGORY_CONFIG[cat];
            const isCollapsed = collapsedCategories.has(cat);
            const fixableCount = catSuggestions.filter((s) => s.fix).length;
            const critCount = catSuggestions.filter(
              (s) => s.severity === "error",
            ).length;

            return (
              <Box key={cat} borderBottom="1px solid" borderColor="gray.50">
                {/* Category header */}
                <HStack
                  as="button"
                  w="full"
                  px={3}
                  py={1.5}
                  gap={1.5}
                  align="center"
                  cursor="pointer"
                  onClick={() => toggleCategory(cat)}
                  _hover={{ bg: "gray.50" }}
                  transition="background 0.1s"
                >
                  <Box color={`${config.color}.400`} flexShrink={0}>
                    {config.icon}
                  </Box>

                  <Text
                    flex={1}
                    fontSize="9px"
                    fontWeight="700"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    textAlign="left"
                  >
                    {config.label}
                  </Text>

                  {/* Issue count */}
                  <Badge
                    colorPalette={critCount > 0 ? "red" : config.color}
                    variant="solid"
                    fontSize="7px"
                    px={1.5}
                    py={0}
                    borderRadius="full"
                    minW="18px"
                    textAlign="center"
                  >
                    {catSuggestions.length}
                  </Badge>

                  {/* Fix All CTA */}
                  {fixableCount > 0 && !isCollapsed && (
                    <Box
                      as="button"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        fixAll(cat);
                      }}
                      display="flex"
                      alignItems="center"
                      gap={0.5}
                      px={1.5}
                      py={0.5}
                      borderRadius="sm"
                      bg={`${config.color}.100`}
                      color={`${config.color}.700`}
                      fontSize="7px"
                      fontWeight="700"
                      cursor="pointer"
                      _hover={{ bg: `${config.color}.200` }}
                      transition="all 0.1s"
                    >
                      <LuWand size={8} />
                      Fix {fixableCount}
                    </Box>
                  )}

                  {/* Chevron */}
                  <Box
                    color="gray.300"
                    flexShrink={0}
                    transition="transform 0.15s"
                    style={{
                      transform: isCollapsed
                        ? "rotate(-90deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    <LuChevronDown size={11} />
                  </Box>
                </HStack>

                {/* Suggestion cards */}
                {!isCollapsed && (
                  <VStack align="stretch" gap={1.5} px={3} pb={2}>
                    {catSuggestions.map((s, i) => (
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
              </Box>
            );
          })}

        {/* All clear */}
        {suggestions !== null && suggestions.length === 0 && (
          <HStack
            gap={2}
            p={3}
            m={3}
            bg="green.50"
            borderRadius="md"
            border="1px solid"
            borderColor="green.100"
          >
            <LuCheck size={14} color="var(--chakra-colors-green-500)" />
            <Text fontSize="11px" color="green.700" fontWeight="500">
              All checks passed! Perfect design system. 🎉
            </Text>
          </HStack>
        )}
      </Box>
    </VStack>
  );
};

// ─── Suggestion Card ──────────────────────────────────────────────────────────

function SuggestionCard({
  suggestion,
  onApply,
}: {
  suggestion: Suggestion;
  onApply?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const icons = {
    error: <LuCircleAlert size={11} color="var(--chakra-colors-red-500)" />,
    warning: (
      <LuTriangleAlert size={11} color="var(--chakra-colors-orange-500)" />
    ),
    info: <LuInfo size={11} color="var(--chakra-colors-blue-400)" />,
  };

  const borderColors = {
    error: "red.100",
    warning: "orange.100",
    info: "blue.50",
  };

  const bgColors = {
    error: "red.50",
    warning: "orange.50",
    info: "gray.50",
  };

  return (
    <Box
      borderRadius="md"
      border="1px solid"
      borderColor={borderColors[suggestion.severity]}
      bg={bgColors[suggestion.severity]}
      overflow="hidden"
    >
      {/* Main row */}
      <HStack
        as="button"
        w="full"
        p={2}
        gap={1.5}
        align="start"
        cursor="pointer"
        onClick={() => setExpanded((v) => !v)}
        textAlign="left"
      >
        <Box mt="1px" flexShrink={0}>
          {icons[suggestion.severity]}
        </Box>
        <VStack align="start" gap={0.5} flex={1}>
          <Text fontSize="10px" fontWeight="700" color="gray.700">
            {suggestion.title}
          </Text>
          {!expanded && (
            <Text
              fontSize="8px"
              color="gray.500"
              lineHeight="1.4"
              overflow="hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {suggestion.description}
            </Text>
          )}
        </VStack>

        {/* Apply fix button */}
        {onApply && (
          <IconButton
            aria-label="Apply fix"
            size="xs"
            variant="ghost"
            colorPalette="green"
            onClick={(e) => {
              e.stopPropagation();
              onApply();
            }}
            minW="22px"
            h="22px"
            flexShrink={0}
            title="Apply auto-fix"
          >
            <LuCheck size={11} />
          </IconButton>
        )}
      </HStack>

      {/* Expanded detail */}
      {expanded && (
        <Box
          px={2}
          pb={2}
          pt={0}
          borderTop="1px solid"
          borderColor={borderColors[suggestion.severity]}
        >
          <Text fontSize="8.5px" color="gray.600" lineHeight="1.5" mb={1.5}>
            {suggestion.description}
          </Text>
          {suggestion.learnMoreUrl && (
            <a
              href={suggestion.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "8px",
                color: "var(--chakra-colors-blue-500)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <LuExternalLink size={9} />
              Learn more
            </a>
          )}
        </Box>
      )}
    </Box>
  );
}

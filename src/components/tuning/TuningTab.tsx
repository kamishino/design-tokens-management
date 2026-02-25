import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { LuUndo2, LuRedo2, LuZoomIn } from "react-icons/lu";

import type { TokenOverrides } from "../../schemas/manifest";
import type { TokenDoc } from "../../utils/token-parser";
import { getPrioritizedTokenMap } from "../../utils/token-graph";

import { ColorsTuning } from "./ColorsTuning";
import { TypographyTuning } from "./TypographyTuning";
import { ArticlePreview } from "./ArticlePreview";
import { SmartTipsPanel } from "../workspace/SmartTipsPanel";
import { prependFont } from "../../utils/fonts";
import { type AnalysisContext } from "../../utils/design-rules";
import { Button } from "../ui/button";

interface TuningTabProps {
  overrides: Record<string, string | number | any>;
  updateOverride: (
    newValues: Record<string, string | number>,
    label?: string,
  ) => void;
  globalTokens: TokenDoc[];
  projectPath: string;
  onReset: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const TuningTab = ({
  overrides,
  updateOverride,
  globalTokens,
  projectPath,
  onReset,
  undo,
  redo,
  canUndo,
  canRedo,
}: TuningTabProps) => {
  const [isPending, startTransition] = useTransition();

  const handleUpdateOverride = useCallback(
    (newValues: Record<string, string | number>, label?: string) => {
      startTransition(() => {
        updateOverride(newValues, label);
      });
    },
    [updateOverride],
  );

  const prioritizedMap = useMemo(() => {
    if (!projectPath || !globalTokens.length)
      return new Map<string, TokenDoc>();
    return getPrioritizedTokenMap(globalTokens, projectPath);
  }, [projectPath, globalTokens]);

  const getEffectiveValue = useCallback(
    (cssVar: string, tokenKey: string, fallback: string) => {
      if (overrides[cssVar] !== undefined) return String(overrides[cssVar]);
      const graphValue = prioritizedMap.get(tokenKey)?.resolvedValue;
      return graphValue !== undefined && graphValue !== null
        ? String(graphValue)
        : fallback;
    },
    [overrides, prioritizedMap],
  );

  const hasOverrides = Object.keys(overrides).length > 0;
  const [tuningSubTab, setTuningSubTab] = useState<
    "colors" | "typography" | "tips"
  >("colors");
  const [uiScale, setUiScale] = useState<number>(1);

  const [scaleSeeds, setScaleSeeds] = useState<Record<string, string>>({});

  const getScaleSeed = useCallback(
    (id: string, currentHex: string) => {
      return scaleSeeds[id] ?? currentHex;
    },
    [scaleSeeds],
  );

  const refreshScaleSeed = useCallback((id: string, hex: string) => {
    setScaleSeeds((prev) => ({ ...prev, [id]: hex }));
  }, []);

  const handleFontSelect = useCallback(
    (
      font: { variable: string; token: string; label: string },
      family: string,
    ) => {
      const currentStack = getEffectiveValue(
        font.variable,
        font.token,
        "Inter, sans-serif",
      );
      const newStack = prependFont(family, currentStack);
      handleUpdateOverride(
        { [font.variable]: newStack },
        `Changed ${font.label} font`,
      );
    },
    [getEffectiveValue, handleUpdateOverride],
  );

  return (
    <VStack align="stretch" gap={0} h="full" overflow="hidden">
      <HStack
        px={2}
        py={1.5}
        gap={0.5}
        borderBottom="1px solid"
        borderColor="gray.100"
        flexShrink={0}
      >
        {(["colors", "typography", "tips"] as const).map((tab) => {
          const labels = {
            colors: "🎨 Colors",
            typography: "🔤 Typography",
            tips: "✨ Tips",
          };
          return (
            <Box
              key={tab}
              as="button"
              px={2.5}
              py={1}
              borderRadius="md"
              fontSize="10px"
              fontWeight="600"
              color={tuningSubTab === tab ? "blue.600" : "gray.400"}
              bg={tuningSubTab === tab ? "blue.50" : "transparent"}
              cursor="pointer"
              _hover={{ bg: tuningSubTab === tab ? "blue.50" : "gray.50" }}
              transition="all 0.1s"
              onClick={() => setTuningSubTab(tab)}
            >
              {labels[tab]}
            </Box>
          );
        })}
        <Box flex={1} />

        <HStack gap={0.5} mr={2} bg="gray.50" p={0.5} borderRadius="sm">
          <LuZoomIn
            size={10}
            color="var(--chakra-colors-gray-400)"
            style={{ marginLeft: "4px", marginRight: "2px" }}
          />
          {[1, 1.25, 1.5].map((scale) => {
            const labels: Record<number, string> = {
              1: "100%",
              1.25: "125%",
              1.5: "150%",
            };
            return (
              <Box
                key={scale}
                as="button"
                px={1.5}
                py={0.5}
                borderRadius="sm"
                fontSize="9px"
                fontWeight="600"
                fontFamily="'Space Mono', monospace"
                color={uiScale === scale ? "blue.600" : "gray.400"}
                bg={uiScale === scale ? "white" : "transparent"}
                boxShadow={uiScale === scale ? "sm" : "none"}
                cursor="pointer"
                _hover={{ bg: uiScale === scale ? "white" : "gray.100" }}
                transition="all 0.1s"
                onClick={() => setUiScale(scale)}
                title={`Scale UI by ${labels[scale]}`}
              >
                {labels[scale]}
              </Box>
            );
          })}
        </HStack>

        {hasOverrides && (
          <HStack gap={0.5}>
            <Box
              as="button"
              p={1}
              borderRadius="sm"
              color={canUndo ? "gray.500" : "gray.200"}
              cursor={canUndo ? "pointer" : "default"}
              onClick={undo}
              _hover={canUndo ? { color: "blue.500" } : {}}
            >
              <LuUndo2 size={11} />
            </Box>
            <Box
              as="button"
              p={1}
              borderRadius="sm"
              color={canRedo ? "gray.500" : "gray.200"}
              cursor={canRedo ? "pointer" : "default"}
              onClick={redo}
              _hover={canRedo ? { color: "blue.500" } : {}}
            >
              <LuRedo2 size={11} />
            </Box>
          </HStack>
        )}
      </HStack>

      <Box
        flex={1}
        overflowY="auto"
        style={{ zoom: uiScale } as any}
        opacity={isPending ? 0.7 : 1}
        transition="opacity 0.2s"
      >
        {tuningSubTab === "colors" && (
          <ColorsTuning
            getEffectiveValue={getEffectiveValue}
            updateOverride={handleUpdateOverride}
            getScaleSeed={getScaleSeed}
            refreshScaleSeed={refreshScaleSeed}
            overrides={overrides}
          />
        )}
        {tuningSubTab === "typography" && (
          <Box position="relative">
            <TypographyTuning
              overrides={overrides}
              getEffectiveValue={getEffectiveValue}
              updateOverride={handleUpdateOverride}
              handleFontSelect={handleFontSelect}
            />
            <Box p={3} mt={4}>
              <Text
                fontSize="9px"
                fontWeight="700"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="wider"
                mb={3}
              >
                Article Preview
              </Text>
              <ArticlePreview
                baseSize={Number(overrides["--font-size-root"]) || 16}
                scaleRatio={Number(overrides["--font-scale-ratio"]) || 1.25}
                headingFont={getEffectiveValue(
                  "--font-family-heading",
                  "font.family.heading",
                  "Inter",
                )}
                bodyFont={getEffectiveValue(
                  "--font-family-base",
                  "font.family.base",
                  "Inter",
                )}
                headingWeight={
                  Number(overrides["--font-weight-heading"]) || 700
                }
                bodyWeight={Number(overrides["--font-weight-body"]) || 400}
                headingLH={Number(overrides["--line-height-heading"]) || 1.2}
                bodyLH={Number(overrides["--line-height-body"]) || 1.5}
                headingLS={Number(overrides["--letter-spacing-heading"]) || 0}
                bodyLS={Number(overrides["--letter-spacing-body"]) || 0}
              />
            </Box>
          </Box>
        )}
        {tuningSubTab === "tips" && (
          <SmartTipsPanel
            context={
              {
                colors: [
                  {
                    id: "primary",
                    variable: "--brand-primary",
                    label: "Primary",
                    token: "brand.primary",
                  },
                  {
                    id: "secondary",
                    variable: "--brand-secondary",
                    label: "Secondary",
                    token: "brand.secondary",
                  },
                  {
                    id: "accent",
                    variable: "--brand-accent",
                    label: "Accent",
                    token: "brand.accent",
                  },
                  {
                    id: "text",
                    variable: "--text-primary",
                    label: "Text",
                    token: "text.primary",
                  },
                  {
                    id: "bg",
                    variable: "--bg-canvas",
                    label: "Background",
                    token: "bg.canvas",
                  },
                ].map((c) => ({
                  variable: c.variable,
                  label: c.label,
                  hex: getEffectiveValue(c.variable, c.token, "#000000"),
                })),
                typography: {
                  baseSize: Number(overrides["--font-size-root"]) || 16,
                  scaleRatio:
                    Number(overrides["--typography-config-scale-ratio"]) ||
                    1.25,
                  lineHeight:
                    Number(overrides["--typography-line-height"]) || 1.5,
                  headingFont: (
                    getEffectiveValue(
                      "--font-family-heading",
                      "font.family.heading",
                      "Inter",
                    ) || "Inter"
                  )
                    .split(",")[0]
                    .replace(/['"]/g, "")
                    .trim(),
                  bodyFont: (
                    getEffectiveValue(
                      "--font-family-base",
                      "font.family.base",
                      "Inter",
                    ) || "Inter"
                  )
                    .split(",")[0]
                    .replace(/['"]/g, "")
                    .trim(),
                  codeFont: (
                    getEffectiveValue(
                      "--font-family-mono",
                      "font.family.mono",
                      "monospace",
                    ) || "monospace"
                  )
                    .split(",")[0]
                    .replace(/['"]/g, "")
                    .trim(),
                },
              } satisfies AnalysisContext
            }
            onApplyFix={(variable, value, label) =>
              handleUpdateOverride({ [variable]: value }, label)
            }
          />
        )}
      </Box>

      {hasOverrides && (
        <Box p={3}>
          <HStack gap={2} mb={2}>
            <Button
              size="xs"
              variant="ghost"
              onClick={undo}
              disabled={!canUndo}
              color="gray.500"
            >
              <LuUndo2 size={12} />
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={redo}
              disabled={!canRedo}
              color="gray.500"
            >
              <LuRedo2 size={12} />
            </Button>
            <Box flex={1} />
            <Button
              size="xs"
              variant="outline"
              onClick={onReset}
              colorPalette="red"
            >
              Reset All
            </Button>
          </HStack>
          <Text fontSize="9px" color="gray.300" textAlign="center">
            {Object.keys(overrides).length} override(s) active
          </Text>
        </Box>
      )}
    </VStack>
  );
};

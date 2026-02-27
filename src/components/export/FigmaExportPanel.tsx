import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Separator,
  Badge,
  Checkbox,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  LuDownload,
  LuClipboard,
  LuCheck,
  LuPackage,
  LuTriangleAlert,
} from "react-icons/lu";
import { Button } from "../ui/button";
import { toaster } from "../ui/toaster";

interface FigmaToken {
  $value: unknown;
  $type: string;
  $description?: string;
}

type FigmaTokenMap = Record<string, FigmaToken>;
type ExportAction = "download" | "copy";
type IntakeStep = 0 | 1 | 2 | 3;

interface FigmaValidationIssue {
  code: string;
  token: string;
  message: string;
}

interface FigmaValidationResponse {
  success: boolean;
  tokens: FigmaTokenMap;
  valid: boolean;
  errors: FigmaValidationIssue[];
  warnings: FigmaValidationIssue[];
  summary: {
    totalTokens: number;
    errorCount: number;
    warningCount: number;
    typeCounts: Record<string, number>;
  };
}

const TYPE_COLORS: Record<string, string> = {
  color: "#3B82F6",
  dimension: "#8B5CF6",
  fontFamilies: "#EC4899",
  fontWeights: "#F59E0B",
  lineHeights: "#10B981",
  spacing: "#F97316",
  borderRadius: "#6366F1",
  other: "#6B7280",
};

export const FigmaExportPanel = () => {
  const [activeStep, setActiveStep] = useState<IntakeStep>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [preview, setPreview] = useState<FigmaTokenMap | null>(null);
  const [validation, setValidation] = useState<FigmaValidationResponse | null>(
    null,
  );
  const [checklist, setChecklist] = useState({
    reviewedWarnings: false,
    mappedCollections: false,
    readyForHandoff: false,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchValidatedExport = async (): Promise<FigmaValidationResponse> => {
    const res = await fetch("/api/validate-figma-export");
    const json = await res.json();
    if (!res.ok) {
      throw new Error(
        (json as { error?: string }).error || "Validation request failed",
      );
    }
    return json as FigmaValidationResponse;
  };

  const executeAction = async (action: ExportAction, tokens: FigmaTokenMap) => {
    if (action === "download") {
      const blob = new Blob([JSON.stringify(tokens, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tokens-figma.json";
      a.click();
      URL.revokeObjectURL(url);

      toaster.success({
        title: "Figma Export Ready",
        description: `${Object.keys(tokens).length} tokens exported as W3C DTCG JSON.`,
      });
      return;
    }
    if (action === "copy") {
      await navigator.clipboard.writeText(JSON.stringify(tokens, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toaster.success({
        title: "Copied to Clipboard",
        description: "Paste into your Figma Variables importer plugin.",
      });
    }
  };

  const hasValidation = Boolean(validation);
  const hasErrors = (validation?.errors.length ?? 0) > 0;
  const hasWarnings = (validation?.warnings.length ?? 0) > 0;
  const warningCheckSatisfied = hasWarnings
    ? checklist.reviewedWarnings
    : hasValidation;
  const readinessComplete =
    warningCheckSatisfied &&
    checklist.mappedCollections &&
    checklist.readyForHandoff;
  const exportLocked = activeStep !== 3 || !hasValidation || hasErrors || !readinessComplete;

  const handleRunValidation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchValidatedExport();
      setValidation(result);
      setPreview(result.tokens);
      setChecklist((prev) => ({
        ...prev,
        reviewedWarnings: result.warnings.length === 0,
      }));
      setActiveStep(1);

      if (result.errors.length > 0) {
        toaster.error({
          title: "Validation Failed",
          description: `${result.errors.length} error(s) must be fixed before export.`,
        });
        return;
      }

      toaster.success({
        title: "Validation Complete",
        description: `${result.summary.totalTokens} token(s) analyzed. Continue to readiness checks.`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toaster.error({ title: "Validation Failed", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: ExportAction) => {
    if (exportLocked) {
      toaster.error({
        title: "Complete Intake Steps",
        description: "Finish validation and readiness checks before exporting.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Final re-validation right before export keeps the JSON handoff deterministic.
      const result = await fetchValidatedExport();
      setValidation(result);
      setPreview(result.tokens);

      if (result.errors.length > 0) {
        setActiveStep(1);
        toaster.error({
          title: "Validation Failed",
          description: `${result.errors.length} error(s) must be fixed before export.`,
        });
        return;
      }

      if (result.warnings.length > 0 && !checklist.reviewedWarnings) {
        setActiveStep(2);
        toaster.error({
          title: "Warnings Need Confirmation",
          description: "Review warnings in Step 3 before exporting.",
        });
        return;
      }

      await executeAction(action, result.tokens);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toaster.error({ title: "Export Failed", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => handleAction("download");
  const handleCopy = () => handleAction("copy");

  const typeSummary = preview
    ? Object.values(preview).reduce<Record<string, number>>((acc, t) => {
        acc[t.$type] = (acc[t.$type] || 0) + 1;
        return acc;
      }, {})
    : null;

  return (
    <VStack align="stretch" gap={6} p={6}>
      {/* Header */}
      <HStack gap={3}>
        <Box p={2} bg="blue.50" borderRadius="lg">
          <LuPackage size={20} color="var(--chakra-colors-blue-500)" />
        </Box>
        <VStack align="start" gap={0}>
          <Heading size="sm">Figma Variables Export</Heading>
          <Text fontSize="xs" color="gray.500">
            W3C DTCG format — compatible with Figma Variables importer plugins
          </Text>
        </VStack>
      </HStack>

      <Separator />

      {/* Guided intake stepper */}
      <Box bg="gray.50" border="1px solid" borderColor="gray.100" borderRadius="lg" p={4}>
        <Text fontSize="xs" fontWeight="700" color="gray.700" mb={2}>
          Guided Token Intake
        </Text>
        <VStack align="stretch" gap={2}>
          {[
            "1. Validate source tokens",
            "2. Review validation output",
            "3. Confirm readiness checklist",
            "4. Export JSON for Figma",
          ].map((step, idx) => {
            const isComplete = idx < activeStep;
            const isCurrent = idx === activeStep;
            return (
              <HStack key={step} justify="space-between">
                <Text
                  fontSize="xs"
                  fontWeight={isCurrent ? "700" : "500"}
                  color={isCurrent ? "blue.700" : isComplete ? "green.700" : "gray.500"}
                >
                  {step}
                </Text>
                <Badge
                  colorPalette={isComplete ? "green" : isCurrent ? "blue" : "gray"}
                  variant="subtle"
                >
                  {isComplete ? "Done" : isCurrent ? "Current" : "Pending"}
                </Badge>
              </HStack>
            );
          })}
        </VStack>
      </Box>

      {/* Step 1 */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="lg" p={4}>
        <VStack align="stretch" gap={3}>
          <Text fontSize="xs" fontWeight="700" color="gray.700">
            Step 1: Validate Source
          </Text>
          <Text fontSize="xs" color="gray.600">
            Run schema, type, and reference checks before any export action.
          </Text>
          <Button
            size="sm"
            colorPalette="blue"
            loading={isLoading}
            onClick={handleRunValidation}
            alignSelf="flex-start"
          >
            Run Intake Validation
          </Button>
        </VStack>
      </Box>

      {/* Step 2 */}
      {hasValidation && (
        <Box border="1px solid" borderColor="gray.200" borderRadius="lg" p={4}>
          <VStack align="stretch" gap={3}>
            <Text fontSize="xs" fontWeight="700" color="gray.700">
              Step 2: Review Results
            </Text>
            <Box
              bg={validation!.valid ? "green.50" : "red.50"}
              borderRadius="lg"
              p={4}
              border="1px solid"
              borderColor={validation!.valid ? "green.100" : "red.200"}
            >
              <VStack align="stretch" gap={2}>
                <HStack justify="space-between">
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color={validation!.valid ? "green.700" : "red.700"}
                  >
                    Validation {validation!.valid ? "Passed" : "Failed"}
                  </Text>
                  <HStack gap={2}>
                    <Badge colorPalette="gray" variant="subtle">
                      {validation!.summary.totalTokens} total
                    </Badge>
                    <Badge colorPalette="red" variant="subtle">
                      {validation!.summary.errorCount} errors
                    </Badge>
                    <Badge colorPalette="yellow" variant="subtle">
                      {validation!.summary.warningCount} warnings
                    </Badge>
                  </HStack>
                </HStack>
                {validation!.errors.length > 0 && (
                  <VStack align="stretch" gap={1}>
                    <Text fontSize="11px" fontWeight="700" color="red.700">
                      Errors
                    </Text>
                    {validation!.errors.slice(0, 5).map((issue, idx) => (
                      <Text
                        key={`${issue.code}-${idx}`}
                        fontSize="11px"
                        color="red.600"
                      >
                        [{issue.code}] {issue.token}: {issue.message}
                      </Text>
                    ))}
                  </VStack>
                )}
                {validation!.warnings.length > 0 && (
                  <VStack align="stretch" gap={1}>
                    <Text fontSize="11px" fontWeight="700" color="orange.700">
                      Warnings
                    </Text>
                    {validation!.warnings.slice(0, 5).map((issue, idx) => (
                      <Text
                        key={`${issue.code}-${idx}`}
                        fontSize="11px"
                        color="orange.700"
                      >
                        [{issue.code}] {issue.token}: {issue.message}
                      </Text>
                    ))}
                  </VStack>
                )}
              </VStack>
            </Box>

            <HStack justify="space-between">
              <Text fontSize="xs" color={hasErrors ? "red.600" : "gray.600"}>
                {hasErrors
                  ? "Fix validation errors and rerun Step 1."
                  : "Review complete. Continue to readiness checks."}
              </Text>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveStep(2)}
                disabled={hasErrors}
              >
                Continue to Readiness
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Step 3 */}
      {activeStep >= 2 && hasValidation && (
        <Box border="1px solid" borderColor="gray.200" borderRadius="lg" p={4}>
          <VStack align="stretch" gap={3}>
            <Text fontSize="xs" fontWeight="700" color="gray.700">
              Step 3: Readiness Checklist
            </Text>

            <Checkbox.Root
              checked={hasWarnings ? checklist.reviewedWarnings : hasValidation}
              disabled={!hasWarnings}
              onCheckedChange={(details) =>
                setChecklist((prev) => ({
                  ...prev,
                  reviewedWarnings: details.checked === true,
                }))
              }
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label fontSize="xs">
                {hasWarnings
                  ? "I reviewed warning items before export."
                  : "No warnings detected in validation."}
              </Checkbox.Label>
            </Checkbox.Root>

            <Checkbox.Root
              checked={checklist.mappedCollections}
              onCheckedChange={(details) =>
                setChecklist((prev) => ({
                  ...prev,
                  mappedCollections: details.checked === true,
                }))
              }
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label fontSize="xs">
                I have a plan to map token groups to Figma Variable collections.
              </Checkbox.Label>
            </Checkbox.Root>

            <Checkbox.Root
              checked={checklist.readyForHandoff}
              onCheckedChange={(details) =>
                setChecklist((prev) => ({
                  ...prev,
                  readyForHandoff: details.checked === true,
                }))
              }
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label fontSize="xs">
                This export is ready to share with the dev team.
              </Checkbox.Label>
            </Checkbox.Root>

            <HStack justify="flex-end">
              <Button
                size="sm"
                colorPalette="blue"
                onClick={() => setActiveStep(3)}
                disabled={!readinessComplete || hasErrors}
              >
                Continue to Export
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Step 4 */}
      {activeStep === 3 && (
        <>
          <Box
            bg="blue.50"
            borderRadius="lg"
            p={4}
            border="1px solid"
            borderColor="blue.100"
          >
            <Text fontSize="xs" color="blue.700" fontWeight="600" mb={2}>
              Step 4: Export to Figma
            </Text>
            <VStack align="start" gap={1}>
              {[
                "1. Export or copy JSON below",
                "2. Open Figma → Plugins → Variables Importer",
                '3. Import the "tokens-figma.json" file',
                "4. Map token groups to Variable collections",
              ].map((step) => (
                <Text key={step} fontSize="xs" color="blue.600">
                  {step}
                </Text>
              ))}
            </VStack>
          </Box>

          {/* CTA buttons */}
          <HStack gap={2}>
            <Button
              colorPalette="blue"
              size="sm"
              flex={1}
              loading={isLoading}
              disabled={exportLocked}
              onClick={handleDownload}
              gap={2}
            >
              <LuDownload size={14} />
              Download tokens-figma.json
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              loading={isLoading}
              disabled={exportLocked}
              minW="120px"
              gap={2}
            >
              {isCopied ? <LuCheck size={14} /> : <LuClipboard size={14} />}
              {isCopied ? "Copied!" : "Copy JSON"}
            </Button>
          </HStack>
        </>
      )}

      {/* Error state */}
      {error && (
        <HStack
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          borderRadius="md"
          px={4}
          py={3}
          gap={2}
        >
          <LuTriangleAlert size={14} color="var(--chakra-colors-red-500)" />
          <Text fontSize="sm" color="red.700">
            {error}
          </Text>
        </HStack>
      )}

      {/* Preview — shown after first fetch */}
      {typeSummary && (
        <Box>
          <Text
            fontSize="10px"
            fontWeight="700"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
            mb={3}
          >
            Token Summary
          </Text>
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between" px={2}>
              <Text fontSize="xs" color="gray.500" fontWeight="600">
                Total
              </Text>
              <Text fontSize="xs" fontWeight="700" color="gray.700">
                {Object.keys(preview!).length} tokens
              </Text>
            </HStack>
            <Separator />
            {Object.entries(typeSummary)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <HStack key={type} justify="space-between" px={2}>
                  <HStack gap={2}>
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="sm"
                      bg={TYPE_COLORS[type] || TYPE_COLORS.other}
                      flexShrink={0}
                    />
                    <Text fontSize="xs" color="gray.600">
                      {type}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" fontWeight="600" color="gray.500">
                    {count}
                  </Text>
                </HStack>
              ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

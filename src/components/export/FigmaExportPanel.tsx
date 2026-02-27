import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Separator,
  Badge,
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
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [preview, setPreview] = useState<FigmaTokenMap | null>(null);
  const [validation, setValidation] = useState<FigmaValidationResponse | null>(
    null,
  );
  const [pendingWarningAction, setPendingWarningAction] =
    useState<ExportAction | null>(null);
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

  const handleAction = async (action: ExportAction) => {
    setIsLoading(true);
    setError(null);
    setPendingWarningAction(null);
    try {
      const result = await fetchValidatedExport();
      setValidation(result);
      setPreview(result.tokens);

      if (result.errors.length > 0) {
        toaster.error({
          title: "Validation Failed",
          description: `${result.errors.length} error(s) must be fixed before export.`,
        });
        return;
      }

      if (result.warnings.length > 0) {
        setPendingWarningAction(action);
        return;
      }

      await executeAction(action, result.tokens);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toaster.error({ title: "Validation Failed", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedWithWarnings = async () => {
    if (!validation || !pendingWarningAction) return;
    setIsLoading(true);
    try {
      await executeAction(pendingWarningAction, validation.tokens);
      setPendingWarningAction(null);
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

      {/* Validation status */}
      {validation && (
        <Box
          bg={validation.valid ? "green.50" : "red.50"}
          borderRadius="lg"
          p={4}
          border="1px solid"
          borderColor={validation.valid ? "green.100" : "red.200"}
        >
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between">
              <Text
                fontSize="xs"
                fontWeight="700"
                color={validation.valid ? "green.700" : "red.700"}
              >
                Validation {validation.valid ? "Passed" : "Failed"}
              </Text>
              <HStack gap={2}>
                <Badge colorPalette="gray" variant="subtle">
                  {validation.summary.totalTokens} total
                </Badge>
                <Badge colorPalette="red" variant="subtle">
                  {validation.summary.errorCount} errors
                </Badge>
                <Badge colorPalette="yellow" variant="subtle">
                  {validation.summary.warningCount} warnings
                </Badge>
              </HStack>
            </HStack>
            {validation.errors.length > 0 && (
              <VStack align="stretch" gap={1}>
                <Text fontSize="11px" fontWeight="700" color="red.700">
                  Errors
                </Text>
                {validation.errors.slice(0, 5).map((issue, idx) => (
                  <Text key={`${issue.code}-${idx}`} fontSize="11px" color="red.600">
                    [{issue.code}] {issue.token}: {issue.message}
                  </Text>
                ))}
              </VStack>
            )}
            {validation.warnings.length > 0 && (
              <VStack align="stretch" gap={1}>
                <Text fontSize="11px" fontWeight="700" color="orange.700">
                  Warnings
                </Text>
                {validation.warnings.slice(0, 5).map((issue, idx) => (
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
      )}

      {/* Instructions */}
      <Box
        bg="blue.50"
        borderRadius="lg"
        p={4}
        border="1px solid"
        borderColor="blue.100"
      >
        <Text fontSize="xs" color="blue.700" fontWeight="600" mb={2}>
          How to use in Figma:
        </Text>
        <VStack align="start" gap={1}>
          {[
            "1. Export the JSON file below",
            "2. Open Figma → Plugins → Variables Importer (or similar)",
            '3. Import the "tokens-figma.json" file',
            "4. Map token groups to Figma Variable collections",
          ].map((step) => (
            <Text key={step} fontSize="xs" color="blue.600">
              {step}
            </Text>
          ))}
        </VStack>
      </Box>

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

      {/* CTA buttons */}
      <HStack gap={2}>
        <Button
          colorPalette="blue"
          size="sm"
          flex={1}
          loading={isLoading}
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
          minW="120px"
          gap={2}
        >
          {isCopied ? <LuCheck size={14} /> : <LuClipboard size={14} />}
          {isCopied ? "Copied!" : "Copy JSON"}
        </Button>
      </HStack>

      {pendingWarningAction && validation && validation.errors.length === 0 && (
        <HStack
          bg="orange.50"
          border="1px solid"
          borderColor="orange.200"
          borderRadius="md"
          px={4}
          py={3}
          justify="space-between"
        >
          <Text fontSize="sm" color="orange.700">
            {validation.warnings.length} warning(s) found. Continue anyway?
          </Text>
          <HStack gap={2}>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setPendingWarningAction(null)}
            >
              Cancel
            </Button>
            <Button
              size="xs"
              colorPalette="orange"
              onClick={handleProceedWithWarnings}
              loading={isLoading}
            >
              Proceed Anyway
            </Button>
          </HStack>
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

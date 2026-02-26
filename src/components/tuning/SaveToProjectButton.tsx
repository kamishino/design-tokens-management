import { useState, useCallback } from "react";
import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import { LuSave, LuCheck, LuX, LuChevronDown } from "react-icons/lu";
import type { Manifest } from "../../schemas/manifest";
import { resolveMapping } from "../../utils/varToTokenKey";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SaveResult {
  file: string;
  saved: number;
}

type SaveStatus = "idle" | "confirm" | "saving" | "success" | "error";

interface SaveToProjectButtonProps {
  overrides: Record<string, string | number>;
  manifest: Manifest;
  /** Currently active project file path (e.g. /tokens/clients/brand-a/theme.json) */
  projectPath: string;
  onSaveSuccess: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build the array of entries to POST to /api/save-tuning */
function buildEntries(
  overrides: Record<string, string | number>,
  projectPath: string,
) {
  const entries: Array<{
    cssVar: string;
    value: string | number;
    tokenPath: string;
    file: string;
  }> = [];

  for (const [cssVar, value] of Object.entries(overrides)) {
    const mapping = resolveMapping(cssVar, projectPath);
    if (!mapping) continue; // unmapped var — skip
    entries.push({
      cssVar,
      value,
      tokenPath: mapping.tokenPath,
      file: mapping.file,
    });
  }
  return entries;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const SaveToProjectButton = ({
  overrides,
  projectPath,
  onSaveSuccess,
}: SaveToProjectButtonProps) => {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [results, setResults] = useState<SaveResult[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const entries = buildEntries(overrides, projectPath);
  const mappedCount = entries.length;
  const totalCount = Object.keys(overrides).length;
  const unmappedCount = totalCount - mappedCount;

  const handleConfirm = useCallback(async () => {
    if (entries.length === 0) return;
    setStatus("saving");
    try {
      const response = await fetch("/api/save-tuning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Save failed");
      }

      setResults(data.results ?? []);
      setStatus("success");
      // Auto-reset after 3s
      setTimeout(() => {
        setStatus("idle");
        setResults([]);
      }, 3000);
      onSaveSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }, [entries, onSaveSuccess]);

  if (totalCount === 0) return null;

  // ── Success toast ──
  if (status === "success") {
    const totalSaved = results.reduce((s, r) => s + r.saved, 0);
    return (
      <Box
        px={3}
        py={2}
        bg="green.50"
        border="1px solid"
        borderColor="green.200"
        borderRadius="lg"
        display="flex"
        alignItems="center"
        gap={2}
      >
        <LuCheck size={13} color="var(--chakra-colors-green-600)" />
        <Text fontSize="10px" fontWeight="700" color="green.700">
          Saved {totalSaved} token{totalSaved !== 1 ? "s" : ""} to{" "}
          {results.length} file{results.length !== 1 ? "s" : ""}
        </Text>
      </Box>
    );
  }

  // ── Error toast ──
  if (status === "error") {
    return (
      <Box
        px={3}
        py={2}
        bg="red.50"
        border="1px solid"
        borderColor="red.200"
        borderRadius="lg"
        display="flex"
        alignItems="center"
        gap={2}
      >
        <LuX size={13} color="var(--chakra-colors-red-600)" />
        <Text
          fontSize="10px"
          fontWeight="700"
          color="red.700"
          flex={1}
          truncate
        >
          {errorMsg}
        </Text>
      </Box>
    );
  }

  // ── Confirm state ──
  if (status === "confirm") {
    return (
      <VStack align="stretch" gap={1.5}>
        {/* Preview of what will be saved */}
        <Box
          px={3}
          py={2}
          bg="blue.50"
          border="1px solid"
          borderColor="blue.100"
          borderRadius="lg"
        >
          <HStack gap={1.5} mb={1}>
            <LuSave size={11} color="var(--chakra-colors-blue-500)" />
            <Text fontSize="10px" fontWeight="700" color="blue.700">
              Save {mappedCount} token{mappedCount !== 1 ? "s" : ""} to disk?
            </Text>
          </HStack>

          {/* Grouped by file */}
          <VStack align="stretch" gap={0.5} mb={unmappedCount > 0 ? 1.5 : 0}>
            {Object.entries(
              entries.reduce(
                (acc, e) => {
                  const short = e.file.replace("/tokens/", "…/");
                  if (!acc[short]) acc[short] = [];
                  acc[short].push(e.cssVar.replace("--", ""));
                  return acc;
                },
                {} as Record<string, string[]>,
              ),
            ).map(([file, vars]) => (
              <Box key={file}>
                <Text fontSize="8px" fontWeight="700" color="blue.500" mb={0.5}>
                  {file}
                </Text>
                <Box
                  as="button"
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  onClick={() => setShowDetails((v) => !v)}
                >
                  <Text fontSize="8px" color="gray.500">
                    {vars.length} change{vars.length !== 1 ? "s" : ""}
                  </Text>
                  <LuChevronDown
                    size={8}
                    color="var(--chakra-colors-gray-400)"
                    style={{
                      transform: showDetails ? "rotate(180deg)" : "none",
                      transition: "transform 0.15s",
                    }}
                  />
                </Box>
                {showDetails && (
                  <VStack align="start" gap={0} mt={0.5}>
                    {vars.map((v) => (
                      <Text
                        key={v}
                        fontSize="8px"
                        color="gray.400"
                        fontFamily="monospace"
                      >
                        {v}
                      </Text>
                    ))}
                  </VStack>
                )}
              </Box>
            ))}
          </VStack>

          {unmappedCount > 0 && (
            <Text fontSize="8px" color="orange.500" mt={1}>
              ⚠ {unmappedCount} override{unmappedCount !== 1 ? "s" : ""} have no
              token mapping and won't be saved.
            </Text>
          )}
        </Box>

        {/* Action buttons */}
        <HStack gap={1.5}>
          <Box
            as="button"
            flex={1}
            py={1.5}
            borderRadius="md"
            bg="blue.500"
            color="white"
            fontSize="10px"
            fontWeight="700"
            textAlign="center"
            cursor="pointer"
            _hover={{ bg: "blue.600" }}
            transition="all 0.1s"
            onClick={handleConfirm}
          >
            {status === "saving" ? "Saving…" : "Confirm Save"}
          </Box>
          <Box
            as="button"
            px={3}
            py={1.5}
            borderRadius="md"
            bg="gray.100"
            color="gray.600"
            fontSize="10px"
            fontWeight="600"
            cursor="pointer"
            _hover={{ bg: "gray.200" }}
            transition="all 0.1s"
            onClick={() => setStatus("idle")}
          >
            Cancel
          </Box>
        </HStack>
      </VStack>
    );
  }

  // ── Idle / default button ──
  return (
    <Box
      as="button"
      display="flex"
      alignItems="center"
      gap={1.5}
      px={3}
      py={1.5}
      borderRadius="md"
      bg="blue.500"
      color="white"
      fontSize="10px"
      fontWeight="700"
      cursor="pointer"
      _hover={{ bg: "blue.600" }}
      transition="all 0.1s"
      onClick={() => setStatus("confirm")}
      title={`Save ${mappedCount} of ${totalCount} override(s) to token files`}
    >
      <LuSave size={11} />
      <Text>Save to Project</Text>
      {unmappedCount > 0 && (
        <Box
          px={1}
          py={0.5}
          borderRadius="sm"
          bg="orange.400"
          fontSize="8px"
          fontWeight="700"
          color="white"
          title={`${unmappedCount} unmapped`}
        >
          {mappedCount}/{totalCount}
        </Box>
      )}
    </Box>
  );
};

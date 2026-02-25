import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Field,
  Group,
  IconButton,
} from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "../ui/dialog";
import { NativeSelectRoot, NativeSelectField } from "../ui/native-select";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { useState, useEffect, useRef, useMemo } from "react";
import { toaster } from "../ui/toaster";
import { extractReferences } from "../../utils/token-parser";
import {
  resolveValueWithMap,
  getPrioritizedTokenMap,
} from "../../utils/token-graph";
import type { TokenDoc } from "../../utils/token-parser";
import { ReferencePicker } from "./ReferencePicker";
import { LuLink } from "react-icons/lu";
import { parse, formatHex } from "culori";

interface TokenEditModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  token?: TokenDoc | null;
  targetPath: string; // The physical file path
  initialCategory?: string;
  globalTokens: TokenDoc[];
}

const TOKEN_TYPE_GROUPS = [
  {
    label: "Standard (W3C DTCG)",
    items: [
      { value: "color", label: "Color" },
      { value: "dimension", label: "Dimension" },
      { value: "fontFamilies", label: "Font Family" },
      { value: "fontWeights", label: "Font Weight" },
      { value: "lineHeights", label: "Line Height" },
      { value: "duration", label: "Duration" },
      { value: "cubicBezier", label: "Cubic Bezier" },
    ],
  },
  {
    label: "Tokens Studio (Figma)",
    items: [
      { value: "spacing", label: "Spacing" },
      { value: "borderRadius", label: "Border Radius" },
      { value: "borderWidth", label: "Border Width" },
      { value: "opacity", label: "Opacity" },
      { value: "boxShadow", label: "Box Shadow" },
      { value: "fontSizes", label: "Font Size" },
      { value: "letterSpacing", label: "Letter Spacing" },
    ],
  },
  {
    label: "Custom",
    items: [{ value: "other", label: "Other / Raw" }],
  },
];

export const TokenEditModal = ({
  isOpen,
  onClose,
  token,
  targetPath,
  initialCategory,
  globalTokens,
}: TokenEditModalProps) => {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("color");
  const [description, setDescription] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reference Picker & Smart Replace State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [refSearch, setRefSearch] = useState("");
  const [anchorRect] = useState<DOMRect | null>(null);
  const [previousLiteral, setPreviousLiteral] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token) {
      // Extract the dot-notation path from the composite ID (e.g. "file:path" -> "path")
      const dotPath = token.id.includes(":")
        ? token.id.split(":")[1]
        : token.id;
      setName(dotPath);
      setValue(
        typeof token.value === "object"
          ? JSON.stringify(token.value)
          : String(token.value),
      );
      setType(token.type);
      setDescription(token.description || "");
    } else {
      setName(initialCategory ? `${initialCategory}.` : "");
      setValue("");
      setType("color");
      setDescription("");
    }
    setIsPickerOpen(false);
    setPreviousLiteral(null);
    setSaveError(null);
  }, [token, initialCategory, isOpen]);

  const isFoundation = useMemo(() => {
    if (!token) return false;
    return (
      token.sourceFile.includes("global/base") ||
      token.path.some((p) => p === "base" || p === "global")
    );
  }, [token]);

  const isSemantic = !isFoundation;

  const handleValueChange = (val: string) => {
    setValue(val);
    setPreviousLiteral(null); // Clear restore button if user starts typing manually

    // Detect { trigger
    const lastOpenBrace = val.lastIndexOf("{");
    const lastCloseBrace = val.lastIndexOf("}");

    if (isSemantic && lastOpenBrace !== -1 && lastOpenBrace > lastCloseBrace) {
      const search = val.slice(lastOpenBrace + 1);
      setRefSearch(search);
      setIsPickerOpen(true);
    } else {
      setIsPickerOpen(false);
    }
  };

  const handleSelectReference = (tokenName: string) => {
    // If current value is a literal (no braces), cache it for restoration
    if (!value.includes("{") && value.trim() !== "") {
      setPreviousLiteral(value);
    }

    // Total replacement with correctly formatted reference
    setValue(`{${tokenName}}`);
    setIsPickerOpen(false);
  };

  const handleRestoreValue = () => {
    if (previousLiteral !== null) {
      setValue(previousLiteral);
      setPreviousLiteral(null);
    }
  };

  const handleSave = async () => {
    setIsSyncing(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetPath,
          tokenPath: name,
          valueObj: {
            $value: value,
            $type: type,
            $description: description,
          },
          action: "update",
        }),
      });

      const json = await response.json().catch(() => ({}));

      if (response.ok) {
        toaster.success({
          title: isNew ? "Token Created" : "Token Saved",
          description: `"${name}" was written to disk successfully.`,
        });
        onClose(true);
      } else {
        const msg =
          (json as { error?: string }).error ||
          `Server responded with ${response.status}`;
        setSaveError(msg);
        toaster.error({
          title: "Save Failed",
          description: msg,
        });
      }
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Network error — is the dev server running?";
      setSaveError(msg);
      toaster.error({ title: "Save Failed", description: msg });
    } finally {
      setIsSyncing(false);
    }
  };

  const isNew = !token;

  // Real-time Color Resolution & Validation
  const resolutionResult = useMemo(() => {
    if (!value || type !== "color") return { isValid: false, status: "none" };

    const refs = extractReferences(value);
    let terminalValue = value;
    let status = "literal";
    let message = "";
    let sourceFile = "";

    if (refs.length > 0) {
      const priorityMap = getPrioritizedTokenMap(globalTokens, targetPath);
      const refTokenName = refs[0];
      const sourceToken = priorityMap.get(refTokenName);

      if (sourceToken) {
        terminalValue = resolveValueWithMap(sourceToken, priorityMap);
        status = "reference";
        sourceFile = sourceToken.sourceFile.split("/").pop() || "";
        message = `Linked to: ${sourceFile} (${terminalValue})`;
      } else {
        return {
          isValid: false,
          status: "broken",
          message: `⚠️ Reference '${refSearch}' not found.`,
        };
      }
    }

    // Validate if terminal value is a real color
    const parsed = parse(terminalValue);
    const isValid = parsed !== undefined;

    if (!isValid && status === "literal" && !value.includes("{")) {
      return {
        isValid: false,
        status: "invalid-color",
        message: "⚠️ Invalid CSS color format.",
      };
    }

    return {
      isValid,
      value: isValid ? formatHex(parsed) : "",
      status,
      message,
    };
  }, [value, type, globalTokens, targetPath, refSearch]);

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(details: { open: boolean }) => !details.open && onClose()}
      size="lg"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNew ? "Create New Token" : "Edit Token"}</DialogTitle>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Target: {targetPath}
          </Text>
        </DialogHeader>
        <DialogBody>
          <VStack gap={6} align="stretch" py={2}>
            {saveError && (
              <Box
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                borderRadius="md"
                px={4}
                py={3}
              >
                <Text fontSize="sm" color="red.700" fontWeight="medium">
                  ⚠️ {saveError}
                </Text>
              </Box>
            )}
            <Field.Root>
              <Field.Label fontWeight="bold">
                Token Name (Dot Notation)
              </Field.Label>
              <Input
                placeholder="e.g. color.brand.primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isNew}
              />
              <Field.HelperText>
                Standard hierarchy: category.group.name
              </Field.HelperText>
            </Field.Root>

            <HStack gap={6} align="flex-start">
              <Field.Root flex={1}>
                <Field.Label fontWeight="bold">Type</Field.Label>
                <NativeSelectRoot>
                  <NativeSelectField
                    value={type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setType(e.target.value)
                    }
                  >
                    {TOKEN_TYPE_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.items.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>
              </Field.Root>

              <Field.Root flex={2}>
                <Field.Label fontWeight="bold">Value</Field.Label>
                <HStack gap={3}>
                  <PopoverRoot
                    open={isPickerOpen}
                    onOpenChange={(e) => {
                      setIsPickerOpen(e.open);
                      // Cleanup: Remove dangling '{' if closing without selection
                      if (!e.open) {
                        setRefSearch("");
                        if (value.endsWith("{")) {
                          setValue((prev) => prev.slice(0, -1));
                        }
                      }
                    }}
                    autoFocus={false}
                    positioning={{
                      strategy: "fixed",
                      placement: "bottom-start",
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Group attached w="full">
                        <Input
                          ref={inputRef}
                          placeholder="e.g. #FFFFFF or {color.blue.500}"
                          value={value}
                          onChange={(e) => handleValueChange(e.target.value)}
                        />
                        <IconButton
                          aria-label="Link reference"
                          variant="subtle"
                          disabled={!isSemantic}
                          onClick={() => {
                            if (!isSemantic) return;
                            if (!value.includes("{")) {
                              setValue(value + "{");
                              setRefSearch("");
                            }
                            setIsPickerOpen(true);
                          }}
                        >
                          <LuLink />
                        </IconButton>
                      </Group>
                    </PopoverTrigger>
                    <PopoverContent
                      w={`${anchorRect?.width || 300}px`}
                      zIndex={5000}
                    >
                      <ReferencePicker
                        tokens={globalTokens}
                        searchTerm={refSearch}
                        filterType={type}
                        onSelect={handleSelectReference}
                      />
                    </PopoverContent>
                  </PopoverRoot>
                  {resolutionResult.isValid && (
                    <Box
                      w="40px"
                      h="40px"
                      bg={resolutionResult.value}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      flexShrink={0}
                    />
                  )}
                </HStack>
                {(resolutionResult.message || previousLiteral !== null) && (
                  <VStack align="start" gap={1} mt={2}>
                    {resolutionResult.message && (
                      <Text
                        fontSize="xs"
                        color={
                          resolutionResult.status.startsWith("broken") ||
                          resolutionResult.status === "invalid-color"
                            ? "red.500"
                            : "gray.500"
                        }
                        fontWeight="medium"
                      >
                        {resolutionResult.message}
                      </Text>
                    )}
                    {previousLiteral !== null && (
                      <Button
                        variant="ghost"
                        size="xs"
                        color="blue.500"
                        onClick={handleRestoreValue}
                        fontWeight="bold"
                        p={0}
                        h="auto"
                      >
                        Restore original: {previousLiteral}
                      </Button>
                    )}
                  </VStack>
                )}
              </Field.Root>
            </HStack>

            <Field.Root>
              <Field.Label fontWeight="bold">Description</Field.Label>
              <Textarea
                placeholder="Explain the purpose of this token..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </Field.Root>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button colorPalette="blue" loading={isSyncing} onClick={handleSave}>
            {isNew ? "Create Token" : "Save Changes"}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

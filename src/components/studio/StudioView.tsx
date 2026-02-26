import {
  Box,
  HStack,
  Button,
  Text,
  Heading,
  createListCollection,
  Portal,
  IconButton,
  Tabs,
  Badge,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { LandingPage } from "./templates/LandingPage";
import { BlogPost } from "./templates/BlogPost";
import { Dashboard } from "./templates/Dashboard";
import { UnifiedStudio } from "./templates/UnifiedStudio";
import { ProductDetail } from "./templates/ProductDetail";
import { StyleAtlas } from "./templates/StyleAtlas";
import { ComponentCatalog } from "./templates/ComponentCatalog";
import { AppSelectRoot } from "../ui/AppSelect";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValueText,
} from "../ui/select";

import { generateStudioMockData } from "./templates/shared/mock-data";
import {
  LuScanEye,
  LuArrowRight,
  LuX,
  LuFlaskConical,
  LuLayoutTemplate,
  LuNewspaper,
  LuActivity,
  LuShoppingBag,
  LuPenLine,
  LuPalette,
  LuBoxes,
} from "react-icons/lu";
import { parse, oklch, formatHex } from "culori";
import type { Manifest, TokenOverrides } from "../../schemas/manifest";
import type { TokenDoc } from "../../utils/token-parser";
import { TokenViewer } from "../TokenViewer";
import { FloatingLab } from "../playground/FloatingLab";
import { CommitCenter } from "../playground/panels/CommitCenter";
import { InlineTokenEditor } from "./InlineTokenEditor";

interface StudioViewProps {
  manifest: Manifest | null;
  globalTokens: TokenDoc[];
  selectedProject: string;
  onProjectChange: (val: string) => void;

  onOpenDocs: () => void;
  onInspectChange: (tokens: string[] | undefined) => void;
  inspectedTokens?: string[];
  overrides: TokenOverrides;
  updateOverride: (
    newValues: Record<string, string | number>,
    label?: string,
  ) => void;
  onReset: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// Template definitions with icons
const TEMPLATE_TABS = [
  { value: "unified", label: "Studio", icon: LuLayoutTemplate },
  { value: "landing", label: "Landing", icon: LuNewspaper },
  { value: "dashboard", label: "Dashboard", icon: LuActivity },
  { value: "ecommerce", label: "Product", icon: LuShoppingBag },
  { value: "blog", label: "Blog", icon: LuPenLine },
  { value: "atlas", label: "Atlas", icon: LuPalette },
  { value: "catalog", label: "Catalog", icon: LuBoxes },
];

export const StudioView = ({
  manifest,
  globalTokens,
  selectedProject,
  onProjectChange,

  onInspectChange,
  inspectedTokens,
  overrides,
  updateOverride,
  onReset,
  undo,
  redo,
  canUndo,
  canRedo,
}: StudioViewProps) => {
  const [template, setTemplate] = useState("unified");
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [activeTool, setActiveTool] = useState<"manager" | "lab" | null>(null);
  const [hoveredRect, setHoveredRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    tokens?: string[];
  } | null>(null);
  const [inlineEditor, setInlineEditor] = useState<{
    anchorRect: DOMRect;
    tokenNames: string[];
  } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Project Collection
  const projectCollection = useMemo(() => {
    if (!manifest)
      return createListCollection<{ label: string; value: string }>({
        items: [],
      });
    return createListCollection({
      items: Object.entries(manifest.projects).map(([key, p]) => ({
        label: `${p.client} - ${p.project}`,
        value: key,
      })),
    });
  }, [manifest]);

  // Inject token VALUES as CSS variables so templates see real project data
  useEffect(() => {
    const styleId = "token-base-vars";
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    if (globalTokens.length === 0) {
      styleTag.innerHTML = "";
      return;
    }

    // Convert camelCase --brandPrimary to dash-case --brand-primary
    const camelToDash = (str: string) =>
      str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

    // Only inject semantic tokens that templates actually use
    const semanticPrefixes = [
      "brand",
      "bg",
      "text",
      "font",
      "border",
      "action",
      "status",
      "radius",
      "typography",
      "shadow",
      "opacity",
    ];

    let rules = globalTokens
      .filter((t) => {
        const name = t.name.toLowerCase();
        return semanticPrefixes.some((p) => name.startsWith(p + "."));
      })
      .map((t) => {
        const dashVar = camelToDash(t.cssVariable);
        // Priority: Override > Resolved Value > Raw Value
        const val = overrides[dashVar] ?? t.resolvedValue ?? t.value;
        return `  ${dashVar}: ${val};`;
      })
      .join("\n");

    // --- 60/30/10 RULE MAPPING (Phase S) ---
    const getGhostTint = (hex: string, lightness: number) => {
      const p = parse(hex);
      if (!p) return hex;
      const o = oklch(p);
      return formatHex({ ...o, l: lightness, c: Math.min(o.c ?? 0, 0.02) });
    };

    const primaryToken =
      globalTokens.find((t) => t.name === "brand.primary")?.cssVariable ||
      "brandPrimary";
    const secondaryToken =
      globalTokens.find((t) => t.name === "brand.secondary")?.cssVariable ||
      "brandSecondary";

    const dashPrimary = camelToDash(primaryToken);
    const dashSecondary = camelToDash(secondaryToken);

    const primaryVal =
      overrides[dashPrimary] ??
      globalTokens.find((t) => t.cssVariable === primaryToken)?.resolvedValue ??
      "#2B4D86";
    const secondaryVal =
      overrides[dashSecondary] ??
      globalTokens.find((t) => t.cssVariable === secondaryToken)
        ?.resolvedValue ??
      "#4A6DA7";

    const bgCanvas = getGhostTint(primaryVal as string, 0.98);
    const bgSurface = getGhostTint(primaryVal as string, 0.95);

    rules += `\n  /* 60/30/10 Rule Mapping (Phase S) */\n`;
    rules += `  --bg-canvas: ${bgCanvas};\n`;
    rules += `  --bg-surface: ${bgSurface};\n`;
    rules += `  --brand-primary: ${primaryVal};\n`;
    rules += `  --brand-secondary: ${secondaryVal};`;

    // ── Direct override pass ──────────────────────────────────────────────────
    // Inject ALL active overrides directly as CSS vars. This ensures vars that
    // are NOT backed by a globalToken (e.g. --font-family-heading, which has no
    // token in the JSON files) still reach the Studio canvas. Without this pass,
    // handleFontSelect writes to overrides["--font-family-heading"] but the token
    // loop above silently skips it because no matching TokenDoc exists.
    const overrideRules = Object.entries(overrides)
      .map(([cssVar, val]) => `  ${cssVar}: ${val};`)
      .join("\n");

    if (overrideRules) {
      rules += `\n  /* Direct overrides */\n${overrideRules}`;
    }

    styleTag.innerHTML = `:root {\n${rules}\n}`;
  }, [globalTokens, overrides]);

  const mockData = useMemo(() => generateStudioMockData(), []);

  const hasNoTokens = globalTokens.length === 0;

  // Toggle inspect mode
  const toggleInspect = useCallback(() => {
    setIsInspectMode((prev) => {
      if (prev) onInspectChange(undefined);
      return !prev;
    });
  }, [onInspectChange]);

  // Keyboard shortcut: "I" to toggle Inspect Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (
        e.key.toLowerCase() === "i" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        toggleInspect();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleInspect]);

  // Inspector Logic
  useEffect(() => {
    if (!isInspectMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const inspectable = target.closest("[data-tokens]");

      if (inspectable) {
        const rect = inspectable.getBoundingClientRect();
        const tokens =
          inspectable
            .getAttribute("data-tokens")
            ?.split(",")
            .map((t) => t.trim()) || [];
        setHoveredRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          tokens,
        });
      } else {
        setHoveredRect(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!isInspectMode) return;
      const target = e.target as HTMLElement;

      if (target.closest(".studio-toolbar")) return;

      const inspectable = target.closest("[data-tokens]");
      if (inspectable) {
        e.preventDefault();
        e.stopPropagation();
        const tokens =
          inspectable
            .getAttribute("data-tokens")
            ?.split(",")
            .map((t) => t.trim()) || [];
        onInspectChange(tokens.length > 0 ? tokens : undefined);
        if (tokens.length > 0) {
          // Show inline editor anchored to the clicked element
          setInlineEditor({
            anchorRect: inspectable.getBoundingClientRect(),
            tokenNames: tokens,
          });
        }
      } else {
        setInlineEditor(null);
        onInspectChange(undefined);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick, true);
      setHoveredRect(null);
    };
  }, [isInspectMode, onInspectChange]);

  return (
    <Box
      position="relative"
      bg="white"
      minH="100%"
      cursor={isInspectMode ? "crosshair" : "default"}
      onClick={() => setInlineEditor(null)}
    >
      {/* Inspector Overlay */}
      {isInspectMode && hoveredRect && (
        <Box
          position="fixed"
          top={hoveredRect.top}
          left={hoveredRect.left}
          width={hoveredRect.width}
          height={hoveredRect.height}
          border="2px solid"
          borderColor="blue.400"
          bg="rgba(66, 153, 225, 0.1)"
          pointerEvents="none"
          zIndex={1900}
          transition="all 0.1s"
        >
          {hoveredRect.tokens && hoveredRect.tokens.length > 0 && (
            <Box
              position="absolute"
              top="-32px"
              left="0"
              bg="blue.600"
              color="white"
              px={2}
              py={1}
              borderRadius="md"
              fontSize="10px"
              whiteSpace="nowrap"
              boxShadow="lg"
              display="flex"
              alignItems="center"
              gap={2}
            >
              {hoveredRect.tokens.map((tokenId, idx) => {
                const token = globalTokens.find((t) => t.id === tokenId);
                const lineage = token?.lineage || [];
                return (
                  <HStack key={tokenId} gap={1}>
                    <Text fontWeight="bold">{tokenId}</Text>
                    {lineage.length > 0 && (
                      <>
                        <LuArrowRight size={10} />
                        <Text opacity={0.8}>{lineage.join(" → ")}</Text>
                      </>
                    )}
                    {idx < hoveredRect.tokens!.length - 1 && (
                      <Box w="1px" h="10px" bg="whiteAlpha.400" mx={2} />
                    )}
                  </HStack>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* Inline Token Editor (click-to-edit in Inspect Mode) */}
      {inlineEditor && (
        <InlineTokenEditor
          anchorRect={inlineEditor.anchorRect}
          tokenNames={inlineEditor.tokenNames}
          globalTokens={globalTokens}
          onApplyOverride={(cssVar, value) =>
            updateOverride({ [cssVar]: value }, `Inline edit: ${cssVar}`)
          }
          onClose={() => setInlineEditor(null)}
        />
      )}

      {/* Studio Toolbar */}
      <Box
        className="studio-toolbar"
        position="sticky"
        top={0}
        left={0}
        right={0}
        zIndex={50}
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(10px)"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={4}
        h="52px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Left: Brand + Project selector */}
        <HStack gap={3}>
          <Heading
            size="xs"
            color="gray.700"
            letterSpacing="tight"
            flexShrink={0}
          >
            Design Studio
          </Heading>
          <Box w="1px" h="16px" bg="gray.200" />

          <HStack gap={1.5}>
            <Text
              fontSize="10px"
              fontWeight="700"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Project
            </Text>
            <Box w="200px">
              <AppSelectRoot
                collection={projectCollection}
                size="sm"
                value={[selectedProject]}
                onValueChange={(e) => onProjectChange(e.value[0])}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent zIndex={2001}>
                  {projectCollection.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </AppSelectRoot>
            </Box>
          </HStack>
        </HStack>

        {/* Right: Actions */}
        <HStack gap={2}>
          {/* Visual Lab button */}
          <Button
            size="xs"
            variant="outline"
            borderColor="purple.200"
            color="purple.600"
            bg="purple.50"
            _hover={{ bg: "purple.100" }}
            onClick={() => setActiveTool("lab")}
            gap={1.5}
            title="Open Visual Lab to edit tokens"
          >
            <LuFlaskConical size={12} />
            Visual Lab
          </Button>

          {/* Inspect Mode button */}
          <Button
            size="xs"
            variant={isInspectMode ? "solid" : "outline"}
            colorPalette={isInspectMode ? "blue" : "gray"}
            onClick={toggleInspect}
            gap={1.5}
            title={
              isInspectMode
                ? "Exit Inspect Mode (I)"
                : "Inspect tokens on canvas (I)"
            }
          >
            <LuScanEye size={12} />
            {isInspectMode ? "Exit Inspect" : "Inspect"}
          </Button>
        </HStack>
      </Box>

      {/* Template Tab Bar */}
      <Box
        className="studio-toolbar"
        position="sticky"
        top="52px"
        zIndex={40}
        bg="rgba(250, 250, 252, 0.95)"
        backdropFilter="blur(8px)"
        borderBottom="1px solid"
        borderColor="gray.100"
        px={4}
        overflowX="auto"
      >
        <HStack gap={0} h="36px" align="stretch">
          {TEMPLATE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = template === tab.value;
            return (
              <HStack
                key={tab.value}
                as="button"
                px={3}
                gap={1.5}
                fontSize="11px"
                fontWeight={isActive ? "700" : "500"}
                color={isActive ? "blue.600" : "gray.500"}
                borderBottom="2px solid"
                borderColor={isActive ? "blue.500" : "transparent"}
                bg={isActive ? "blue.50" : "transparent"}
                cursor="pointer"
                _hover={{
                  color: isActive ? "blue.600" : "gray.700",
                  bg: isActive ? "blue.50" : "gray.50",
                }}
                transition="all 0.15s"
                onClick={() => setTemplate(tab.value)}
                flexShrink={0}
                h="full"
                align="center"
              >
                <Icon size={12} />
                <Text fontSize="11px">{tab.label}</Text>
              </HStack>
            );
          })}
        </HStack>
      </Box>

      {/* Inspect Mode Active Banner */}
      {isInspectMode && (
        <Box
          bg="blue.500"
          color="white"
          px={4}
          py={1.5}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          fontSize="11px"
          fontWeight="600"
          position="sticky"
          top="88px"
          zIndex={30}
        >
          <HStack gap={2}>
            <LuScanEye size={13} />
            <Text>
              Inspect Mode Active — Hover to highlight tokens, click to open
              Visual Lab
            </Text>
          </HStack>
          <Box
            as="button"
            opacity={0.8}
            _hover={{ opacity: 1 }}
            cursor="pointer"
            onClick={toggleInspect}
          >
            <LuX size={13} />
          </Box>
        </Box>
      )}

      {/* Overlays */}
      {activeTool === "manager" && manifest && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            zIndex={3000}
            bg="white"
            animation="fade-in 0.2s"
          >
            <Box position="absolute" top={4} right={4} zIndex={3001}>
              <IconButton
                size="sm"
                variant="ghost"
                onClick={() => setActiveTool(null)}
                title="Close Manager"
              >
                <LuX />
              </IconButton>
            </Box>
            <TokenViewer
              manifest={manifest}
              selectedProject={selectedProject}
              onProjectChange={onProjectChange}
              onEnterStudio={() => setActiveTool(null)}
              overrides={overrides}
              updateOverride={updateOverride}
            />
          </Box>
        </Portal>
      )}

      {activeTool === "lab" && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            zIndex={3000}
            bg="blackAlpha.500"
            onClick={() => setActiveTool(null)}
          >
            {/* Popover Container */}
            <div
              ref={popoverRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 4000,
              }}
            />

            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              onClick={(e) => e.stopPropagation()}
              bg="white"
              borderRadius="xl"
              boxShadow="2xl"
              overflow="hidden"
              w="900px"
              maxW="90vw"
              h="80vh"
              display="flex"
              flexDirection="column"
            >
              <HStack
                justify="space-between"
                p={4}
                borderBottom="1px solid"
                borderColor="gray.100"
                bg="gray.50"
              >
                <HStack gap={2}>
                  <LuFlaskConical
                    size={14}
                    color="var(--chakra-colors-purple-500)"
                  />
                  <Heading size="sm">Visual Lab</Heading>
                </HStack>
                <IconButton
                  size="xs"
                  variant="ghost"
                  onClick={() => setActiveTool(null)}
                >
                  <LuX />
                </IconButton>
              </HStack>

              <Tabs.Root
                defaultValue="lab"
                flex={1}
                display="flex"
                flexDirection="column"
                overflow="hidden"
              >
                <Tabs.List
                  px={4}
                  pt={2}
                  bg="gray.50"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                >
                  <Tabs.Trigger value="lab">Editor</Tabs.Trigger>
                  <Tabs.Trigger value="commit">
                    Commit Changes
                    {Object.keys(overrides).length > 0 && (
                      <Badge
                        ml={2}
                        colorPalette="blue"
                        variant="solid"
                        size="xs"
                      >
                        {Object.keys(overrides).length}
                      </Badge>
                    )}
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content
                  value="lab"
                  flex={1}
                  overflow="hidden"
                  p={0}
                  position="relative"
                >
                  <Box h="full" w="full">
                    <FloatingLab
                      variant="static"
                      manifest={manifest}
                      projectPath={manifest?.projects[selectedProject]?.path}
                      clientId={
                        manifest?.projects[selectedProject]?.client || ""
                      }
                      projectId={
                        manifest?.projects[selectedProject]?.project || ""
                      }
                      overrides={overrides}
                      updateOverride={updateOverride}
                      onReset={onReset}
                      hasOverrides={Object.keys(overrides).length > 0}
                      undo={undo}
                      redo={redo}
                      canUndo={canUndo}
                      canRedo={canRedo}
                      globalTokens={globalTokens}
                      filteredIds={inspectedTokens}
                      onClearFilter={() => onInspectChange(undefined)}
                      onProjectSelect={onProjectChange}
                      recentProjects={[]}
                      popoverContainer={popoverRef}
                    />
                  </Box>
                </Tabs.Content>

                <Tabs.Content value="commit" flex={1} overflowY="auto" p={6}>
                  <CommitCenter
                    overrides={overrides as Record<string, string | number>}
                    globalTokens={globalTokens}
                    onCommitSuccess={onReset}
                  />
                </Tabs.Content>
              </Tabs.Root>
            </Box>
          </Box>
        </Portal>
      )}

      {/* Template Preview Area */}
      <Box
        className={isInspectMode ? "studio-inspect-mode" : ""}
        position="relative"
      >
        {/* Empty state when no tokens loaded */}
        {hasNoTokens && (
          <Box
            position="absolute"
            top={3}
            right={4}
            zIndex={100}
            bg="orange.50"
            border="1px solid"
            borderColor="orange.200"
            borderRadius="lg"
            px={3}
            py={1.5}
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Box
              w="6px"
              h="6px"
              borderRadius="full"
              bg="orange.400"
              flexShrink={0}
            />
            <Text fontSize="11px" color="orange.700" fontWeight="600">
              No tokens loaded — showing defaults
            </Text>
          </Box>
        )}

        {template === "unified" && <UnifiedStudio data={mockData} />}
        {template === "catalog" && <ComponentCatalog />}
        {template === "atlas" && <StyleAtlas data={mockData} />}
        {template === "landing" && <LandingPage data={mockData} />}
        {template === "dashboard" && <Dashboard data={mockData} />}
        {template === "ecommerce" && <ProductDetail data={mockData} />}
        {template === "blog" && <BlogPost data={mockData} />}
      </Box>
    </Box>
  );
};

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
import { useState, useMemo, useEffect, useRef } from "react";
import { LandingPage } from "./templates/LandingPage";
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
import { LuScanEye, LuArrowRight, LuX } from "react-icons/lu";
import type { Manifest, TokenOverrides } from "../../schemas/manifest";
import type { TokenDoc } from "../../utils/token-parser";
import { TokenViewer } from "../TokenViewer";
import { FloatingLab } from "../playground/FloatingLab";
import { CommitCenter } from "../playground/panels/CommitCenter";

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

const templates = createListCollection({
  items: [
    { label: "Unified Studio", value: "unified" },
    { label: "Component Catalog", value: "catalog" },
    { label: "Design System Atlas", value: "atlas" },
    { label: "SaaS Landing Page", value: "landing" },
    { label: "Admin Dashboard", value: "dashboard" },
    { label: "E-commerce Product", value: "ecommerce" },
  ],
});

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
  const [refreshKey, setRefreshKey] = useState(0);
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [activeTool, setActiveTool] = useState<"manager" | "lab" | null>(null);
  const [hoveredRect, setHoveredRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    tokens?: string[];
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

    // Only inject semantic tokens that templates actually use (brand, bg, text, font, border, etc.)
    const semanticPrefixes = [
      "brand",
      "bg",
      "text",
      "font",
      "border",
      "action",
      "status",
      "radius",
    ];

    const rules = globalTokens
      .filter((t) => {
        const name = t.name.toLowerCase();
        return semanticPrefixes.some((p) => name.startsWith(p + "."));
      })
      .map((t) => {
        const dashVar = camelToDash(t.cssVariable);
        const val = t.resolvedValue ?? t.value;
        return `  ${dashVar}: ${val};`;
      })
      .join("\n");

    styleTag.innerHTML = `:root {\n${rules}\n}`;
  }, [globalTokens]);

  // Generate new mock data whenever refreshKey changes
  const mockData = useMemo(() => {
    return generateStudioMockData();
  }, [refreshKey]);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

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
        if (tokens.length > 0) setActiveTool("lab");
      } else {
        onInspectChange(undefined);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick, true); // Capture phase

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick, true);
      setHoveredRect(null); // Clean up outline when mode exits or component unmounts
    };
  }, [isInspectMode, onInspectChange]);

  return (
    <Box
      position="relative"
      bg="white"
      minH="100%"
      cursor={isInspectMode ? "crosshair" : "default"}
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

      {/* Studio Toolbar */}
      <Box
        className="studio-toolbar"
        position="sticky"
        top={0}
        left={0}
        right={0}
        zIndex={2000}
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(10px)"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={8}
        h="60px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <HStack gap={4}>
          <Heading size="sm">Design Studio</Heading>
          <Box w="1px" h="20px" bg="gray.300" />

          <HStack gap={2}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">
              Project:
            </Text>
            <Box w="220px">
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

          <Box w="1px" h="20px" bg="gray.300" />

          <HStack gap={2}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">
              Template:
            </Text>
            <Box w="180px">
              <AppSelectRoot
                collection={templates}
                size="sm"
                value={[template]}
                onValueChange={(e) => setTemplate(e.value[0])}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Select Template" />
                </SelectTrigger>
                <SelectContent zIndex={2001}>
                  {templates.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </AppSelectRoot>
            </Box>
          </HStack>
          <Button
            size="xs"
            variant="ghost"
            onClick={handleRefresh}
            title="Regenerate Mock Data"
          >
            Refresh Data ✨
          </Button>
        </HStack>

        <HStack gap={3}>
          <Button
            size="xs"
            variant={isInspectMode ? "solid" : "outline"}
            colorScheme={isInspectMode ? "blue" : "gray"}
            onClick={() => {
              setIsInspectMode(!isInspectMode);
              if (isInspectMode) onInspectChange(undefined); // Clear on exit
            }}
          >
            <LuScanEye size={14} style={{ marginRight: 6 }} />
            {isInspectMode ? "Exit Inspect" : "Inspect Mode"}
          </Button>
        </HStack>
      </Box>

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
            {/* Popover Container - Placed here to avoid modal clipping */}
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
                <Heading size="sm">Visual Lab</Heading>
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
      <Box className={isInspectMode ? "studio-inspect-mode" : ""}>
        {template === "unified" && <UnifiedStudio data={mockData} />}
        {template === "catalog" && <ComponentCatalog />}
        {template === "atlas" && <StyleAtlas data={mockData} />}
        {template === "landing" && <LandingPage data={mockData} />}
        {template === "dashboard" && <Dashboard data={mockData} />}
        {template === "ecommerce" && <ProductDetail data={mockData} />}
      </Box>
    </Box>
  );
};

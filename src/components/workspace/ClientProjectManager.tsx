import { Box, VStack, HStack, Text, Input, Field, Badge } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { NativeSelectField, NativeSelectRoot } from "../ui/native-select";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "../ui/dialog";
import { toaster } from "../ui/toaster";
import type { Manifest, Project } from "../../schemas/manifest";

interface ClientProjectManagerProps {
  manifest: Manifest;
  selectedProject: string | null;
  onSelectProject: (projectKey: string) => void;
  onProjectCreated?: (projectKey: string) => Promise<void> | void;
}

interface ProjectEntry {
  key: string;
  client: string;
  brand: string;
  project: string;
  lastBuild: string;
}

interface BrandGroup {
  id: string;
  projects: ProjectEntry[];
}

interface ClientGroup {
  id: string;
  brands: BrandGroup[];
  projectCount: number;
}

const DEFAULT_BRAND = "core";

function normalizeSegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getProjectBrand(project: Project): string {
  const metadata = project.metadata;
  if (metadata && typeof metadata === "object") {
    const maybeBrand = (metadata as Record<string, unknown>).brand;
    if (typeof maybeBrand === "string" && maybeBrand.trim()) {
      return maybeBrand;
    }
  }
  return DEFAULT_BRAND;
}

function formatBuildDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "not built";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function buildHierarchy(entries: ProjectEntry[]): ClientGroup[] {
  const clientMap = new Map<string, Map<string, ProjectEntry[]>>();

  for (const entry of entries) {
    const brandMap = clientMap.get(entry.client) ?? new Map<string, ProjectEntry[]>();
    const projects = brandMap.get(entry.brand) ?? [];
    projects.push(entry);
    brandMap.set(entry.brand, projects);
    clientMap.set(entry.client, brandMap);
  }

  return Array.from(clientMap.entries())
    .map(([clientId, brandMap]) => {
      const brands = Array.from(brandMap.entries())
        .map(([brandId, projects]) => ({
          id: brandId,
          projects: [...projects].sort((a, b) =>
            a.project.localeCompare(b.project),
          ),
        }))
        .sort((a, b) => a.id.localeCompare(b.id));

      const projectCount = brands.reduce(
        (count, brand) => count + brand.projects.length,
        0,
      );

      return { id: clientId, brands, projectCount };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export const ClientProjectManager = ({
  manifest,
  selectedProject,
  onSelectProject,
  onProjectCreated,
}: ClientProjectManagerProps) => {
  const [query, setQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [wizardError, setWizardError] = useState("");
  const [clientIdInput, setClientIdInput] = useState("");
  const [brandIdInput, setBrandIdInput] = useState(DEFAULT_BRAND);
  const [projectIdInput, setProjectIdInput] = useState("");
  const [templateInput, setTemplateInput] = useState("product-ui");

  const projectEntries = useMemo<ProjectEntry[]>(() => {
    return Object.entries(manifest.projects).map(([key, project]) => ({
      key,
      client: project.client,
      brand: getProjectBrand(project),
      project: project.project || project.name || key,
      lastBuild: project.lastBuild,
    }));
  }, [manifest]);

  const clientOptions = useMemo(() => {
    return [...new Set(projectEntries.map((entry) => entry.client))].sort(
      (a, b) => a.localeCompare(b),
    );
  }, [projectEntries]);

  const brandOptions = useMemo(() => {
    const scoped =
      clientFilter === "all"
        ? projectEntries
        : projectEntries.filter((entry) => entry.client === clientFilter);

    return [...new Set(scoped.map((entry) => entry.brand))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [clientFilter, projectEntries]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projectEntries.filter((entry) => {
      if (clientFilter !== "all" && entry.client !== clientFilter) return false;
      if (brandFilter !== "all" && entry.brand !== brandFilter) return false;
      if (!normalizedQuery) return true;

      return (
        entry.client.toLowerCase().includes(normalizedQuery) ||
        entry.brand.toLowerCase().includes(normalizedQuery) ||
        entry.project.toLowerCase().includes(normalizedQuery) ||
        entry.key.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [projectEntries, clientFilter, brandFilter, query]);

  const hierarchy = useMemo(
    () => buildHierarchy(filteredEntries),
    [filteredEntries],
  );

  const resetWizard = () => {
    setWizardError("");
    setClientIdInput(clientFilter === "all" ? "" : clientFilter);
    setBrandIdInput(brandFilter === "all" ? DEFAULT_BRAND : brandFilter);
    setProjectIdInput("");
    setTemplateInput("product-ui");
  };

  const openWizard = () => {
    resetWizard();
    setIsWizardOpen(true);
  };

  const handleCreateProject = async () => {
    const clientId = normalizeSegment(clientIdInput);
    const brandId = normalizeSegment(brandIdInput) || DEFAULT_BRAND;
    const projectId = normalizeSegment(projectIdInput);

    if (!clientId || !projectId) {
      setWizardError("Client ID and Project ID are required.");
      return;
    }

    setIsCreating(true);
    setWizardError("");

    try {
      const response = await fetch("/api/workspace/create-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          brandId,
          projectId,
          template: templateInput,
        }),
      });

      const json = (await response.json().catch(() => ({}))) as {
        projectKey?: string;
        error?: string;
      };

      if (!response.ok) {
        const message =
          json.error || `Failed with status ${response.status}. Please retry.`;
        setWizardError(message);
        toaster.error({
          title: "Project Setup Failed",
          description: message,
        });
        return;
      }

      const projectKey = json.projectKey || `${clientId}/${projectId}`;

      toaster.success({
        title: "Workspace Ready",
        description: `Created ${projectKey} under brand ${brandId}.`,
      });

      if (onProjectCreated) {
        await onProjectCreated(projectKey);
      }

      onSelectProject(projectKey);
      setIsWizardOpen(false);
      resetWizard();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Network error while creating project";
      setWizardError(message);
      toaster.error({ title: "Project Setup Failed", description: message });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box>
      <VStack align="stretch" gap={2}>
        <HStack justify="space-between" align="center">
          <Text
            fontSize="10px"
            fontWeight="800"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            Client Workspace
          </Text>
          <Button size="xs" variant="outline" onClick={openWizard}>
            New Project
          </Button>
        </HStack>

        <Input
          size="xs"
          placeholder="Filter client, brand, project"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          borderColor="gray.200"
          bg="white"
        />

        <HStack gap={2}>
          <NativeSelectRoot size="xs" flex={1}>
            <NativeSelectField
              value={clientFilter}
              onChange={(event) => {
                const next = event.target.value;
                setClientFilter(next);
                if (next !== "all" && brandFilter !== "all") {
                  const stillValid = projectEntries.some(
                    (entry) =>
                      entry.client === next && entry.brand === brandFilter,
                  );
                  if (!stillValid) setBrandFilter("all");
                }
              }}
            >
              <option value="all">All clients</option>
              {clientOptions.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>

          <NativeSelectRoot size="xs" flex={1}>
            <NativeSelectField
              value={brandFilter}
              onChange={(event) => setBrandFilter(event.target.value)}
            >
              <option value="all">All brands</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
        </HStack>

        <Box
          maxH="220px"
          overflowY="auto"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="md"
          bg="white"
          p={2}
        >
          {hierarchy.length === 0 ? (
            <Text fontSize="xs" color="gray.500" p={2}>
              No projects match your filters.
            </Text>
          ) : (
            <VStack align="stretch" gap={2}>
              {hierarchy.map((client) => (
                <Box
                  key={client.id}
                  border="1px solid"
                  borderColor="gray.100"
                  borderRadius="md"
                  p={2}
                >
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="xs" fontWeight="700" color="gray.800">
                      {client.id}
                    </Text>
                    <Badge colorPalette="blue" variant="subtle" fontSize="9px">
                      {client.projectCount} projects
                    </Badge>
                  </HStack>

                  <VStack align="stretch" gap={1}>
                    {client.brands.map((brand) => (
                      <Box key={`${client.id}-${brand.id}`} pl={1}>
                        <HStack justify="space-between" mb={0.5}>
                          <Text
                            fontSize="10px"
                            color="gray.500"
                            textTransform="uppercase"
                            fontWeight="700"
                            letterSpacing="wide"
                          >
                            {brand.id}
                          </Text>
                          <Badge
                            colorPalette="gray"
                            variant="outline"
                            fontSize="9px"
                          >
                            {brand.projects.length}
                          </Badge>
                        </HStack>

                        <VStack align="stretch" gap={1}>
                          {brand.projects.map((project) => {
                            const isSelected = selectedProject === project.key;
                            return (
                              <Button
                                key={project.key}
                                size="xs"
                                variant={isSelected ? "subtle" : "ghost"}
                                colorPalette={isSelected ? "blue" : "gray"}
                                justifyContent="space-between"
                                h="auto"
                                py={1.5}
                                px={2}
                                onClick={() => onSelectProject(project.key)}
                              >
                                <VStack align="start" gap={0}>
                                  <Text fontSize="11px" fontWeight="700">
                                    {project.project}
                                  </Text>
                                  <Text fontSize="10px" color="gray.500">
                                    {project.key}
                                  </Text>
                                </VStack>
                                <Text fontSize="10px" color="gray.500">
                                  {formatBuildDate(project.lastBuild)}
                                </Text>
                              </Button>
                            );
                          })}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>

      <DialogRoot
        open={isWizardOpen}
        onOpenChange={(details: { open: boolean }) => {
          setIsWizardOpen(details.open);
          if (!details.open) {
            resetWizard();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project Workspace</DialogTitle>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Setup Client - Brand - Project and scaffold starter token files.
            </Text>
          </DialogHeader>

          <DialogBody>
            <VStack align="stretch" gap={4} py={2}>
              {wizardError && (
                <Box
                  bg="red.50"
                  border="1px solid"
                  borderColor="red.200"
                  borderRadius="md"
                  px={3}
                  py={2}
                >
                  <Text fontSize="xs" color="red.700" fontWeight="600">
                    {wizardError}
                  </Text>
                </Box>
              )}

              <Field.Root>
                <Field.Label fontWeight="700">Client ID</Field.Label>
                <Input
                  value={clientIdInput}
                  onChange={(event) => setClientIdInput(event.target.value)}
                  placeholder="acme-corp"
                />
                <Field.HelperText>
                  Lowercase letters, numbers, and hyphens only.
                </Field.HelperText>
              </Field.Root>

              <Field.Root>
                <Field.Label fontWeight="700">Brand ID</Field.Label>
                <Input
                  value={brandIdInput}
                  onChange={(event) => setBrandIdInput(event.target.value)}
                  placeholder="core"
                />
                <Field.HelperText>
                  Used for workspace grouping and metadata.
                </Field.HelperText>
              </Field.Root>

              <Field.Root>
                <Field.Label fontWeight="700">Project ID</Field.Label>
                <Input
                  value={projectIdInput}
                  onChange={(event) => setProjectIdInput(event.target.value)}
                  placeholder="marketing-site"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label fontWeight="700">Starter Template</Field.Label>
                <NativeSelectRoot>
                  <NativeSelectField
                    value={templateInput}
                    onChange={(event) => setTemplateInput(event.target.value)}
                  >
                    <option value="minimal">Minimal Starter</option>
                    <option value="product-ui">Product UI Kit</option>
                    <option value="editorial">Editorial System</option>
                  </NativeSelectField>
                </NativeSelectRoot>
              </Field.Root>
            </VStack>
          </DialogBody>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsWizardOpen(false)}>
              Cancel
            </Button>
            <Button
              colorPalette="blue"
              loading={isCreating}
              onClick={handleCreateProject}
            >
              Create Project
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

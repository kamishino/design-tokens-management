import { useState, useEffect } from "react";
import { Spinner, Center } from "@chakra-ui/react";
import type { Manifest } from "./schemas/manifest";
import { useTokenLoader } from "./hooks/useTokenLoader";
import { usePersistentPlayground } from "./hooks/usePersistentPlayground";
import { WorkspaceLayout } from "./components/workspace/WorkspaceLayout";

function App() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [, setRecentProjects] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("kami_recent_projects");
    return saved ? JSON.parse(saved) : [];
  });

  const {
    overrides,
    updateOverride,
    undo,
    redo,
    canUndo,
    canRedo,
    resetOverrides,
  } = usePersistentPlayground();

  const handleProjectChange = (key: string) => {
    setSelectedProject(key);
    if (key) {
      setRecentProjects((prev) => {
        const next = [key, ...prev.filter((p) => p !== key)].slice(0, 3);
        localStorage.setItem("kami_recent_projects", JSON.stringify(next));
        return next;
      });
    }
  };

  // Undo/Redo global keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") redo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // Fetch manifest
  useEffect(() => {
    fetch("/tokens/manifest.json")
      .then((res) => res.json())
      .then((data) => {
        setManifest(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load manifest:", err);
        setLoading(false);
      });
  }, []);

  const currentPath = manifest?.projects[selectedProject]?.path;
  useTokenLoader(currentPath);

  if (loading)
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );

  return (
    <WorkspaceLayout
      manifest={manifest!}
      selectedProject={selectedProject}
      onProjectChange={handleProjectChange}
      overrides={overrides}
      updateOverride={updateOverride}
      onReset={resetOverrides}
      undo={undo}
      redo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
    />
  );
}

export default App;

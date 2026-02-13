import { useState, useEffect } from 'react'
import { Box, Spinner, Center } from "@chakra-ui/react"
import type { Manifest } from './schemas/manifest'
import { TokenViewer } from "./components/TokenViewer"
import { StudioView } from "./components/studio/StudioView"
import { DocsPortal } from "./components/docs/DocsPortal"
import { useTokenLoader } from './hooks/useTokenLoader'
import { usePersistentPlayground } from './hooks/usePersistentPlayground'
import { FloatingLab } from './components/playground/FloatingLab'
import { useGlobalTokens } from './hooks/useGlobalTokens'

type ViewMode = 'explorer' | 'studio' | 'docs';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('explorer');
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [inspectedTokens, setInspectedTokens] = useState<string[] | undefined>(undefined);
  const [recentProjects, setRecentProjects] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('kami_recent_projects');
    return saved ? JSON.parse(saved) : [];
  });

  const { 
    overrides, updateOverride, undo, redo, canUndo, canRedo, resetOverrides 
  } = usePersistentPlayground();

  const { globalTokens } = useGlobalTokens();

  const handleProjectChange = (key: string) => {
    setSelectedProject(key);
    if (key) {
      setRecentProjects(prev => {
        const next = [key, ...prev.filter(p => p !== key)].slice(0, 3);
        localStorage.setItem('kami_recent_projects', JSON.stringify(next));
        return next;
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) redo(); else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') redo();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    fetch('/tokens/manifest.json')
      .then(res => res.json())
      .then(data => {
        setManifest(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load manifest:', err);
        setLoading(false);
      });
  }, []);

  const currentPath = manifest?.projects[selectedProject]?.path;
  useTokenLoader(currentPath);

  if (loading) return <Center h="100vh"><Spinner size="xl" /></Center>;

  // Lab only visible in Studio mode per user request
  const isLabActuallyVisible = viewMode === 'studio';

  return (
    <Box minH="100vh">
      {viewMode === 'explorer' && (
        <TokenViewer 
          manifest={manifest!}
          selectedProject={selectedProject}
          onProjectChange={handleProjectChange}
          onEnterStudio={() => setViewMode('studio')}
          overrides={overrides}
          updateOverride={updateOverride}
        />
      )}

      {viewMode === 'studio' && (
        <StudioView 
          manifest={manifest}
          globalTokens={globalTokens}
          selectedProject={selectedProject}
          onProjectChange={handleProjectChange}
          onExit={() => {
            setViewMode('explorer');
            setInspectedTokens(undefined);
          }} 
          onOpenDocs={() => setViewMode('docs')}
          onInspectChange={setInspectedTokens}
          overrides={overrides}
          updateOverride={updateOverride}
          onReset={resetOverrides}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      )}

      {viewMode === 'docs' && (
        <DocsPortal manifest={manifest!} onExit={() => setViewMode('studio')} />
      )}
    </Box>
  )
}

export default App
import { useState, useEffect } from 'react'
import { Box, Spinner, Center } from "@chakra-ui/react"
import { TokenViewer } from "./components/TokenViewer"
import { StudioView } from "./components/studio/StudioView"
import { DocsPortal } from "./components/docs/DocsPortal"
import { useTokenLoader } from './hooks/useTokenLoader'
import { usePersistentPlayground } from './hooks/usePersistentPlayground'
import { FloatingLab } from './components/playground/FloatingLab'
import { useGlobalTokens } from './hooks/useGlobalTokens'
import type { Manifest } from './schemas/manifest'

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

  const [showLab, setShowLab] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('kami_explorer_lab_visible') === 'true';
  });

  const { 
    overrides, updateOverride, undo, redo, canUndo, canRedo, resetOverrides 
  } = usePersistentPlayground();

  const { globalTokens } = useGlobalTokens();

  // Track Recent Projects
  useEffect(() => {
    if (selectedProject) {
      setRecentProjects(prev => {
        const next = [selectedProject, ...prev.filter(p => p !== selectedProject)].slice(0, 3);
        localStorage.setItem('kami_recent_projects', JSON.stringify(next));
        return next;
      });
    }
  }, [selectedProject]);

  useEffect(() => {
    localStorage.setItem('kami_explorer_lab_visible', String(showLab));
  }, [showLab]);

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
          onProjectChange={(val) => {
            setSelectedProject(val);
          }}
          onEnterStudio={() => setViewMode('studio')}
          overrides={overrides}
          updateOverride={updateOverride}
          resetOverrides={resetOverrides}
          showLab={showLab}
          onToggleLab={() => setShowLab(!showLab)}
        />
      )}

      {viewMode === 'studio' && (
        <StudioView 
          manifest={manifest}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
          onExit={() => {
            setViewMode('explorer');
            setInspectedTokens(undefined);
          }} 
          onOpenDocs={() => setViewMode('docs')}
          onInspectChange={setInspectedTokens}
        />
      )}

      {viewMode === 'docs' && (
        <DocsPortal manifest={manifest!} onExit={() => setViewMode('studio')} />
      )}

      {/* Global Floating Lab - Unified instance */}
      {isLabActuallyVisible && (
        <FloatingLab 
          manifest={manifest}
          recentProjects={recentProjects}
          onProjectSelect={setSelectedProject}
          clientId={manifest?.projects[selectedProject]?.client || ''} 
          projectId={manifest?.projects[selectedProject]?.project || ''} 
          overrides={overrides}
          updateOverride={updateOverride}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          globalTokens={globalTokens}
          filteredIds={inspectedTokens}
          onClearFilter={() => setInspectedTokens(undefined)}
        />
      )}
    </Box>
  )
}

export default App
import { useState, useEffect } from 'react'
import { Box, Spinner, Center } from "@chakra-ui/react"
import { TokenViewer } from "./components/TokenViewer"
import { StudioView } from "./components/studio/StudioView"
import { useTokenLoader } from './hooks/useTokenLoader'
import { usePersistentPlayground } from './hooks/usePersistentPlayground'
import { FloatingLab } from './components/playground/FloatingLab'

type ViewMode = 'explorer' | 'studio';

interface Manifest {
  projects: {
    [key: string]: {
      name: string;
      path: string;
      client: string;
      project: string;
    }
  }
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('explorer');
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const { 
    overrides, updateOverride, undo, redo, canUndo, canRedo, resetOverrides 
  } = usePersistentPlayground();

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
        const firstProject = Object.keys(data.projects)[0];
        if (firstProject) setSelectedProject(firstProject);
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

  return (
    <Box minH="100vh">
      {viewMode === 'explorer' ? (
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
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      ) : (
        <StudioView onExit={() => setViewMode('explorer')} />
      )}

      {selectedProject && (
        <FloatingLab 
          clientId={manifest?.projects[selectedProject]?.client || ''} 
          projectId={manifest?.projects[selectedProject]?.project || ''} 
          overrides={overrides}
          updateOverride={updateOverride}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      )}
    </Box>
  )
}

export default App

import { useState, useEffect } from 'react'
import { Box, Spinner, Center } from "@chakra-ui/react"
import { TokenViewer } from "./components/TokenViewer"
import { StudioView } from "./components/studio/StudioView"
import { useTokenLoader } from './hooks/useTokenLoader'
import { useTokenPlayground } from './hooks/useTokenPlayground'
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

  // Playground & Loader
  const { overrides, updateOverride, resetOverrides } = useTokenPlayground();

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
            resetOverrides();
          }}
          onEnterStudio={() => setViewMode('studio')}
          overrides={overrides}
          updateOverride={updateOverride}
          resetOverrides={resetOverrides}
        />
      ) : (
        <StudioView onExit={() => setViewMode('explorer')} />
      )}

      {/* Global Floating Lab (Always visible except maybe in some dashboard views, but here we want it) */}
      {selectedProject && (
        <FloatingLab 
          clientId={manifest?.projects[selectedProject]?.client || ''} 
          projectId={manifest?.projects[selectedProject]?.project || ''} 
          onUpdate={updateOverride}
        />
      )}
    </Box>
  )
}

export default App

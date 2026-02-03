import { Box, HStack, Heading, Spinner, Center, Button } from "@chakra-ui/react";
import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { TokenTable } from './TokenTable';
import { MarkdownView } from './MarkdownView';
import { parseTokensToDocs } from '../../utils/token-parser';
import { generateDocNav } from '../../utils/doc-nav';

interface DocsPortalProps {
  manifest: any;
  onExit: () => void;
}

export const DocsPortal = ({ manifest, onExit }: DocsPortalProps) => {
  const [selectedProject, setSelectedProject] = useState(Object.keys(manifest.projects)[0]);
  const [activePage, setActivePage] = useState({ type: 'md', id: 'introduction' });
  const [mdContent, setMdContent] = useState('');
  const [tokensJson, setTokensJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    fetch('/tokens/global/base/colors.json')
      .then(res => res.json())
      .then(data => {
        setTokensJson(data);
        setLoading(false);
      });
  }, [selectedProject]);

  useEffect(() => {
    if (activePage.type === 'md') {
      fetch(`/docs/guidelines/${activePage.id}.md`)
        .then(res => res.text())
        .then(setMdContent);
    }
  }, [activePage]);

  const allTokens = useMemo(() => tokensJson ? parseTokensToDocs(tokensJson) : [], [tokensJson]);
  const nav = useMemo(() => generateDocNav(allTokens), [allTokens]);

  const filteredTokens = useMemo(() => {
    if (activePage.type === 'tokens') {
      return allTokens.filter(t => t.path[1] === activePage.id || t.path[0] === activePage.id);
    }
    return [];
  }, [allTokens, activePage]);

  return (
    <Box bg="white" minH="100vh">
      <HStack h="60px" px={8} borderBottom="1px solid" borderColor="gray.100" justify="space-between" bg="white" position="sticky" top={0} zIndex={10}>
        <HStack gap={4}>
          <Heading size="md" color="blue.600">Documentation</Heading>
          <Box w="1px" h="20px" bg="gray.200" />
          <select 
            value={selectedProject} 
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{ fontSize: '13px', padding: '4px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
          >
            {Object.keys(manifest.projects).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </HStack>
        <Button size="xs" variant="outline" onClick={onExit}>Back to Studio</Button>
      </HStack>

      <HStack align="start" gap={0}>
        <Sidebar 
          nav={nav} 
          activeId={activePage.id} 
          onSelectPage={(type, id) => setActivePage({ type, id })} 
        />
        
        <Box flex={1} h="calc(100vh - 60px)" overflowY="auto">
          {loading ? (
            <Center h="full"><Spinner /></Center>
          ) : (
            activePage.type === 'md' ? (
              <MarkdownView content={mdContent} />
            ) : (
              <Box p={8}>
                <Heading size="lg" mb={6}>{activePage.id.charAt(0).toUpperCase() + activePage.id.slice(1)} Tokens</Heading>
                <TokenTable tokens={filteredTokens} />
              </Box>
            )
          )}
        </Box>
      </HStack>
    </Box>
  );
};
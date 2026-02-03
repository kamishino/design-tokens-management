import { 
  Box, HStack, Heading, Spinner, Center, Button,
  createListCollection
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { TokenTable } from './TokenTable';
import { MarkdownView } from './MarkdownView';
import { parseTokensToDocs } from '../../utils/token-parser';
import { generateDocNav } from '../../utils/doc-nav';
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "../ui/select";

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

  const projectCollection = useMemo(() => {
    return createListCollection({
      items: Object.keys(manifest?.projects || {}).map(key => ({
        label: key,
        value: key
      }))
    });
  }, [manifest]);

  return (
    <Box bg="white" minH="100vh">
      <HStack h="60px" px={8} borderBottom="1px solid" borderColor="gray.100" justify="space-between" bg="white" position="sticky" top={0} zIndex={10}>
        <HStack gap={4}>
          <Heading size="md" color="blue.600">Documentation</Heading>
          <Box w="1px" h="20px" bg="gray.200" />
          <Box w="200px">
            <SelectRoot 
              collection={projectCollection} 
              size="sm"
              value={[selectedProject]}
              onValueChange={(e) => setSelectedProject(e.value[0])}
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
            </SelectRoot>
          </Box>
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

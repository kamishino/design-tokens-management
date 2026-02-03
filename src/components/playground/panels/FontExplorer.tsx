import { 
  Box, VStack, HStack, Input, Text, 
  Heading
} from "@chakra-ui/react";
import { useState, useMemo } from 'react';
import fonts from '../../../data/google-fonts.json';

interface FontExplorerProps {
  onSelect: (family: string) => void;
  currentFamily: string;
}

export const FontExplorer = ({ onSelect, currentFamily }: FontExplorerProps) => {
  const [search, setSearch] = useState('');
  const [previewText, setPreviewText] = useState('Design Tokens');

  const filteredFonts = useMemo(() => {
    return fonts.filter(f => f.family.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const loadGoogleFont = (family: string) => {
    const linkId = `google-font-${family.replace(/\s+/g, '-').toLowerCase()}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
      document.head.appendChild(link);
    }
  };

  return (
    <VStack p={4} gap={4} align="stretch" w="400px" maxH="500px" bg="white">
      <Heading size="xs" textTransform="uppercase" color="gray.500">Font Explorer</Heading>
      
      <Input 
        placeholder="Search fonts..." 
        size="sm" 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        bg="gray.50"
      />

      <Input 
        placeholder="Preview text..." 
        size="sm" 
        value={previewText} 
        onChange={(e) => setPreviewText(e.target.value)} 
        bg="gray.50"
      />

      <Box overflowY="auto" flex={1}>
        <VStack align="stretch" gap={1}>
          {filteredFonts.map((font) => {
            const isSelected = currentFamily.includes(font.family);
            return (
              <Box 
                key={font.family}
                p={3}
                borderRadius="md"
                cursor="pointer"
                bg={isSelected ? "blue.50" : "transparent"}
                _hover={{ bg: "gray.50" }}
                onClick={() => {
                  loadGoogleFont(font.family);
                  onSelect(font.family);
                }}
                onMouseEnter={() => loadGoogleFont(font.family)}
              >
                <HStack justify="space-between">
                  <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="gray.400">{font.category}</Text>
                    <Text style={{ fontFamily: `"${font.family}", sans-serif` }} fontSize="lg">
                      {previewText || font.family}
                    </Text>
                  </VStack>
                  <Text fontSize="2xs" color="gray.300">{font.family}</Text>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </VStack>
  );
};
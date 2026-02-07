import { 
  Box, VStack, HStack, Input, Text, 
  Heading, SimpleGrid, Button, Badge, Circle
} from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import { useState, useMemo } from 'react';
import { LuCheck } from "react-icons/lu";
import fonts from '../../../data/google-fonts.json';

interface GoogleFont {
  family: string;
  category: string;
}

interface FontExplorerProps {
  onSelect: (family: string, role: string) => void;
  headingFamily: string;
  bodyFamily: string;
  codeFamily: string;
}

type FontRole = 'heading' | 'body' | 'code';

const ROLES: { id: FontRole; label: string }[] = [
  { id: 'heading', label: 'Heading' },
  { id: 'body', label: 'Body' },
  { id: 'code', label: 'Code' }
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'sans-serif', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'monospace', label: 'Mono' },
  { id: 'display', label: 'Display' },
  { id: 'handwriting', label: 'Script' }
];

export const FontExplorer = ({ 
  onSelect, 
  headingFamily, 
  bodyFamily, 
  codeFamily 
}: FontExplorerProps) => {
  const [activeRole, setActiveRole] = useState<FontRole>('heading');
  const [search, setSearch] = useState('');
  const [previewText, setPreviewText] = useState('Design Tokens');
  const [category, setCategory] = useState('all');
  const [recentFonts, setRecentFonts] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('kami_recent_fonts');
    return saved ? JSON.parse(saved) : [];
  });

  // Derived Values
  const currentFamily = useMemo(() => {
    if (activeRole === 'heading') return headingFamily;
    if (activeRole === 'body') return bodyFamily;
    return codeFamily;
  }, [activeRole, headingFamily, bodyFamily, codeFamily]);

  const effectiveCategory = activeRole === 'code' ? 'monospace' : category;

  const primarySelected = useMemo(() => {
    return currentFamily.split(',')[0].replace(/['"]/g, '').trim();
  }, [currentFamily]);

  const filteredFonts = useMemo(() => {
    return (fonts as GoogleFont[]).filter(f => {
      const matchesSearch = f.family.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = effectiveCategory === 'all' || f.category === effectiveCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, effectiveCategory]);

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

  const handleSelect = (family: string) => {
    loadGoogleFont(family);
    onSelect(family, activeRole);
    setRecentFonts(prev => {
      const next = [family, ...prev.filter(f => f !== family)].slice(0, 5);
      localStorage.setItem('kami_recent_fonts', JSON.stringify(next));
      return next;
    });
  };

  return (
    <VStack p={4} gap={4} align="stretch" w="500px" maxH="650px" bg="white">
      <HStack justify="space-between">
        <Heading size="xs" textTransform="uppercase" color="gray.500">Typography Studio</Heading>
        <Badge variant="subtle" colorPalette="blue" size="xs">Google Fonts</Badge>
      </HStack>

      {/* ROLE SWITCHER */}
      <HStack gap={1} bg="gray.100" p={1} borderRadius="lg">
        {ROLES.map(role => (
          <Button
            key={role.id}
            flex={1}
            size="xs"
            variant={activeRole === role.id ? "solid" : "ghost"}
            bg={activeRole === role.id ? "white" : "transparent"}
            color={activeRole === role.id ? "blue.600" : "gray.500"}
            boxShadow={activeRole === role.id ? "sm" : "none"}
            onClick={() => {
              setActiveRole(role.id);
              if (role.id === 'code') setCategory('monospace');
            }}
            borderRadius="md"
          >
            {role.label}
          </Button>
        ))}
      </HStack>
      
      <VStack gap={2} align="stretch">
        <Input 
          placeholder="Search fonts..." 
          size="sm" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          bg="gray.50"
          borderRadius="md"
        />
        <HStack gap={1} overflowX="auto" pb={1} sx={{ '&::-webkit-scrollbar': { display: 'none' } }}>
          {CATEGORIES.map(cat => (
            <Button 
              key={cat.id} 
              size="xs" 
              variant={effectiveCategory === cat.id ? "solid" : "ghost"}
              colorPalette={effectiveCategory === cat.id ? "blue" : "gray"}
              onClick={() => setCategory(cat.id)}
              borderRadius="full"
              flexShrink={0}
              disabled={activeRole === 'code' && cat.id !== 'monospace'}
              opacity={activeRole === 'code' && cat.id !== 'monospace' ? 0.3 : 1}
            >
              {cat.label}
            </Button>
          ))}
        </HStack>
      </VStack>

      <Input 
        placeholder="Preview text..." 
        size="sm" 
        value={previewText} 
        onChange={(e) => setPreviewText(e.target.value)} 
        bg="gray.50"
        borderRadius="md"
      />

      <Box overflowY="auto" flex={1} px={1}>
        <VStack align="stretch" gap={6}>
          {/* Recent Fonts Section */}
          {recentFonts.length > 0 && !search && effectiveCategory === 'all' && (
            <VStack align="stretch" gap={3}>
              <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                Recently Used
              </Text>
              <SimpleGrid columns={2} gap={3}>
                {recentFonts.map(family => {
                  const font = (fonts as GoogleFont[]).find(f => f.family === family);
                  if (!font) return null;
                  const isSelected = family === primarySelected;
                  return (
                    <FontCard 
                      key={`recent-${family}`}
                      font={font}
                      previewText={previewText}
                      isSelected={isSelected}
                      onClick={() => handleSelect(family)}
                      onMouseEnter={() => loadGoogleFont(family)}
                    />
                  );
                })}
              </SimpleGrid>
              <Box h="1px" bg="gray.100" my={2} />
            </VStack>
          )}

          <VStack align="stretch" gap={3}>
            {filteredFonts.length > 0 ? (
              <SimpleGrid columns={2} gap={3}>
                {filteredFonts.map((font) => {
                  const isSelected = font.family === primarySelected;
                  return (
                    <FontCard 
                      key={font.family}
                      font={font}
                      previewText={previewText}
                      isSelected={isSelected}
                      onClick={() => handleSelect(font.family)}
                      onMouseEnter={() => loadGoogleFont(font.family)}
                    />
                  );
                })}
              </SimpleGrid>
            ) : (
              <Center p={8}>
                <Text fontSize="xs" color="gray.400">No fonts found matching your search.</Text>
              </Center>
            )}
          </VStack>
        </VStack>
      </Box>
    </VStack>
  );
};

interface FontCardProps {
  font: GoogleFont;
  previewText: string;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

const FontCard = ({ font, previewText, isSelected, onClick, onMouseEnter }: FontCardProps) => (
  <Box 
    p={4}
    borderRadius="xl"
    cursor="pointer"
    border="2px solid"
    borderColor={isSelected ? "blue.500" : "gray.100"}
    bg={isSelected ? "blue.50/30" : "white"}
    _hover={{ borderColor: isSelected ? "blue.500" : "blue.200", transform: "translateY(-2px)", boxShadow: "md" }}
    transition="all 0.2s"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    position="relative"
    overflow="hidden"
  >
    {/* Selection Overlay */}
    {isSelected && (
      <Box position="absolute" top={2} right={2}>
        <Circle size="20px" bg="blue.500" color="white">
          <LuCheck size={12} />
        </Circle>
      </Box>
    )}

    <VStack align="start" gap={3}>
      <VStack align="start" gap={0.5} w="full">
        <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider">
          {font.category.split('-')[0]}
        </Text>
        <Text 
          style={{ fontFamily: `"${font.family}", sans-serif` }} 
          fontSize="xl" 
          fontWeight="bold"
          lineClamp={1}
          color={isSelected ? "blue.700" : "gray.800"}
          title={font.family}
        >
          {font.family}
        </Text>
      </VStack>
      
      <Box h="1px" w="full" bg="gray.100" opacity={0.5} />

      <Text 
        style={{ fontFamily: `"${font.family}", sans-serif` }} 
        fontSize="xs" 
        color="gray.500"
        lineClamp={1}
      >
        {previewText}
      </Text>
    </VStack>
  </Box>
);

const Center = ({ children, ...props }: { children: React.ReactNode } & BoxProps) => (
  <Box display="flex" alignItems="center" justifyContent="center" {...props}>
    {children}
  </Box>
);
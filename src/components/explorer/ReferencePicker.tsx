import { 
  Box, VStack, HStack, Text, Badge, 
  Portal
} from "@chakra-ui/react";
import { useMemo } from "react";
import { LuHash, LuRuler, LuType, LuBox } from "react-icons/lu";
import type { TokenDoc } from "../../utils/token-parser";

interface ReferencePickerProps {
  isOpen: boolean;
  tokens: TokenDoc[];
  searchTerm: string;
  filterType: string;
  onSelect: (tokenName: string) => void;
  anchorRect: DOMRect | null;
}

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'color': return <LuHash size={12} />;
    case 'spacing':
    case 'dimension': return <LuRuler size={12} />;
    case 'fontSize':
    case 'fontWeight': return <LuType size={12} />;
    default: return <LuBox size={12} />;
  }
};

/**
 * High-Fidelity Reference Picker inspired by Figma Tokens Studio.
 * Scoped to Global Base tokens with visual swatches.
 */
export const ReferencePicker = ({ 
  isOpen, tokens, searchTerm, filterType, onSelect, anchorRect 
}: ReferencePickerProps) => {
  
  const filtered = useMemo(() => {
    if (!isOpen) return [];

    // 1. Filter: Global Base only
    const base = tokens.filter(t => t.sourceFile.includes('/global/base/'));

    // 2. Filter: Search match
    const search = searchTerm.toLowerCase();
    const matches = base.filter(t => t.name.toLowerCase().includes(search));

    // 3. Sort: Type matches first, then alphabetically
    return matches.sort((a, b) => {
      if (a.type === filterType && b.type !== filterType) return -1;
      if (a.type !== filterType && b.type === filterType) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [tokens, searchTerm, filterType, isOpen]);

  if (!isOpen || !anchorRect || filtered.length === 0) return null;

  return (
    <Portal>
      <VStack
        position="fixed"
        top={`${anchorRect.bottom + 8}px`}
        left={`${anchorRect.left}px`}
        w={`${anchorRect.width}px`}
        maxH="300px"
        bg="white"
        borderRadius="md"
        boxShadow="2xl"
        border="1px solid"
        borderColor="gray.200"
        zIndex={5000}
        overflowY="auto"
        align="stretch"
        gap={0}
        p={1}
      >
        <Box p={2} borderBottom="1px solid" borderColor="gray.50">
          <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">
            Linking to Global Base
          </Text>
        </Box>
        {filtered.map((token) => (
          <HStack
            key={token.id}
            p={2}
            borderRadius="sm"
            cursor="pointer"
            _hover={{ bg: "blue.50" }}
            onClick={() => onSelect(token.name)}
            gap={3}
          >
            {token.type === 'color' ? (
              <Box 
                w="20px" h="20px" 
                bg={token.resolvedValue || token.value} 
                borderRadius="2px" 
                border="1px solid rgba(0,0,0,0.1)"
                flexShrink={0}
              />
            ) : (
              <Box w="20px" h="20px" display="flex" alignItems="center" justifyContent="center" bg="gray.50" borderRadius="2px" flexShrink={0}>
                <TypeIcon type={token.type} />
              </Box>
            )}
            
            <VStack align="start" gap={0} flex={1} overflow="hidden">
              <Text fontSize="xs" fontWeight="bold" lineClamp={1}>
                {token.name}
              </Text>
              <Text fontSize="9px" color="gray.400">
                {token.sourceFile.split('/').pop()}
              </Text>
            </VStack>

            {token.type === filterType && (
              <Badge variant="subtle" size="xs" colorPalette="blue">Match</Badge>
            )}
          </HStack>
        ))}
      </VStack>
    </Portal>
  );
};

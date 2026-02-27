import { 
  Box, VStack, HStack, Text, Badge
} from "@chakra-ui/react";
import { useMemo } from "react";
import { 
  LuHash, LuRuler, LuType, LuBox, 
  LuCircleDot, LuSquare, 
  LuMoveHorizontal, LuClock, LuZap
} from "react-icons/lu";
import type { TokenDoc } from "../../utils/token-parser";
import { PopoverBody } from "../ui/popover";

interface ReferencePickerProps {
  tokens: TokenDoc[];
  searchTerm: string;
  filterType: string;
  onSelect: (tokenName: string) => void;
}

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'color': return <LuHash size={12} />;
    case 'spacing': return <LuMoveHorizontal size={12} />;
    case 'borderRadius': return <LuCircleDot size={12} />;
    case 'borderWidth': return <LuSquare size={12} />;
    case 'dimension': return <LuRuler size={12} />;
    case 'fontFamilies': return <LuType size={12} />;
    case 'fontWeights': return <LuType size={12} />;
    case 'fontSize':
    case 'fontSizes': return <LuType size={12} />;
    case 'lineHeight':
    case 'lineHeights': return <LuType size={12} />;
    case 'duration': return <LuClock size={12} />;
    case 'cubicBezier': return <LuZap size={12} />;
    default: return <LuBox size={12} />;
  }
};

/**
 * High-Fidelity Reference Picker inspired by Figma Tokens Studio.
 * Scoped to Global Base tokens with visual swatches.
 */
export const ReferencePicker = ({ 
  tokens, searchTerm, filterType, onSelect
}: ReferencePickerProps) => {
  const toSafeColor = (
    val: string | number | boolean | object | undefined | null,
  ) => {
    if (typeof val === "string" || typeof val === "number") return String(val);
    return "transparent";
  };
  
  const filtered = useMemo(() => {
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
  }, [tokens, searchTerm, filterType]);

  if (filtered.length === 0) return null;

  return (
    <PopoverBody
      maxH="300px"
      overflowY="auto"
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
              bg={toSafeColor(token.resolvedValue || token.value)} 
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
              <HStack gap={1} color="gray.400" fontSize="9px" whiteSpace="nowrap">
                <Text lineClamp={1}>{token.sourceFile.split('/').pop()}</Text>
                <Text color="gray.300">•</Text>
                <Text fontFamily="'Space Mono', monospace" color="blue.500/80" lineClamp={1}>
                  {typeof token.resolvedValue === 'object' ? JSON.stringify(token.resolvedValue) : String(token.resolvedValue)}
                </Text>
              </HStack>
            </VStack>
                    {token.type === filterType && (
            <Badge variant="subtle" size="xs" colorPalette="blue">Match</Badge>
          )}
        </HStack>
      ))}
    </PopoverBody>
  );
};

import { Box, VStack, Text, Link } from "@chakra-ui/react";
import type { FileCategory } from "../../utils/token-grouping";

interface ToCOutlineProps {
  categories: FileCategory[];
}

export const ToCOutline = ({ categories }: ToCOutlineProps) => {
  const scrollTo = (id: string) => {
    // Escape ID for query selector if needed, but here we used replace in CategoryAccordion
    const el = document.getElementById(`category-${id.replace('.', '-')}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Box 
      position="sticky" 
      top="88px" 
      w="full" 
      p={4} 
      borderWidth="1px" 
      borderRadius="lg" 
      bg="white"
      display={{ base: 'none', lg: 'block' }}
      boxShadow="sm"
    >
      <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={4} letterSpacing="widest">
        File Outline
      </Text>
      <VStack align="stretch" gap={2}>
        {categories.map(cat => (
          <Link 
            key={cat.id}
            fontSize="xs"
            color="gray.600"
            _hover={{ color: "blue.500", textDecoration: "none" }}
            onClick={() => scrollTo(cat.id)}
            cursor="pointer"
            fontWeight={cat.totalCount > 0 ? "medium" : "normal"}
            opacity={cat.totalCount > 0 ? 1 : 0.4}
          >
            {cat.title} ({cat.totalCount})
          </Link>
        ))}
      </VStack>
    </Box>
  );
};
import { Box, Heading, Text, VStack, HStack } from "@chakra-ui/react";
import { 
  AccordionRoot, 
  AccordionItem, 
  AccordionItemTrigger, 
  AccordionItemContent 
} from "../ui/accordion";
import type { FileCategory } from "../../utils/token-grouping";
import { TokenTable } from "../docs/TokenTable";
import { IdeMenuButton } from "./IdeMenuButton";
import { useState } from 'react';

interface CategoryAccordionProps {
  categories: FileCategory[];
  value: string[];
  onValueChange: (value: string[]) => void;
}

/**
 * Sub-component to manage local hover state for each category row.
 * This ensures the IDE menu appears reliably regardless of CSS selector issues.
 */
const CategoryAccordionItem = ({ category }: { category: FileCategory }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <AccordionItem 
      key={category.id} 
      value={category.id} 
      id={`category-${category.id.replace('.', '-')}`}
      borderWidth="1px"
      borderRadius="md"
      mb={4}
      bg="white"
      scrollMarginTop="90px"
    >
      <HStack 
        justify="space-between" 
        align="center" 
        cursor="pointer" 
        _hover={{ bg: "gray.50" }}
        transition="background 0.2s"
        position="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AccordionItemTrigger px={6} py={4} flex={1} pr="120px">
          <Heading size="sm">
            {category.title} ({category.totalCount})
          </Heading>
        </AccordionItemTrigger>
        
        <Box 
          position="absolute" 
          right={6} 
          top="50%" 
          transform="translateY(-50%)" 
          zIndex={2}
          opacity={isHovered ? 1 : 0}
          visibility={isHovered ? "visible" : "hidden"}
          transition="all 0.2s ease-in-out"
          w="max-content"
        >
          <IdeMenuButton filename={category.id} />
        </Box>
      </HStack>
      
      <AccordionItemContent px={6} pb={6}>
        <VStack align="stretch" gap={8} pt={4}>
          {category.subCategories.length > 0 ? (
            category.subCategories.map((sub) => (
              <Box key={sub.id}>
                {category.subCategories.length > 1 && (
                  <Heading 
                    size="xs" 
                    textTransform="uppercase" 
                    color="gray.500" 
                    mb={4} 
                    pb={2} 
                    borderBottom="1px solid" 
                    borderColor="gray.50"
                    letterSpacing="wider"
                  >
                    {sub.name}
                  </Heading>
                )}
                <TokenTable tokens={sub.tokens} />
              </Box>
            ))
          ) : (
            <Box py={8} textAlign="center">
              <Text color="gray.400" fontSize="sm">No results found in this category.</Text>
            </Box>
          )}
        </VStack>
      </AccordionItemContent>
    </AccordionItem>
  );
};

export const CategoryAccordion = ({ categories, value, onValueChange }: CategoryAccordionProps) => {
  return (
    <AccordionRoot 
      multiple 
      value={value} 
      onValueChange={(e) => onValueChange(e.value)}
      variant="subtle"
    >
      {categories.map((category) => (
        <CategoryAccordionItem key={category.id} category={category} />
      ))}
    </AccordionRoot>
  );
};

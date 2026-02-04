import { 
  Box, Heading, Text, SimpleGrid, VStack, 
  HStack, Container, Button, Badge,
  Image, Separator
} from "@chakra-ui/react";
import type { StudioMockData } from "./shared/mock-data";
import { 
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "../../ui/accordion";

export const ProductDetail = ({ data }: { data: StudioMockData }) => {
  return (
    <Box bg="white" minH="100vh" py={20} fontFamily="var(--fontFamilyBase)">
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={16}>
          {/* Image Gallery */}
          <VStack gap={6}>
            <Box 
              borderRadius="var(--radius4)" 
              overflow="hidden" 
              bg="gray.50" 
              border="1px solid" 
              borderColor="gray.100"
              position="relative"
            >
              <Image 
                src={data.product.image} 
                alt={data.product.name}
                fallbackSrc="https://via.placeholder.com/800"
                transition="transform 0.5s"
                _hover={{ transform: "scale(1.05)" }}
              />
              <Badge 
                position="absolute" top={6} left={6} 
                colorScheme="red" variant="solid" px={4} py={1}
                borderRadius="full" fontWeight="bold"
              >
                SALE
              </Badge>
            </Box>
            <SimpleGrid columns={4} gap={4} w="full">
              {[1, 2, 3, 4].map((i) => (
                <Box 
                  key={i} borderRadius="var(--radius2)" overflow="hidden" 
                  border="1px solid" borderColor={i === 1 ? "var(--brandPrimary)" : "gray.100"}
                  cursor="pointer"
                >
                  <Image src={data.product.image} opacity={i === 1 ? 1 : 0.5} />
                </Box>
              ))}
            </SimpleGrid>
          </VStack>

          {/* Product Info */}
          <VStack align="start" gap={8}>
            <VStack align="start" gap={2}>
              <HStack justify="space-between" w="full">
                <Text color="var(--brandPrimary)" fontWeight="bold" fontSize="sm" textTransform="uppercase" letterSpacing="widest">
                  {data.product.category}
                </Text>
                <HStack gap={1}>
                  <Text fontWeight="bold">{data.product.rating}</Text>
                  <Text color="gray.400" fontSize="xs">({data.product.reviews} reviews)</Text>
                </HStack>
              </HStack>
              <Heading size="2xl" letterSpacing="tight">{data.product.name}</Heading>
              <HStack gap={4} mt={2}>
                <Text fontSize="2xl" fontWeight="var(--fontWeightExtrabold)" color="var(--brandPrimary)">
                  {data.product.price}
                </Text>
                <Text fontSize="xl" color="gray.400" textDecoration="line-through">
                  {data.product.oldPrice}
                </Text>
              </HStack>
            </VStack>

            <Text color="gray.600" fontSize="md" lineHeight="relaxed">
              {data.product.description}
            </Text>

            <Separator borderColor="gray.100" />

            {/* Variants */}
            <VStack align="start" gap={4} w="full">
              <Text fontWeight="bold" fontSize="xs" textTransform="uppercase" color="gray.500">Select Color</Text>
              <HStack gap={3}>
                {data.product.variants.colors.map((color, i) => (
                  <Box 
                    key={i} w={10} h={10} bg={color} borderRadius="full" 
                    border="2px solid" borderColor={i === 0 ? "black" : "white"}
                    cursor="pointer" boxShadow="sm"
                    _hover={{ transform: "scale(1.1)" }}
                    transition="all 0.2s"
                  />
                ))}
              </HStack>
            </VStack>

            <VStack align="start" gap={4} w="full">
              <Text fontWeight="bold" fontSize="xs" textTransform="uppercase" color="gray.500">Select Size</Text>
              <HStack gap={2}>
                {data.product.variants.sizes.map((size) => (
                  <Button 
                    key={size} variant="outline" size="sm" px={6} 
                    borderRadius="var(--radius2)"
                    borderColor={size === 'M' ? "black" : "gray.200"}
                    color={size === 'M' ? "black" : "gray.600"}
                  >
                    {size}
                  </Button>
                ))}
              </HStack>
            </VStack>

            <HStack gap={4} w="full" pt={4}>
              <Button 
                size="lg" flex={2} bg="var(--brandPrimary)" color="white" 
                borderRadius="var(--radius3)" fontWeight="bold"
                _hover={{ opacity: 0.9 }}
              >
                Add to Cart
              </Button>
              <Button size="lg" flex={1} variant="outline" borderRadius="var(--radius3)" borderColor="gray.200">
                Wishlist
              </Button>
            </HStack>

            <AccordionRoot collapsible defaultValue={["info"]} variant="plain" w="full">
              <AccordionItem value="info">
                <AccordionItemTrigger fontWeight="bold">Product Information</AccordionItemTrigger>
                <AccordionItemContent fontSize="sm" color="gray.600">
                  This product is meticulously crafted using high-quality materials and our precision-based design system tokens.
                </AccordionItemContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionItemTrigger fontWeight="bold">Shipping & Returns</AccordionItemTrigger>
                <AccordionItemContent fontSize="sm" color="gray.600">
                  Free worldwide shipping on all orders over $200. 30-day money-back guarantee.
                </AccordionItemContent>
              </AccordionItem>
            </AccordionRoot>
          </VStack>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

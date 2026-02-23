import { 
  Box, Heading, Text, SimpleGrid, VStack, 
  HStack, Container, Button, Badge,
  Image, Separator, Float
} from "@chakra-ui/react";
import { 
  LuStar, LuShoppingBag, LuHeart, LuTruck, LuShieldCheck, 
  LuChevronRight, LuPackage
} from "react-icons/lu";
import type { StudioMockData } from "./shared/mock-data";
import { Tabs } from "@chakra-ui/react";
import { useState } from 'react';
import { faker } from '@faker-js/faker';

/**
 * High-Fidelity Product Detail Template
 * Stress-tests: Layout Grids, Image Borders, Accent Colors, Accordion/Tabs radius
 */
export const ProductDetail = ({ data }: { data: StudioMockData }) => {
  const [selectedSize, setSelectedSize] = useState('M');

  return (
    <Box bg="var(--bg-canvas)" minH="100vh" py={12} fontFamily="var(--font-family-body)" color="var(--text-primary)">
      <Container maxW="container.xl">
        
        {/* 1. Breadcrumbs */}
        <HStack gap={2} mb={12} color="gray.400" fontSize="xs" fontWeight="bold" fontFamily="var(--font-family-body)" data-tokens="font.family.base">
          <Text cursor="pointer" _hover={{ color: "var(--brand-secondary)" }} data-tokens="brand.secondary">Shop</Text>
          <LuChevronRight size={12} />
          <Text cursor="pointer" _hover={{ color: "var(--brand-secondary)" }} data-tokens="brand.secondary">{data.product.category}</Text>
          <LuChevronRight size={12} />
          <Text color="var(--text-primary)" data-tokens="text.primary">{data.product.name}</Text>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={20}>
          {/* 2. Image Gallery & Stress Test */}
          <VStack gap={8}>
            <Box 
              borderRadius="var(--radius4)" 
              overflow="hidden" 
              bg="gray.50" 
              border="1px solid" 
              borderColor="gray.100"
              position="relative"
              w="full"
              data-tokens="border.radius.4"
            >
              <Image 
                src={data.product.image} 
                alt={data.product.name}
                transition="transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ transform: "scale(1.05)" }}
              />
              <Badge 
                position="absolute" top={8} left={8} 
                bg="var(--brand-accent)" color="white" variant="solid" px={6} py={1.5}
                borderRadius="full" fontWeight="var(--font-weight-extrabold)"
                boxShadow="xl"
                fontFamily="var(--font-family-heading)"
                data-tokens="brand.accent, font.family.heading, font.weight.extrabold"
              >
                SPECIAL EDITION
              </Badge>
            </Box>
            <SimpleGrid columns={4} gap={6} w="full">
              {[1, 2, 3, 4].map((i) => (
                <Box 
                  key={i} borderRadius="var(--radius2)" overflow="hidden" 
                  border="2px solid" borderColor={i === 1 ? "var(--brand-primary)" : "gray.50"}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ borderColor: "var(--brand-primary)", opacity: 1 }}
                  opacity={i === 1 ? 1 : 0.6}
                  data-tokens="brand.primary, border.radius.2"
                >
                  <Image src={data.product.image} />
                </Box>
              ))}
            </SimpleGrid>
          </VStack>

          {/* 3. Product Content */}
          <VStack align="start" gap={10}>
            <VStack align="start" gap={4} w="full">
              <HStack justify="space-between" w="full">
                <Badge variant="subtle" colorPalette="blue" px={3} py={1} borderRadius="var(--radius1)" fontFamily="var(--font-family-heading)" data-tokens="font.family.heading, border.radius.1">
                  {data.product.category}
                </Badge>
                <HStack gap={1}>
                  <HStack color="orange.400" gap={0}>
                    {[1,2,3,4,5].map(s => <LuStar key={s} size={14} fill={s <= Math.floor(data.product.rating) ? "currentColor" : "none"} />)}
                  </HStack>
                  <Text fontWeight="bold" fontSize="sm">{data.product.rating}</Text>
                  <Text color="gray.400" fontSize="xs">({data.product.reviewsCount} reviews)</Text>
                </HStack>
              </HStack>
              
              <Heading size="3xl" letterSpacing="tight" fontWeight="var(--font-weight-extrabold)" color="var(--text-primary)" fontFamily="var(--font-family-heading)" data-tokens="text.primary, font.family.heading, font.weight.extrabold">
                {data.product.name}
              </Heading>
              
              <HStack gap={6} mt={2}>
                <Text fontSize="3xl" fontWeight="var(--font-weight-extrabold)" color="var(--brand-accent)" fontFamily="var(--font-family-heading)" data-tokens="brand.accent, font.family.heading">
                  {data.product.price}
                </Text>
                <VStack align="start" gap={0}>
                  <Text fontSize="lg" color="gray.300" textDecoration="line-through">
                    {data.product.oldPrice}
                  </Text>
                  <Text fontSize="10px" color="var(--brand-accent)" fontWeight="bold" data-tokens="brand.accent">SAVE 40% TODAY</Text>
                </VStack>
              </HStack>

              <Text color="var(--text-primary)" opacity={0.8} fontSize="md" lineHeight="tall" maxW="xl" data-tokens="text.primary">
                {data.product.description}
              </Text>
            </VStack>

            <Separator borderColor="gray.100" />

            {/* 4. Interactive Selectors */}
            <VStack align="start" gap={6} w="full">
              <VStack align="start" gap={4} w="full">
                <Text fontWeight="bold" fontSize="xs" textTransform="uppercase" color="gray.400" letterSpacing="widest">Colorway</Text>
                <HStack gap={4}>
                  {data.product.variants.colors.map((color, i) => (
                    <Box 
                      key={i} w={12} h={12} bg={color} borderRadius="full" 
                      border="3px solid" borderColor={i === 0 ? "var(--brand-primary)" : "white"}
                      cursor="pointer" boxShadow="md"
                      _hover={{ transform: "scale(1.1)" }}
                      transition="all 0.2s"
                      data-tokens={i === 0 ? "brand.primary" : ""}
                    />
                  ))}
                </HStack>
              </VStack>

              <VStack align="start" gap={4} w="full">
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" fontSize="xs" textTransform="uppercase" color="gray.400" letterSpacing="widest">Select Size</Text>
                  <Button size="xs" variant="plain" color="var(--brand-secondary)" fontWeight="bold" data-tokens="brand.secondary">Size Guide</Button>
                </HStack>
                <HStack gap={3}>
                  {data.product.variants.sizes.map((size) => (
                    <Button 
                      key={size} 
                      variant={selectedSize === size ? "solid" : "outline"} 
                      bg={selectedSize === size ? "var(--text-primary)" : "transparent"}
                      color={selectedSize === size ? "var(--bg-canvas)" : "var(--text-primary)"}
                      borderColor={selectedSize === size ? "var(--text-primary)" : "var(--brand-secondary)"}
                      size="md" px={8} 
                      borderRadius="var(--radius2)"
                      fontWeight="bold"
                      onClick={() => setSelectedSize(size)}
                      data-tokens={selectedSize === size ? "text.primary, bg.canvas" : "brand.secondary, text.primary"}
                    >
                      {size}
                    </Button>
                  ))}
                </HStack>
              </VStack>
            </VStack>

            {/* 5. CTA Area */}
            <VStack gap={4} w="full">
              <HStack gap={4} w="full">
                <Button 
                  size="xl" flex={4} bg="var(--brand-primary)" color="white" 
                  borderRadius="var(--radius3)" fontWeight="var(--font-weight-extrabold)"
                  boxShadow="0 20px 40px -10px var(--brand-primary)"
                  _hover={{ opacity: 0.9, transform: "translateY(-2px)" }}
                  gap={3}
                  data-tokens="brand.primary, font.weight.extrabold, border.radius.3"
                >
                  <LuShoppingBag /> Add to Cart
                </Button>
                <Button size="xl" flex={1} variant="outline" borderRadius="var(--radius3)" borderColor="var(--brand-secondary)" _hover={{ bg: "red.50", borderColor: "red.100", color: "red.500" }} data-tokens="brand.secondary, border.radius.3">
                  <LuHeart />
                </Button>
              </HStack>
              <HStack gap={6} w="full" justify="center" pt={4}>
                <HStack gap={2} color="green.500" fontSize="xs" fontWeight="bold">
                  <LuTruck /> <Text>Free Shipping</Text>
                </HStack>
                <Separator orientation="vertical" h="12px" />
                <HStack gap={2} color="blue.500" fontSize="xs" fontWeight="bold">
                  <LuShieldCheck /> <Text>2 Year Warranty</Text>
                </HStack>
                <Separator orientation="vertical" h="12px" />
                <HStack gap={2} color="var(--brand-accent)" fontSize="xs" fontWeight="bold">
                  <LuPackage /> <Text>In Stock</Text>
                </HStack>
              </HStack>
            </VStack>

            {/* 6. Technical Tabs */}
            <Tabs.Root defaultValue="details" w="full" variant="line" colorPalette="blue">
              <Tabs.List mb={6}>
                <Tabs.Trigger value="details" fontWeight="bold" color="var(--text-primary)">Details</Tabs.Trigger>
                <Tabs.Trigger value="specs" fontWeight="bold" color="var(--text-primary)">Specifications</Tabs.Trigger>
                <Tabs.Trigger value="reviews" fontWeight="bold" color="var(--text-primary)">Reviews ({data.product.reviewsCount})</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="details" py={4}>
                <Text fontSize="sm" color="var(--text-primary)" opacity={0.7} lineHeight="relaxed">
                  Experience the perfect blend of form and function. This piece was designed with our core design tokens to ensure maximum visual harmony and accessibility.
                </Text>
              </Tabs.Content>
              <Tabs.Content value="specs" py={4}>
                <VStack align="stretch" gap={3}>
                  {data.product.specs.map(spec => (
                    <HStack key={spec.label} justify="space-between" p={3} bg="gray.50" borderRadius="var(--radius1)" border="1px solid" borderColor="var(--brand-secondary)">
                      <Text fontSize="xs" fontWeight="bold" color="gray.500">{spec.label}</Text>
                      <Text fontSize="xs" fontWeight="bold" color="var(--text-primary)">{spec.value}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Tabs.Content>
              <Tabs.Content value="reviews" py={4}>
                <VStack align="stretch" gap={6}>
                  {data.product.reviews.map((rev, i) => (
                    <VStack key={i} align="start" gap={2} p={4} border="1px solid" borderColor="var(--brand-secondary)" borderRadius="var(--radius2)">
                      <HStack justify="space-between" w="full">
                        <Text fontSize="xs" fontWeight="bold" color="var(--text-primary)">{rev.user}</Text>
                        <Text fontSize="10px" color="gray.400">{rev.date}</Text>
                      </HStack>
                      <HStack color="orange.400" gap={0}>
                        {[1,2,3,4,5].map(s => <LuStar key={s} size={10} fill={s <= rev.rating ? "currentColor" : "none"} />)}
                      </HStack>
                      <Text fontSize="xs" color="var(--text-primary)" opacity={0.8}>{rev.comment}</Text>
                    </VStack>
                  ))}
                </VStack>
              </Tabs.Content>
            </Tabs.Root>
          </VStack>
        </SimpleGrid>

        {/* 7. Related Items */}
        <Box mt={32} pt={20} borderTop="1px solid" borderColor="gray.100">
          <Heading size="xl" mb={12} letterSpacing="tight" color="var(--text-primary)">Complete the Look</Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={8}>
            {[1,2,3,4].map(i => (
              <VStack key={i} align="start" gap={4} role="group" cursor="pointer">
                <Box bg="gray.50" borderRadius="var(--radius3)" overflow="hidden" w="full" position="relative">
                  <Image src={data.product.image} filter="grayscale(0.5)" _groupHover={{ filter: "grayscale(0)", transform: "scale(1.05)" }} transition="all 0.5s" />
                  <Float placement="bottom-end" offset={4}>
                    <Button size="xs" bg="var(--bg-canvas)" color="var(--text-primary)" border="1px solid" borderColor="var(--brand-secondary)" borderRadius="full" boxShadow="md" fontWeight="bold">Quick Add</Button>
                  </Float>
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontWeight="bold" fontSize="sm" color="var(--text-primary)">{faker.commerce.productName()}</Text>
                  <Text color="var(--brand-accent)" fontSize="xs" fontWeight="bold">{data.product.price}</Text>
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
};
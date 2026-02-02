import { Box, SimpleGrid, VStack, HStack, Text, Heading, Button } from "@chakra-ui/react";

export const Dashboard = () => {
  return (
    <Box bg="#f0f2f5" minH="100vh" fontFamily="var(--fontFamilyBase)" display="flex">
      {/* Sidebar */}
      <Box w="260px" bg="white" borderRight="1px solid" borderColor="gray.200" p={6}>
        <Heading size="md" mb={10} color="var(--brandPrimary)">Token OS</Heading>
        <VStack align="stretch" gap={2}>
          {["Overview", "Tokens", "Themes", "Settings", "Analytics"].map((item, i) => (
            <Box 
              key={item} 
              p={3} 
              borderRadius="var(--radius1)" 
              bg={i === 0 ? "rgba(0,0,0,0.05)" : "transparent"}
              fontWeight={i === 0 ? "bold" : "normal"}
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
            >
              {item}
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex={1}>
        {/* Header */}
        <Box bg="white" h="70px" borderBottom="1px solid" borderColor="gray.200" px={8} display="flex" alignItems="center" justifyContent="space-between">
          <Heading size="sm">Project Overview</Heading>
          <HStack gap={4}>
            <Button size="sm" variant="outline">Docs</Button>
            <Button size="sm" bg="var(--brandPrimary)" color="white" borderRadius="var(--radius1)">New Project</Button>
          </HStack>
        </Box>

        {/* Content Body */}
        <Box p={8}>
          <SimpleGrid columns={4} gap="var(--gridGutterDesktop)" mb={10}>
            {[
              { label: "Active Tokens", value: "1,240", change: "+12%" },
              { label: "Built Projects", value: "48", change: "+5" },
              { label: "Contrast Success", value: "98%", change: "stable" },
              { label: "Avg Sync Time", value: "1.2s", change: "-0.4s" }
            ].map((stat, i) => (
              <Box key={i} bg="white" p={6} borderRadius="var(--radius2)" boxShadow="sm" border="1px solid" borderColor="gray.100">
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2} textTransform="uppercase">{stat.label}</Text>
                <Heading size="lg">{stat.value}</Heading>
                <Text fontSize="2xs" color="green.500" mt={2}>{stat.change}</Text>
              </Box>
            ))}
          </SimpleGrid>

          <Box bg="white" p={8} borderRadius="var(--radius3)" boxShadow="sm" border="1px solid" borderColor="gray.100">
            <Heading size="md" mb={6}>Recent Activity</Heading>
            <VStack align="stretch" gap={4}>
              {[1, 2, 3, 4, 5].map((item) => (
                <HStack key={item} justify="space-between" py={3} borderBottom="1px solid" borderColor="gray.50">
                  <HStack gap={4}>
                    <Box w={10} h={10} bg="gray.100" borderRadius="full" />
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" fontWeight="bold">Token Updated: brand.primary</Text>
                      <Text fontSize="xs" color="gray.500">2 hours ago by Kami</Text>
                    </VStack>
                  </HStack>
                  <Badge colorScheme="blue">v0.1.0</Badge>
                </HStack>
              ))}
            </VStack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const Badge = ({ children, colorScheme }: any) => (
  <Box bg={`${colorScheme}.50`} color={`${colorScheme}.600`} px={2} borderRadius="sm" fontSize="10px" fontWeight="bold">
    {children}
  </Box>
);
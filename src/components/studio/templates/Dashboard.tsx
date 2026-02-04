import { 
  Box, Heading, Text, SimpleGrid, VStack, 
  HStack, Container, Badge, Table,
  Button
} from "@chakra-ui/react";
import type { StudioMockData } from "./shared/mock-data";

export const Dashboard = ({ data }: { data: StudioMockData }) => {
  return (
    <Box bg="gray.50" minH="100vh" py={12} fontFamily="var(--fontFamilyBase)">
      <Container maxW="container.xl">
        <VStack align="stretch" gap={10}>
          {/* Header */}
          <HStack justify="space-between">
            <VStack align="start" gap={1}>
              <Heading size="lg" letterSpacing="tight">Analytics Overview</Heading>
              <Text color="gray.500" fontSize="sm">Welcome back, here's what's happening with your brand.</Text>
            </VStack>
            <HStack gap={3}>
              <Box p={2} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontSize="xs" fontWeight="bold">Last 30 Days</Text>
              </Box>
            </HStack>
          </HStack>

          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 4 }} gap={6}>
            {[
              { label: "Total Revenue", value: data.dashboard.totalRevenue, trend: "+12.5%", color: "green" },
              { label: "Active Users", value: data.dashboard.activeUsers.toLocaleString(), trend: "+3.2%", color: "blue" },
              { label: "Conversion Rate", value: data.dashboard.conversionRate, trend: "-0.4%", color: "red" },
              { label: "Sales Count", value: data.dashboard.salesCount.toLocaleString(), trend: "+18.1%", color: "green" }
            ].map((stat, i) => (
              <VStack key={i} align="start" p={6} bg="white" borderRadius="var(--radius3)" boxShadow="sm" border="1px solid" borderColor="gray.100">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">{stat.label}</Text>
                <HStack align="baseline" gap={2}>
                  <Heading size="xl">{stat.value}</Heading>
                  <Badge colorScheme={stat.color} variant="subtle" fontSize="10px">{stat.trend}</Badge>
                </HStack>
              </VStack>
            ))}
          </SimpleGrid>

          {/* Table & Chart Area */}
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            <Box gridColumn={{ md: "span 2" }} bg="white" p={8} borderRadius="var(--radius4)" boxShadow="sm" border="1px solid" borderColor="gray.100">
              <Heading size="md" mb={6}>Recent Transactions</Heading>
              <Table.Root size="sm" variant="line">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>ID</Table.ColumnHeader>
                    <Table.ColumnHeader>Customer</Table.ColumnHeader>
                    <Table.ColumnHeader>Amount</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Date</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.dashboard.recentTransactions.map((tx) => (
                    <Table.Row key={tx.id}>
                      <Table.Cell><Text fontSize="xs" fontWeight="bold" fontFamily="monospace">{tx.id}</Text></Table.Cell>
                      <Table.Cell><Text fontSize="xs" fontWeight="medium">{tx.user}</Text></Table.Cell>
                      <Table.Cell><Text fontSize="xs" fontWeight="bold">{tx.amount}</Text></Table.Cell>
                      <Table.Cell>
                        <Badge 
                          colorScheme={tx.status === 'success' ? 'green' : tx.status === 'pending' ? 'orange' : 'red'} 
                          variant="solid" fontSize="9px"
                        >
                          {tx.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell textAlign="end"><Text fontSize="xs" color="gray.500">{tx.date}</Text></Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>

            <VStack align="stretch" gap={6}>
              <Box bg="var(--brandPrimary)" p={8} borderRadius="var(--radius4)" color="white" position="relative" overflow="hidden">
                <Box position="absolute" top="-20%" right="-20%" w="150px" h="150px" bg="white" opacity={0.1} borderRadius="full" />
                <VStack align="start" gap={4} position="relative" zIndex={1}>
                  <Heading size="md">Pro Plan</Heading>
                  <Text fontSize="sm" opacity={0.9}>Upgrade to unlock advanced token analytics and multi-tenant support.</Text>
                  <Button size="sm" bg="white" colorScheme="blue" fontWeight="bold" w="full">Upgrade Now</Button>
                </VStack>
              </Box>
              
              <Box bg="white" p={8} borderRadius="var(--radius4)" boxShadow="sm" border="1px solid" borderColor="gray.100">
                <Heading size="sm" mb={4}>Active Session</Heading>
                <VStack align="start" gap={2}>
                  <Text fontSize="2xs" fontWeight="bold" color="gray.400">SESSION ID</Text>
                  <Text fontSize="xs" fontFamily="monospace" p={2} bg="gray.50" borderRadius="md" w="full">SES_99283_KAMIFLOW</Text>
                </VStack>
              </Box>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};
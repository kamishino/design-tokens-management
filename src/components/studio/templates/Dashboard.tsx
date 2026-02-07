import { 
  Box, Heading, Text, SimpleGrid, VStack, 
  HStack, Container, Badge, Table,
  Button, Input, Icon,
  Circle, Flex, Center
} from "@chakra-ui/react";
import { 
  LuSearch, LuArrowUpRight, LuArrowDownRight, 
  LuTrendingUp, LuUsers, LuDollarSign, LuShoppingCart,
  LuBell, LuChevronRight
} from "react-icons/lu";
import type { StudioMockData } from "./shared/mock-data";
import { useState } from 'react';

/**
 * Simple Sparkline component using Chakra Primitives
 */
const MiniSparkline = ({ data, color }: { data: number[], color: string }) => (
  <HStack gap={1} h="32px" align="flex-end" w="full">
    {data.map((v, i) => (
      <Box 
        key={i} 
        flex={1} 
        h={`${v}%`} 
        bg={`${color}.400`} 
        opacity={0.3 + (v / 100) * 0.7} 
        borderRadius="1px" 
      />
    ))}
  </HStack>
);

/**
 * High-Fidelity Dashboard Template
 * Stress-tests: Background Colors, Borders, Status Badges, Monospace Fonts
 */
export const Dashboard = ({ data }: { data: StudioMockData }) => {
  const [search, setSearch] = useState("");

  const filteredTransactions = data.dashboard.recentTransactions.filter(tx => 
    tx.user.toLowerCase().includes(search.toLowerCase()) || 
    tx.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box bg="var(--bgCanvas)" minH="100vh" fontFamily="var(--fontFamilyBase)" color="var(--textPrimary)">
      {/* 1. Dashboard Header */}
      <Box bg="var(--bgCanvas)" borderBottom="1px solid" borderColor="var(--brandSecondary)" py={4} px={8} position="sticky" top={0} zIndex={10}>
        <Container maxW="container.xl">
          <HStack justify="space-between">
            <HStack gap={8}>
              <VStack align="start" gap={0}>
                <Heading size="md" letterSpacing="tight" fontWeight="var(--fontWeightExtrabold)" color="var(--textPrimary)">Dashboard</Heading>
                <Text fontSize="xs" color="gray.500">{data.brand.name} Analytics</Text>
              </VStack>
              <HStack gap={4} bg="gray.50" px={4} py={2} borderRadius="var(--radius2)" border="1px solid" borderColor="var(--brandSecondary)">
                <LuSearch size={14} color="gray" />
                <Input 
                  placeholder="Quick search..." 
                  variant="subtle" 
                  size="sm" 
                  w="200px" 
                  fontSize="xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  color="var(--textPrimary)"
                />
              </HStack>
            </HStack>
            <HStack gap={4}>
              <IconButton icon={<LuBell size={18} />} variant="ghost" color="var(--textPrimary)" />
              <HStack gap={3}>
                <Circle size="32px" bg="var(--brandPrimary)" color="white" fontWeight="bold" fontSize="xs">TH</Circle>
                <VStack align="start" gap={0} display={{ base: 'none', md: 'flex' }}>
                  <Text fontSize="xs" fontWeight="bold" color="var(--textPrimary)">Admin User</Text>
                  <Text fontSize="10px" color="gray.400">System Architect</Text>
                </VStack>
              </HStack>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <SimpleGrid columns={{ base: 1, lg: 4 }} gap={8}>
          {/* Main Content (Span 3) */}
          <VStack align="stretch" gap={8} gridColumn={{ lg: "span 3" }}>
            
            {/* 2. Stats Grid */}
            <SimpleGrid columns={{ base: 1, md: 4 }} gap={6}>
              {[
                { label: "Revenue", value: data.dashboard.totalRevenue, trend: "+12.5%", color: "var(--brandAccent)", icon: LuDollarSign },
                { label: "Users", value: data.dashboard.activeUsers.toLocaleString(), trend: "+3.2%", color: "var(--brandPrimary)", icon: LuUsers },
                { label: "Rate", value: data.dashboard.conversionRate, trend: "-0.4%", color: "red", icon: LuTrendingUp },
                { label: "Sales", value: data.dashboard.salesCount.toLocaleString(), trend: "+18.1%", color: "var(--brandAccent)", icon: LuShoppingCart }
              ].map((stat, i) => (
                <VStack key={i} align="stretch" p={6} bg="white" borderRadius="var(--radius3)" boxShadow="sm" border="1px solid" borderColor="var(--brandSecondary)" gap={4}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">{stat.label}</Text>
                    <Icon as={stat.icon} color={stat.color || "gray.300"} boxSize="16px" />
                  </HStack>
                  <VStack align="start" gap={1}>
                    <Heading size="xl" letterSpacing="tighter" color="var(--textPrimary)">{stat.value}</Heading>
                    {stat.trend && (
                      <HStack gap={1} color={stat.color}>
                        {stat.trend.startsWith('+') ? <LuArrowUpRight size={12} /> : <LuArrowDownRight size={12} />}
                        <Text fontSize="xs" fontWeight="bold">{stat.trend}</Text>
                      </HStack>
                    )}
                  </VStack>
                  <MiniSparkline data={data.dashboard.statsHistory} color={stat.color === 'red' ? 'red' : 'blue'} />
                </VStack>
              ))}
            </SimpleGrid>

            {/* 3. Main Transaction Table */}
            <Box bg="white" p={8} borderRadius="var(--radius4)" boxShadow="sm" border="1px solid" borderColor="var(--brandSecondary)">
              <HStack justify="space-between" mb={8}>
                <VStack align="start" gap={1}>
                  <Heading size="md" color="var(--textPrimary)">Recent Transactions</Heading>
                  <Text fontSize="xs" color="gray.400">Processing real-time payment data</Text>
                </VStack>
                <Button size="sm" variant="outline" borderColor="var(--brandSecondary)" color="var(--textPrimary)" borderRadius="var(--radius2)">Export CSV</Button>
              </HStack>
              
              <Table.Root size="sm" variant="line">
                <Table.Header>
                  <Table.Row borderColor="var(--brandSecondary)">
                    <Table.ColumnHeader color="gray.400" fontSize="10px" textTransform="uppercase">Transaction ID</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.400" fontSize="10px" textTransform="uppercase">Customer</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.400" fontSize="10px" textTransform="uppercase">Amount</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.400" fontSize="10px" textTransform="uppercase">Status</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end" color="gray.400" fontSize="10px" textTransform="uppercase">Date</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredTransactions.map((tx) => (
                    <Table.Row key={tx.id} _hover={{ bg: "gray.50/50" }} borderColor="var(--brandSecondary)">
                      <Table.Cell><Text fontSize="xs" fontWeight="bold" fontFamily="monospace" color="var(--brandPrimary)">{tx.id}</Text></Table.Cell>
                      <Table.Cell><Text fontSize="xs" fontWeight="bold" color="var(--textPrimary)">{tx.user}</Text></Table.Cell>
                      <Table.Cell><Text fontSize="xs" fontWeight="var(--fontWeightExtrabold)" color="var(--textPrimary)">{tx.amount}</Text></Table.Cell>
                      <Table.Cell>
                        <Badge 
                          colorPalette={tx.status === 'success' ? 'green' : tx.status === 'pending' ? 'orange' : 'red'} 
                          variant="subtle" fontSize="9px" px={2} borderRadius="full"
                        >
                          {tx.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell textAlign="end"><Text fontSize="xs" color="gray.500">{tx.date}</Text></Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
              {filteredTransactions.length === 0 && (
                <Center py={12}><Text color="gray.400" fontSize="sm">No transactions found for "{search}"</Text></Center>
              )}
            </Box>
          </VStack>

          {/* 4. Activity Sidebar */}
          <VStack align="stretch" gap={8}>
            <Box bg="var(--brandPrimary)" p={8} borderRadius="var(--radius4)" color="white" position="relative" overflow="hidden" boxShadow="lg">
              <Box position="absolute" top="-20%" right="-20%" w="150px" h="150px" bg="white" opacity={0.1} borderRadius="full" />
              <VStack align="start" gap={6} position="relative" zIndex={1}>
                <VStack align="start" gap={2}>
                  <Heading size="md">Scale Higher</Heading>
                  <Text fontSize="sm" opacity={0.8}>Upgrade to Enterprise for multi-tenant token support and advanced lineage.</Text>
                </VStack>
                <Button size="md" w="full" bg="white" color="var(--brandPrimary)" fontWeight="var(--fontWeightExtrabold)" borderRadius="var(--radius2)" _hover={{ transform: "translateY(-2px)" }}>
                  Upgrade Plan
                </Button>
              </VStack>
            </Box>

            <Box bg="white" p={8} borderRadius="var(--radius4)" boxShadow="sm" border="1px solid" borderColor="var(--brandSecondary)">
              <Heading size="sm" mb={6} color="var(--textPrimary)">Live Feed</Heading>
              <VStack align="stretch" gap={6}>
                {[
                  { label: "Token Updated", desc: "brand.primary changed to #3B82F6", time: "2m ago" },
                  { label: "Build Success", desc: "Production CSS generated", time: "15m ago" },
                  { label: "New Project", desc: "Brand B initialized", time: "1h ago" }
                ].map((item, i) => (
                  <HStack key={i} align="flex-start" gap={4}>
                    <Box mt={1}><Circle size="8px" bg={i === 0 ? "var(--brandAccent)" : "gray.200"} /></Box>
                    <VStack align="start" gap={0.5}>
                      <Text fontSize="xs" fontWeight="bold" color="var(--textPrimary)">{item.label}</Text>
                      <Text fontSize="10px" color="gray.500">{item.desc}</Text>
                      <Text fontSize="9px" color="gray.300" fontWeight="bold">{item.time}</Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
              <Button size="xs" variant="ghost" w="full" mt={6} color="gray.400">View All <LuChevronRight /></Button>
            </Box>

            <Box bg="white" p={8} borderRadius="var(--radius4)" boxShadow="sm" border="1px solid" borderColor="var(--brandSecondary)">
              <Heading size="sm" mb={6} color="var(--textPrimary)">Top Categories</Heading>
              <VStack align="stretch" gap={4}>
                {data.dashboard.topProducts.map((p, i) => (
                  <VStack key={i} align="stretch" gap={1}>
                    <HStack justify="space-between">
                      <Text fontSize="xs" fontWeight="bold" lineClamp={1} color="var(--textPrimary)">{p.name}</Text>
                      <Text fontSize="10px" color="var(--brandAccent)" fontWeight="bold">{p.growth}</Text>
                    </HStack>
                    <Flex h="4px" bg="gray.100" borderRadius="full" overflow="hidden">
                      <Box w={`${(p.sales / 500) * 100}%`} bg="var(--brandPrimary)" borderRadius="full" />
                    </Flex>
                  </VStack>
                ))}
              </VStack>
            </Box>
          </VStack>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

// Internal IconButton for demo
const IconButton = ({ icon, ...props }: { icon: React.ReactNode, [key: string]: unknown }) => (
  <Box 
    p={2} borderRadius="var(--radius2)" cursor="pointer" 
    _hover={{ bg: "gray.100" }} transition="all 0.2s" 
    display="flex" alignItems="center" justifyContent="center"
    {...props}
  >
    {icon}
  </Box>
);

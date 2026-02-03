import { Box, VStack, Text, Link } from "@chakra-ui/react";
import type { NavSection } from "../../utils/doc-nav";

interface SidebarProps {
  nav: NavSection[];
  onSelectPage: (type: 'md' | 'tokens', id: string) => void;
  activeId: string;
}

export const Sidebar = ({ nav, onSelectPage, activeId }: SidebarProps) => {
  return (
    <Box w="280px" borderRight="1px solid" borderColor="gray.200" h="calc(100vh - 60px)" p={6} overflowY="auto">
      <VStack align="stretch" gap={8}>
        {/* Guidelines Section */}
        <Box>
          <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={3} letterSpacing="widest">
            Guidelines
          </Text>
          <VStack align="start" gap={1}>
            <Link 
              fontSize="sm" 
              fontWeight={activeId === 'introduction' ? "bold" : "normal"}
              color={activeId === 'introduction' ? "blue.600" : "gray.600"}
              onClick={() => onSelectPage('md', 'introduction')}
              cursor="pointer"
            >
              Introduction
            </Link>
          </VStack>
        </Box>

        {/* Tokens Section */}
        {nav.map(section => (
          <Box key={section.title}>
            <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={3} letterSpacing="widest">
              {section.title}
            </Text>
            <VStack align="start" gap={1}>
              {section.items.map(item => (
                <Link 
                  key={item} 
                  fontSize="sm" 
                  fontWeight={activeId === item ? "bold" : "normal"}
                  color={activeId === item ? "blue.600" : "gray.600"}
                  onClick={() => onSelectPage('tokens', item)}
                  cursor="pointer"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Link>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
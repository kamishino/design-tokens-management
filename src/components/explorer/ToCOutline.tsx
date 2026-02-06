import { Box, VStack, Text, Link, HStack } from "@chakra-ui/react";
import { useMemo, useEffect, useState, useRef } from "react";
import { LuLayers, LuDatabase } from "react-icons/lu";
import type { FileCategory } from "../../utils/token-grouping";

interface ToCOutlineProps {
  categories: FileCategory[];
}

export const ToCOutline = ({ categories }: ToCOutlineProps) => {
  const [activeSection, setActiveSection] = useState<'semantic' | 'foundation' | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // 1. Group categories for the hierarchical view
  const { semantic, foundation } = useMemo(() => {
    return {
      semantic: categories.filter(c => !c.id.includes('global/base')),
      foundation: categories.filter(c => c.id.includes('global/base'))
    };
  }, [categories]);

  // 2. Setup IntersectionObserver for scroll sync
  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setActiveSection(id === 'section-semantic' ? 'semantic' : 'foundation');
        }
      });
    }, {
      root: null,
      rootMargin: '-100px 0px -70% 0px',
      threshold: 0
    });

    const semanticEl = document.getElementById('section-semantic');
    const foundationEl = document.getElementById('section-foundation');

    if (semanticEl) observer.current.observe(semanticEl);
    if (foundationEl) observer.current.observe(foundationEl);

    return () => observer.current?.disconnect();
  }, [categories]);

  const scrollTo = (type: 'semantic' | 'foundation', fileId?: string) => {
    let targetId = `section-${type}`;
    let isRowTarget = false;

    if (fileId) {
      const sanitized = `file-${fileId.replace(/[^a-zA-Z0-9]/g, '-')}`;
      const rowEl = document.getElementById(sanitized);
      if (rowEl) {
        targetId = sanitized;
        isRowTarget = true;
      }
    }

    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Pulse animation logic
      const pulseTarget = isRowTarget ? el : el.querySelector('.chakra-stack[position="sticky"]');
      
      if (pulseTarget) {
        const target = pulseTarget as HTMLElement;
        const originalBg = isRowTarget ? 'transparent' : 'white';
        
        target.style.backgroundColor = 'var(--chakra-colors-blue-50)';
        setTimeout(() => {
          target.style.transition = 'background-color 1s ease-out';
          target.style.backgroundColor = originalBg;
          setTimeout(() => {
            target.style.transition = '';
          }, 1000);
        }, 500);
      }
    }
  };

  const GroupItem = ({ title, icon: Icon, items, type }: { title: string, icon: any, items: FileCategory[], type: 'semantic' | 'foundation' }) => (
    <VStack align="stretch" gap={2} mb={4}>
      <HStack 
        gap={2} 
        cursor="pointer" 
        onClick={() => scrollTo(type)}
        color={activeSection === type ? "blue.600" : "gray.500"}
        transition="color 0.2s"
      >
        <Icon size={14} />
        <Text fontSize="xs" fontWeight="extrabold" textTransform="uppercase" letterSpacing="wider">
          {title}
        </Text>
      </HStack>
      <VStack align="stretch" gap={1} pl={4} borderLeft="1px solid" borderColor="gray.100">
        {items.map(cat => (
          <Link 
            key={cat.id}
            fontSize="11px"
            color="gray.600"
            _hover={{ color: "blue.500", textDecoration: "none" }}
            onClick={() => scrollTo(type, cat.id)}
            cursor="pointer"
            fontWeight={cat.totalCount > 0 ? "medium" : "normal"}
            opacity={cat.totalCount > 0 ? 1 : 0.4}
          >
            {cat.title}
          </Link>
        ))}
      </VStack>
    </VStack>
  );

  return (
    <Box 
      position="sticky" 
      top="88px" 
      w="full" 
      p={4} 
      borderWidth="1px" 
      borderRadius="xl" 
      bg="white"
      display={{ base: 'none', lg: 'block' }}
      boxShadow="sm"
      maxH="calc(100vh - 120px)"
      overflowY="auto"
    >
      <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={6} letterSpacing="widest">
        Navigation
      </Text>
      
      <GroupItem title="Semantic" icon={LuLayers} items={semantic} type="semantic" />
      <GroupItem title="Foundation" icon={LuDatabase} items={foundation} type="foundation" />
    </Box>
  );
};
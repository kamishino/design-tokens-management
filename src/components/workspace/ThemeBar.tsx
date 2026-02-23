import { Box, HStack, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { LuCircle, LuCircleDot } from "react-icons/lu";
import type { Manifest } from "../../schemas/manifest";

interface ThemeBarProps {
  manifest: Manifest;
  activePath: string;
  onSelect: (key: string) => void;
}

export const ThemeBar = ({ manifest, activePath, onSelect }: ThemeBarProps) => {
  const items = useMemo(() => {
    const entries = Object.entries(manifest.projects);
    // Group by client for visual separation
    const grouped: {
      client: string;
      projects: { key: string; name: string }[];
    }[] = [];

    for (const [key, project] of entries) {
      const existing = grouped.find((g) => g.client === project.client);
      if (existing) {
        existing.projects.push({ key, name: project.project || project.name });
      } else {
        grouped.push({
          client: project.client,
          projects: [{ key, name: project.project || project.name }],
        });
      }
    }

    return grouped;
  }, [manifest]);

  return (
    <HStack
      w="full"
      px={4}
      py={1.5}
      gap={3}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.100"
      overflowX="auto"
      flexShrink={0}
      minH="32px"
    >
      {/* "All" pill */}
      <ThemePill
        label="All files"
        isActive={!activePath}
        onClick={() => onSelect("")}
      />

      {items.map((group) => (
        <HStack key={group.client} gap={1.5}>
          <Text
            fontSize="9px"
            fontWeight="700"
            color="gray.300"
            textTransform="uppercase"
            letterSpacing="wider"
            mr={0.5}
          >
            {group.client}
          </Text>
          {group.projects.map((p) => (
            <ThemePill
              key={p.key}
              label={p.name}
              isActive={activePath === p.key}
              onClick={() => onSelect(p.key)}
            />
          ))}
        </HStack>
      ))}
    </HStack>
  );
};

const ThemePill = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <HStack
    px={2}
    py={0.5}
    gap={1}
    borderRadius="full"
    bg={isActive ? "blue.50" : "transparent"}
    border="1px solid"
    borderColor={isActive ? "blue.200" : "gray.100"}
    cursor="pointer"
    _hover={{
      bg: isActive ? "blue.50" : "gray.50",
      borderColor: isActive ? "blue.200" : "gray.200",
    }}
    transition="all 0.15s"
    onClick={onClick}
    whiteSpace="nowrap"
  >
    <Box color={isActive ? "blue.500" : "gray.300"}>
      {isActive ? <LuCircleDot size={10} /> : <LuCircle size={10} />}
    </Box>
    <Text
      fontSize="10px"
      fontWeight={isActive ? "700" : "500"}
      color={isActive ? "blue.700" : "gray.500"}
    >
      {label}
    </Text>
  </HStack>
);

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Separator,
} from "@chakra-ui/react";
import { LuClock, LuUser, LuBookOpen } from "react-icons/lu";
import type { StudioMockData } from "./shared/mock-data";

/**
 * Blog Post Template
 * Stress-tests: Full Typography Scale (h1-h6, body, caption, code, blockquote),
 * Heading vs Body font families, Line Height, Spacing, Brand Colors
 */
export const BlogPost = ({ data }: { data: StudioMockData }) => {
  return (
    <Box
      bg="var(--bg-canvas)"
      minH="100vh"
      fontFamily="var(--font-family-body)"
      color="var(--text-primary)"
      data-tokens="bg.canvas, text.primary, font.family.body"
    >
      {/* Hero / Featured Image */}
      <Box
        h="360px"
        bg="linear-gradient(135deg, var(--brand-primary), var(--brand-accent))"
        position="relative"
        data-tokens="brand.primary, brand.accent"
      >
        <Container maxW="container.md" h="full" position="relative">
          <VStack
            justify="end"
            align="start"
            h="full"
            pb={12}
            gap={4}
            position="relative"
            zIndex={1}
          >
            <Badge
              bg="var(--bg-surface)"
              color="var(--brand-primary)"
              borderRadius="var(--radius-basic-full)"
              px={4}
              py={1}
              fontSize="var(--font-size-basic-xs)"
              fontWeight="var(--font-weight-bold)"
              textTransform="uppercase"
              letterSpacing="var(--font-letter-spacing-widest)"
              data-tokens="bg.surface, brand.primary, font.size.basic.xs, font.weight.bold"
            >
              Design Systems
            </Badge>
            <Heading
              as="h1"
              fontSize="var(--font-size-scale-6)"
              fontWeight="var(--font-weight-extrabold)"
              fontFamily="var(--font-family-heading)"
              lineHeight="var(--font-leading-tight)"
              color="white"
              maxW="2xl"
              data-tokens="font.size.scale.6, font.weight.extrabold, font.family.heading, font.leading.tight"
            >
              Building a Scalable Design Token Architecture
            </Heading>
          </VStack>
        </Container>
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="80px"
          bgGradient="to-t"
          gradientFrom="var(--bg-canvas)"
          gradientTo="transparent"
          data-tokens="bg.canvas"
        />
      </Box>

      {/* Article Container */}
      <Container maxW="container.md" py={12}>
        {/* Meta / Byline */}
        <HStack gap={6} mb={10} flexWrap="wrap">
          <HStack gap={2}>
            <Box
              w={10}
              h={10}
              borderRadius="full"
              bg="var(--brand-primary)"
              data-tokens="brand.primary"
            />
            <VStack align="start" gap={0}>
              <Text
                fontSize="var(--font-size-scale-0)"
                fontWeight="var(--font-weight-bold)"
                fontFamily="var(--font-family-heading)"
                data-tokens="font.family.heading, font.weight.bold"
              >
                {data.brand.name} Team
              </Text>
              <Text
                fontSize="var(--font-size-scale--1)"
                color="var(--text-secondary)"
                data-tokens="text.secondary, font.size.scale.-1"
              >
                Technical Writer
              </Text>
            </VStack>
          </HStack>
          <Separator
            orientation="vertical"
            h="32px"
            borderColor="var(--brand-secondary)"
          />
          <HStack
            gap={1}
            color="var(--text-secondary)"
            data-tokens="text.secondary"
          >
            <LuClock size={14} />
            <Text fontSize="var(--font-size-scale--1)">12 min read</Text>
          </HStack>
          <HStack gap={1} color="var(--text-secondary)">
            <LuBookOpen size={14} />
            <Text fontSize="var(--font-size-scale--1)">Feb 23, 2026</Text>
          </HStack>
        </HStack>

        {/* Article Body — showcases all typography tokens */}
        <VStack align="stretch" gap={8}>
          {/* Intro paragraph (body text) */}
          <Text
            fontSize="var(--font-size-scale-1)"
            lineHeight="var(--font-leading-relaxed)"
            color="var(--text-primary)"
            fontFamily="var(--font-family-body)"
            data-tokens="font.size.scale.1, font.family.body, text.primary, font.leading.relaxed"
          >
            Design tokens are the visual atoms of a design system — they store
            values like colors, spacing, and typography in a platform-agnostic
            format. When implemented well, they create a single source of truth
            that travels from Figma to code seamlessly.
          </Text>

          {/* H2 */}
          <Heading
            as="h2"
            fontSize="var(--font-size-scale-4)"
            fontWeight="var(--font-weight-bold)"
            fontFamily="var(--font-family-heading)"
            lineHeight="var(--font-leading-snug)"
            color="var(--text-primary)"
            mt={4}
            data-tokens="font.size.scale.4, font.weight.bold, font.family.heading, font.leading.snug"
          >
            Why Tokens Matter
          </Heading>

          <Text
            fontSize="var(--font-size-scale-0)"
            lineHeight="var(--font-leading-relaxed)"
            fontFamily="var(--font-family-body)"
            data-tokens="font.size.scale.0, font.family.body, font.leading.relaxed"
          >
            Most design systems start with a Figma file and a CSS stylesheet.
            But the moment you need to support dark mode, multiple brands, or
            cross-platform delivery, you need an abstraction layer. Design
            tokens are that layer.
          </Text>

          {/* Blockquote */}
          <Box
            borderLeft="4px solid"
            borderColor="var(--brand-primary)"
            pl={6}
            py={3}
            bg="var(--bg-surface)"
            borderRadius="0 var(--radius2) var(--radius2) 0"
            data-tokens="brand.primary, bg.surface, border.radius.2"
          >
            <Text
              fontSize="var(--font-size-scale-1)"
              fontStyle="italic"
              lineHeight="var(--font-leading-relaxed)"
              color="var(--text-primary)"
              fontFamily="var(--font-family-body)"
              data-tokens="font.size.scale.1, font.leading.relaxed"
            >
              "Design tokens are the subatomic particles of our design system.
              They're the smallest units that still carry meaning."
            </Text>
            <Text
              fontSize="var(--font-size-scale--1)"
              color="var(--text-secondary)"
              mt={2}
              data-tokens="text.secondary"
            >
              — Jina Anne, Design Token Pioneer
            </Text>
          </Box>

          {/* H3 */}
          <Heading
            as="h3"
            fontSize="var(--font-size-scale-3)"
            fontWeight="var(--font-weight-bold)"
            fontFamily="var(--font-family-heading)"
            lineHeight="var(--font-leading-snug)"
            color="var(--text-primary)"
            mt={4}
            data-tokens="font.size.scale.3, font.family.heading, font.leading.snug"
          >
            Token Architecture Layers
          </Heading>

          <Text
            fontSize="var(--font-size-scale-0)"
            lineHeight="var(--typography-line-height, 1.6)"
            fontFamily="var(--font-family-body)"
          >
            A robust token system typically has three layers: primitive values
            (raw hex codes, pixel sizes), semantic tokens (brand.primary,
            text.body), and component tokens (button.background, card.radius).
            Each layer references the one below it.
          </Text>

          {/* Code block */}
          <Box
            bg="var(--chakra-colors-gray-900)"
            color="var(--chakra-colors-gray-100)"
            p={6}
            borderRadius="var(--radius2)"
            fontFamily="var(--font-family-code)"
            fontSize="var(--font-size-basic-sm)"
            lineHeight="var(--font-leading-relaxed)"
            overflow="auto"
            data-tokens="border.radius.2, font.family.code, font.size.basic.sm, font.leading.relaxed"
          >
            <Text as="pre" whiteSpace="pre" m={0}>
              {`{
  "color": {
    "brand": {
      "primary": {
        "$value": "#4A6DA7",
        "$type": "color"
      }
    }
  }
}`}
            </Text>
          </Box>

          {/* H4 */}
          <Heading
            as="h4"
            fontSize="var(--font-size-scale-2)"
            fontWeight="var(--font-weight-semibold)"
            fontFamily="var(--font-family-heading)"
            lineHeight="var(--font-leading-snug)"
            color="var(--text-primary)"
            data-tokens="font.size.scale.2, font.weight.semibold, font.family.heading, font.leading.snug"
          >
            Color Scale Generation with OKLCH
          </Heading>

          <Text
            fontSize="var(--font-size-scale-0)"
            lineHeight="var(--typography-line-height, 1.6)"
            fontFamily="var(--font-family-body)"
          >
            Using OKLCH (Lightness, Chroma, Hue) for color operations ensures
            that generated scales are perceptually uniform. A blue at 50%
            lightness in OKLCH will look equally bright as a red at 50%
            lightness — something that HSL cannot guarantee.
          </Text>

          {/* Inline highlight / callout card */}
          <HStack
            p={6}
            bg="var(--bg-surface)"
            borderRadius="var(--radius3)"
            border="1px solid"
            borderColor="var(--brand-secondary)"
            gap={4}
            data-tokens="bg.surface, brand.secondary, border.radius.3"
          >
            <Box
              w={12}
              h={12}
              bg="var(--brand-accent)"
              borderRadius="var(--radius2)"
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              data-tokens="brand.accent, border.radius.2"
            >
              <LuUser size={20} color="white" />
            </Box>
            <VStack align="start" gap={1}>
              <Text
                fontSize="var(--font-size-scale-0)"
                fontWeight="var(--font-weight-bold)"
                fontFamily="var(--font-family-heading)"
                data-tokens="font.weight.bold"
              >
                Pro Tip
              </Text>
              <Text
                fontSize="var(--font-size-basic-sm)"
                color="var(--text-secondary)"
                lineHeight="var(--font-leading-relaxed)"
                data-tokens="text.secondary, font.size.basic.sm, font.leading.relaxed"
              >
                Always validate generated colors against sRGB gamut boundaries.
                High-chroma colors in OKLCH may fall outside displayable range.
              </Text>
            </VStack>
          </HStack>

          {/* H5 */}
          <Heading
            as="h5"
            fontSize="var(--font-size-scale-1)"
            fontWeight="var(--font-weight-semibold)"
            fontFamily="var(--font-family-heading)"
            lineHeight="var(--font-leading-snug)"
            color="var(--text-primary)"
            data-tokens="font.size.scale.1, font.family.heading, font.leading.snug"
          >
            Implementation Checklist
          </Heading>

          <VStack align="stretch" gap={2} pl={4}>
            {[
              "Define primitive color tokens (hex values)",
              "Create semantic aliases (brand.primary → blue.600)",
              "Generate OKLCH shade scales (50–900)",
              "Map tokens to CSS custom properties",
              "Validate contrast ratios (WCAG AA + APCA Lc 60)",
            ].map((item, i) => (
              <HStack key={i} gap={3} align="baseline">
                <Text
                  fontSize="var(--font-size-scale--1)"
                  fontWeight="var(--font-weight-bold)"
                  color="var(--brand-accent)"
                  fontFamily="monospace"
                  data-tokens="brand.accent"
                >
                  {i + 1}.
                </Text>
                <Text
                  fontSize="var(--font-size-scale-0)"
                  lineHeight="var(--font-leading-relaxed)"
                  fontFamily="var(--font-family-body)"
                >
                  {item}
                </Text>
              </HStack>
            ))}
          </VStack>

          {/* H6 (smallest heading) */}
          <Heading
            as="h6"
            fontSize="var(--font-size-scale-0)"
            fontWeight="var(--font-weight-bold)"
            fontFamily="var(--font-family-heading)"
            textTransform="uppercase"
            letterSpacing="wider"
            color="var(--text-secondary)"
            data-tokens="font.size.scale.0, text.secondary, font.family.heading"
          >
            Further Reading
          </Heading>

          <Text
            fontSize="var(--font-size-basic-sm)"
            color="var(--text-secondary)"
            lineHeight="var(--font-leading-relaxed)"
            data-tokens="text.secondary, font.size.basic.sm, font.leading.relaxed"
          >
            This article is part of our Design System series. For more on
            typography scales, see our Type Scale Calculator. For color
            generation, explore the Harmony Lab in our Tuning panel.
          </Text>

          <Separator
            borderColor="var(--brand-secondary)"
            data-tokens="brand.secondary"
          />

          {/* Tags / Footer */}
          <HStack gap={2} flexWrap="wrap">
            {[
              "Design Tokens",
              "OKLCH",
              "Typography",
              "Figma",
              "CSS Variables",
            ].map((tag) => (
              <Badge
                key={tag}
                variant="subtle"
                bg="var(--bg-surface)"
                color="var(--text-secondary)"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="11px"
                border="1px solid"
                borderColor="var(--brand-secondary)"
                data-tokens="bg.surface, text.secondary, brand.secondary"
              >
                {tag}
              </Badge>
            ))}
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

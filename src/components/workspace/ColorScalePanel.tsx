/**
 * ColorScalePanel (K3+K5)
 *
 * Generates OKLCH shade scales for each semantic color and displays them
 * as Radix-style horizontal shade strips with contrast labels.
 */
import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { generateColorScale, type ColorScale } from "../../utils/oklch-scale";
import { wcagContrast } from "culori";

interface ColorScalePanelProps {
  colors: { id: string; label: string; hex: string; variable: string }[];
  onSelectShade?: (variable: string, hex: string, label: string) => void;
}

export const ColorScalePanel = ({
  colors,
  onSelectShade,
}: ColorScalePanelProps) => {
  const scales = useMemo(
    () =>
      colors.map((c) => ({
        ...c,
        scale: generateColorScale(c.hex, c.label),
      })),
    [colors],
  );

  return (
    <VStack align="stretch" gap={3}>
      {scales.map(({ id, label, variable, scale }) => (
        <ScaleRow
          key={id}
          label={label}
          scale={scale}
          onSelect={
            onSelectShade
              ? (hex, step) => onSelectShade(variable, hex, `${label} ${step}`)
              : undefined
          }
        />
      ))}
    </VStack>
  );
};

// ---- Scale Row ----

function ScaleRow({
  label,
  scale,
  onSelect,
}: {
  label: string;
  scale: ColorScale;
  onSelect?: (hex: string, step: number) => void;
}) {
  return (
    <Box>
      <HStack justify="space-between" mb={1}>
        <Text fontSize="9px" fontWeight="700" color="gray.500">
          {label}
        </Text>
        <Text
          fontSize="8px"
          fontFamily="'Space Mono', monospace"
          color="gray.300"
        >
          {scale.baseHex}
        </Text>
      </HStack>

      {/* Shade strip */}
      <HStack gap={0} borderRadius="md" overflow="hidden" h="28px">
        {scale.shades.map((shade) => {
          const contrastW = wcagContrast(shade.hex, "#ffffff");
          const contrastB = wcagContrast(shade.hex, "#000000");
          const textColor = contrastW > contrastB ? "#ffffff" : "#000000";
          const isBase = shade.step === scale.baseStep;

          return (
            <Box
              key={shade.step}
              flex={1}
              h="full"
              bg={shade.hex}
              cursor={onSelect ? "pointer" : "default"}
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
              onClick={() => onSelect?.(shade.hex, shade.step)}
              _hover={
                onSelect
                  ? {
                      transform: "scaleY(1.15)",
                      zIndex: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }
                  : {}
              }
              transition="all 0.1s"
              title={`${label} ${shade.step}\n${shade.hex}\nL:${shade.oklch.l}% C:${shade.oklch.c}`}
            >
              <Text
                fontSize="7px"
                fontWeight={isBase ? "800" : "600"}
                color={textColor}
                opacity={isBase ? 1 : 0.7}
                fontFamily="monospace"
                userSelect="none"
              >
                {shade.step}
              </Text>
              {isBase && (
                <Box
                  position="absolute"
                  bottom="0"
                  left="50%"
                  transform="translateX(-50%)"
                  w="4px"
                  h="4px"
                  borderRadius="full"
                  bg={textColor}
                />
              )}
            </Box>
          );
        })}
      </HStack>

      {/* Contrast info for base shade */}
      <HStack justify="space-between" mt={0.5}>
        <Text fontSize="7px" fontFamily="monospace" color="gray.300">
          L:{scale.shades[0]?.oklch.l}%
        </Text>
        <Text fontSize="7px" fontFamily="monospace" color="gray.300">
          base: {scale.baseStep}
        </Text>
        <Text fontSize="7px" fontFamily="monospace" color="gray.300">
          L:{scale.shades[9]?.oklch.l}%
        </Text>
      </HStack>
    </Box>
  );
}

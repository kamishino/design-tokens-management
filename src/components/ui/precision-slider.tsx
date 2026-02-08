import { Slider as ChakraSlider, HStack, Text } from "@chakra-ui/react"
import * as React from "react"

export interface PrecisionSliderProps extends ChakraSlider.RootProps {
  label?: string
  value: number[]
  displayValue?: string | number
  unit?: string
  trackBg?: string
  onValueChange: (details: ChakraSlider.ValueChangeDetails) => void
}

/**
 * PrecisionSlider
 * A specialized slider variant for color tuning.
 * - Transparent range (fill) to reveal background gradients.
 * - Minimalist, high-precision thumb (Figma style).
 */
export const PrecisionSlider = React.forwardRef<HTMLDivElement, PrecisionSliderProps>(
  function PrecisionSlider(props, ref) {
    const { label, value, displayValue, unit = "", trackBg, onValueChange, ...rest } = props

    return (
      <ChakraSlider.Root 
        ref={ref} 
        value={value} 
        onValueChange={onValueChange}
        size="sm"
        {...rest}
      >
        <HStack justify="space-between" mb={1}>
          <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">{label}</Text>
          <Text fontSize="10px" fontWeight="bold" fontFamily="monospace" color="blue.600">
            {displayValue !== undefined ? displayValue : value[0]}{unit}
          </Text>
        </HStack>

        <ChakraSlider.Control h="20px">
          <ChakraSlider.Track 
            h="6px" 
            borderRadius="full" 
            bg={trackBg || "gray.100"}
            border="1px solid rgba(0,0,0,0.05)"
          >
            {/* The Range (filled part) is set to transparent to reveal the gradient */}
            <ChakraSlider.Range bg="transparent !important" />
          </ChakraSlider.Track>
          
          <ChakraSlider.Thumb 
            index={0}
            w="12px" h="12px" 
            bg="white" 
            border="1px solid" 
            borderColor="gray.300"
            boxShadow="sm"
            _hover={{ borderColor: "blue.400", transform: "scale(1.1)" }}
            _focus={{ boxShadow: "0 0 0 2px var(--chakra-colors-blue-200)" }}
            transition="all 0.1s"
          >
            <ChakraSlider.HiddenInput />
          </ChakraSlider.Thumb>
        </ChakraSlider.Control>
      </ChakraSlider.Root>
    )
  },
)

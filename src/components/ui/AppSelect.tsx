import { SelectRoot as ChakraSelectRoot } from "./select";
import type { SelectRootProps } from "@chakra-ui/react";

/**
 * App-level Select wrapper that enforces professional floating behavior.
 * Specifically handles the strategy='fixed' requirement to prevent layout jitters.
 */
export const AppSelectRoot = (props: SelectRootProps) => {
  return (
    <ChakraSelectRoot 
      {...props} 
      positioning={{ strategy: "fixed", ...props.positioning }} 
    />
  );
};

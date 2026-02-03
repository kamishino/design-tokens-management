import { MenuRoot as ChakraMenuRoot } from "@chakra-ui/react";
import type { MenuRootProps } from "@chakra-ui/react";

/**
 * App-level Menu wrapper that enforces professional floating behavior.
 * Specifically handles the strategy='fixed' requirement to prevent layout jitters.
 */
export const AppMenuRoot = (props: MenuRootProps) => {
  return (
    <ChakraMenuRoot 
      {...props} 
      positioning={{ strategy: "fixed", ...props.positioning }} 
    />
  );
};

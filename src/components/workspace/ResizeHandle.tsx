import { Box } from "@chakra-ui/react";
import { useCallback, useRef } from "react";

interface ResizeHandleProps {
  /** "left" = dragging resizes the panel on the left; "right" = panel on the right */
  side: "left" | "right";
  onResize: (delta: number) => void;
  onResizeEnd?: () => void;
}

/**
 * A 4px drag handle that sits between panels.
 * Dragging it fires `onResize(delta)` where delta is px moved.
 */
export const ResizeHandle = ({
  side,
  onResize,
  onResizeEnd,
}: ResizeHandleProps) => {
  const startX = useRef(0);
  const dragging = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      startX.current = e.clientX;
      dragging.current = true;

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const handleMove = (ev: PointerEvent) => {
        if (!dragging.current) return;
        const delta = ev.clientX - startX.current;
        startX.current = ev.clientX;
        onResize(side === "left" ? delta : -delta);
      };

      const handleUp = () => {
        dragging.current = false;
        target.removeEventListener("pointermove", handleMove);
        target.removeEventListener("pointerup", handleUp);
        onResizeEnd?.();
      };

      target.addEventListener("pointermove", handleMove);
      target.addEventListener("pointerup", handleUp);
    },
    [onResize, onResizeEnd, side],
  );

  return (
    <Box
      w="4px"
      minW="4px"
      h="full"
      cursor="col-resize"
      bg="transparent"
      _hover={{ bg: "blue.200" }}
      transition="background 0.15s"
      flexShrink={0}
      onPointerDown={handlePointerDown}
      position="relative"
      zIndex={10}
      css={{
        "&:active": { bg: "blue.400" },
      }}
    />
  );
};

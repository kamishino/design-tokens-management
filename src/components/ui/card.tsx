import { Box, type BoxProps } from "@chakra-ui/react"
import * as React from "react"

console.log("[Debug] Loading src/components/ui/card.tsx");

// Define components individually first
const CardRoot = React.forwardRef<HTMLDivElement, BoxProps>(function CardRoot(props, ref) {
  // console.log("[Debug] Rendering CardRoot");
  return (
    <Box 
      ref={ref} 
      borderRadius="md" 
      borderWidth="1px" 
      borderColor="border" 
      bg="bg.panel" 
      color="fg" 
      boxShadow="sm" 
      overflow="hidden"
      {...props} 
    />
  )
})

const CardHeader = React.forwardRef<HTMLDivElement, BoxProps>(function CardHeader(props, ref) {
  return <Box ref={ref} p="6" {...props} />
})

const CardBody = React.forwardRef<HTMLDivElement, BoxProps>(function CardBody(props, ref) {
  return <Box ref={ref} p="6" {...props} />
})

const CardFooter = React.forwardRef<HTMLDivElement, BoxProps>(function CardFooter(props, ref) {
  return <Box ref={ref} p="6" pt="0" {...props} />
})

const CardTitle = React.forwardRef<HTMLDivElement, BoxProps>(function CardTitle(props, ref) {
  return <Box ref={ref} textStyle="lg" fontWeight="semibold" {...props} />
})

const CardDescription = React.forwardRef<HTMLDivElement, BoxProps>(function CardDescription(props, ref) {
  return <Box ref={ref} textStyle="sm" color="fg.muted" {...props} />
})

// Export explicitly
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
}

console.log("[Debug] Card object exported:", Card);

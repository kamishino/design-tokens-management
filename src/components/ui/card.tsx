import { Box, type BoxProps } from "@chakra-ui/react"
import * as React from "react"

export const Card = {
  Root: React.forwardRef<HTMLDivElement, BoxProps>(function CardRoot(props, ref) {
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
  }),
  Header: React.forwardRef<HTMLDivElement, BoxProps>(function CardHeader(props, ref) {
    return (
      <Box ref={ref} p="6" {...props} />
    )
  }),
  Body: React.forwardRef<HTMLDivElement, BoxProps>(function CardBody(props, ref) {
    return (
      <Box ref={ref} p="6" {...props} />
    )
  }),
  Footer: React.forwardRef<HTMLDivElement, BoxProps>(function CardFooter(props, ref) {
    return (
      <Box ref={ref} p="6" pt="0" {...props} />
    )
  }),
  Title: React.forwardRef<HTMLDivElement, BoxProps>(function CardTitle(props, ref) {
    return (
      <Box ref={ref} textStyle="lg" fontWeight="semibold" {...props} />
    )
  }),
  Description: React.forwardRef<HTMLDivElement, BoxProps>(function CardDescription(props, ref) {
    return (
      <Box ref={ref} textStyle="sm" color="fg.muted" {...props} />
    )
  }),
}

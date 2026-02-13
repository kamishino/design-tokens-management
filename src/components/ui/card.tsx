import { Box, type BoxProps } from "@chakra-ui/react"
import * as React from "react"

const CardRoot = (props: BoxProps) => {
  return (
    <Box 
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
}

const CardHeader = (props: BoxProps) => {
  return <Box p="6" {...props} />
}

const CardBody = (props: BoxProps) => {
  return <Box p="6" {...props} />
}

const CardFooter = (props: BoxProps) => {
  return <Box p="6" pt="0" {...props} />
}

const CardTitle = (props: BoxProps) => {
  return <Box textStyle="lg" fontWeight="semibold" {...props} />
}

const CardDescription = (props: BoxProps) => {
  return <Box textStyle="sm" color="fg.muted" {...props} />
}

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
}

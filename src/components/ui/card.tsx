import { Card as ChakraCard, type CardRootProps } from "@chakra-ui/react"
import * as React from "react"

export interface CardProps extends CardRootProps {}

export const Card = {
  Root: ChakraCard.Root,
  Header: ChakraCard.Header,
  Body: ChakraCard.Body,
  Footer: ChakraCard.Footer,
  Title: ChakraCard.Title,
  Description: ChakraCard.Description,
}

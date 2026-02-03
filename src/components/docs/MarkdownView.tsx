import { Box, Heading, Text } from "@chakra-ui/react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const MarkdownView = ({ content }: { content: string }) => {
  return (
    <Box p={8}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <Heading as="h1" size="xl" mb={6} borderBottom="1px solid" borderColor="gray.100" pb={4}>{children}</Heading>,
          h2: ({ children }) => <Heading as="h2" size="lg" mt={10} mb={4}>{children}</Heading>,
          p: ({ children }) => <Text fontSize="md" color="gray.700" lineHeight="tall" mb={4}>{children}</Text>,
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};
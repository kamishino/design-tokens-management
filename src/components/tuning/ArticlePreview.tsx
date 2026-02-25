import { Box, VStack, Text, Heading, HStack } from '@chakra-ui/react';
import { LuInfo } from 'react-icons/lu';

export function ArticlePreview({
  baseSize,
  scaleRatio,
  headingFont,
  bodyFont,
  headingWeight = 700,
  bodyWeight = 400,
  headingLH = 1.2,
  bodyLH = 1.5,
  headingLS = 0,
  bodyLS = 0,
}: {
  baseSize: number;
  scaleRatio: number;
  headingFont: string;
  bodyFont: string;
  headingWeight?: number;
  bodyWeight?: number;
  headingLH?: number;
  bodyLH?: number;
  headingLS?: number;
  bodyLS?: number;
}) {
  const s = (step: number) =>
    `${Math.round(baseSize * Math.pow(scaleRatio, step) * 100) / 100}px`;

  const hStyle = (step: number): React.CSSProperties => ({
    fontFamily: headingFont,
    fontSize: s(step),
    lineHeight: `${headingLH}`,
    fontWeight: headingWeight,
    letterSpacing: `${headingLS}em`,
    margin: 0,
    padding: 0,
    color: "var(--chakra-colors-gray-800)",
  });

  const pStyle: React.CSSProperties = {
    fontFamily: bodyFont,
    fontSize: s(0),
    lineHeight: `${bodyLH}`,
    fontWeight: bodyWeight,
    letterSpacing: `${bodyLS}em`,
    margin: 0,
    padding: 0,
    color: "var(--chakra-colors-gray-600)",
  };

  const smallStyle: React.CSSProperties = {
    fontFamily: bodyFont,
    fontSize: s(-1),
    lineHeight: `${bodyLH}`,
    color: "var(--chakra-colors-gray-400)",
  };

  return (
    <Box
      border="1px solid"
      borderColor="gray.100"
      borderRadius="md"
      p={4}
      maxH="500px"
      overflowY="auto"
    >
      <VStack align="stretch" gap={3}>
        {/* Blog header */}
        <h2 style={hStyle(4)}>
          <Box as="span" display="inline-block" mr={1.5}>
            <svg
              style={{ height: "1em", width: "auto", verticalAlign: "bottom" }}
              viewBox="0 0 72 72"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m0,72c39.76,0,72-32.24,72-72H0v72Z"
                fill="rgba(0,0,0,0.12)"
              />
            </svg>
          </Box>
          The Blog
        </h2>

        <h1 style={hStyle(6)}>Exploring the mysteries of Atlantis</h1>

        <p style={smallStyle}>Feb 23rd, 2026 — By Seraphina</p>

        <p style={pStyle}>
          Atlantis, the Lost City of Myth and Legend, has captivated the human
          imagination for centuries. In this article, we will delve into the
          depths of this enigmatic sunken realm and uncover the secrets hidden
          beneath the waves.
        </p>

        <h2 style={hStyle(4)}>The origins of Atlantis</h2>
        <p style={pStyle}>
          The first mention of Atlantis can be traced back to the works of the
          ancient Greek philosopher Plato. He described a powerful and advanced
          civilization that disappeared beneath the ocean's surface, leaving
          behind only speculation and intrigue. But what if Atlantis was more
          than just a legend?
        </p>

        <h3 style={hStyle(3)}>Theories and speculations</h3>
        <p style={pStyle}>
          Over the years, numerous theories and speculations have arisen
          regarding the existence and fate of Atlantis. Some believe it was a
          highly advanced society with technology far beyond its time, while
          others argue that it was purely a product of Plato's imagination.
        </p>

        <h4 style={hStyle(2)}>Advanced technology</h4>
        <p style={pStyle}>
          One theory suggests that Atlantis possessed technology that allowed it
          to harness the Earth's energy, leading to its eventual downfall.
          Theorists propose that their unchecked power may have contributed to
          their watery demise.
        </p>

        <h5 style={hStyle(1)}>Geological evidence</h5>
        <p style={pStyle}>
          Geological formations and underwater structures have led some
          researchers to believe they may have found the remnants of Atlantis.
          Could these enigmatic formations on the ocean floor be the lost city?
        </p>

        <h6 style={hStyle(0)}>Conclusion</h6>
        <p style={pStyle}>
          The mystery of Atlantis continues to intrigue and baffle historians,
          archaeologists, and enthusiasts alike. Whether Atlantis was real or a
          mere figment of Plato's imagination remains an unsolved riddle.
        </p>
      </VStack>
    </Box>
  );
}
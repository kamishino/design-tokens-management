import { 
  Box, Text, VStack, HStack, Heading
} from "@chakra-ui/react";
import { useState, useEffect } from 'react';

interface TypographyVisualizerProps {
  onUpdate: (name: string, value: string | number) => void;
}

const STEPS = ["minus2", "minus1", "0", "1", "2", "3", "4", "5", "6", "7", "8"];

export const TypographyVisualizer = ({ onUpdate }: TypographyVisualizerProps) => {
  const [base, setBase] = useState(16);
  const [ratio, setRatio] = useState(1.25);

  useEffect(() => {
    STEPS.forEach((stepStr) => {
      const step = stepStr.startsWith('minus') ? -parseInt(stepStr.replace('minus', '')) : parseInt(stepStr);
      const val = Math.round(base * Math.pow(ratio, step));
      onUpdate(`--fontSizeScale${stepStr.charAt(0).toUpperCase() + stepStr.slice(1)}`, `${val}px`);
    });
    onUpdate('--typographyConfigScaleRatio', ratio);
    onUpdate('--fontSizeRoot', `${base}px`);
  }, [base, ratio, onUpdate]);

  return (
    <HStack align="start" gap={10} w="full" flexDirection={{ base: 'column', lg: 'row' }}>
      <VStack flex={1} align="stretch" gap={6} w="full">
        <Heading size="md">Typography Spec Sheet</Heading>
        <Box borderWidth="1px" borderRadius="md" overflow="auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left' }}>Step</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Variable</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Preview</th>
              </tr>
            </thead>
            <tbody>
              {STEPS.map((step) => (
                <tr key={step} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{step}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', color: '#6b7280' }}>
                    --fontSizeScale{step.charAt(0).toUpperCase() + step.slice(1)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Text 
                      fontSize={`var(--fontSizeScale${step.charAt(0).toUpperCase() + step.slice(1)})`}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      The quick brown fox...
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </VStack>

      <VStack w={{ base: 'full', lg: '300px' }} align="stretch" gap={8} p={6} bg="gray.50" borderRadius="lg">
        <Heading size="sm">Playground Controls</Heading>
        
        <Box>
          <Text fontSize="xs" fontWeight="bold" mb={2}>Base Font Size ({base}px)</Text>
          <input 
            type="range" min="10" max="24" step="1" value={base} 
            onChange={(e) => setBase(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </Box>

        <Box>
          <Text fontSize="xs" fontWeight="bold" mb={2}>Modular Ratio ({ratio})</Text>
          <input 
            type="range" min="1.0" max="2.0" step="0.01" value={ratio} 
            onChange={(e) => setRatio(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <HStack justify="space-between" mt={2}>
            <Text fontSize="2xs" color="blue.500" cursor="pointer" onClick={() => setRatio(1.25)}>1.25</Text>
            <Text fontSize="2xs" color="blue.500" cursor="pointer" onClick={() => setRatio(1.618)}>1.618</Text>
          </HStack>
        </Box>
      </VStack>
    </HStack>
  );
};
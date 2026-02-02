import fs from 'fs';
import path from 'path';

const CONFIG = {
  base: 16,
  ratio: 1.25, // Major Third
  min: -2,
  max: 8,
  precision: 2 // Round to 2 decimal places if needed, but usually px is int
};

const OUTPUT_DIR = 'tokens/global/generated';
const OUTPUT_FILE = 'typography-scale.json';

const generateScale = () => {
  console.log('🧮 Generating Modular Scale...');
  
  const scaleTokens = {};
  
  for (let i = CONFIG.min; i <= CONFIG.max; i++) {
    const rawValue = CONFIG.base * Math.pow(CONFIG.ratio, i);
    const roundedValue = Math.round(rawValue);
    
    // Key naming: "0", "1", "minus-1", "minus-2"
    const key = i < 0 ? `minus${Math.abs(i)}` : i.toString();
    
    scaleTokens[key] = {
      $value: `${roundedValue}px`,
      $type: 'fontSizes',
      $description: `Step ${i}: ${CONFIG.base}px * ${CONFIG.ratio}^${i} ≈ ${roundedValue}px`
    };
  }

  const output = {
    font: {
      size: {
        scale: scaleTokens
      }
    }
  };

  // Ensure directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, OUTPUT_FILE), JSON.stringify(output, null, 2));
  console.log(`✅ Generated ${OUTPUT_FILE}`);
};

generateScale();

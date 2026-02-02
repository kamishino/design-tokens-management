import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';
import { z } from 'zod';
import { BaseTokenSchema } from '../src/schemas/tokens.ts'; // We might need to handle TS import in JS script or run via ts-node
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Since we are running in Node context (ESM), we need some adjustments if importing TS directly isn't set up.
// For simplicity in this MVP step, I will inline a basic validation or assume tsx execution.
// Let's implement a robust build script using pure JS for node execution to avoid compilation complexity for now.

// Register tokens-studio transforms for W3C compatibility
register(StyleDictionary);

const run = async () => {
  console.log('🏗️  Building Design Tokens...');

  // 1. Define Hierarchy
  const hierarchy = [
    'tokens/global/**/*.json',
    'tokens/client/**/*.json',
    'tokens/project/**/*.json'
  ];

  // 2. Initialize Style Dictionary
  const sd = new StyleDictionary({
    source: hierarchy,
    platforms: {
      css: {
        transformGroup: 'tokens-studio', // Handles $value, references, etc.
        buildPath: 'src/assets/',
        files: [{
          destination: 'variables.css',
          format: 'css/variables'
        }]
      }
    }
  });

  // 3. Build
  await sd.buildAllPlatforms();
  console.log('✅ Tokens built successfully!');
};

run();

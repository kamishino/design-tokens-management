import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootPath = path.resolve(__dirname, '..').replace(/\\/g, '/');
const envPath = path.resolve(__dirname, '../.env.local');

const content = `VITE_PROJECT_ROOT=${rootPath}\n`;

try {
  fs.writeFileSync(envPath, content);
  console.log(`✅ .env.local initialized with ROOT: ${rootPath}`);
} catch (err) {
  console.error('❌ Failed to write .env.local', err);
}


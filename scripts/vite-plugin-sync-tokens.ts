import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

/**
 * Enhanced Sync Plugin supporting universal file writing and deletion.
 * Security: Restricts all writes to the /tokens directory.
 */
export function syncTokensPlugin(): Plugin {
  return {
    name: 'vite-plugin-sync-tokens',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/save-token' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { targetPath, tokenPath, valueObj, action = 'update' } = data;

              // Security Guard: Ensure we only write within the tokens/ directory
              if (!targetPath || !targetPath.includes('/tokens/')) {
                res.statusCode = 403;
                return res.end(JSON.stringify({ error: 'Forbidden: Path outside of tokens directory' }));
              }

              // Support both absolute and project-relative paths
              const absoluteFilePath = targetPath.startsWith('/') 
                ? path.join(process.cwd(), targetPath)
                : path.join(process.cwd(), 'tokens', targetPath);

              const dir = path.dirname(absoluteFilePath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }

              let currentJson: any = {};
              if (fs.existsSync(absoluteFilePath)) {
                currentJson = JSON.parse(fs.readFileSync(absoluteFilePath, 'utf8'));
              }

              // Navigate to the deep key path
              const keys = tokenPath.split('.');
              let current = currentJson;
              
              keys.forEach((key: string, index: number) => {
                if (index === keys.length - 1) {
                  if (action === 'delete') {
                    delete current[key];
                  } else {
                    current[key] = valueObj;
                  }
                } else {
                  current[key] = current[key] || {};
                  current = current[key];
                }
              });

              // Write back to disk
              fs.writeFileSync(absoluteFilePath, JSON.stringify(currentJson, null, 2));
              console.log(`💾 [CRUD] ${action.toUpperCase()} ${tokenPath} in ${absoluteFilePath}`);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, path: absoluteFilePath }));
            } catch (error: any) {
              console.error('❌ Sync Error:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error?.message || 'Unknown error' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}
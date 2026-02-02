import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

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
              const { clientId, projectId, tokens } = data;

              if (!clientId || !projectId) {
                res.statusCode = 400;
                return res.end('Missing clientId or projectId');
              }

              const projectDir = path.resolve(process.cwd(), 'tokens/clients', clientId, 'projects', projectId);
              const targetFile = path.join(projectDir, 'overrides.json');

              if (!fs.existsSync(projectDir)) {
                fs.mkdirSync(projectDir, { recursive: true });
              }

              let currentJson: any = {};
              if (fs.existsSync(targetFile)) {
                currentJson = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
              }

              Object.entries(tokens).forEach(([tokenPath, valueObj]: [string, any]) => {
                const keys = tokenPath.split('.');
                let current = currentJson;
                
                keys.forEach((key, index) => {
                  if (index === keys.length - 1) {
                    current[key] = valueObj;
                  } else {
                    current[key] = current[key] || {};
                    current = current[key];
                  }
                });
              });

              fs.writeFileSync(targetFile, JSON.stringify(currentJson, null, 2));
              console.log(`💾 Successfully synced tokens to: ${targetFile}`);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, path: targetFile }));
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
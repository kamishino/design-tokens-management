import type { Plugin } from 'vite';

/**
 * Vite Plugin: Launch IDE
 * Adds a dev server middleware endpoint `/api/open-in-editor`
 * that uses the `launch-ide` library to open files in the running editor.
 */
export function launchIdePlugin(): Plugin {
  return {
    name: 'vite-plugin-launch-ide',
    apply: 'serve', // Only in dev mode
    configureServer(server) {
      server.middlewares.use('/api/open-in-editor', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { file, editor, line, column } = JSON.parse(body);
            
            if (!file) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'file is required' }));
              return;
            }

            // Dynamic import to avoid bundling in client
            const { launchIDE } = await import('launch-ide');
            
            launchIDE({
              file,
              editor,
              line: line ? Number(line) : undefined,
              column: column ? Number(column) : undefined,
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, file, editor }));
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: message }));
          }
        });
      });
    },
  };
}

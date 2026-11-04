import { constants } from 'node:fs';
import { open, realpath } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2' };
const within = (root, file) => file === root || file.startsWith(root + sep);

export function createCatalogServer(directory) {
  const root = resolve(directory);
  return createServer(async (request, response) => {
    try {
      let pathname;
      try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
      catch { response.writeHead(400).end('Invalid URL'); return; }
      const requested = resolve(root, '.' + pathname);
      if (!within(root, requested)) { response.writeHead(403).end('Forbidden'); return; }
      const canonicalRoot = await realpath(root);
      const readAsset = async (file) => {
        const canonical = await realpath(file);
        if (!within(canonicalRoot, canonical)) {
          const error = new Error('Asset escapes the catalog directory');
          error.code = 'EACCES';
          throw error;
        }
        const handle = await open(canonical, constants.O_RDONLY | constants.O_NOFOLLOW);
        try {
          // The descriptor keeps the metadata and bytes tied to the same file
          // even when another build replaces its path during a request.
          const metadata = await handle.stat();
          if (metadata.isDirectory()) return await readAsset(join(canonical, 'index.html'));
          if (!metadata.isFile()) {
            const error = new Error('Not a regular catalog asset');
            error.code = 'EACCES';
            throw error;
          }
          return { file: canonical, bytes: await handle.readFile() };
        } finally { await handle.close(); }
      };
      const { file, bytes } = await readAsset(requested);
      response.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream', 'x-content-type-options': 'nosniff' });
      response.end(bytes);
    } catch (error) {
      const forbidden = ['EACCES', 'EPERM', 'ELOOP'].includes(error.code);
      response.writeHead(forbidden ? 403 : 404).end(forbidden ? 'Forbidden' : 'Not found');
    }
  });
}

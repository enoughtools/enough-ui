import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../storybook-static/', import.meta.url);
const html = (await readFile(new URL('index.html', root), 'utf8')).replace('<head>', '<head><base href="/">');
assert.ok(html.includes('<base href="/">'), 'The Swift entry page must resolve Storybook assets from the website root.');
await mkdir(new URL('swift/', root), { recursive: true });
await writeFile(new URL('swift/index.html', root), html);
console.log('Swift gallery entry page published at /swift.');

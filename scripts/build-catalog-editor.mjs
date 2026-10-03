import { build } from 'vite';
import { fileURLToPath } from 'node:url';
import { copyFile } from 'node:fs/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
await build({
  configFile: false, root, base: '/editor/', logLevel: 'warn',
  build: {
    outDir: '.storybook/catalog/editor-assets', emptyOutDir: true,
    target: 'es2022', sourcemap: false,
    lib: { entry: '.storybook/catalog/editor-runtime.ts', formats: ['es'], fileName: () => 'editor.js', cssFileName: 'editor' },
    rollupOptions: { output: { chunkFileNames: 'chunks/[name]-[hash].js' } },
  },
  worker: { format: 'es' },
});
await copyFile(new URL('../node_modules/monaco-editor/LICENSE', import.meta.url), new URL('../.storybook/catalog/editor-assets/LICENSE.txt', import.meta.url));
console.log('Source viewer: self-hosted Monaco runtime, styles, and worker built.');

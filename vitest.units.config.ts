import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: { dedupe: ['react', 'react-dom'] },
  plugins: [react()],
  test: {
    server: { deps: { inline: [/json-render/, /tanstack.*ai/] } },
    environment: 'happy-dom',
    include: ['tests/units/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/units/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
});

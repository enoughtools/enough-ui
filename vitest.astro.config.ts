import { defineConfig } from '@storybook-astro/framework/vitest';
export default defineConfig({ test: { environment:'happy-dom', include:['tests/astro/*.test.ts'] } });

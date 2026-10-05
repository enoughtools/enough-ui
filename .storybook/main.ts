import type { StorybookConfig } from '@storybook-astro/framework';
import { react } from '@storybook-astro/framework/integrations';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx', '../stories/astro/**/*.stories.{js,ts}'],
  staticDirs: [{ from: '../docs/assets/brand', to: '/brand' }, { from: './catalog/previews', to: '/previews' }, { from: './catalog/editor-assets', to: '/editor' }],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook-astro/framework',
    options: { integrations: [react({ include: ['**/src/components/**/*.tsx'] })] },
  },
  viteFinal(config) {
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    return config;
  },
};
export default config;

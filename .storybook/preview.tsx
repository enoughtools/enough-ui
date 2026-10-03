import '../src/styles/styles.css';
import type { ProjectAnnotations, AstroRenderer } from '@storybook-astro/framework'
import { create } from 'storybook/theming/create';

const preview: ProjectAnnotations<AstroRenderer> = {
  parameters: {
    docs: {
      theme: create({
        base: 'light',
        fontBase: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
        fontCode: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
        colorSecondary: '#3b4fe4',
        appBorderRadius: 0,
      }),
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // Catalog violations must be actionable; browser verification also scans
      // every story and checks interaction states that static stories cannot show.
      test: 'error'
    }
  },
};

export default preview;

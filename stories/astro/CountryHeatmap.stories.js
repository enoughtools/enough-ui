import Example from './CountryHeatmapExample.astro';
export default {
  title: 'Astro/CountryHeatmap', component: Example, tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { description: { component: 'Native Astro SVG and native details/table. No React island or client script is needed. The map, colors, normalization, and exact values share the same helpers as the React renderer. Values in these examples are invented.' } } },
};
export const Default = {};
export const LogScale = { args: { variant: 'log' } };
export const Empty = { args: { variant: 'empty' } };
export const ZeroAndMissing = { args: { variant: 'zero' } };
export const FixedDomain = { args: { variant: 'domain' } };
export const SignedValues = { args: { variant: 'signed' } };
export const Localized = { args: { variant: 'localized' } };
export const ExtremeValues = { args: { variant: 'extreme' } };
export const CustomFormatting = { args: { variant: 'custom' } };

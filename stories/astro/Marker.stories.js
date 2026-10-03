import Marker from './MarkerExample.astro';

export default { title: 'Astro/Marker', component: Marker, tags: ['autodocs'], parameters: { layout: 'padded' }, args: {"slots": {"default": "Make it yours"}} };

export const Default = { args: {} };
export const Composed = { args: { composed: true, variant: 'border' } };
export const Separator = { args: { composed: true, variant: 'separator' } };

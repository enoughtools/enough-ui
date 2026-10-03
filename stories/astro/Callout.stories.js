import Callout from '../../src/astro/Callout.astro';

export default { title: 'Astro/Callout', component: Callout, tags: ['autodocs'], parameters: { layout: 'padded' }, args: {"label": "Before you start", "slots": {"default": "<p>Bring something to write with.</p>"}} };

export const Accent = { args: {"tone": "accent"} };
export const Warning = { args: {"tone": "warn"} };

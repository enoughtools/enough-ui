import Textarea from '../../src/astro/Textarea.astro';

export default { title: 'Astro/Textarea', component: Textarea, tags: ['autodocs'], parameters: { layout: 'padded' }, args: {"aria-label": "Note", "slots": {"default": "Hello from Astro."}} };

export const Default = { args: {} };
export const Disabled = { args: {"disabled": true} };

import Input from '../../src/astro/Input.astro';

export default { title: 'Astro/Input', component: Input, tags: ['autodocs'], parameters: { layout: 'padded' }, args: {"aria-label": "Email"} };

export const Email = { args: {"type": "email", "placeholder": "you@example.com"} };
export const Disabled = { args: {"disabled": true, "value": "Unavailable"} };
export const Invalid = { args: {"aria-invalid": "true", "value": "not an email"} };

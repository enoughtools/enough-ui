import Button from '../../src/astro/Button.astro';

export default { title: 'Astro/Button', component: Button, tags: ['autodocs'], parameters: { layout: 'padded' }, args: {"slots": {"default": "Get started"}}, argTypes: {"variant": {"control": "select", "options": ["ink", "accent", "outline", "ghost", "destructive"]}, "size": {"control": "select", "options": ["md", "sm", "ghost"]}, "disabled": {"control": "boolean"}} };

export const Ink = { args: {"variant": "ink"} };
export const Accent = { args: {"variant": "accent"} };
export const Outline = { args: {"variant": "outline"} };
export const Ghost = { args: {"variant": "ghost"} };
export const Destructive = { args: {"variant": "destructive"} };
export const Small = { args: {"size": "sm"} };
export const Link = { args: {"href": "#start", "variant": "accent", "id": "native-button"} };
export const DisabledLink = { args: {"href": "/unavailable", "disabled": true, "id": "disabled-button"} };
export const Submit = { args: {"type": "submit"} };

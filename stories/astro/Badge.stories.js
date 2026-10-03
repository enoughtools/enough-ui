import Badge from '../../src/astro/Badge.astro';

export default { title: 'Astro/Badge', component: Badge, tags: ['autodocs'], parameters: { layout: 'padded' }, args: {"slots": {"default": "First edition"}} };

export const Default = { args: {"variant": "default"} };
export const Secondary = { args: {"variant": "secondary"} };
export const Outline = { args: {"variant": "outline"} };
export const Destructive = { args: {"variant": "destructive"} };

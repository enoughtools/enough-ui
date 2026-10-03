import Typography from '../../src/astro/Typography.astro';

export default { title: 'Astro/Typography', component: Typography, tags: ['autodocs'], parameters: { layout: 'padded' }, args: {"slots": {"default": "Make something worth keeping."}} };

export const H1 = { args: {"variant": "h1"} };
export const H2 = { args: {"variant": "h2"} };
export const H3 = { args: {"variant": "h3"} };
export const H4 = { args: {"variant": "h4"} };
export const P = { args: {"variant": "p"} };
export const Lead = { args: {"variant": "lead"} };
export const Large = { args: {"variant": "large"} };
export const Small = { args: {"variant": "small"} };
export const Muted = { args: {"variant": "muted"} };

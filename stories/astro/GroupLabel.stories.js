import GroupLabel from '../../src/astro/GroupLabel.astro';

export default { title: 'Astro/GroupLabel', component: GroupLabel, tags: ['autodocs'], parameters: { layout: 'padded' }, args: {"slots": {"default": "Your collection"}} };

export const Default = { args: {} };
export const Accent = { args: {"accent": true, "marker": true} };

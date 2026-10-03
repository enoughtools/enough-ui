import Separator from '../../src/astro/Separator.astro';

export default { title: 'Astro/Separator', component: Separator, tags: ['autodocs'], parameters: { layout: 'padded' } };

export const Horizontal = { args: {} };
export const Vertical = { args: {"orientation": "vertical", "style": "height:80px"} };

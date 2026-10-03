import Example from './CardExample.astro';
export default { title:'Astro/Card', component:Example, tags:['autodocs'], parameters:{layout:'padded'} };
export const Composed = {};
export const WithAction = { args: { withAction: true } };
export const Compact = { args: { withAction: true, size: 'sm' } };

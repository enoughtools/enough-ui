import Example from './PaginationExample.astro';
import LocalizedExample from './PaginationLocalizedExample.astro';
export default { title:'Astro/Pagination', component:Example, tags:['autodocs'], parameters:{layout:'padded'} };
export const Composed = {};
export const Localized = { render: () => ({ component: LocalizedExample }) };

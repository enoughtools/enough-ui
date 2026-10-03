import TopNav from '../../src/astro/TopNav.astro';

export default { title: 'Astro/TopNav', component: TopNav, tags: ['autodocs'], parameters: { layout: 'padded' }, args: {"brand": "EnoughUI", "links": [{"label": "Components", "href": "#components"}, {"label": "About", "href": "#about"}], "active": "Components"} };

export const Default = { args: {} };
export const WithAction = { args: {"cta": "Get started", "ctaHref": "#start"} };
export const CustomBrand = { args: {"slots": {"brand": "<strong>Your project</strong>"}} };

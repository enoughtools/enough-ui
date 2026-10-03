import ToolRow from '../../src/astro/ToolRow.astro';

export default { title: 'Astro/ToolRow', component: ToolRow, tags: ['autodocs'], parameters: { layout: 'padded' }, args: {"title": "Astro components", "meta": "Ready for reuse", "href": "#components", "action": "Explore"} };

export const Light = { args: {"surface": "light"} };
export const Selected = { args: {"surface": "selected"} };
export const Dark = { args: {"surface": "dark"} };
export const Gap = { args: {"surface": "gap"} };
export const Transparent = { args: {"surface": "transparent"} };

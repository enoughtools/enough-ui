import Spinner from '../../src/astro/Spinner.astro';

export default { title: 'Astro/Spinner', component: Spinner, tags: ['autodocs'], parameters: { layout: 'padded' }, args: {"label": "Loading"} };

export const Default = { args: {} };
export const Small = { args: {"size": "sm"} };

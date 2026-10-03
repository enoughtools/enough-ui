import Example from './FieldsExample.astro';
import ChoiceCardExample from './FieldChoiceCardExample.astro';
export default { title:'Astro/Fields', component:Example, tags:['autodocs'], parameters:{layout:'padded'} };
export const Composed = {};
export const ChoiceCard = { render: () => ({ component: ChoiceCardExample }) };

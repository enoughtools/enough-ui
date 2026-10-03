import Progress from '../../src/astro/Progress.astro';
import ValueLabelExample from './ProgressValueLabelExample.astro';

export default { title: 'Astro/Progress', component: Progress, tags: ['autodocs'], parameters: { layout: 'padded' }, args: {"label": "Build progress"} };

export const Halfway = { args: {"value": 50} };
export const Complete = { args: {"value": 100} };
export const Clamped = { args: {"value": 150} };
export const Indeterminate = { args: {} };
export const CustomMaximum = { render: (args) => ({ component: ValueLabelExample, props: args }), args: { value: 3, max: 8 } };
export const InvalidBounds = { args: { value: 150, max: 0 } };
export const InvalidValue = { args: { value: NaN, max: Infinity } };

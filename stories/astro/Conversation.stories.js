import Example from './ConversationExample.astro';
export default { title: 'Astro/Conversation', component: Example, tags: ['autodocs'], parameters: { layout: 'padded' } };
export const Composed = {};
export const Uploading = { args: { state: 'uploading' } };
export const FailedUpload = { args: { state: 'error' } };
export const Disabled = { args: { disabled: true } };

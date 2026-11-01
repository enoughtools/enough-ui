import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';

// This serializable schema is an integration API, not the React component API.
// Deliberately omit arbitrary classes, styles, HTML and executable callbacks.
export const catalog = defineCatalog(schema, {
  components: {
    Panel: { props: z.object({title:z.string().max(200)}).strict(), slots:['default'], description:'A titled group of related content and controls.' },
    Text: { props:z.object({text:z.string().max(10000)}).strict(), description:'Plain text.' },
    DraftField: { props:z.object({label:z.string(),value:z.string()}).strict(), description:'An editable text field. Bind value with $bindState.' },
    Choice: { props:z.object({label:z.string(),value:z.string(),options:z.array(z.object({value:z.string(),label:z.string()}).strict()).max(30)}).strict(), description:'A single selection. Bind value with $bindState.' },
    Button: { props:z.object({label:z.string(),variant:z.enum(['default','outline','secondary'])}).strict(), description:'Invoke a registered action using its press event.' },
    Table: { props:z.object({caption:z.string(),columns:z.array(z.string()).max(12),rows:z.array(z.array(z.string()).max(12)).max(100)}).strict(), description:'A read-only table with a caption and column headings.' },
  },
  actions: { submit: {params:z.object({text:z.string().max(10000)}).strict(),description:'Send the current draft to the application.'} },
});

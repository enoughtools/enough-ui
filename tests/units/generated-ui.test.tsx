import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { GeneratedSurfaceDemo, validateSurface, initialSpec, completeSpec } from '../../examples/agentic-ui/generated-surface.js';
import { TanStackChat, demoConnection } from '../../examples/agentic-ui/tanstack-chat.js';
import { catalog } from '../../examples/agentic-ui/catalog.js';

test('generated updates preserve field identity, focus, state and named actions', async () => {
  render(<GeneratedSurfaceDemo />);
  const field=screen.getByRole('textbox',{name:'Review notes'});
  field.focus();
  fireEvent.change(field,{target:{value:'Keep the public props.'}});
  fireEvent.click(screen.getByRole('button',{name:'Append UI chunk'}));
  expect(screen.getByRole('textbox',{name:'Review notes'})).toBe(field);
  expect(field).toHaveFocus();
  expect(field).toHaveValue('Keep the public props.');
  expect(screen.getByRole('table')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Submit notes'}));
  await screen.findByText('Submitted: Keep the public props.');
});
test('catalog rejects unknown components, props and incomplete reference trees', () => {
  expect(catalog.validate(initialSpec).error?.issues).toBeUndefined();
  expect(()=>validateSurface(initialSpec)).not.toThrow();
  expect(()=>validateSurface(completeSpec)).not.toThrow();
  expect(()=>validateSurface({root:'bad',elements:{bad:{type:'Unknown',props:{}}}})).toThrow();
  expect(()=>validateSurface({...initialSpec,elements:{...initialSpec.elements,draft:{...initialSpec.elements.draft,props:{label:'x',value:'',className:'fixed'}}}})).toThrow();
  expect(()=>validateSurface({...initialSpec,elements:{...initialSpec.elements,panel:{...initialSpec.elements.panel,children:['missing']}}})).toThrow();
  expect(()=>validateSurface({...initialSpec,elements:{...initialSpec.elements,panel:{...initialSpec.elements.panel,children:['panel']}}})).toThrow();
  expect(()=>validateSurface({...initialSpec,elements:{...initialSpec.elements,panel:{...initialSpec.elements.panel,children:['draft','draft']}}})).toThrow();
  expect(()=>validateSurface({...initialSpec,elements:{...initialSpec.elements,send:{...initialSpec.elements.send,on:{press:{action:'unknown'}}}}})).toThrow();
});
test('TanStack actual client streams a tool, requests approval and resumes the run', async () => {
  render(<TanStackChat connection={demoConnection(0)} />);
  fireEvent.click(screen.getByRole('button',{name:'Send'}));
  const approve=await screen.findByRole('button',{name:'Approve'});
  fireEvent.click(approve);
  await screen.findByText('The source matches the pinned contract.');
  await waitFor(()=>expect(screen.queryByRole('button',{name:'Approve'})).toBeNull());
});
test('TanStack denial is recorded without implying tool execution', async () => {
  render(<TanStackChat connection={demoConnection(0)} />);
  fireEvent.click(screen.getByRole('button',{name:'Send'}));
  fireEvent.click(await screen.findByRole('button',{name:'Deny'}));
  await screen.findByText('The tool was denied.');
  expect(screen.queryByText('Ran readSource')).toBeNull();
});

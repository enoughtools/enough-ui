import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Trace, TraceLine, TraceIcon, TraceTitle, TraceDescription, TraceCollapsible, TraceCollapsibleTrigger, TraceCollapsibleContent } from './trace.js';
import { CodeBlock, CodeBlockContent } from './code-block.js';
import { Button } from './button.js';

const meta = { title: 'UI/Trace', component: Trace, parameters: { layout: 'padded', renderer: 'react' }, tags: ['autodocs'] } satisfies Meta<typeof Trace>;
export default meta;
type Story = StoryObj<typeof meta>;
export const States: Story = { render: () => <Trace className="max-w-xl">
  <TraceLine><TraceIcon>✓</TraceIcon><TraceTitle>Read the source</TraceTitle><TraceDescription>2 files</TraceDescription></TraceLine>
  <TraceLine status="running"><TraceIcon>◌</TraceIcon><TraceTitle>Running tests</TraceTitle></TraceLine>
  <TraceLine status="pending"><TraceTitle>Build packages</TraceTitle></TraceLine>
  <TraceLine status="error"><TraceTitle>Failed to publish</TraceTitle><TraceDescription>Try again</TraceDescription></TraceLine>
</Trace> };
export const Expandable: Story = { render: () => <Trace><TraceCollapsible><TraceCollapsibleTrigger><TraceLine><TraceTitle>Ran pnpm test</TraceTitle></TraceLine></TraceCollapsibleTrigger><TraceCollapsibleContent><CodeBlock size="sm"><CodeBlockContent>All tests passed.</CodeBlockContent></CodeBlock><Trace><TraceLine><TraceTitle>Verified native rendering</TraceTitle></TraceLine></Trace></TraceCollapsibleContent></TraceCollapsible></Trace> };
function ControlledExample() {
  const [open, setOpen] = React.useState(false);
  return <Trace><Button onClick={() => setOpen(value => !value)}>Toggle details</Button><TraceCollapsible open={open} onOpenChange={setOpen}><TraceCollapsibleTrigger><TraceLine status="running"><TraceTitle>Inspecting a streamed result</TraceTitle></TraceLine></TraceCollapsibleTrigger><TraceCollapsibleContent>User-controlled details stay open.</TraceCollapsibleContent></TraceCollapsible></Trace>;
}
export const Controlled: Story = { render: () => <ControlledExample /> };

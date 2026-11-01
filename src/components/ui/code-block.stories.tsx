import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeBlock, CodeBlockHeader, CodeBlockTitle, CodeBlockActions, CodeBlockCopyButton, CodeBlockContent, CodeBlockLine } from './code-block.js';
import { useHighlightedCode } from '../../hooks/use-highlighted-code.js';
import { Button } from './button.js';
const meta = { title: 'UI/Code Block', component: CodeBlock, parameters: { layout: 'centered', renderer: 'react' }, tags: ['autodocs'] } satisfies Meta<typeof CodeBlock>;
export default meta;
type Story = StoryObj<typeof meta>;
const code = 'const ready = true;\n\nexport { ready };\n';
export const Numbered: Story = { render: () => <CodeBlock className="w-[min(40rem,calc(100vw-2rem))]"><CodeBlockHeader><CodeBlockTitle>release.ts</CodeBlockTitle><CodeBlockActions><CodeBlockCopyButton value={code} /></CodeBlockActions></CodeBlockHeader><CodeBlockContent lineNumbers startLine={10}>{code}</CodeBlockContent></CodeBlock> };
export const Diff: Story = { render: () => <CodeBlock size="sm"><CodeBlockContent lineNumbers><CodeBlockLine variant="removed">const ready = false;</CodeBlockLine><CodeBlockLine variant="added">const ready = true;</CodeBlockLine><CodeBlockLine /><CodeBlockLine variant="highlighted">export &#123; ready &#125;;</CodeBlockLine></CodeBlockContent></CodeBlock> };
export const Wrapped: Story = { render: () => <div dir="rtl" className="max-w-sm"><CodeBlock variant="destructive"><CodeBlockHeader><CodeBlockTitle>Failed command</CodeBlockTitle></CodeBlockHeader><CodeBlockContent wrap>{'Error: a deliberately long diagnostic message that wraps within the narrow code block while its content remains left to right.'}</CodeBlockContent></CodeBlock></div> };
function StreamingExample() {
  const [value, setValue] = React.useState('const');
  const lines = useHighlightedCode(value, 'typescript');
  return <div className="flex flex-col gap-3"><Button onClick={() => setValue(value === code ? 'const' : code)}>Replay stream</Button><CodeBlock><CodeBlockContent lineNumbers>{lines.map((line, index) => <CodeBlockLine key={index}>{line}</CodeBlockLine>)}</CodeBlockContent></CodeBlock></div>;
}
export const Streaming: Story = { render: () => <StreamingExample /> };

import type { Meta, StoryObj } from '@storybook/react';
import { Callout } from './callout.js';

const meta = { title: 'UI/Callout', component: Callout, parameters: { renderer: 'react' }, args: { label: 'Before you start', children: <p>Bring something to write with.</p> } } satisfies Meta<typeof Callout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Accent: Story = { args: { tone: 'accent' } };
export const Warning: Story = { args: { tone: 'warn' } };

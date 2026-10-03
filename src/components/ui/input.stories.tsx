import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input.js';

const meta = {
  parameters: { renderer: 'react' },
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text here...',
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite"

import { Spinner } from "./spinner.js"

const meta = {
  title: "UI/Spinner",
  component: Spinner,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg", "xl"],
    },
    label: {
      control: "text",
      description: "Accessible loading status label.",
    },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: "default",
    label: "Loading",
  },
}

export const Small: Story = {
  args: {
    size: "sm",
  },
}

export const Large: Story = {
  args: {
    size: "lg",
  },
}

export const ExtraLarge: Story = {
  args: {
    size: "xl",
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-5">
      <Spinner size="sm" label="Small spinner" />
      <Spinner label="Default spinner" />
      <Spinner size="lg" label="Large spinner" />
      <Spinner size="xl" label="Extra large spinner" />
    </div>
  ),
}

export const WithText: Story = {
  render: () => (
    <div className="flex items-center gap-3 rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
      <Spinner size="sm" label="Loading records" />
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-ink)]">
        Loading records...
      </span>
    </div>
  ),
}

export const ReducedMotion: Story = {
  render: () => (
    <Spinner
      size="lg"
      label="Static loading indicator"
      className="[&>span]:animate-none"
    />
  ),
}

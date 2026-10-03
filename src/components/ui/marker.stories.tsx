import type { Meta, StoryObj } from "@storybook/react-vite"

import { Marker, MarkerContent, MarkerIcon } from "./marker.js"

const meta = {
  title: "UI/Marker",
  component: Marker,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "accent", "secondary", "outline", "border", "separator"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    asChild: {
      control: false,
    },
  },
} satisfies Meta<typeof Marker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "New",
    variant: "default",
    size: "md",
  },
}

export const Accent: Story = {
  args: {
    children: "Featured",
    variant: "accent",
    size: "md",
  },
}

export const Secondary: Story = {
  args: {
    children: "Draft",
    variant: "secondary",
    size: "md",
  },
}

export const Outline: Story = {
  args: {
    children: "Archived",
    variant: "outline",
    size: "md",
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-5">
      <Marker size="sm">Small</Marker>
      <Marker size="md">Medium</Marker>
      <Marker size="lg">Large</Marker>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-5">
      <Marker>Default</Marker>
      <Marker variant="accent">Accent</Marker>
      <Marker variant="secondary">Secondary</Marker>
      <Marker variant="outline">Outline</Marker>
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div className="max-w-md border border-[var(--color-ink)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] rounded-none">
      <div className="mb-4 flex items-center gap-4">
        <Marker variant="accent" size="sm">
          Updated
        </Marker>
        <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-3)]">
          Release 2.4
        </span>
      </div>
      <h3 className="font-serif text-xl font-bold text-[var(--color-text-main)]">
        Structural components
      </h3>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-2)]">
        Marker labels draw attention to compact statuses and editorial metadata.
      </p>
    </div>
  ),
}

export const AsChild: Story = {
  render: () => (
    <Marker asChild variant="outline">
      <a href="#marker-example">Linked marker</a>
    </Marker>
  ),
}

export const Composed: Story = {
  render: () => (
    <div className="flex w-[min(480px,calc(100vw-40px))] flex-col gap-4">
      <Marker variant="border" role="status"><MarkerIcon>✓</MarkerIcon><MarkerContent>Reviewed all project files</MarkerContent></Marker>
      <Marker variant="separator"><MarkerContent>Today</MarkerContent></Marker>
    </div>
  ),
}

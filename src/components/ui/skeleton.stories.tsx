import type { Meta, StoryObj } from "@storybook/react-vite"

import { Skeleton } from "./skeleton.js"

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: false,
      description: "Tailwind classes used to size and compose the placeholder.",
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: "h-4 w-64",
  },
}

export const Profile: Story = {
  render: () => (
    <div className="flex w-80 items-center gap-4 border border-[var(--color-ink)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-palette)]">
      <Skeleton className="h-14 w-14 shrink-0" />
      <div className="grid flex-1 gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  ),
}

export const Card: Story = {
  render: () => (
    <div className="grid w-80 gap-4 border border-[var(--color-ink)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
      <Skeleton className="h-36 w-full" />
      <div className="grid gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <Skeleton className="h-9 w-28" />
    </div>
  ),
}

export const List: Story = {
  render: () => (
    <div className="grid w-80 gap-3">
      {["first", "second", "third"].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 border border-[var(--color-ink)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)]"
        >
          <Skeleton className="h-10 w-10 shrink-0" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  ),
}

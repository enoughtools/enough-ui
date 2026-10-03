import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Progress } from "./progress.js"

const meta = {
  title: "UI/Progress",
  component: Progress,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "The current progress value.",
    },
    max: {
      control: { type: "number", min: 1 },
      description: "The maximum progress value.",
    },
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 45,
    className: "w-[300px]",
  },
}

export const Empty: Story = {
  args: {
    value: 0,
    className: "w-[300px]",
  },
}

export const Complete: Story = {
  args: {
    value: 100,
    className: "w-[300px]",
  },
}

export const CustomMaximum: Story = {
  args: { value: 3, max: 8, "aria-label": "Files uploaded", className: "w-[300px]", getValueLabel: (value, max) => `${value} of ${max} files` },
}

export const InvalidBounds: Story = {
  args: { value: 150, max: 0, className: "w-[300px]" },
}

export const Indeterminate: Story = {
  args: { value: null, className: "w-[300px]" },
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <div className="flex items-center justify-between font-sans text-xs uppercase tracking-wider text-[var(--color-ink)]">
        <span>Uploading</span>
        <span>68%</span>
      </div>
      <Progress value={68} aria-label="Upload progress" />
    </div>
  ),
}

export const Animated: Story = {
  render: function AnimatedProgress() {
    const [progress, setProgress] = React.useState(13)

    React.useEffect(() => {
      const timer = window.setTimeout(() => setProgress(87), 500)
      return () => window.clearTimeout(timer)
    }, [])

    return (
      <Progress
        value={progress}
        className="w-[300px]"
        aria-label="Animated progress"
      />
    )
  },
}

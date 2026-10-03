import type { Meta, StoryObj } from "@storybook/react-vite"

import { Textarea } from "./textarea.js"

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { 'aria-label': 'Project brief' },
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    rows: { control: { type: "number", min: 2, max: 12 } },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: "Describe the problem, audience, and intended outcome.",
  },
}

export const WithValue: Story = {
  args: {
    defaultValue:
      "Build a clear project brief that gives the team enough context to make decisions without another meeting.",
  },
}

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    defaultValue: "Too short.",
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "This note is locked while the review is in progress.",
  },
}

export const FixedRows: Story = {
  args: {
    rows: 6,
    placeholder: "Add implementation notes…",
  },
}

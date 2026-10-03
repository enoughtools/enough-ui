import type { Meta, StoryObj } from "@storybook/react-vite"

import { ToggleGroup, ToggleGroupItem } from "./toggle-group.js"

const meta = {
  title: "UI/Toggle Group",
  component: ToggleGroup,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "radio",
      options: ["single", "multiple"],
    },
    variant: {
      control: "radio",
      options: ["default", "outline"],
    },
    size: {
      control: "radio",
      options: ["default", "sm", "lg"],
    },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: {
    type: "single",
    defaultValue: "center",
    "aria-label": "Text alignment",
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="left" aria-label="Align left">
        ◧ Left
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        ▣ Center
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        Right ◨
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Multiple: Story = {
  args: {
    type: "multiple",
    variant: "outline",
    defaultValue: ["bold", "underline"],
    "aria-label": "Text formatting",
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <span className="font-black">B</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <span className="italic">I</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <span className="underline">U</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="strike" aria-label="Toggle strikethrough">
        <span className="line-through">S</span>
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Sizes: Story = {
  args: {
    type: "single",
    "aria-label": "Density",
  },
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <ToggleGroup type="single" aria-label="Density" size="sm" defaultValue="compact">
        <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
        <ToggleGroupItem value="cozy">Cozy</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" aria-label="Density" defaultValue="compact">
        <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
        <ToggleGroupItem value="cozy">Cozy</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" aria-label="Density" size="lg" defaultValue="compact">
        <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
        <ToggleGroupItem value="cozy">Cozy</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}

export const Vertical: Story = {
  args: {
    type: "single",
    orientation: "vertical",
    variant: "outline",
    defaultValue: "grid",
    "aria-label": "View style",
  },
  render: (args) => (
    <ToggleGroup {...args} className="w-40">
      <ToggleGroupItem value="list" className="w-full justify-start">
        ≡ List
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" className="w-full justify-start">
        ▦ Grid
      </ToggleGroupItem>
      <ToggleGroupItem value="detail" className="w-full justify-start">
        ▤ Detail
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Disabled: Story = {
  args: {
    type: "single",
    defaultValue: "week",
    disabled: true,
    "aria-label": "Date range",
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="day">Day</ToggleGroupItem>
      <ToggleGroupItem value="week">Week</ToggleGroupItem>
      <ToggleGroupItem value="month">Month</ToggleGroupItem>
    </ToggleGroup>
  ),
}

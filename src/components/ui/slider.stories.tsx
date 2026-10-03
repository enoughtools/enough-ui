import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Slider } from "./slider.js"

const meta = {
  title: "UI/Slider",
  component: Slider,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "object",
      description: "The initial slider value or values.",
    },
    min: {
      control: "number",
      description: "The minimum permitted value.",
    },
    max: {
      control: "number",
      description: "The maximum permitted value.",
    },
    step: {
      control: "number",
      description: "The interval between permitted values.",
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
  },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: [50],
    className: "w-[min(70vw,320px)]",
    "aria-label": "Value",
  },
}

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    className: "w-[min(70vw,320px)]",
    "aria-label": "Price range",
    thumbLabels: ["Minimum price", "Maximum price"],
  },
}

export const Steps: Story = {
  args: {
    defaultValue: [30],
    step: 10,
    className: "w-[min(70vw,320px)]",
    "aria-label": "Value in increments of ten",
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    disabled: true,
    className: "w-[min(70vw,320px)]",
    "aria-label": "Disabled value",
  },
}

export const Vertical: Story = {
  args: {
    defaultValue: [65],
    orientation: "vertical",
    "aria-label": "Vertical value",
  },
}

export const WithValue: Story = {
  render: function SliderWithValue() {
    const [value, setValue] = React.useState([42])

    return (
      <div className="w-[min(70vw,320px)] space-y-3">
        <div className="flex items-center justify-between font-sans text-xs uppercase tracking-wider text-[var(--color-ink)]">
          <span>Intensity</span>
          <output>{value[0]}%</output>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          aria-label="Intensity"
        />
      </div>
    )
  },
}

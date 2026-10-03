import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { Toggle } from "./toggle.js"

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
    pressed: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    showStateIndicator: {
      control: "boolean",
      description:
        "Shows a redundant ON/OFF plate so state does not depend on color alone.",
    },
  },
  args: {
    children: "Favorite",
    showStateIndicator: true,
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("button", {
      name: "Favorite",
      pressed: false,
    })

    await expect(toggle).toHaveAttribute("data-state", "off")
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute("aria-pressed", "true")
    await expect(toggle).toHaveAttribute("data-state", "on")
  },
}

export const Pressed: Story = {
  args: {
    defaultPressed: true,
  },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("button", {
      name: "Favorite",
      pressed: true,
    })

    await expect(toggle).toHaveAttribute("data-state", "on")
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Selected",
  },
}

export const Small: Story = {
  args: {
    size: "sm",
    children: "Bold",
  },
}

export const Large: Story = {
  args: {
    size: "lg",
    children: "Feature",
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Toggle disabled>Unavailable</Toggle>
      <Toggle disabled defaultPressed>
        Locked selection
      </Toggle>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const toggles = within(canvasElement).getAllByRole("button")

    await expect(toggles[0]).toBeDisabled()
    await expect(toggles[0]).toHaveAttribute("aria-pressed", "false")
    await expect(toggles[1]).toBeDisabled()
    await expect(toggles[1]).toHaveAttribute("aria-pressed", "true")
  },
}

export const States: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_auto] items-center gap-x-4 gap-y-3">
      <span className="font-sans text-xs font-bold tracking-[0.12em] text-[var(--color-text-3)]">
        UNPRESSED
      </span>
      <Toggle>Favorite</Toggle>
      <span className="font-sans text-xs font-bold tracking-[0.12em] text-[var(--color-text-3)]">
        PRESSED
      </span>
      <Toggle defaultPressed>Favorite</Toggle>
      <span className="font-sans text-xs font-bold tracking-[0.12em] text-[var(--color-text-3)]">
        OUTLINE
      </span>
      <Toggle variant="outline" defaultPressed>
        Favorite
      </Toggle>
      <span className="font-sans text-xs font-bold tracking-[0.12em] text-[var(--color-text-3)]">
        COMPACT
      </span>
      <Toggle showStateIndicator={false} aria-label="Bold" defaultPressed>
        B
      </Toggle>
    </div>
  ),
}

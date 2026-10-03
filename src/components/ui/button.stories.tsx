import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { Button } from "./button.js"

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["ink", "accent", "outline", "ghost", "destructive"],
    },
    size: {
      control: "select",
      options: ["md", "sm", "ghost"],
    },
    asChild: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Ink: Story = {
  args: {
    children: "Button",
    variant: "ink",
  },
}

export const Accent: Story = {
  args: {
    children: "Button",
    variant: "accent",
  },
}

export const Outline: Story = {
  args: {
    children: "Button",
    variant: "outline",
  },
}

export const Ghost: Story = {
  args: {
    children: "Button",
    variant: "ghost",
  },
}

export const Destructive: Story = {
  args: {
    children: "Delete account",
    variant: "destructive",
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Delete account",
    })

    await expect(button).toBeEnabled()
    await userEvent.tab()
    await expect(button).toHaveFocus()
    await userEvent.hover(button)
  },
}

export const DestructiveDisabled: Story = {
  args: {
    children: "Delete account",
    variant: "destructive",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Delete account" })
    ).toBeDisabled()
  },
}

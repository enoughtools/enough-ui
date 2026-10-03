import type { Meta, StoryObj } from "@storybook/react-vite"

import { Kbd, KbdGroup } from "./kbd.js"

const meta = {
  title: "UI/Kbd",
  component: Kbd,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    asChild: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "K",
  },
}

export const Command: Story = {
  args: {
    children: "⌘",
    "aria-label": "Command",
  },
}

export const Pressed: Story = {
  render: () => (
    <Kbd data-pressed="true" aria-label="K, pressed">
      K
    </Kbd>
  ),
}

export const KeyCombination: Story = {
  render: () => (
    <KbdGroup aria-label="Command Shift P">
      <Kbd aria-hidden="true">⌘</Kbd>
      <Kbd aria-hidden="true">Shift</Kbd>
      <Kbd aria-hidden="true">P</Kbd>
    </KbdGroup>
  ),
}

export const CommonKeys: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 text-[var(--color-ink)]">
      <Kbd>Esc</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd aria-label="Backspace">⌫</Kbd>
      <Kbd aria-label="Arrow up">Up</Kbd>
      <Kbd aria-label="Arrow down">Down</Kbd>
    </div>
  ),
}

export const WithinText: Story = {
  render: () => (
    <p className="font-sans text-sm text-[var(--color-ink)]">
      Press <Kbd className="mx-1">Enter</Kbd> to continue.
    </p>
  ),
}

export const ShortcutCard: Story = {
  render: () => (
    <div className="flex w-72 items-center justify-between rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] p-4 text-[var(--color-ink)] shadow-[var(--shadow-card)]">
      <span className="font-sans text-sm font-medium">Open command menu</span>
      <KbdGroup aria-label="Command K">
        <Kbd aria-hidden="true">⌘</Kbd>
        <Kbd aria-hidden="true">K</Kbd>
      </KbdGroup>
    </div>
  ),
}

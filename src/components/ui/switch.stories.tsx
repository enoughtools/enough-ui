import type { Meta, StoryObj } from "@storybook/react-vite"

import { Switch } from "./switch.js"

const meta = {
  title: "UI/Switch",
  component: Switch,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    "aria-label": "Enable notifications",
  },
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
    "aria-label": "Enable notifications",
  },
}

export const Small: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch size="sm" id="compact-notifications" />
      <label htmlFor="compact-notifications" className="cursor-pointer text-sm text-[var(--color-ink)]">Enable notifications</label>
    </div>
  ),
}

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" className="grid gap-5">
      <div className="flex items-center gap-3"><Switch id="rtl-notifications" defaultChecked /><label htmlFor="rtl-notifications" className="cursor-pointer text-sm text-[var(--color-ink)]">Notifications</label></div>
      <div className="flex items-center gap-3"><Switch id="rtl-compact-notifications" size="sm" defaultChecked /><label htmlFor="rtl-compact-notifications" className="cursor-pointer text-sm text-[var(--color-ink)]">Compact notifications</label></div>
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="airplane-mode" />
      <label
        htmlFor="airplane-mode"
        className="cursor-pointer text-sm font-medium text-[var(--color-ink)] peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        Airplane mode
      </label>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Switch disabled aria-label="Disabled off switch" />
      <Switch disabled defaultChecked aria-label="Disabled on switch" />
    </div>
  ),
}

export const Settings: Story = {
  render: () => (
    <div className="w-80 border border-[var(--color-ink)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      {[
        ["settings-email", "Email alerts", "Receive updates in your inbox", true],
        ["settings-sound", "Sound", "Play a sound for new activity", false],
        ["settings-public", "Public profile", "Allow others to find your profile", true],
      ].map(([id, label, description, checked]) => (
        <div
          key={String(id)}
          className="flex items-center justify-between gap-6 border-b border-[var(--color-ink)] p-4 last:border-b-0"
        >
          <label htmlFor={String(id)} className="cursor-pointer">
            <span className="block text-sm font-bold text-[var(--color-ink)]">
              {String(label)}
            </span>
            <span className="block text-xs text-[var(--color-text-muted)]">
              {String(description)}
            </span>
          </label>
          <Switch id={String(id)} defaultChecked={Boolean(checked)} />
        </div>
      ))}
    </div>
  ),
}

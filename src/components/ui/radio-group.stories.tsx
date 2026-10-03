import type { Meta, StoryObj } from "@storybook/react-vite"

import { RadioGroup, RadioGroupItem } from "./radio-group.js"

const meta = {
  title: "UI/Radio Group",
  component: RadioGroup,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

const labelClassName =
  "cursor-pointer text-sm font-medium leading-none text-[var(--color-text-main)] peer-disabled:cursor-not-allowed peer-disabled:opacity-50"

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="email" aria-label="Notification preference">
      <div className="flex items-center gap-3">
        <RadioGroupItem value="email" id="notifications-email" />
        <label htmlFor="notifications-email" className={labelClassName}>
          Email
        </label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="sms" id="notifications-sms" />
        <label htmlFor="notifications-sms" className={labelClassName}>
          Text message
        </label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="none" id="notifications-none" />
        <label htmlFor="notifications-none" className={labelClassName}>
          Do not notify me
        </label>
      </div>
    </RadioGroup>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <RadioGroup
      defaultValue="comfortable"
      aria-label="Interface density"
      className="flex flex-wrap gap-6"
    >
      {[
        ["compact", "Compact"],
        ["comfortable", "Comfortable"],
        ["spacious", "Spacious"],
      ].map(([value, label]) => (
        <div className="flex items-center gap-3" key={value}>
          <RadioGroupItem value={value} id={`density-${value}`} />
          <label htmlFor={`density-${value}`} className={labelClassName}>
            {label}
          </label>
        </div>
      ))}
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="standard" aria-label="Shipping speed">
      <div className="flex items-center gap-3">
        <RadioGroupItem value="standard" id="shipping-standard" />
        <label htmlFor="shipping-standard" className={labelClassName}>
          Standard shipping
        </label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="express" id="shipping-express" disabled />
        <label htmlFor="shipping-express" className={labelClassName}>
          Express shipping — unavailable
        </label>
      </div>
    </RadioGroup>
  ),
}

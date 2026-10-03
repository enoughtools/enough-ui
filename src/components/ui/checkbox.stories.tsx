import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Checkbox } from "./checkbox.js"

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: { renderer: "react", layout: "centered" },
} satisfies Meta<typeof Checkbox>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <div className="flex items-center gap-3"><Checkbox id="checkbox-updates" /><label htmlFor="checkbox-updates" className="cursor-pointer text-sm">Send product updates</label></div>,
}
export const Checked: Story = {
  render: () => <div className="flex items-center gap-3"><Checkbox id="checkbox-checked" defaultChecked /><label htmlFor="checkbox-checked" className="cursor-pointer text-sm">Keep me signed in</label></div>,
}
export const Disabled: Story = {
  render: () => <div className="flex items-center gap-3"><Checkbox id="checkbox-disabled" disabled /><label htmlFor="checkbox-disabled" className="cursor-not-allowed text-sm opacity-50">Updates unavailable</label></div>,
}
export const Indeterminate: Story = {
  render: function IndeterminateCheckbox() {
    const [checked, setChecked] = React.useState<React.ComponentProps<typeof Checkbox>["checked"]>("indeterminate")
    return <div className="flex items-center gap-3"><Checkbox id="checkbox-all" checked={checked} onCheckedChange={setChecked} /><label htmlFor="checkbox-all" className="cursor-pointer text-sm">Select all items</label></div>
  },
}
export const Standalone: Story = {
  render: () => <Checkbox aria-label="Select item" />,
}

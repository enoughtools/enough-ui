import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Button } from "./button.js"
import { Input } from "./input.js"
import { Label } from "./label.js"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover.js"

const meta = {
  title: "UI/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Edit dimensions</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start" aria-labelledby="popover-dimensions-title" aria-describedby="popover-dimensions-description">
        <div className="space-y-[16px]">
          <PopoverHeader className="border-b border-[var(--color-ink)] pb-[12px]">
            <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-3)]">
              Canvas
            </p>
            <PopoverTitle id="popover-dimensions-title" className="mt-[4px]">
              Dimensions
            </PopoverTitle>
            <PopoverDescription id="popover-dimensions-description" className="mt-[8px]">
              Set the size of the selected frame.
            </PopoverDescription>
          </PopoverHeader>
          <div className="grid gap-[12px]">
            <div className="grid grid-cols-[72px_1fr] items-center gap-[12px]">
              <Label htmlFor="popover-width">Width</Label>
              <Input id="popover-width" defaultValue="1280" className="h-[33px] px-[12px]" />
            </div>
            <div className="grid grid-cols-[72px_1fr] items-center gap-[12px]">
              <Label htmlFor="popover-height">Height</Label>
              <Input id="popover-height" defaultValue="720" className="h-[33px] px-[12px]" />
            </div>
          </div>
          <div className="flex justify-end border-t border-[var(--color-ink)] pt-[12px]">
            <Button size="sm">Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole("button", { name: "Edit dimensions" })

    await userEvent.click(trigger)
    const dialog = await page.findByRole("dialog", { name: "Dimensions" })
    await expect(dialog).toHaveAccessibleDescription("Set the size of the selected frame.")
    await expect(within(dialog).getByRole("heading", { name: "Dimensions", level: 2 })).toBeVisible()
    await expect(within(dialog).getByLabelText("Width")).toHaveFocus()
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(page.queryByRole("dialog")).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
  },
}

export const Header: Story = {
  render: () => (
    <div className="w-72 rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-palette)]">
      <PopoverHeader>
        <PopoverTitle>Share this canvas</PopoverTitle>
        <PopoverDescription>
          Invite your team to review the latest version.
        </PopoverDescription>
      </PopoverHeader>
    </div>
  ),
}

export const Anchored: Story = {
  render: () => (
    <Popover defaultOpen>
      <div className="relative flex h-[180px] w-[360px] items-center justify-center border border-[var(--color-ink)] bg-[var(--color-paper)]">
        <PopoverAnchor asChild>
          <span className="size-[8px] rounded-none bg-[var(--color-accent)]" />
        </PopoverAnchor>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="absolute bottom-[16px] right-[16px]">
            Toggle note
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent side="top" className="w-56 shadow-[var(--shadow-card)]">
        <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-3)]">
          Anchor point
        </p>
        <p className="mt-[6px] text-[13px] leading-[1.5]">
          Content can be positioned against a separate visual target.
        </p>
      </PopoverContent>
    </Popover>
  ),
}

export const Positioned: Story = {
  render: () => (
    <div className="flex flex-wrap items-center justify-center gap-[16px] p-[80px]">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              {side[0].toUpperCase() + side.slice(1)}
            </Button>
          </PopoverTrigger>
          <PopoverContent side={side} className="w-52">
            <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-3)]">
              Placement
            </p>
            <p className="mt-[6px] text-[13px] leading-[1.5]">
              This popover opens on the {side} side of its trigger.
            </p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
}

import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button.js"
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet.js"

const meta = {
  title: "UI/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Update your public details, then save your changes.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div className="grid gap-[20px]">
            <label className="grid gap-[6px] text-[13px] font-semibold text-[var(--color-ink)]">
              Name
              <input
                defaultValue="Pedro Duarte"
                className="h-[41px] rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] px-[12px] text-[14px] font-normal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
              />
            </label>
            <label className="grid gap-[6px] text-[13px] font-semibold text-[var(--color-ink)]">
              Username
              <input
                defaultValue="@peduarte"
                className="h-[41px] rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] px-[12px] text-[14px] font-normal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
              />
            </label>
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button>Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open workspace</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Workspace</SheetTitle>
          <SheetDescription>Choose a destination to continue.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <nav aria-label="Workspace navigation" className="grid gap-[8px]">
            {[
              ["01", "Overview"],
              ["02", "Projects"],
              ["03", "Archive"],
            ].map(([number, label]) => (
              <SheetClose asChild key={label}>
                <button className="flex cursor-pointer items-center gap-[16px] rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] px-[16px] py-[12px] text-left text-[14px] font-semibold text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]">
                  <span className="font-sans text-[12px] text-[var(--color-ink)] opacity-70">
                    {number}
                  </span>
                  {label}
                </button>
              </SheetClose>
            ))}
          </nav>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
}

export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Show announcement</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>System maintenance</SheetTitle>
          <SheetDescription>
            Publishing will be unavailable on September 12 from 02:00–03:00 UTC.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Understood</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open filters</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Filter results</SheetTitle>
          <SheetDescription>
            Narrow the collection by status and priority.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="mx-auto grid w-full max-w-3xl gap-[16px] sm:grid-cols-2">
          <label className="grid gap-[6px] text-[13px] font-semibold">
            Status
            <select className="h-[41px] rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] px-[12px] text-[14px] font-normal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]">
              <option>Any status</option>
              <option>In progress</option>
              <option>Complete</option>
            </select>
          </label>
          <label className="grid gap-[6px] text-[13px] font-semibold">
            Priority
            <select className="h-[41px] rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] px-[12px] text-[14px] font-normal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]">
              <option>Any priority</option>
              <option>High</option>
              <option>Standard</option>
            </select>
          </label>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Reset</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button>Apply filters</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const WithoutCloseButton: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline">Review preferences</Button></SheetTrigger>
      <SheetContent showCloseButton={false}>
        <SheetHeader><SheetTitle>Preferences</SheetTitle><SheetDescription>Review your preferences before continuing.</SheetDescription></SheetHeader>
        <SheetBody><p className="text-sm text-[var(--color-text-3)]">Press Escape or use the button below to return.</p></SheetBody>
        <SheetFooter><SheetClose asChild><Button>Done</Button></SheetClose></SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button.js"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer.js"

const meta = {
  title: "UI/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Project details</DrawerTitle>
          <DrawerDescription>
            Review the project information before saving your changes.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <dl className="grid gap-[20px] text-[14px]">
            <div className="grid gap-[4px] border-b border-[var(--color-ink)] pb-[16px]">
              <dt className="font-semibold text-[var(--color-ink)]">Owner</dt>
              <dd className="text-[var(--color-ink)]/70">Design systems team</dd>
            </div>
            <div className="grid gap-[4px] border-b border-[var(--color-ink)] pb-[16px]">
              <dt className="font-semibold text-[var(--color-ink)]">Status</dt>
              <dd className="text-[var(--color-ink)]/70">In progress</dd>
            </div>
            <div className="grid gap-[4px]">
              <dt className="font-semibold text-[var(--color-ink)]">Due date</dt>
              <dd className="text-[var(--color-ink)]/70">September 30</dd>
            </div>
          </dl>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button>Save changes</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

export const Left: Story = {
  render: () => (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">Open navigation</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Workspace</DrawerTitle>
          <DrawerDescription>Choose a section to continue.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <nav aria-label="Workspace navigation" className="grid gap-[8px]">
            {[
              ["01", "Overview"],
              ["02", "Projects"],
              ["03", "Archive"],
            ].map(([number, label]) => (
              <DrawerClose asChild key={label}>
                <button className="flex cursor-pointer items-center gap-[16px] rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] px-[16px] py-[12px] text-left text-[14px] font-semibold text-[var(--color-ink)] shadow-[var(--shadow-card)] transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]">
                  <span className="font-sans text-[12px] text-[var(--color-ink)]/70">
                    {number}
                  </span>
                  {label}
                </button>
              </DrawerClose>
            ))}
          </nav>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  ),
}

export const Bottom: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open filters</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filter results</DrawerTitle>
          <DrawerDescription>
            Narrow the collection by status and priority.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="mx-auto grid w-full max-w-3xl gap-[16px] sm:grid-cols-2">
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
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Reset</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button>Apply filters</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}


export const SnapPoints: Story = {
  render: function SnapPointsDrawer() {
    const [snap, setSnap] = React.useState<number | string | null>(0.5)
    return <Drawer snapPoints={[0.5, 0.9]} activeSnapPoint={snap} setActiveSnapPoint={setSnap}>
      <DrawerTrigger asChild><Button variant="outline">Open activity</Button></DrawerTrigger>
      <DrawerContent>
        <DrawerHeader><DrawerTitle>Workspace activity</DrawerTitle><DrawerDescription>Drag the handle or choose a height to see more activity.</DrawerDescription></DrawerHeader>
        <DrawerBody className="mx-auto w-full max-w-xl">
          <div className="mb-6 flex flex-wrap gap-2" aria-label="Drawer height">
            <Button variant={snap === 0.5 ? "default" : "outline"} onClick={() => setSnap(0.5)} aria-pressed={snap === 0.5}>Half height</Button>
            <Button variant={snap === 0.9 ? "default" : "outline"} onClick={() => setSnap(0.9)} aria-pressed={snap === 0.9}>Full height</Button>
          </div>
          <ul className="grid gap-4">{["Design review completed", "New project created", "Team invitation accepted", "Website published"].map((activity) => <li key={activity} className="border-b border-[var(--color-ink)] pb-4 text-sm">{activity}</li>)}</ul>
        </DrawerBody>
        <DrawerFooter><DrawerClose asChild><Button variant="outline">Done</Button></DrawerClose></DrawerFooter>
      </DrawerContent>
    </Drawer>
  },
}

export const Right: Story = {
  render: () => <Drawer direction="right"><DrawerTrigger asChild><Button variant="outline">Open details</Button></DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Project details</DrawerTitle><DrawerDescription>A side drawer supports the same pointer gestures as the bottom drawer.</DrawerDescription></DrawerHeader><DrawerBody>Drag toward the edge to dismiss.</DrawerBody><DrawerFooter><DrawerClose asChild><Button variant="outline">Done</Button></DrawerClose></DrawerFooter></DrawerContent></Drawer>,
}

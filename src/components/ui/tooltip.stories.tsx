import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button.js"
import { ScrollArea } from "./scroll-area.js"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip.js"

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: { renderer: "react", layout: "centered" },
  decorators: [(Story) => <TooltipProvider><Story /></TooltipProvider>],
} satisfies Meta<typeof Tooltip>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Tooltip><TooltipTrigger asChild><Button variant="outline">Publish draft</Button></TooltipTrigger><TooltipContent>Share this draft with your team.</TooltipContent></Tooltip>,
}

export const InScrollArea: Story = {
  render: () => (
    <ScrollArea className="h-36 w-72 border border-[var(--color-ink)] bg-[var(--color-surface)]">
      <div className="grid gap-4 p-4">
        <p className="text-sm text-[var(--color-text-3)]">The tooltip stays visible above the scroll area.</p>
        <Tooltip><TooltipTrigger asChild><Button variant="outline">Archive project</Button></TooltipTrigger><TooltipContent side="right">You can restore it from the archive.</TooltipContent></Tooltip>
        <p className="text-sm text-[var(--color-text-3)]">Scroll to review the rest of this project.</p>
      </div>
    </ScrollArea>
  ),
}

export const Delayed: Story = {
  render: () => <TooltipProvider delayDuration={500}><Tooltip><TooltipTrigger asChild><Button variant="outline">Hover for details</Button></TooltipTrigger><TooltipContent>Appears after a short delay.</TooltipContent></Tooltip></TooltipProvider>,
}

export const LongText: Story = {
  render: () => <Tooltip defaultOpen><TooltipTrigger asChild><Button variant="outline">Workspace permissions</Button></TooltipTrigger><TooltipContent>Everyone with access to this workspace can view published drafts, while only project editors can update content and change sharing permissions.</TooltipContent></Tooltip>,
}

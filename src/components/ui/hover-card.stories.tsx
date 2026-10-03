import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button.js"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./hover-card.js"

const meta = {
  title: "UI/Hover Card",
  component: HoverCard,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <HoverCard openDelay={150}>
      <HoverCardTrigger asChild>
        <Button variant="outline">@atlas</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex gap-[12px]">
          <div
            aria-hidden="true"
            className="flex size-[44px] shrink-0 items-center justify-center rounded-none border border-[var(--color-ink)] bg-[var(--color-accent-soft)] font-sans text-[16px] font-semibold text-[var(--color-accent)]"
          >
            A
          </div>
          <div className="min-w-0 space-y-[8px]">
            <div>
              <p className="text-[14px] font-semibold leading-tight">Atlas Studio</p>
              <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-3)]">
                Design systems
              </p>
            </div>
            <p className="text-[13px] leading-[1.5] text-[var(--color-text-2)]">
              Tools and patterns for building precise, accessible interfaces.
            </p>
            <p className="border-t border-[var(--color-ink)] pt-[8px] font-sans text-[11px] text-[var(--color-text-3)]">
              24 components · Updated today
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}

export const Compact: Story = {
  render: () => (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <a
          href="#hover-card-release"
          className="font-sans text-[14px] font-semibold text-[var(--color-accent)] underline decoration-1 underline-offset-4 outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
        >
          Release 2.4
        </a>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-64 shadow-[var(--shadow-card)]">
        <div className="space-y-[8px]">
          <div className="flex items-center justify-between gap-[16px] border-b border-[var(--color-ink)] pb-[8px]">
            <p className="text-[14px] font-semibold">Release 2.4</p>
            <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-[var(--color-ok)]">
              Stable
            </span>
          </div>
          <p className="text-[13px] leading-[1.5] text-[var(--color-text-2)]">
            Adds keyboard navigation improvements and new layout primitives.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}

export const Positioned: Story = {
  render: () => (
    <div className="flex flex-wrap items-center justify-center gap-[16px] p-[80px]">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <HoverCard key={side} openDelay={100}>
          <HoverCardTrigger asChild>
            <Button variant="outline" size="sm">
              {side[0].toUpperCase() + side.slice(1)}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent side={side} className="w-52">
            <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-3)]">
              Placement
            </p>
            <p className="mt-[6px] text-[13px] leading-[1.5]">
              This card opens on the {side} side of its trigger.
            </p>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  ),
}

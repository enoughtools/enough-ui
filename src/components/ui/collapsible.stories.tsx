import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { directionIconClass, directionChevronPaths } from "../../lib/direction-icons.js"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible.js"

const meta = {
  parameters: { renderer: 'react' },
  title: "UI/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-[350px] space-y-2"
      >
        <div className="flex items-center justify-between space-x-4 px-4 py-2 border border-[var(--color-ink)] shadow-[var(--shadow-card)] bg-[var(--color-surface)] rounded-none">
          <h4 className="text-sm font-semibold text-[var(--color-ink)]">
            Starred repositories
          </h4>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-label={isOpen ? "Collapse repositories" : "Expand repositories"}
              className="h-8 w-8 p-0 flex items-center justify-center border border-[var(--color-ink)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-accent)] cursor-pointer rounded-none transition-colors"
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={directionIconClass}><path d={isOpen ? directionChevronPaths.up : directionChevronPaths.down} /></svg>
            </button>
          </CollapsibleTrigger>
        </div>
        <div className="px-4 py-3 font-sans text-sm border border-[var(--color-ink)] bg-[var(--color-surface)] rounded-none">
          @radix-ui/primitives
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="px-4 py-3 font-sans text-sm border border-[var(--color-ink)] bg-[var(--color-surface)] rounded-none">
            @radix-ui/colors
          </div>
          <div className="px-4 py-3 font-sans text-sm border border-[var(--color-ink)] bg-[var(--color-surface)] rounded-none">
            @stitches/react
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}

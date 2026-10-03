import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./context-menu.js"

const meta = {
  title: "UI/Context Menu",
  component: ContextMenu,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

function ContextArea({ children }: { children?: React.ReactNode }) {
  return (
    <ContextMenuTrigger asChild>
      <div className="flex h-[280px] w-[420px] max-w-[calc(100vw-32px)] select-none items-center justify-center border border-[var(--color-ink)] bg-[var(--color-surface)] p-[32px] text-center font-sans shadow-[var(--shadow-card)] rounded-none">
        <div>
          <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-3)]">
            Context target
          </div>
          <p className="mt-[8px] text-[15px] text-[var(--color-text-main)]">
            {children ?? "Right-click anywhere in this area"}
          </p>
        </div>
      </div>
    </ContextMenuTrigger>
  )
}

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextArea />
      <ContextMenuContent className="w-[240px]">
        <ContextMenuItem>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem inset>Save page as…</ContextMenuItem>
        <ContextMenuItem inset>Print…</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

export const WithSelections: Story = {
  render: function WithSelectionsStory() {
    const [showBookmarks, setShowBookmarks] = React.useState(true)
    const [showUrls, setShowUrls] = React.useState(false)
    const [density, setDensity] = React.useState("comfortable")

    return (
      <ContextMenu>
        <ContextArea>Right-click to configure the view</ContextArea>
        <ContextMenuContent className="w-[260px]">
          <ContextMenuLabel>View options</ContextMenuLabel>
          <ContextMenuCheckboxItem
            checked={showBookmarks}
            onCheckedChange={setShowBookmarks}
          >
            Show bookmarks
            <ContextMenuShortcut>⌘Shift B</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={showUrls} onCheckedChange={setShowUrls}>
            Show full URLs
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuLabel inset>Density</ContextMenuLabel>
          <ContextMenuRadioGroup value={density} onValueChange={setDensity}>
            <ContextMenuRadioItem value="compact">Compact</ContextMenuRadioItem>
            <ContextMenuRadioItem value="comfortable">Comfortable</ContextMenuRadioItem>
            <ContextMenuRadioItem value="spacious">Spacious</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
}

export const WithSubmenu: Story = {
  render: () => (
    <ContextMenu>
      <ContextArea>Right-click to inspect submenu behavior</ContextArea>
      <ContextMenuContent className="w-[240px]">
        <ContextMenuLabel>Document</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuItem>
            Duplicate
            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>Rename</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-[220px]">
            <ContextMenuItem>Email link</ContextMenuItem>
            <ContextMenuItem>Copy private link</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Manage access…</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>Move to</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-[200px]">
            <ContextMenuLabel>Workspace</ContextMenuLabel>
            <ContextMenuItem>Research</ContextMenuItem>
            <ContextMenuItem>Archive</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-[var(--color-accent)]">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

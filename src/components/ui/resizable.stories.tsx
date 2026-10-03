import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable.js"

const meta = {
  title: "UI/Resizable",
  component: ResizablePanelGroup,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
} satisfies Meta<typeof ResizablePanelGroup>

export default meta
type Story = StoryObj<typeof meta>

function PanelContent({
  index,
  title,
  detail,
}: {
  index: string
  title: string
  detail: string
}) {
  return (
    <div tabIndex={0} role="region" aria-label={title} className="flex h-full min-h-0 flex-col justify-between gap-4 p-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]">
      <span className="font-sans text-[11px] tracking-[0.14em] text-[var(--color-accent)]">
        {index}
      </span>
      <div>
        <h3 className="font-serif text-[24px] text-[var(--color-text-main)]">
          {title}
        </h3>
        <p className="mt-1 font-sans text-[13px] text-[var(--color-text-3)]">
          {detail}
        </p>
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <ResizablePanelGroup
      aria-label="Outline and canvas"
      orientation="horizontal"
      className="h-[280px] w-[min(680px,calc(100vw-48px))]"
      style={{ height: 280, width: "min(680px, calc(100vw - 48px))" }}
    >
      <ResizablePanel id="outline" defaultSize="34%" minSize="20%">
        <PanelContent index="01" title="Outline" detail="Navigate the project structure." />
      </ResizablePanel>
      <ResizableHandle aria-label="Resize outline and canvas" withHandle />
      <ResizablePanel id="canvas" defaultSize="66%" minSize="30%">
        <PanelContent index="02" title="Canvas" detail="Shape the primary working area." />
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByLabelText("Outline and canvas")
    const separator = canvas.getByRole("separator", {
      name: "Resize outline and canvas",
    })
    const outline = group.querySelector("#outline")

    await expect(group.style.flexFlow).toContain("row")
    await expect(separator).toHaveAttribute("aria-orientation", "vertical")
    await expect(outline).not.toBeNull()

    const initialWidth = outline!.getBoundingClientRect().width
    const handleRect = separator.getBoundingClientRect()

    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: separator,
        coords: { clientX: handleRect.x, clientY: handleRect.y },
      },
      { coords: { clientX: handleRect.x + 60, clientY: handleRect.y } },
      { keys: "[/MouseLeft]" },
    ])
    await waitFor(() => {
      expect(outline!.getBoundingClientRect().width).toBeGreaterThan(initialWidth)
    })

    const draggedWidth = outline!.getBoundingClientRect().width
    separator.focus()
    await userEvent.keyboard("{ArrowRight}")

    await expect(separator).toHaveFocus()
    await waitFor(() => {
      expect(outline!.getBoundingClientRect().width).toBeGreaterThan(draggedWidth)
    })
  },
}

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup
      aria-label="Editor and console"
      orientation="vertical"
      className="h-[440px] w-[min(560px,calc(100vw-48px))]"
      style={{ height: 440, width: "min(560px, calc(100vw - 48px))" }}
    >
      <ResizablePanel id="editor" defaultSize="40%" minSize="25%">
        <PanelContent index="01" title="Editor" detail="Compose the current document." />
      </ResizablePanel>
      <ResizableHandle aria-label="Resize editor and console" withHandle />
      <ResizablePanel id="console" defaultSize="60%" minSize="25%">
        <PanelContent index="02" title="Console" detail="Review output and diagnostics." />
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByLabelText("Editor and console")
    const separator = canvas.getByRole("separator", {
      name: "Resize editor and console",
    })

    await expect(group.style.flexFlow).toContain("column")
    await expect(separator).toHaveAttribute("aria-orientation", "horizontal")
  },
}

export const Nested: Story = {
  render: () => (
    <ResizablePanelGroup
      aria-label="Project workspace"
      orientation="horizontal"
      className="h-[440px] w-[min(760px,calc(100vw-48px))]"
      style={{ height: 440, width: "min(760px, calc(100vw - 48px))" }}
    >
      <ResizablePanel id="library" defaultSize="28%" minSize="18%">
        <PanelContent index="01" title="Library" detail="Browse available resources." />
      </ResizablePanel>
      <ResizableHandle aria-label="Resize library and workspace" withHandle />
      <ResizablePanel id="workspace-area" defaultSize="72%" minSize="40%">
        <ResizablePanelGroup
          aria-label="Workspace and inspector"
          orientation="vertical"
          className="border-0 shadow-none"
        >
          <ResizablePanel id="workspace" defaultSize="62%" minSize="30%">
            <PanelContent index="02" title="Workspace" detail="Arrange and edit the composition." />
          </ResizablePanel>
          <ResizableHandle aria-label="Resize workspace and inspector" withHandle />
          <ResizablePanel id="inspector" defaultSize="38%" minSize="20%">
            <PanelContent index="03" title="Inspector" detail="Tune the selected element." />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

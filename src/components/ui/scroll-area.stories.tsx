import type { Meta, StoryObj } from "@storybook/react-vite"

import { ScrollArea, ScrollBar } from "./scroll-area.js"

const meta = {
  title: "UI/Scroll Area",
  component: ScrollArea,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const releaseNotes = Array.from({ length: 24 }, (_, index) => ({
  version: `02.${String(24 - index).padStart(2, "0")}`,
  note: index % 3 === 0 ? "System update" : index % 3 === 1 ? "Component pass" : "Token revision",
}))

export const Default: Story = {
  render: () => (
    <ScrollArea aria-label="Release notes" className="h-80 w-72 shadow-[var(--shadow-palette)]">
      <div className="p-4">
        <div className="mb-4 border-b border-[var(--color-ink)] pb-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">Archive</p>
          <h3 className="mt-1 text-lg font-bold">Release notes</h3>
        </div>
        <div className="divide-y divide-[var(--color-ink)]">
          {releaseNotes.map((release) => (
            <div key={release.version} className="grid grid-cols-[4rem_1fr] gap-3 py-3 text-sm">
              <span className="font-sans font-bold">{release.version}</span>
              <span>{release.note}</span>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  ),
}

const swatches = [
  ["Signal", "var(--color-accent)"],
  ["Ink", "var(--color-ink)"],
  ["Surface", "var(--color-surface)"],
  ["Signal", "var(--color-accent)"],
  ["Ink", "var(--color-ink)"],
  ["Surface", "var(--color-surface)"],
] as const

export const Horizontal: Story = {
  render: () => (
    <ScrollArea aria-label="Color swatches" className="w-[min(22rem,calc(100vw-3rem))] shadow-[var(--shadow-card)]">
      <div className="flex w-max gap-3 p-4 pb-5">
        {swatches.map(([name, color], index) => (
          <figure
            key={`${name}-${index}`}
            className="w-32 shrink-0 rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] shadow-[var(--shadow-palette)]"
          >
            <div
              className="h-24 border-b border-[var(--color-ink)]"
              style={{ backgroundColor: color }}
            />
            <figcaption className="flex items-center justify-between p-2 text-xs font-bold uppercase tracking-wider">
              {name}
            </figcaption>
          </figure>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}

export const BothAxes: Story = {
  render: () => (
    <ScrollArea aria-label="System index" className="h-64 w-[min(20rem,calc(100vw-3rem))] shadow-[var(--shadow-card)]">
      <div className="w-[42rem] p-4">
        <div className="mb-3 flex items-center justify-between border-b border-[var(--color-ink)] pb-3">
          <h3 className="font-bold uppercase tracking-wider">System index</h3>
          <span className="font-sans text-xs">24 entries</span>
        </div>
        {releaseNotes.slice(0, 12).map((release, index) => (
          <div
            key={release.version}
            className="grid grid-cols-[5rem_12rem_1fr_6rem] border-b border-[var(--color-ink)] py-3 text-sm"
          >
            <span className="font-sans">{release.version}</span>
            <strong>{release.note}</strong>
            <span>{index % 2 === 0 ? "Ready for review" : "In circulation"}</span>
            <span className="text-right font-sans">{String(index + 1).padStart(2, "0")} / 12</span>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}

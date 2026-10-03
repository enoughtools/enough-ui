import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button.js"
import {
  Empty,
  EmptyAction,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty.js"

const meta = {
  title: "UI/Empty",
  component: Empty,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[min(560px,calc(100vw-40px))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia aria-hidden="true">∅</EmptyMedia>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>
          We could not find anything matching your current filters. Adjust your
          search and try again.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <EmptyAction>
          <Button variant="outline">Clear filters</Button>
          <Button>New item</Button>
        </EmptyAction>
      </EmptyContent>
    </Empty>
  ),
}

export const FirstProject: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia aria-hidden="true">+</EmptyMedia>
        <EmptyTitle>Create your first project</EmptyTitle>
        <EmptyDescription>
          Projects keep related tasks, files, and conversations in one focused
          workspace.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <EmptyAction asChild>
          <Button>Create project</Button>
        </EmptyAction>
        <Button variant="ghost" size="ghost">
          Import an existing project
        </Button>
      </EmptyContent>
    </Empty>
  ),
}

export const Minimal: Story = {
  render: () => (
    <Empty className="min-h-40 bg-transparent p-6 shadow-none">
      <EmptyHeader>
        <EmptyMedia variant="bare" aria-hidden="true">
          —
        </EmptyMedia>
        <EmptyTitle>Nothing saved yet</EmptyTitle>
        <EmptyDescription>
          Saved items will appear here when you add them.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
}

export const Compact: Story = {
  render: () => (
    <Empty className="min-h-0 flex-row justify-between gap-4 p-4 text-left max-sm:flex-col max-sm:items-start">
      <EmptyHeader className="max-w-none flex-row gap-4 text-left max-sm:items-start">
        <EmptyMedia className="mb-0 h-10 w-10 text-lg" aria-hidden="true">
          !
        </EmptyMedia>
        <div className="space-y-1">
          <EmptyTitle className="text-base">No notifications</EmptyTitle>
          <EmptyDescription>
            You are all caught up. New activity will appear here.
          </EmptyDescription>
        </div>
      </EmptyHeader>
      <EmptyAction className="shrink-0 max-sm:pl-14">
        <Button variant="outline" size="sm">
          Refresh
        </Button>
      </EmptyAction>
    </Empty>
  ),
}

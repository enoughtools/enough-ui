import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "./combobox.js"

const frameworks = ["Astro", "Next.js", "Remix", "SvelteKit", "Nuxt"]

function ComboboxDemo({
  disabled = false,
  defaultOpen = false,
  showClear = false,
}: {
  disabled?: boolean
  defaultOpen?: boolean
  showClear?: boolean
}) {
  const [value, setValue] = React.useState<string | null>(null)

  return (
    <div className="grid gap-3">
      <label htmlFor="framework" className="font-sans text-sm font-semibold">
        Framework
      </label>
      <Combobox
        items={frameworks}
        value={value}
        onValueChange={setValue}
        disabled={disabled}
        defaultOpen={defaultOpen}
      >
        <ComboboxInput
          id="framework"
          placeholder="Select a framework"
          showClear={showClear}
        />
        <ComboboxContent>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxList>
            {(framework: string) => (
              <ComboboxItem key={framework} value={framework}>
                {framework}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p role="status" className="font-sans text-sm text-[var(--color-text-3)]">
        {value ? `${value} selected` : "Choose the framework for your project."}
      </p>
    </div>
  )
}

function MultipleComboboxDemo() {
  const [value, setValue] = React.useState<string[]>(["Astro"])
  const anchor = useComboboxAnchor()

  return (
    <div className="grid gap-3">
      <label htmlFor="frameworks" className="font-sans text-sm font-semibold">
        Supported frameworks
      </label>
      <Combobox items={frameworks} multiple value={value} onValueChange={setValue}>
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {value.map((framework) => (
              <ComboboxChip key={framework}>{framework}</ComboboxChip>
            ))}
          </ComboboxValue>
          <ComboboxChipsInput id="frameworks" placeholder="Add a framework" />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxList>
            {(framework: string) => (
              <ComboboxItem key={framework} value={framework}>
                {framework}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p role="status" className="font-sans text-sm text-[var(--color-text-3)]">
        {value.length === 0
          ? "Select every framework your project supports."
          : `${value.length} ${value.length === 1 ? "framework" : "frameworks"} selected`}
      </p>
    </div>
  )
}

type Workspace = {
  id: string
  name: string
  description: string
}

const workspaces: Workspace[] = [
  { id: "studio", name: "Studio", description: "Design systems and experiments" },
  { id: "product", name: "Product", description: "Roadmaps and release planning" },
  { id: "engineering", name: "Engineering", description: "Delivery and infrastructure" },
]

function CustomItemsDemo() {
  const [value, setValue] = React.useState<Workspace | null>(workspaces[0])

  return (
    <div className="grid gap-3">
      <label htmlFor="workspace" className="font-sans text-sm font-semibold">
        Workspace
      </label>
      <Combobox
        items={workspaces}
        value={value}
        onValueChange={setValue}
        itemToStringLabel={(workspace) => workspace.name}
        itemToStringValue={(workspace) => workspace.id}
      >
        <ComboboxInput id="workspace" placeholder="Search workspaces" showClear />
        <ComboboxContent>
          <ComboboxEmpty>No workspace found.</ComboboxEmpty>
          <ComboboxList>
            {(workspace: Workspace) => (
              <ComboboxItem key={workspace.id} value={workspace}>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-semibold">{workspace.name}</span>
                  <span className="text-xs text-[var(--color-text-3)]">
                    {workspace.description}
                  </span>
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p role="status" className="font-sans text-sm text-[var(--color-text-3)]">
        {value ? `${value.name} workspace selected` : "Choose a workspace."}
      </p>
    </div>
  )
}

type FrameworkGroup = {
  label: string
  items: string[]
}

const frameworkGroups: FrameworkGroup[] = [
  { label: "Content focused", items: ["Astro", "Nuxt"] },
  { label: "Application focused", items: ["Next.js", "Remix", "SvelteKit"] },
]

function GroupedComboboxDemo() {
  const [value, setValue] = React.useState<string | null>(null)

  return (
    <div className="grid gap-3">
      <label htmlFor="grouped-framework" className="font-sans text-sm font-semibold">
        Framework
      </label>
      <Combobox items={frameworkGroups} value={value} onValueChange={setValue}>
        <ComboboxInput id="grouped-framework" placeholder="Search frameworks" />
        <ComboboxContent>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxList>
            {(group: FrameworkGroup, index: number) => (
              <React.Fragment key={group.label}>
                <ComboboxGroup items={group.items}>
                  <ComboboxLabel>{group.label}</ComboboxLabel>
                  <ComboboxCollection>
                    {(framework: string) => (
                      <ComboboxItem key={framework} value={framework}>
                        {framework}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
                {index < frameworkGroups.length - 1 ? <ComboboxSeparator /> : null}
              </React.Fragment>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p role="status" className="font-sans text-sm text-[var(--color-text-3)]">
        {value ? `${value} selected` : "Search both groups to find a framework."}
      </p>
    </div>
  )
}

const meta = {
  parameters: { renderer: "react" },
  title: "UI/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-h-[380px] bg-[var(--color-paper)] p-[40px]">
        <div className="w-full max-w-[360px]">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ComboboxDemo />,
}

export const Open: Story = {
  render: () => <ComboboxDemo defaultOpen />,
}

export const MultipleSelection: Story = {
  render: () => <MultipleComboboxDemo />,
}

export const ClearButton: Story = {
  render: () => <ComboboxDemo showClear />,
}

export const Disabled: Story = {
  render: () => <ComboboxDemo disabled />,
}

export const CustomItems: Story = {
  render: () => <CustomItemsDemo />,
}

export const Groups: Story = {
  render: () => <GroupedComboboxDemo />,
}

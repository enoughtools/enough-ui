import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select.js"

const frameworks = [
  { value: "astro", label: "Astro" },
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
]

const meta = {
  parameters: { renderer: 'react' },
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-h-[360px] bg-[var(--color-paper)] p-[40px]">
        <div className="w-full max-w-[360px]">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Framework">
        <SelectValue placeholder="Select a framework..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Frameworks</SelectLabel>
          {frameworks.map((framework) => (
            <SelectItem key={framework.value} value={framework.value}>
              {framework.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const WithGroups: Story = {
  render: () => (
    <Select defaultValue="editor">
      <SelectTrigger aria-label="Workspace role">
        <SelectValue placeholder="Select a role..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Project roles</SelectLabel>
          <SelectItem value="viewer">Viewer</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="admin">Administrator</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Special access</SelectLabel>
          <SelectItem value="guest">Guest</SelectItem>
          <SelectItem value="owner" disabled>
            Owner — unavailable
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger aria-label="Disabled framework select">
        <SelectValue placeholder="Select a framework..." />
      </SelectTrigger>
      <SelectContent>
        {frameworks.map((framework) => (
          <SelectItem key={framework.value} value={framework.value}>
            {framework.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
}

export const Small: Story = {
  render: () => (
    <Select defaultValue="astro">
      <SelectTrigger size="sm" aria-label="Framework"><SelectValue /></SelectTrigger>
      <SelectContent>{frameworks.map((framework) => <SelectItem key={framework.value} value={framework.value}>{framework.label}</SelectItem>)}</SelectContent>
    </Select>
  ),
}

import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group.js"

const meta = {
  parameters: { renderer: 'react' },
  title: "UI/Input Group",
  component: InputGroup,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-full max-w-[520px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Website address" placeholder="your-studio" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const Search: Story = {
  render: () => (
    <InputGroup className="shadow-[var(--shadow-palette)]">
      <InputGroupAddon>
        <InputGroupText aria-hidden="true">⌕</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Search archive" placeholder="Search the archive" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton aria-label="Clear search" size="icon-xs">
          ×
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const WithAction: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText aria-hidden="true">@</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Username" placeholder="username" />
      <InputGroupAddon align="inline-end" className="p-[4px]">
        <InputGroupButton className="bg-[var(--color-ink)] text-[var(--color-dark-text)]">
          Check
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const Amount: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>£</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        aria-label="Amount"
        inputMode="decimal"
        placeholder="0.00"
        className="font-sans"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText>GBP</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const TextareaWithCounter: Story = {
  render: () => (
    <InputGroup>
      <InputGroupTextarea
        aria-label="Project note"
        maxLength={280}
        placeholder="Write a project note…"
        className="pb-[36px]"
      />
      <InputGroupAddon
        align="block-end"
        className="justify-between bg-[var(--color-surface)]"
      >
        <InputGroupText>Plain text</InputGroupText>
        <InputGroupText className="font-sans">0 / 280</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const Invalid: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText aria-hidden="true">!</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        aria-label="Email address"
        aria-invalid="true"
        defaultValue="not-an-email"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText>Invalid email</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon data-disabled="true">
        <InputGroupText aria-hidden="true">#</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput disabled placeholder="Reference unavailable" />
      <InputGroupAddon align="inline-end" data-disabled="true">
        <InputGroupButton disabled>Copy</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

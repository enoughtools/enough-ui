import type { Meta, StoryObj } from "@storybook/react-vite"
import { directionIconClass, directionChevronPaths } from "../../lib/direction-icons.js"

import { Button } from "./button.js"
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./button-group.js"

const meta = {
  parameters: { renderer: 'react' },
  title: "UI/Button Group",
  component: ButtonGroup,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
  args: {
    orientation: "horizontal",
  },
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">Previous</Button>
      <Button variant="outline">Current</Button>
      <Button variant="outline">Next</Button>
    </ButtonGroup>
  ),
}

export const PrimaryActions: Story = {
  render: (args) => (
    <ButtonGroup {...args} className="shadow-[var(--shadow-palette)]">
      <Button variant="ink">Save draft</Button>
      <Button variant="accent">Publish</Button>
    </ButtonGroup>
  ),
}

export const WithText: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupText>Zoom</ButtonGroupText>
      <Button variant="outline" size="sm" aria-label="Zoom out">
        −
      </Button>
      <ButtonGroupText className="min-w-[64px]">100%</ButtonGroupText>
      <Button variant="outline" size="sm" aria-label="Zoom in">
        +
      </Button>
    </ButtonGroup>
  ),
}

export const SplitAction: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="ink">Run task</Button>
      <ButtonGroupSeparator />
      <Button variant="ink" className="px-[13px]" aria-label="More run options">
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={directionIconClass}><path d={directionChevronPaths.down} /></svg>
      </Button>
    </ButtonGroup>
  ),
}

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline" className="justify-start">
        Cut
      </Button>
      <Button variant="outline" className="justify-start">
        Copy
      </Button>
      <Button variant="outline" className="justify-start">
        Paste
      </Button>
    </ButtonGroup>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">Back</Button>
      <Button variant="outline" disabled>
        Forward
      </Button>
      <Button variant="outline">Reload</Button>
    </ButtonGroup>
  ),
}

import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Alert, AlertTitle, AlertDescription, AlertAction } from "./alert.js"
import { Button } from "./button.js"
import { expect, userEvent, within } from "storybook/test"

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  parameters: { renderer: "react" },
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "success", "warning", "info"],
    },
  },
}

export default meta
type Story = StoryObj<typeof Alert>

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Notification</AlertTitle>
      <AlertDescription>
        This is a standard alert notification.
      </AlertDescription>
    </Alert>
  ),
}

export const WithIcon: Story = {
  render: (args) => (
    <Alert {...args}>
      <span data-icon className="text-lg leading-none mt-0.5">ⓘ</span>
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This alert contains a unicode icon.
      </AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  render: (args) => (
    <Alert {...args}>
      <span data-icon className="text-lg leading-none mt-0.5">✕</span>
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
}

export const Success: Story = {
  args: {
    variant: "success",
  },
  render: (args) => (
    <Alert {...args}>
      <span data-icon className="text-lg leading-none mt-0.5">✓</span>
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
}

export const Warning: Story = {
  args: {
    variant: "warning",
  },
  render: (args) => (
    <Alert {...args}>
      <span data-icon className="text-lg leading-none mt-0.5">⚠</span>
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Please make sure you back up your data.
      </AlertDescription>
    </Alert>
  ),
}

export const WithAction: Story = {
  render: function ActionAlert(args) {
    const [visible, setVisible] = React.useState(true)
    return visible ? (
      <Alert {...args}>
        <AlertTitle>Project saved</AlertTitle>
        <AlertDescription>Your latest changes are ready to share.</AlertDescription>
        <AlertAction>
          <Button variant="ghost" size="icon-sm" aria-label="Dismiss notification" onClick={() => setVisible(false)}>×</Button>
        </AlertAction>
      </Alert>
    ) : <p role="status">Notification dismissed.</p>
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss notification" }))
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
    await expect(canvas.getByRole("status")).toHaveTextContent("Notification dismissed.")
  },
}

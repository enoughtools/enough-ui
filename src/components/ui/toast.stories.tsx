import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button.js"
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast.js"

const meta = {
  title: "UI/Toast",
  component: Toast,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <ToastProvider swipeDirection="right">
        <div className="min-h-[320px] w-[min(680px,calc(100vw-2rem))] border border-[var(--color-ink)] bg-[var(--color-paper)] p-8 shadow-[var(--shadow-card)] rounded-none">
          <Story />
        </div>
        <ToastViewport />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

type ToastDemoProps = {
  variant?: "default" | "destructive"
  title: string
  description: string
  action?: boolean
}

function ToastDemo({
  variant = "default",
  title,
  description,
  action = false,
}: ToastDemoProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Show toast</Button>
      <Toast
        open={open}
        onOpenChange={setOpen}
        variant={variant}
        duration={5000}
      >
        <div className="grid gap-1">
          <ToastTitle>{title}</ToastTitle>
          <ToastDescription>{description}</ToastDescription>
        </div>
        {action ? <ToastAction altText="Undo the latest action">Undo</ToastAction> : null}
        <ToastClose />
      </Toast>
    </>
  )
}

export const Default: Story = {
  render: () => (
    <ToastDemo
      title="Draft saved"
      description="Your changes are ready for review."
    />
  ),
}

export const WithAction: Story = {
  render: () => (
    <ToastDemo
      title="Item archived"
      description="The item was moved out of your workspace."
      action
    />
  ),
}

export const Destructive: Story = {
  render: () => (
    <ToastDemo
      variant="destructive"
      title="Could not publish"
      description="Check your connection and try again."
      action
    />
  ),
}

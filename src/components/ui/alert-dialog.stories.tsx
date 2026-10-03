import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog.js"
import { Button } from "./button.js"
import { expect, userEvent, waitFor, within } from "storybook/test"

const meta = {
  title: "UI/AlertDialog",
  component: AlertDialog,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger className="inline-flex h-10 items-center justify-center bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-[var(--color-surface)] transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 rounded-none border border-[var(--color-ink)] shadow-[var(--shadow-card)]">
        Show Dialog
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

export const SmallWithMedia: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="outline">Delete draft</Button></AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia aria-hidden="true">×</AlertDialogMedia>
          <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
          <AlertDialogDescription>You can start a new draft after deleting this one.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm">Keep draft</AlertDialogCancel>
          <AlertDialogAction variant="destructive" size="sm">Delete draft</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole("button", { name: "Delete draft" })
    await userEvent.click(trigger)
    const dialog = await page.findByRole("alertdialog", { name: "Delete this draft?" })
    const cancel = within(dialog).getByRole("button", { name: "Keep draft" })
    await expect(cancel).toHaveFocus()
    await userEvent.click(cancel)
    await waitFor(() => expect(page.queryByRole("alertdialog")).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
  },
}

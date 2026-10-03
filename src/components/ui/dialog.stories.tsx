import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "./button.js"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "./dialog.js"
import { Input } from "./input.js"
import { Label } from "./label.js"

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: { renderer: "react", layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild><Button>Edit project</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>Update the name shown in your workspace.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="dialog-project-name">Project name</Label>
          <Input id="dialog-project-name" defaultValue="Signal archive" />
        </div>
        <DialogFooter showCloseButton>
          <DialogClose asChild><Button>Save changes</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const FooterClose: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline">Project details</Button></DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Project details</DialogTitle>
          <DialogDescription>This dialog uses a footer close action.</DialogDescription>
        </DialogHeader>
        <p className="text-sm">Keyboard users can also press Escape to return to the project.</p>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
}

export const LongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline">Read workspace policy</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workspace policy</DialogTitle>
          <DialogDescription>Review the shared practices for this workspace.</DialogDescription>
        </DialogHeader>
        {Array.from({ length: 12 }, (_, index) => <p key={index} className="text-sm">Keep project notes clear and current so every teammate can understand a decision and its next step.</p>)}
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
}

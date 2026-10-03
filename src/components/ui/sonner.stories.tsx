import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button.js"
import { Toaster, toast } from "./sonner.js"

function SonnerDemo({ types = false }: { types?: boolean }) {
  const [undone, setUndone] = React.useState(false)
  return (
    <div className="grid gap-4">
      <div className="flex max-w-lg flex-wrap gap-3">
        <Button onClick={() => toast("Project archived", { description: "The project is still available in your archive.", action: { label: "Undo", onClick: () => setUndone(true) } })}>Show notification</Button>
        {types && <>
          <Button variant="outline" onClick={() => toast.success("Changes saved")}>Success</Button>
          <Button variant="outline" onClick={() => toast.info("A new update is available")}>Info</Button>
          <Button variant="outline" onClick={() => toast.warning("Your session expires soon")}>Warning</Button>
          <Button variant="outline" onClick={() => toast.error("Could not publish", { description: "Check your connection and try again." })}>Error</Button>
          <Button variant="outline" onClick={() => toast.promise(new Promise<string>((resolve) => setTimeout(() => resolve("Report ready"), 1500)), { loading: "Preparing your report…", success: (result) => result, error: "Could not prepare the report." })}>Promise</Button>
        </>}
      </div>
      <p role="status" className="text-sm text-[var(--color-text-3)]">{undone ? "The project has been restored." : ""}</p>
      <Toaster closeButton position="bottom-right" />
    </div>
  )
}

const meta = {
  title: "UI/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  parameters: { renderer: "react", layout: "centered" },
} satisfies Meta<typeof Toaster>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <SonnerDemo /> }
export const Types: Story = { render: () => <SonnerDemo types /> }
export const PersistentPreview: Story = {
  render: () => {
    React.useEffect(() => {
      const id = toast("Preferences saved", { description: "Your workspace is ready for your next visit.", duration: Infinity })
      return () => { toast.dismiss(id) }
    }, [])
    return <div className="min-h-64 w-[min(24rem,calc(100vw-2rem))]"><Toaster closeButton position="bottom-center" /></div>
  },
}

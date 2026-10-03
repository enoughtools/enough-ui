import * as React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  Sidebar, SidebarProvider, SidebarContent, SidebarInset, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton, SidebarTrigger, useSidebar,
} from "../../src/components/ui/sidebar.js"
import {
  Drawer, DrawerContent, DrawerClose, DrawerTitle, DrawerDescription, DrawerTrigger,
} from "../../src/components/ui/drawer.js"

function viewport(mobile: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: mobile && query.includes("767px"), media: query, onchange: null,
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
    dispatchEvent: () => false,
  }))
}

function SidebarState() {
  const { open, openMobile, expanded } = useSidebar()
  return <output aria-label="Sidebar state">{`${open}/${openMobile}/${expanded}`}</output>
}

function Navigation(props: React.ComponentProps<typeof SidebarProvider>) {
  return <SidebarProvider persistState={false} {...props}>
    <Sidebar collapsible="icon"><SidebarContent><SidebarMenu><SidebarMenuItem>
      <SidebarMenuButton asChild tooltip="Overview"><a href="#overview"><svg aria-hidden="true" /><span>Overview</span></a></SidebarMenuButton>
    </SidebarMenuItem></SidebarMenu></SidebarContent></Sidebar>
    <SidebarInset><SidebarTrigger /><input aria-label="Search" /><SidebarState /></SidebarInset>
  </SidebarProvider>
}

beforeEach(() => viewport(false))

describe("Sidebar", () => {
  it("keeps collapsed navigation accessible and toggles desktop state", async () => {
    const user = userEvent.setup()
    render(<Navigation defaultOpen={false} />)
    const trigger = screen.getByRole("button", { name: "Toggle Sidebar" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "#overview")
    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByLabelText("Sidebar state")).toHaveTextContent("true/false/true")
  })

  it("calls controlled change handlers without overriding the owner's state", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = render(<Navigation open onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "true")
    rerender(<Navigation open={false} onOpenChange={onOpenChange} />)
    expect(screen.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "false")
  })

  it("supports the original expanded API", async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    render(<Navigation expanded={false} onExpandedChange={onExpandedChange} />)
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }))
    expect(onExpandedChange).toHaveBeenCalledWith(true)
    expect(screen.getByLabelText("Sidebar state")).toHaveTextContent("false/false/false")
  })

  it("supports the desktop shortcut while preserving shortcuts inside text controls", () => {
    render(<Navigation />)
    fireEvent.keyDown(window, { key: "b", ctrlKey: true })
    expect(screen.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "false")
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Search" }), { key: "b", metaKey: true })
    expect(screen.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "false")
    fireEvent.keyDown(window, { key: "B", metaKey: true })
    expect(screen.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "true")
  })

  it("opens an accessible mobile dialog independently of desktop state and closes with Escape", async () => {
    viewport(true)
    const user = userEvent.setup()
    render(<Navigation defaultOpen={false} dir="rtl" />)
    const trigger = screen.getByRole("button", { name: "Toggle Sidebar" })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await user.click(trigger)
    const dialog = await screen.findByRole("dialog", { name: "Sidebar" })
    expect(dialog).toHaveAccessibleDescription("Navigate the application using the mobile sidebar.")
    expect(dialog).toHaveAttribute("dir", "rtl")
    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument()
    expect(screen.getByLabelText("Sidebar state")).toHaveTextContent("false/true/false")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(trigger).toHaveFocus()
    expect(screen.getByLabelText("Sidebar state")).toHaveTextContent("false/false/false")
  })

  it("persists desktop state only when requested", async () => {
    const user = userEvent.setup()
    const cookieSetter = vi.spyOn(document, "cookie", "set")
    const { rerender } = render(<Navigation />)
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }))
    expect(cookieSetter).not.toHaveBeenCalled()
    rerender(<Navigation persistState cookieName="workspace_sidebar" cookieMaxAge={3600} />)
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }))
    expect(cookieSetter).toHaveBeenCalledWith("workspace_sidebar=true; path=/; max-age=3600; samesite=lax")
  })
})

function DrawerExample(props: React.ComponentProps<typeof Drawer>) {
  return <Drawer {...props}>
    <DrawerTrigger>Open details</DrawerTrigger>
    <DrawerContent><DrawerTitle>Project details</DrawerTitle><DrawerDescription>Review your project.</DrawerDescription><DrawerClose>Done</DrawerClose></DrawerContent>
  </Drawer>
}

describe("Drawer", () => {
  it("opens, exposes its title and description, and closes through the primitive", async () => {
    const user = userEvent.setup()
    render(<DrawerExample />)
    await user.click(screen.getByRole("button", { name: "Open details" }))
    const dialog = await screen.findByRole("dialog", { name: "Project details" })
    expect(dialog).toHaveAccessibleDescription("Review your project.")
    expect(dialog).toHaveAttribute("data-vaul-drawer-direction", "bottom")
    screen.getByRole("button", { name: "Done" }).focus()
    await user.keyboard("{Enter}")
    expect(dialog).toHaveAttribute("data-state", "closed")
    // happy-dom does not run Vaul's CSS exit animation.
    fireEvent.animationEnd(dialog, { animationName: "slideToBottom" })
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it.each(["left", "right", "top", "bottom"] as const)("hands %s placement to the gesture primitive", async (direction) => {
    const user = userEvent.setup()
    render(<DrawerExample direction={direction} />)
    await user.click(screen.getByRole("button", { name: "Open details" }))
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-vaul-drawer-direction", direction)
  })

  it("retains the legacy content side while using the same gesture direction", async () => {
    const user = userEvent.setup()
    render(<Drawer><DrawerTrigger>Open legacy drawer</DrawerTrigger><DrawerContent side="left"><DrawerTitle>Legacy navigation</DrawerTitle><DrawerDescription>Choose a section.</DrawerDescription></DrawerContent></Drawer>)
    await user.click(screen.getByRole("button", { name: "Open legacy drawer" }))
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-vaul-drawer-direction", "left")
  })

  it("honors controlled open state and non-dismissible Escape behavior", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = render(<DrawerExample open dismissible={false} onOpenChange={onOpenChange} />)
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    rerender(<DrawerExample open={false} dismissible={false} onOpenChange={onOpenChange} />)
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAttribute("data-state", "closed")
    fireEvent.animationEnd(dialog, { animationName: "slideToBottom" })
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("preserves controlled snap points for the swipe implementation", async () => {
    const user = userEvent.setup()
    const onSnapChange = vi.fn()
    const { rerender } = render(<DrawerExample snapPoints={[0.5, 0.9]} activeSnapPoint={0.5} setActiveSnapPoint={onSnapChange} />)
    await user.click(screen.getByRole("button", { name: "Open details" }))
    const dialog = await screen.findByRole("dialog")
    expect(dialog).toHaveAttribute("data-vaul-snap-points", "true")
    const initialTransform = dialog.style.transform
    rerender(<DrawerExample snapPoints={[0.5, 0.9]} activeSnapPoint={0.9} setActiveSnapPoint={onSnapChange} />)
    await waitFor(() => expect(dialog.style.transform).not.toBe(initialTransform))
  })
})

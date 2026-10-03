import * as React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../../src/components/ui/sheet.js"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../../src/components/ui/navigation-menu.js"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../src/components/ui/select.js"
import { Switch } from "../../src/components/ui/switch.js"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../src/components/ui/tooltip.js"

describe("Sheet close button compatibility", () => {
  it("forwards refs to the header, body and footer", () => {
    const header = React.createRef<HTMLDivElement>()
    const body = React.createRef<HTMLDivElement>()
    const footer = React.createRef<HTMLDivElement>()
    render(<><SheetHeader ref={header}>Header</SheetHeader><SheetBody ref={body}>Body</SheetBody><SheetFooter ref={footer}>Footer</SheetFooter></>)
    expect(header.current).toBe(screen.getByText("Header"))
    expect(body.current).toBe(screen.getByText("Body"))
    expect(footer.current).toBe(screen.getByText("Footer"))
  })

  it.each([{ showCloseButton: false }, { showClose: false }])("hides the close button and still dismisses with Escape for %j", async (props) => {
    const user = userEvent.setup()
    render(<Sheet><SheetTrigger>Open preferences</SheetTrigger><SheetContent {...props}><SheetTitle>Preferences</SheetTitle><SheetDescription>Update your settings.</SheetDescription></SheetContent></Sheet>)
    const trigger = screen.getByRole("button", { name: "Open preferences" })
    await user.click(trigger)
    expect(screen.getByRole("dialog", { name: "Preferences" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("uses the current showCloseButton prop when both options are supplied", async () => {
    const user = userEvent.setup()
    render(<Sheet defaultOpen><SheetContent showClose={false} showCloseButton><SheetTitle>Preferences</SheetTitle><SheetDescription>Update your settings.</SheetDescription></SheetContent></Sheet>)
    await user.click(screen.getByRole("button", { name: "Close" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })
})

describe("Navigation menu viewport", () => {
  it.each([true, false])("opens linked content and supports Escape with viewport=%s", async (viewport) => {
    const user = userEvent.setup()
    const { container } = render(<NavigationMenu viewport={viewport} delayDuration={0}><NavigationMenuList><NavigationMenuItem value="products"><NavigationMenuTrigger>Products</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="/analytics">Analytics</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>)
    const trigger = screen.getByRole("button", { name: "Products" })
    await user.tab()
    await user.keyboard("{Enter}{ArrowDown}")
    expect(await screen.findByRole("link", { name: "Analytics" })).toHaveAttribute("href", "/analytics")
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    if (!viewport) expect(container.querySelector('[data-slot="navigation-menu-viewport"]')).toBeNull()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"))
  })
})

describe("Small controls", () => {
  it.each(["default", "sm"] as const)("selects an option by keyboard with size=%s", async (size) => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select onValueChange={onChange}><SelectTrigger size={size} aria-label="Framework"><SelectValue placeholder="Choose framework" /></SelectTrigger><SelectContent><SelectItem value="astro">Astro</SelectItem><SelectItem value="react">React</SelectItem><SelectItem value="disabled" disabled>Unavailable</SelectItem></SelectContent></Select>)
    const trigger = screen.getByRole("combobox", { name: "Framework" })
    await user.tab()
    expect(trigger).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(await screen.findByRole("option", { name: "Astro" })).toBeInTheDocument()
    await user.keyboard("{ArrowDown}{Enter}")
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("react"))
    expect(trigger).toHaveTextContent("React")
    expect(trigger).toHaveFocus()
  })

  it.each(["default", "sm"] as const)("toggles and submits its named value with size=%s", async (size) => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<form><Switch size={size} name="notifications" aria-label="Enable notifications" onCheckedChange={onChange} /><Switch size={size} disabled aria-label="Disabled setting" /></form>)
    const control = screen.getByRole("switch", { name: "Enable notifications" })
    await user.tab()
    await user.keyboard(" ")
    expect(control).toBeChecked()
    expect(onChange).toHaveBeenCalledWith(true)
    expect(new FormData(container.querySelector("form")!).get("notifications")).toBe("on")
    await user.keyboard(" ")
    expect(control).not.toBeChecked()
    expect(new FormData(container.querySelector("form")!).has("notifications")).toBe(false)
    const disabled = screen.getByRole("switch", { name: "Disabled setting" })
    await user.click(disabled)
    expect(disabled).not.toBeChecked()
  })
})

describe("Tooltip", () => {
  it("portals outside an overflow container and associates its keyboard-focused trigger", async () => {
    const user = userEvent.setup()
    const { container } = render(<div style={{ overflow: "hidden" }}><TooltipProvider><Tooltip><TooltipTrigger>Publish</TooltipTrigger><TooltipContent>Share the current draft.</TooltipContent></Tooltip></TooltipProvider></div>)
    await user.tab()
    const tooltip = await screen.findByRole("tooltip")
    const trigger = screen.getByRole("button", { name: "Publish" })
    expect(tooltip).toHaveTextContent("Share the current draft.")
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id)
    expect(container.contains(tooltip)).toBe(false)
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument())
  })

  it("opens pointer tooltips immediately by default and respects explicit delays", async () => {
    vi.useFakeTimers()
    try {
      const { unmount } = render(<TooltipProvider><Tooltip><TooltipTrigger>Immediate</TooltipTrigger><TooltipContent>Available now</TooltipContent></Tooltip></TooltipProvider>)
      fireEvent.pointerMove(screen.getByRole("button", { name: "Immediate" }), { pointerType: "mouse" })
      act(() => { vi.advanceTimersByTime(0) })
      expect(screen.getByRole("tooltip")).toHaveTextContent("Available now")
      unmount()
      render(<TooltipProvider delayDuration={500}><Tooltip><TooltipTrigger>Delayed</TooltipTrigger><TooltipContent>Available later</TooltipContent></Tooltip></TooltipProvider>)
      fireEvent.pointerMove(screen.getByRole("button", { name: "Delayed" }), { pointerType: "mouse" })
      act(() => { vi.advanceTimersByTime(499) })
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
      act(() => { vi.advanceTimersByTime(1) })
      expect(screen.getByRole("tooltip")).toHaveTextContent("Available later")
    } finally {
      vi.useRealTimers()
    }
  })
})

import * as React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Slider } from "../../src/components/ui/slider.js"
import { ScrollArea } from "../../src/components/ui/scroll-area.js"
import { Checkbox } from "../../src/components/ui/checkbox.js"
import { RadioGroup, RadioGroupItem } from "../../src/components/ui/radio-group.js"

describe("Slider accessibility", () => {
  it("names the keyboard control and updates uncontrolled values", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = render(<Slider aria-label="Intensity" defaultValue={[50]} step={5} onValueChange={onValueChange} />)
    const slider = screen.getByRole("slider", { name: "Intensity" })
    expect(container.querySelector('[data-slot="slider"]')).not.toHaveAttribute("aria-label")
    slider.focus()
    await user.keyboard("{ArrowRight}")
    expect(slider).toHaveAttribute("aria-valuenow", "55")
    expect(onValueChange).toHaveBeenLastCalledWith([55])
    await user.keyboard("{Home}")
    expect(slider).toHaveAttribute("aria-valuenow", "0")
  })

  it("forwards label references, instructions, and errors to its actual control", () => {
    render(<><span id="volume-label">Volume</span><p id="volume-hint">Choose a comfortable level.</p><p id="volume-error">Choose a lower volume.</p><Slider defaultValue={[60]} aria-labelledby="volume-label" aria-describedby="volume-hint" aria-invalid aria-errormessage="volume-error" /></>)
    const slider = screen.getByRole("slider", { name: "Volume" })
    expect(slider).toHaveAccessibleDescription("Choose a comfortable level.")
    expect(slider).toHaveAttribute("aria-invalid", "true")
    expect(slider).toHaveAttribute("aria-errormessage", "volume-error")
  })

  it("distinguishes range endpoints and preserves their values and focus refs", () => {
    const maximumRef = React.createRef<HTMLSpanElement>()
    render(<><span id="price-label">Price</span><Slider aria-labelledby="price-label" defaultValue={[20, 80]} thumbLabels={["Minimum price", "Maximum price"]} thumbProps={[{}, { ref: maximumRef, "aria-valuetext": "$80" }]} /></>)
    const minimum = screen.getByRole("slider", { name: "Minimum price" })
    const maximum = screen.getByRole("slider", { name: "Maximum price" })
    expect(minimum).toHaveAttribute("aria-valuenow", "20")
    expect(maximum).toHaveAttribute("aria-valuenow", "80")
    expect(maximum).toHaveAttribute("aria-valuetext", "$80")
    expect(maximum).not.toHaveAttribute("aria-labelledby")
    expect(maximumRef.current).toBe(maximum)
    maximumRef.current?.focus()
    expect(maximum).toHaveFocus()
  })

  it("refreshes per-handle value text when an uncontrolled slider changes", async () => {
    const user = userEvent.setup()
    render(<Slider defaultValue={[25]} aria-label="Price" thumbProps={(_, value) => ({ "aria-valuetext": `$${value}` })} />)
    const slider = screen.getByRole("slider", { name: "Price" })
    expect(slider).toHaveAttribute("aria-valuetext", "$25")
    slider.focus()
    await user.keyboard("{ArrowRight}")
    expect(slider).toHaveAttribute("aria-valuetext", "$26")
  })

  it("honors an explicit thumb name instead of an inherited label reference", () => {
    render(<><span id="shared-name">Shared label</span><Slider aria-labelledby="shared-name" defaultValue={[40]} thumbProps={[{ "aria-label": "Custom handle" }]} /></>)
    const slider = screen.getByRole("slider", { name: "Custom handle" })
    expect(slider).not.toHaveAttribute("aria-labelledby")
  })
})

describe("ScrollArea accessibility", () => {
  it("provides a named focusable scrolling viewport and keeps the root ref", async () => {
    const user = userEvent.setup()
    const rootRef = React.createRef<HTMLDivElement>()
    const viewportRef = React.createRef<HTMLDivElement>()
    render(<ScrollArea ref={rootRef} aria-label="Release notes" viewportProps={{ ref: viewportRef }}>Updates</ScrollArea>)
    const viewport = screen.getByRole("region", { name: "Release notes" })
    expect(viewportRef.current).toBe(viewport)
    expect(rootRef.current).not.toBe(viewport)
    expect(rootRef.current).not.toHaveAttribute("aria-label")
    await user.tab()
    expect(viewport).toHaveFocus()
  })

  it("supports viewport names, descriptions, scroll handlers, and tab order overrides", () => {
    const onScroll = vi.fn()
    render(<><span id="root-name">Root name</span><p id="viewport-help">Use the arrow keys to browse.</p><ScrollArea aria-labelledby="root-name" viewportProps={{ "aria-label": "History", "aria-describedby": "viewport-help", tabIndex: -1, onScroll, className: "custom-viewport" }}>History entries</ScrollArea></>)
    const viewport = screen.getByRole("region", { name: "History" })
    expect(viewport).not.toHaveAttribute("aria-labelledby")
    expect(viewport).toHaveAccessibleDescription("Use the arrow keys to browse.")
    expect(viewport).toHaveAttribute("tabindex", "-1")
    expect(viewport).toHaveClass("custom-viewport")
    fireEvent.scroll(viewport)
    expect(onScroll).toHaveBeenCalledOnce()
  })

  it("does not create an unnamed region when callers omit a label", () => {
    const { container } = render(<ScrollArea>Content</ScrollArea>)
    expect(screen.queryByRole("region")).not.toBeInTheDocument()
    expect(container.querySelector('[data-slot="scroll-area-viewport"]')).toHaveAttribute("tabindex", "0")
  })
})

describe("Selection controls accessibility", () => {
  it("toggles a labelled checkbox with Space and exposes its indicator slot", async () => {
    const user = userEvent.setup()
    render(<><Checkbox id="updates" /><label htmlFor="updates">Receive updates</label></>)
    const checkbox = screen.getByRole("checkbox", { name: "Receive updates" })
    expect(checkbox).toHaveAttribute("data-slot", "checkbox")
    checkbox.focus()
    await user.keyboard(" ")
    expect(checkbox).toBeChecked()
    expect(checkbox.querySelector('[data-slot="checkbox-indicator"]')).toBeInTheDocument()
  })

  it("announces indeterminate selection", () => {
    render(<Checkbox aria-label="Select all items" checked="indeterminate" />)
    expect(screen.getByRole("checkbox", { name: "Select all items" })).toHaveAttribute("aria-checked", "mixed")
  })

  it("keeps disabled checkboxes unchanged", async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Unavailable selection" disabled onCheckedChange={onCheckedChange} />)
    await user.click(screen.getByRole("checkbox", { name: "Unavailable selection" }))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it("moves radio selection by arrow keys while skipping disabled choices", async () => {
    const user = userEvent.setup()
    const { container } = render(<RadioGroup aria-label="Density" defaultValue="compact"><RadioGroupItem value="compact" aria-label="Compact" /><RadioGroupItem value="comfortable" aria-label="Comfortable" disabled /><RadioGroupItem value="spacious" aria-label="Spacious" /></RadioGroup>)
    expect(screen.getByRole("radiogroup", { name: "Density" })).toHaveAttribute("data-slot", "radio-group")
    const compact = screen.getByRole("radio", { name: "Compact" })
    const spacious = screen.getByRole("radio", { name: "Spacious" })
    compact.focus()
    await user.keyboard("{ArrowDown>}")
    await waitFor(() => expect(spacious).toBeChecked())
    await user.keyboard("{/ArrowDown}")
    expect(spacious).toHaveFocus()
    expect(container.querySelector('[data-slot="radio-group-indicator"]')).toBeInTheDocument()
    expect(spacious).toHaveAttribute("data-slot", "radio-group-item")
  })
})

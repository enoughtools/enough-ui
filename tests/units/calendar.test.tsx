import * as React from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToStaticMarkup } from "react-dom/server"
import { es } from "react-day-picker/locale"
import type { DateRange } from "react-day-picker"

import { Calendar } from "../../src/components/ui/calendar.js"
import { DatePicker } from "../../src/components/ui/date-picker.js"

const month = new Date(2026, 9, 1)
const today = new Date(2026, 9, 3)
const october = (day: number) => new Date(2026, 9, day)
const fixedCalendar = { defaultMonth: month, today }

function dayButton(day: number) {
  const button = document.querySelector<HTMLButtonElement>(`[data-slot="calendar-day-button"][data-day="10/${day}/2026"]`)
  if (!button) throw new Error(`Missing calendar day ${day}`)
  return button
}

describe("Calendar", () => {
  it("selects dates internally and prevents disabled-date selection", async () => {
    const user = userEvent.setup()
    render(<Calendar mode="single" {...fixedCalendar} disabled={october(14)} />)
    await user.click(dayButton(12))
    expect(dayButton(12)).toHaveAttribute("data-selected-single", "true")
    expect(dayButton(14)).toBeDisabled()
    await user.click(dayButton(14))
    expect(dayButton(12)).toHaveAttribute("data-selected-single", "true")
    await user.click(dayButton(12))
    expect(dayButton(12)).toHaveAttribute("data-selected-single", "false")
  })

  it("keeps the controlled selection until the parent changes it", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const result = render(<Calendar mode="single" selected={october(12)} onSelect={onSelect} {...fixedCalendar} />)
    await user.click(dayButton(13))
    expect(onSelect.mock.calls[0][0]).toEqual(october(13))
    expect(dayButton(12)).toHaveAttribute("data-selected-single", "true")
    result.rerender(<Calendar mode="single" selected={october(13)} onSelect={onSelect} {...fixedCalendar} />)
    expect(dayButton(13)).toHaveAttribute("data-selected-single", "true")
  })

  it("respects maximum multiple selection and preserves required dates", async () => {
    const user = userEvent.setup()
    function Multiple() {
      const [selected, setSelected] = React.useState<Date[]>([october(12)])
      return <Calendar mode="multiple" selected={selected} onSelect={setSelected} required min={1} max={2} {...fixedCalendar} />
    }
    render(<Multiple />)
    await user.click(dayButton(13))
    expect(document.querySelectorAll('[data-selected-single="true"]')).toHaveLength(2)
    // DayPicker resets to the new date when a selection reaches its maximum.
    await user.click(dayButton(14))
    expect(document.querySelectorAll('[data-selected-single="true"]')).toHaveLength(1)
    expect(dayButton(14)).toHaveAttribute("data-selected-single", "true")
    await user.click(dayButton(14))
    expect(dayButton(14)).toHaveAttribute("data-selected-single", "true")
  })

  it("marks range boundaries and resets a range crossing an excluded day", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    function Range() {
      const [selected, setSelected] = React.useState<DateRange | undefined>()
      return <Calendar mode="range" selected={selected} onSelect={(value) => { setSelected(value); onSelect(value) }} disabled={october(14)} excludeDisabled {...fixedCalendar} />
    }
    render(<Range />)
    await user.click(dayButton(12))
    await user.click(dayButton(13))
    expect(dayButton(12)).toHaveAttribute("data-range-start", "true")
    expect(dayButton(13)).toHaveAttribute("data-range-end", "true")
    await user.click(dayButton(12))
    await user.click(dayButton(16))
    expect(onSelect.mock.lastCall?.[0]).toEqual({ from: october(16), to: undefined })
  })

  it("moves focus by keyboard and navigates labelled months", async () => {
    const user = userEvent.setup()
    render(<Calendar mode="single" selected={october(12)} {...fixedCalendar} />)
    dayButton(12).focus()
    await user.keyboard("{ArrowRight}")
    expect(dayButton(13)).toHaveFocus()
    await user.click(screen.getByRole("button", { name: /next month/i }))
    expect(document.querySelector(".rdp-caption_label")).toHaveTextContent("November 2026")
    await user.click(screen.getByRole("button", { name: /previous month/i }))
    expect(document.querySelector(".rdp-caption_label")).toHaveTextContent("October 2026")
  })

  it("uses locale labels and accessible month/year controls", () => {
    render(<Calendar mode="single" locale={es} captionLayout="dropdown" startMonth={new Date(2020, 0)} endMonth={new Date(2030, 11)} {...fixedCalendar} />)
    expect(screen.getAllByRole("combobox")).toHaveLength(2)
    expect(screen.getAllByRole("combobox").every((select) => Boolean(select.getAttribute("aria-label")))).toBe(true)
    expect(document.querySelector(".rdp-months")).toHaveTextContent("oct")
  })

  it("renders deterministic initial markup and non-submitting day buttons", () => {
    const markup = renderToStaticMarkup(<Calendar mode="single" selected={october(12)} {...fixedCalendar} />)
    expect(markup).toContain("October 2026")
    expect(markup).toContain('data-day="10/12/2026"')
    expect(markup).toContain('data-selected-single="true"')
    const document = new DOMParser().parseFromString(markup, "text/html")
    expect(Array.from(document.querySelectorAll('[data-slot="calendar-day-button"]')).every((button) => button.getAttribute("type") === "button")).toBe(true)
  })
})

describe("DatePicker", () => {
  it("opens an accessible calendar, selects a date and restores trigger focus", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = render(<DatePicker label="Appointment date" name="appointment" onValueChange={onValueChange} calendarProps={fixedCalendar} />)
    const trigger = screen.getByRole("button", { name: "Appointment date: Pick a date" })
    await user.click(trigger)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await user.click(dayButton(12))
    expect(onValueChange).toHaveBeenCalledWith(october(12))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(trigger).toHaveAccessibleName("Appointment date: October 12th, 2026")
    expect(trigger).toHaveFocus()
    expect(container.querySelector('input[name="appointment"]')).toHaveValue("2026-10-12")
  })

  it("supports a controlled empty date without silently storing changes", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DatePicker label="Departure" value={undefined} onValueChange={onValueChange} calendarProps={fixedCalendar} />)
    await user.click(screen.getByRole("button", { name: "Departure: Pick a date" }))
    await user.click(dayButton(12))
    expect(onValueChange).toHaveBeenCalledWith(october(12))
    expect(screen.getByRole("button", { name: "Departure: Pick a date" })).toBeInTheDocument()
  })

  it("holds the popup open for a partial range and closes after completion", async () => {
    const user = userEvent.setup()
    const { container } = render(<DatePicker mode="range" label="Travel dates" name="travel" closeOnSelect calendarProps={{ ...fixedCalendar, min: 1 }} />)
    await user.click(screen.getByRole("button", { name: "Travel dates: Pick a date range" }))
    await user.click(dayButton(12))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await user.click(dayButton(16))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(container.querySelector('input[name="travel.from"]')).toHaveValue("2026-10-12")
    expect(container.querySelector('input[name="travel.to"]')).toHaveValue("2026-10-16")
  })

  it("remains disabled and can be dismissed with Escape", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<DatePicker label="Departure" disabled calendarProps={fixedCalendar} />)
    const trigger = screen.getByRole("button", { name: "Departure: Pick a date" })
    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    rerender(<DatePicker label="Departure" calendarProps={fixedCalendar} />)
    await user.click(trigger)
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })
})

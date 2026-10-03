import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { arSA, es } from "react-day-picker/locale"
import type { DateRange } from "react-day-picker"

import { Calendar, type CalendarProps } from "./calendar.js"

const month = new Date(2026, 9, 1)
const today = new Date(2026, 9, 3)

const meta = {
  title: "UI/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    renderer: "react",
    docs: { description: { component: "Full React DayPicker API: single, multiple and range selection, locale, keyboard navigation, disabled dates and month controls. In Astro, mount Calendar as a React island using client:load. For consistent server rendering, pass an explicit defaultMonth, today and locale. EnoughUI's compiled component styles contain the calendar styles; no DayPicker CSS import is needed." } },
  },
  args: { defaultMonth: month, today, className: "border border-[var(--color-ink)]" },
} satisfies Meta<typeof Calendar>

export default meta
// Each scenario owns its selection mode; shared controls edit the appearance and month.
type Story = StoryObj<Omit<CalendarProps, "mode" | "selected" | "onSelect" | "required">>

export const Default: Story = {
  render: (args) => <Calendar {...args} mode="single" />,
}

function ControlledSingle() {
  const [selected, setSelected] = React.useState<Date | undefined>(new Date(2026, 9, 12))
  return <Calendar mode="single" selected={selected} onSelect={setSelected} defaultMonth={month} today={today} className="border border-[var(--color-ink)]" footer={selected ? `Selected: ${selected.toLocaleDateString("en-US")}` : "Choose a date."} />
}

export const Controlled: Story = { render: () => <ControlledSingle /> }

function MultipleDates() {
  const [selected, setSelected] = React.useState<Date[] | undefined>([new Date(2026, 9, 7), new Date(2026, 9, 9)])
  return <Calendar mode="multiple" selected={selected} onSelect={setSelected} max={5} defaultMonth={month} today={today} className="border border-[var(--color-ink)]" footer="Choose up to five dates." />
}

export const Multiple: Story = { render: () => <MultipleDates /> }

function DateRange() {
  const [selected, setSelected] = React.useState<DateRange | undefined>({ from: new Date(2026, 9, 12), to: new Date(2026, 9, 17) })
  return <Calendar mode="range" selected={selected} onSelect={setSelected} numberOfMonths={2} defaultMonth={month} today={today} className="border border-[var(--color-ink)]" footer="Choose a start date and an end date." />
}

export const Range: Story = { render: () => <DateRange /> }

export const DisabledDates: Story = {
  render: (args) => <Calendar {...args} mode="single" disabled={[{ before: today }, { dayOfWeek: [0, 6] }]} footer="Weekends and past dates are unavailable." />,
}

export const MonthAndYear: Story = {
  render: (args) => <Calendar {...args} mode="single" captionLayout="dropdown" startMonth={new Date(2020, 0)} endMonth={new Date(2030, 11)} />,
}

export const Localized: Story = {
  render: (args) => <Calendar {...args} mode="single" locale={es} captionLayout="dropdown" startMonth={new Date(2020, 0)} endMonth={new Date(2030, 11)} />,
}

export const RightToLeft: Story = {
  render: (args) => <Calendar {...args} mode="single" dir="rtl" locale={arSA} />,
}

export const WeekNumbers: Story = {
  render: (args) => <Calendar {...args} mode="single" showWeekNumber weekStartsOn={1} />,
}

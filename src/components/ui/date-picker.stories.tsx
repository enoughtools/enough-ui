import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { addDays, format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "./button.js"
import { Calendar } from "./calendar.js"
import { DatePicker, type SingleDatePickerProps } from "./date-picker.js"
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js"

const month = new Date(2026, 9, 1)
const today = new Date(2026, 9, 3)

const meta = {
  title: "UI/Date Picker",
  component: DatePicker as React.ComponentType<SingleDatePickerProps>,
  tags: ["autodocs"],
  parameters: {
    renderer: "react",
    docs: { description: { component: "DatePicker composes Popover and Calendar, as in shadcn's Date Picker recipe. Use value/onValueChange for controlled selection or defaultValue for internal state. label gives the trigger an accessible name. A single selection closes the popup; range selection stays open until dismissed, or closes on completion with closeOnSelect. Optional name submits local calendar dates in yyyy-MM-dd form (name.from/name.to for ranges). In Astro, hydrate this React island with client:load. Calendar and Popover remain independently composable, as the Composition story demonstrates." } },
  },
  args: { label: "Appointment date", calendarProps: { defaultMonth: month, today } },
  decorators: [(Story) => <div className="min-h-[400px] w-full max-w-[340px] p-2"><Story /></div>],
} satisfies Meta<SingleDatePickerProps>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Open: Story = { args: { defaultOpen: true, defaultValue: new Date(2026, 9, 12) } }

function ControlledDate() {
  const [value, setValue] = React.useState<Date | undefined>()
  return <DatePicker label="Appointment date" value={value} onValueChange={setValue} calendarProps={{ defaultMonth: month, today }} />
}

export const Controlled: Story = { render: () => <ControlledDate /> }

export const Range: Story = {
  render: () => <DatePicker mode="range" label="Travel dates" defaultOpen defaultValue={{ from: new Date(2026, 9, 12), to: new Date(2026, 9, 17) }} closeOnSelect calendarProps={{ defaultMonth: month, today, min: 1, excludeDisabled: true, disabled: { before: today } }} />,
}

export const Localized: Story = { args: { label: "Fecha de la cita", placeholder: "Elige una fecha", locale: es } }

export const Disabled: Story = { args: { disabled: true } }

export const UnavailableDates: Story = {
  args: { defaultOpen: true, calendarProps: { defaultMonth: month, today, disabled: [{ before: today }, { dayOfWeek: [0, 6] }], footer: "Choose a weekday on or after October 3." } },
}

function CompositionDemo() {
  const [selected, setSelected] = React.useState<Date | undefined>()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" aria-label={`Deadline: ${selected ? format(selected, "PPP") : "Pick a date"}`}>
          <CalendarIcon aria-hidden="true" />
          {selected ? format(selected, "PPP") : "Pick a deadline"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-[calc(100vw-1rem)] p-0" align="start">
        <Calendar mode="single" selected={selected} onSelect={setSelected} defaultMonth={month} today={today} autoFocus />
        <div className="flex flex-wrap gap-2 border-t border-[var(--color-hairline)] p-2">
          {[0, 1, 7].map((offset) => (
            <Button key={offset} type="button" variant="outline" size="sm" onClick={() => setSelected(addDays(today, offset))}>
              {offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : "In a week"}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const Composition: Story = { render: () => <CompositionDemo /> }

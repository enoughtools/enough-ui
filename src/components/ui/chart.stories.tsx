import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card.js"
import {
  ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent,
  type ChartConfig,
} from "./chart.js"

const visitors = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 173, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
]

const visitorConfig = {
  desktop: { label: "Desktop", color: "var(--color-accent)" },
  mobile: { label: "Mobile", color: "var(--color-ok)" },
} satisfies ChartConfig

const meta = {
  title: "UI/Chart",
  parameters: { renderer: "react", layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function ChartData() {
  return (
    <details className="mt-4 font-sans text-sm text-text-2">
      <summary className="cursor-pointer rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-accent">View chart data</summary>
      <div className="mt-3 overflow-auto">
        <table className="w-full text-start tabular-nums">
          <caption className="sr-only">Visitors by month and device</caption>
          <thead><tr><th scope="col" className="py-2 text-start">Month</th><th scope="col" className="text-end">Desktop</th><th scope="col" className="text-end">Mobile</th></tr></thead>
          <tbody>{visitors.map((row) => <tr key={row.month} className="border-t border-hairline"><th scope="row" className="py-2 text-start font-normal">{row.month}</th><td className="text-end">{row.desktop}</td><td className="text-end">{row.mobile}</td></tr>)}</tbody>
        </table>
      </div>
    </details>
  )
}

export const Default: Story = {
  render: () => (
    <Card className="w-[min(640px,calc(100vw-48px))]">
      <CardHeader><CardTitle>Visitors by month</CardTitle><CardDescription>Desktop and mobile visits, January–June</CardDescription></CardHeader>
      <CardContent>
        <figure>
          <ChartContainer config={visitorConfig} className="h-72" role="group" aria-label="Monthly visitors by device">
            <BarChart accessibilityLayer data={visitors} margin={{ top: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} width={36} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="mobile" fill="var(--color-mobile)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
          <figcaption className="mt-4 font-sans text-sm text-text-3">February had the most visits across both devices. Desktop visits were higher in five of six months.</figcaption>
          <ChartData />
        </figure>
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole("group", { name: "Monthly visitors by device" })).toBeVisible()
    canvas.getByRole("application").focus()
    await userEvent.keyboard("{ArrowRight}")
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("FebDesktop305Mobile200"))
    await userEvent.click(canvas.getByText("View chart data"))
    expect(canvas.getByRole("table", { name: "Visitors by month and device" })).toBeVisible()
    expect(canvas.getByRole("columnheader", { name: "Desktop" })).toBeVisible()
  },
}

export const LineWithDashedTooltip: Story = {
  render: () => (
    <Card className="w-[min(640px,calc(100vw-48px))]">
      <CardHeader><CardTitle>Mobile traffic</CardTitle><CardDescription>A six month trend with keyboard accessible points</CardDescription></CardHeader>
      <CardContent>
        <figure>
          <ChartContainer config={visitorConfig} className="h-64" role="group" aria-label="Monthly mobile visitors">
            <LineChart accessibilityLayer data={visitors} margin={{ top: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
              <Line dataKey="mobile" stroke="var(--color-mobile)" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
            </LineChart>
          </ChartContainer>
          <figcaption className="mt-4 font-sans text-sm text-text-3">Mobile visits peaked at 200 in February and finished at 140 in June.</figcaption>
          <ChartData />
        </figure>
      </CardContent>
    </Card>
  ),
}

export const ThemeColors: Story = {
  render: () => {
    const themed = {
      desktop: { label: "Desktop", theme: { light: "#3b4fe4", dark: "#a5b0ff" } },
      mobile: { label: "Mobile", theme: { light: "#1a7f37", dark: "#7eda96" } },
    } satisfies ChartConfig
    return (
      <div className="grid w-[min(880px,calc(100vw-48px))] gap-4 sm:grid-cols-2">
        {(["light", "dark"] as const).map((theme) => (
          <figure key={theme} data-theme={theme} className={theme === "dark" ? "rounded-md bg-ink p-4 text-dark-text" : "rounded-md border border-hairline bg-surface p-4 text-text-main"}>
            <figcaption className="mb-4 font-sans text-sm font-medium">{theme === "dark" ? "Dark" : "Light"} theme</figcaption>
            <ChartContainer config={themed} className={theme === "dark" ? "h-52 min-h-0 [&_.recharts-cartesian-axis-tick_text]:fill-dark-text-2" : "h-52 min-h-0"} role="group" aria-label={`${theme} chart colors`}>
              <BarChart accessibilityLayer data={visitors}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: theme === "dark" ? "#d5dae2" : "#626b7a" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} isAnimationActive={false} />
                <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
            <p className="mt-2 font-sans text-xs">Desktop: 186–305 visits. Mobile: 80–200 visits.</p>
          </figure>
        ))}
      </div>
    )
  },
}

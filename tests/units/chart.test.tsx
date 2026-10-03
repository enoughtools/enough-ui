import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type {} from "@testing-library/jest-dom/vitest"
import { Bar, BarChart, XAxis } from "recharts"
import {
  ChartContainer, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "../../src/components/ui/chart.js"
import { Default } from "../../src/components/ui/chart.stories.js"

const config = {
  desktop: { label: "Desktop", color: "var(--color-accent)" },
  mobile: { label: "Mobile", theme: { light: "#1a7f37", dark: "#7eda96" } },
  visitors: { label: "Total visitors" },
  chrome: { label: "Chrome", color: "oklch(0.6 0.18 250)" },
} satisfies ChartConfig

function content(children: React.ReactNode, chartConfig: ChartConfig = config) {
  const html = renderToStaticMarkup(<ChartContainer config={chartConfig}><div>{children}</div></ChartContainer>)
  return new DOMParser().parseFromString(html, "text/html")
}

function mockChartSize() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
    const sized = this.classList.contains("recharts-responsive-container")
    const width = sized ? 600 : 0
    const height = sized ? 300 : 0
    return { width, height, x: 0, y: 0, top: 0, left: 0, bottom: height, right: width, toJSON() {} }
  })
}

describe("Chart", () => {
  it("renders its default story on the server with chart data and a accessible description", () => {
    const render = Default.render!
    const html = renderToStaticMarkup(render({} as never, {} as never) as React.ReactElement)
    expect(html).toContain("Visitors by month")
    expect(html).toContain("February had the most visits")
    expect(html).toContain("View chart data")
    expect(html).toContain("Visitors by month and device")
    expect(html).toContain("recharts-wrapper")
    expect(html).not.toContain("font-mono")
  })

  it("provides nonzero initial dimensions and independent CSS scopes for repeated charts", () => {
    const chart = <BarChart accessibilityLayer data={[{ visits: 10 }]}><Bar dataKey="visits" /></BarChart>
    const html = renderToStaticMarkup(<><ChartContainer id="visits" config={config}>{chart}</ChartContainer><ChartContainer id="visits" config={config}>{chart}</ChartContainer></>)
    const document = new DOMParser().parseFromString(html, "text/html")
    const scopes = Array.from(document.querySelectorAll("[data-chart]"), (element) => element.getAttribute("data-chart"))
    expect(new Set(scopes).size).toBe(2)
    expect(scopes.every((scope) => /^chart-[a-zA-Z0-9-]+$/.test(scope!))).toBe(true)
    expect(document.querySelector("[data-slot='chart']")!.className).toContain("min-h-[200px]")
    // Recharts reserves these dimensions during SSR; its SVG mounts on hydration.
    expect(document.querySelector(".recharts-wrapper")?.getAttribute("width")).toBe("320")
    expect(document.querySelector(".recharts-wrapper")?.getAttribute("height")).toBe("200")
  })

  it("sets configured colors for light and dark, including data-theme selectors", () => {
    const html = renderToStaticMarkup(<ChartStyle id="chart-visits" config={config} />)
    expect(html).toContain("--color-desktop: var(--color-accent)")
    expect(html).toContain("--color-mobile: #1a7f37")
    expect(html).toContain("--color-mobile: #7eda96")
    expect(html).toContain('data-theme="dark"')
    expect(html).toContain(".dark")
    expect(html).not.toContain("--color-visitors")
  })

  it("rejects unsafe keys and color values and escapes arbitrary CSS selector ids", () => {
    const html = renderToStaticMarkup(<ChartStyle id={'a"] {} </style><script>alert(1)</script>'} config={{
      "bad;--color-forged": { color: "red" },
      injected: { color: "red; } body { display:none }" },
      html: { color: "</style><script>alert(1)</script>" },
      remote: { color: "url(https://example.com/track)" },
      comment: { color: "red/*" },
      desktop: { color: "var(--color-accent, #3b4fe4)" },
    }} />)
    expect(html).toContain("--color-desktop: var(--color-accent, #3b4fe4)")
    expect(html).not.toMatch(/--color-(bad|injected|html|remote|comment)/)
    expect(html).not.toContain("<script>")
    expect(html.match(/<\/style>/g)).toHaveLength(1)
  })

  it("shows configured series names, zero values, and the axis label", () => {
    const document = content(<ChartTooltipContent active label="January" payload={[
      { name: "desktop", dataKey: "desktop", value: 0, color: "#3b4fe4", graphicalItemId: "desktop" },
      { name: "mobile", dataKey: "mobile", value: 1280, color: "#1a7f37", graphicalItemId: "mobile" },
      { name: "hidden", dataKey: "hidden", value: 99, type: "none", graphicalItemId: "hidden" },
    ]} />)
    const tooltip = document.querySelector("[role='tooltip']")!
    expect(tooltip.textContent).toContain("January")
    expect(tooltip.textContent).toContain("Desktop0")
    expect(tooltip.textContent).toContain(`Mobile${(1280).toLocaleString()}`)
    expect(tooltip.textContent).not.toContain("hidden")
    expect(tooltip.querySelectorAll("[data-slot='chart-tooltip-indicator']")).toHaveLength(2)
  })

  it("resolves nameKey and labelKey through the data row", () => {
    const document = content(<ChartTooltipContent active labelKey="visitors" nameKey="browser" indicator="line" payload={[
      { name: "visitors", dataKey: "visitors", value: 275, payload: { browser: "chrome" }, graphicalItemId: "visitors" },
    ]} />)
    expect(document.querySelector("[role='tooltip']")!.textContent).toBe("Total visitorsChrome275")
    const indicator = document.querySelector("[data-slot='chart-tooltip-indicator']") as HTMLElement
    expect(indicator.getAttribute("data-indicator")).toBe("line")
    expect(indicator.style.backgroundColor).toBe("var(--color-chrome)")
  })

  it("passes each series and its data row to a custom formatter", () => {
    const row = { month: "June", desktop: 42 }
    const payload = [{ name: "desktop", dataKey: "desktop", value: 42, payload: row, graphicalItemId: "desktop" }]
    const formatter = vi.fn((value) => <span>{value} visits</span>)
    const labelFormatter = vi.fn((label) => <strong>{label} totals</strong>)
    const document = content(<ChartTooltipContent active payload={payload} label="June" formatter={formatter} labelFormatter={labelFormatter} />)
    expect(document.querySelector("[role='tooltip']")!.textContent).toBe("June totals42 visits")
    expect(formatter).toHaveBeenCalledWith(42, "desktop", payload[0], 0, row)
    expect(labelFormatter).toHaveBeenCalledWith("June", payload)
  })

  it("respects hideLabel and hideIndicator and stays absent for inactive or empty payloads", () => {
    const payload = [{ name: "desktop", value: 0, graphicalItemId: "desktop" }]
    const document = content(<ChartTooltipContent active hideLabel hideIndicator label="June" payload={payload} />)
    expect(document.querySelector("[role='tooltip']")!.textContent).toBe("Desktop0")
    expect(document.querySelector("[data-slot='chart-tooltip-indicator']")).toBeNull()
    expect(content(<ChartTooltipContent active={false} payload={payload} />).querySelector("[role='tooltip']")).toBeNull()
    expect(content(<ChartTooltipContent active payload={[]} />).querySelector("[role='tooltip']")).toBeNull()
    expect(content(<ChartTooltipContent active payload={[{ name: "hidden", type: "none", value: 1, graphicalItemId: "hidden" }]} />).querySelector("[role='tooltip']")).toBeNull()
  })

  it("announces accessible chart updates and filters Recharts settings out of the DOM", () => {
    const injected = { activeIndex: "0", coordinate: { x: 20, y: 30 }, allowEscapeViewBox: { x: false, y: false } }
    const document = content(<ChartTooltipContent {...injected} active accessibilityLayer payload={[{ name: "desktop", value: 12, graphicalItemId: "desktop" }]} data-testid="tooltip" />)
    const status = document.querySelector("[role='status']")!
    expect(status.getAttribute("aria-live")).toBe("polite")
    expect(status.getAttribute("aria-atomic")).toBe("true")
    expect(status.getAttribute("data-testid")).toBe("tooltip")
    expect(status.getAttribute("coordinate")).toBeNull()
    expect(status.getAttribute("activeindex")).toBeNull()
    expect(status.getAttribute("allowescapeviewbox")).toBeNull()
    const legend = content(<ChartLegendContent layout="horizontal" iconSize={12} payload={[{ value: "desktop", dataKey: "desktop" }]} />).querySelector("[role='list']")!
    expect(legend.getAttribute("layout")).toBeNull()
    expect(legend.getAttribute("iconsize")).toBeNull()
  })

  it("updates the tooltip through Recharts keyboard navigation", async () => {
    mockChartSize()
    const user = userEvent.setup()
    render(<ChartContainer config={config}><BarChart accessibilityLayer data={[{ month: "June", desktop: 42 }, { month: "July", desktop: 65 }]}>
      <XAxis dataKey="month" />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
    </BarChart></ChartContainer>)
    await user.tab()
    expect(screen.getByRole("application")).toHaveFocus()
    expect(await screen.findByRole("status")).toHaveTextContent("JuneDesktop42")
    await user.keyboard("{ArrowRight}")
    expect(await screen.findByRole("status")).toHaveTextContent("JulyDesktop65")
    await user.keyboard("{ArrowLeft}")
    expect(await screen.findByRole("status")).toHaveTextContent("JuneDesktop42")
  })

  it("gives legend items readable names, custom row keys, and an unconfigured fallback", () => {
    const document = content(<ChartLegendContent nameKey="browser" payload={[
      { value: "visitors", dataKey: "visitors", payload: { browser: "chrome" }, color: "#3b4fe4" },
      { value: "Other browsers", dataKey: "other", color: "#626b7a" },
      { value: "Hidden", dataKey: "hidden", type: "none" },
    ]} />)
    expect(document.querySelector("[role='list']")!.getAttribute("aria-label")).toBe("Chart legend")
    expect(Array.from(document.querySelectorAll("[role='listitem']"), (item) => item.textContent)).toEqual(["Chrome", "Other browsers"])
  })

  it("supports custom legend icons and hides them on request", () => {
    const Icon = () => <svg data-testid="series-icon" />
    const chartConfig: ChartConfig = { desktop: { label: "Desktop", icon: Icon, color: "red" } }
    const payload = [{ value: "desktop", dataKey: "desktop", color: "red" }]
    expect(content(<ChartLegendContent payload={payload} />, chartConfig).querySelector("[data-testid='series-icon']")).not.toBeNull()
    const hidden = content(<ChartLegendContent payload={payload} hideIcon />, chartConfig)
    expect(hidden.querySelector("[data-testid='series-icon']")).toBeNull()
    expect(hidden.querySelector("[data-slot='chart-legend-indicator']")).not.toBeNull()
  })

  it("passes legend entries to callbacks and makes interactive legends keyboard accessible", async () => {
    mockChartSize()
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onMouseEnter = vi.fn()
    const payload = [{ value: "hidden", type: "none" as const }, { value: "desktop", dataKey: "desktop", inactive: false }, { value: "mobile", dataKey: "mobile", inactive: true }]
    render(<ChartContainer config={config}><div><ChartLegendContent payload={payload} onClick={onClick} onMouseEnter={onMouseEnter} /></div></ChartContainer>)
    await user.tab()
    expect(screen.getByRole("button", { name: "Desktop", pressed: true })).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(onClick).toHaveBeenLastCalledWith(payload[1], 1, expect.anything())
    await user.tab()
    expect(screen.getByRole("button", { name: "Mobile", pressed: false })).toHaveFocus()
    await user.keyboard(" ")
    expect(onClick).toHaveBeenLastCalledWith(payload[2], 2, expect.anything())
    await user.hover(screen.getByRole("button", { name: "Desktop" }))
    expect(onMouseEnter).toHaveBeenLastCalledWith(payload[1], 1, expect.anything())
  })

  it("explains incorrect content placement", () => {
    expect(() => renderToStaticMarkup(<ChartTooltipContent active payload={[]} />)).toThrow("ChartContainer")
    expect(() => renderToStaticMarkup(<ChartLegendContent payload={[]} />)).toThrow("ChartContainer")
  })
})

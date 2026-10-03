import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CountryHeatmap } from "../../src/components/ui/country-heatmap.js"
import {
  countryHeatmapColors, countryHeatmapNoDataColor, createCountryHeatmapModel,
  normalizeCountryHeatmapCode,
} from "../../src/lib/country-heatmap.js"
import { countryHeatmapGeometry } from "../../src/lib/country-heatmap-geometry.js"

describe("CountryHeatmap data", () => {
  it("normalizes ISO codes and common aliases without accepting unassigned geometry codes", () => {
    expect(normalizeCountryHeatmapCode(" us ")).toBe("US")
    expect(normalizeCountryHeatmapCode("uk")).toBe("GB")
    expect(normalizeCountryHeatmapCode("EL")).toBe("GR")
    expect(normalizeCountryHeatmapCode("XK")).toBe("XK")
    for (const code of ["", "USA", "-99", "<script>"]) {
      expect(() => normalizeCountryHeatmapCode(code)).toThrow(RangeError)
    }
  })

  it("joins measured zero separately from missing/null/nonfinite observations", () => {
    const model = createCountryHeatmapModel({ data: [
      { code: "NZ", value: 0 }, { code: "AU", value: null },
      { code: "US", value: NaN }, { code: "CA", value: Infinity },
    ] })
    const country = (code: string) => model.countries.find((country) => country.code === code)!
    expect(model.hasData).toBe(true)
    expect(model.collapsed).toBe(true)
    expect(model.legendColors).toEqual([countryHeatmapColors[0]])
    expect(country("NZ")).toMatchObject({ value: 0, state: "zero", color: countryHeatmapColors[0], formattedValue: "0" })
    for (const code of ["AU", "US", "CA", "GB"]) {
      expect(country(code)).toMatchObject({ value: null, state: "no-data", color: countryHeatmapNoDataColor, formattedValue: "No data" })
    }
    expect(createCountryHeatmapModel({ data: [{ code: "US", value: null }] }).hasData).toBe(false)
  })

  it("sums duplicate normalized codes and retains the first label and any finite value", () => {
    const model = createCountryHeatmapModel({ data: [
      { code: "gb", value: 2, label: "Britain" }, { code: "UK", value: 3, label: "Other label" },
      { code: "GB", value: null }, { code: "US", value: null }, { code: "us", value: 0 },
    ] })
    expect(model.rows).toHaveLength(2)
    expect(model.rows.find((row) => row.code === "GB")).toMatchObject({ value: 5, label: "Britain" })
    expect(model.countries.find((country) => country.code === "GB")).toMatchObject({ value: 5, name: "Britain" })
    expect(model.rows.find((row) => row.code === "US")).toMatchObject({ value: 0, state: "zero" })
    expect(() => createCountryHeatmapModel({ data: [{ code: "US", value: Number.MAX_VALUE }, { code: "US", value: Number.MAX_VALUE }] })).toThrow("finite numeric range")
  })

  it("keeps absent small-country observations and other two-letter codes in the table", () => {
    const model = createCountryHeatmapModel({ data: [{ code: "SG", value: 25 }, { code: "MC", value: 1 }, { code: "ZZ", value: 4, label: "Unclassified region" }] })
    expect(model.rows).toHaveLength(3)
    expect(model.unmappedCount).toBe(3)
    expect(model.rows.every((row) => !row.mapped)).toBe(true)
    expect(model.rows.find((row) => row.code === "SG")?.label).toBe("Singapore")
    expect(model.countries.filter((country) => country.code === "-99")).toHaveLength(2)
    expect(model.countries.filter((country) => country.code === "-99").every((country) => country.state === "no-data")).toBe(true)
    expect(new Set(model.countries.map((country) => country.key)).size).toBe(countryHeatmapGeometry.length)
  })

  it("clamps color domains while preserving original outlier and negative values", () => {
    const model = createCountryHeatmapModel({ data: [
      { code: "US", value: 200 }, { code: "CA", value: -100 }, { code: "MX", value: 0 },
    ], domain: [-10, 10] })
    expect(model.rows.find((row) => row.code === "US")).toMatchObject({ value: 200, formattedValue: "200", bucket: 4 })
    expect(model.rows.find((row) => row.code === "CA")).toMatchObject({ value: -100, formattedValue: "-100", bucket: 0 })
    expect(model.rows.find((row) => row.code === "MX")).toMatchObject({ value: 0, bucket: 2 })
    expect(model.domain).toEqual([-10, 10])
    expect(() => createCountryHeatmapModel({ data: [], domain: [10, 0] })).toThrow(RangeError)
    expect(() => createCountryHeatmapModel({ data: [], domain: [0, NaN] })).toThrow(RangeError)
    expect(() => createCountryHeatmapModel({ data: [], domain: [0] as unknown as [number, number] })).toThrow(RangeError)
  })

  it("uses signed log1p without losing zero or negative measures", () => {
    const data = [{ code: "US", value: 10000 }, { code: "GB", value: 100 }, { code: "NZ", value: 0 }, { code: "CA", value: -100 }]
    const linear = createCountryHeatmapModel({ data, domain: [-10000, 10000] })
    const log = createCountryHeatmapModel({ data, scale: "log", domain: [-10000, 10000] })
    expect(linear.rows.find((row) => row.code === "GB")?.bucket).toBe(2)
    expect(log.rows.find((row) => row.code === "GB")?.bucket).toBe(3)
    expect(log.rows.find((row) => row.code === "CA")?.bucket).toBe(1)
    expect(log.rows.find((row) => row.code === "NZ")).toMatchObject({ value: 0, state: "zero", bucket: 2 })
    expect(log.rows.find((row) => row.code === "US")).toMatchObject({ value: 10000, formattedValue: "10,000", bucket: 4 })
  })

  it("keeps finite scales stable near numeric limits and handles collapsed domains", () => {
    const model = createCountryHeatmapModel({ data: [{ code: "US", value: Number.MAX_VALUE }, { code: "CA", value: -Number.MAX_VALUE }], domain: [-Number.MAX_VALUE, Number.MAX_VALUE] })
    expect(model.rows.find((row) => row.code === "US")?.bucket).toBe(4)
    expect(model.rows.find((row) => row.code === "CA")?.bucket).toBe(0)
    const collapsed = createCountryHeatmapModel({ data: [{ code: "US", value: 10 }], domain: [10, 10] })
    expect(collapsed.rows[0].bucket).toBe(0)
    expect(collapsed.legendColors).toHaveLength(1)
    expect(collapsed.minimumLabel).toBe(collapsed.maximumLabel)
  })

  it("preserves narrow logarithmic domains without subtracting rounded logarithms", () => {
    for (const domain of [[1e15, 1e15 + 1], [-1e15 - 1, -1e15]] as const) {
      const model = createCountryHeatmapModel({ data: [
        { code: "US", value: domain[0] }, { code: "CA", value: domain[1] },
        { code: "MX", value: domain[0] + 0.5 },
      ], scale: "log", domain })
      expect(model.rows.find((row) => row.code === "US")?.bucket).toBe(0)
      expect(model.rows.find((row) => row.code === "CA")?.bucket).toBe(4)
      expect(model.rows.find((row) => row.code === "MX")?.bucket).toBe(2)
      expect(model.collapsed).toBe(false)
      expect(model.legendColors).toHaveLength(5)
    }
  })

  it("localizes names/numbers and allows labels and custom value formats", () => {
    const model = createCountryHeatmapModel({ data: [{ code: "US", value: 1234.5 }], locale: "es-MX" })
    expect(model.rows[0]).toMatchObject({ label: "Estados Unidos", formattedValue: "1,234.5" })
    const formatted = createCountryHeatmapModel({ data: [{ code: "US", value: 0.75, label: "US customers" }], formatValue: (value) => `${value * 100}%` })
    expect(formatted.rows[0]).toMatchObject({ label: "US customers", formattedValue: "75%" })
    expect(formatted.maximumLabel).toBe("75%")
    expect(createCountryHeatmapModel({ data: [{ code: "US", value: 0.000000000000000000001 }] }).rows[0].formattedValue).toBe("0.000000000000000000001")
  })
})

describe("CountryHeatmap React", () => {
  it("renders a complete static map/table without depending on client state", () => {
    const html = renderToStaticMarkup(<CountryHeatmap title="Sessions by country" valueLabel="Sessions" data={[{ code: "US", value: 8 }, { code: "SG", value: 3 }]} />)
    const document = new DOMParser().parseFromString(html, "text/html")
    const svg = document.querySelector('svg[role="img"]')!
    const title = document.getElementById(svg.getAttribute("aria-labelledby")!)!
    const description = document.getElementById(svg.getAttribute("aria-describedby")!)!
    expect(title.textContent).toBe("Sessions by country")
    expect(description.textContent).toContain("measured zero")
    expect(document.querySelectorAll("svg path")).toHaveLength(176)
    expect(document.querySelectorAll("tbody tr")).toHaveLength(2)
    expect(document.querySelector("tbody")).toHaveTextContent("SingaporeSGNot shown at this map scale3")
    expect(document.querySelector("summary")).toHaveTextContent("View country data")
    expect(document.querySelector('svg [tabindex]')).toBeNull()
    expect(document.querySelector('[data-slot="country-heatmap-table-scroll"]')?.getAttribute('tabindex')).toBe("0")
    expect(document.querySelector('[data-slot="country-heatmap-table-scroll"]')?.getAttribute('role')).toBe("region")
    expect(html).not.toMatch(/<script|font-mono/)
  })

  it("assigns independent accessible references to multiple maps", () => {
    const html = renderToStaticMarkup(<><CountryHeatmap data={[]} /><CountryHeatmap data={[]} /></>)
    const document = new DOMParser().parseFromString(html, "text/html")
    const references = Array.from(document.querySelectorAll('svg[role="img"]'), (svg) => svg.getAttribute("aria-labelledby"))
    expect(new Set(references).size).toBe(2)
    expect(references.every((id) => document.getElementById(id!)?.tagName.toLowerCase() === "title")).toBe(true)
  })

  it("gives empty and all-zero datasets different states and legends", () => {
    const empty = new DOMParser().parseFromString(renderToStaticMarkup(<CountryHeatmap data={[]} />), "text/html")
    expect(empty.querySelector('[data-slot="country-heatmap-empty"]')).toHaveTextContent("No country data to display")
    expect(empty.querySelectorAll('[role="listitem"]')).toHaveLength(1)
    const zero = new DOMParser().parseFromString(renderToStaticMarkup(<CountryHeatmap data={[{ code: "NZ", value: 0 }]} />), "text/html")
    expect(zero.querySelector('[data-slot="country-heatmap-empty"]')).toBeNull()
    expect(zero.querySelectorAll('[role="listitem"]')).toHaveLength(2)
    expect(zero.querySelector('[data-slot="country-heatmap-legend"]')).toHaveTextContent("No data0 Value")
  })

  it("focuses the native summary and exposes exact values without focusing every shape", async () => {
    const user = userEvent.setup()
    render(<CountryHeatmap data={[{ code: "NZ", value: 0 }, { code: "AU", value: null }, { code: "SG", value: 125 }]} title="Country activity" />)
    await user.tab()
    expect(screen.getByText("View country data")).toHaveFocus()
    // Happy DOM does not implement the summary's native Enter key default.
    // Real browser checks cover Enter/Space without custom event handlers.
    await user.click(screen.getByText("View country data"))
    const table = screen.getByRole("table", { name: "Country activity: Value" })
    expect(within(table).getByRole("row", { name: /New Zealand NZ 0/ })).toBeVisible()
    expect(within(table).getByRole("row", { name: /Australia AU No data/ })).toBeVisible()
    expect(within(table).getByRole("row", { name: /Singapore SG Not shown at this map scale 125/ })).toBeVisible()
    expect(document.querySelector('svg [tabindex]')).toBeNull()
  })

  it("escapes caller content in map labels, descriptions, and table formats", () => {
    const html = renderToStaticMarkup(<CountryHeatmap data={[{ code: "US", value: 1, label: "<script>bad()</script>" }]} title="<img src=x>" description="<svg onload=bad()>" formatValue={() => "<script>value</script>"} />)
    expect(html).not.toContain("<script>")
    expect(html).not.toContain("<img src=x>")
    expect(html).toContain("&lt;script&gt;value&lt;/script&gt;")
  })
})

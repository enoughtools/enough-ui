import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { CountryHeatmap } from "./country-heatmap.js"
import { countryHeatmapChange, countryHeatmapCustom, countryHeatmapExtreme, countryHeatmapSample, countryHeatmapSkewed, formatCountryHeatmapLongValue } from "../../../stories/country-heatmap-data.js"

const meta = {
  title: "UI/CountryHeatmap",
  component: CountryHeatmap,
  tags: ["autodocs"],
  parameters: {
    renderer: "react", layout: "padded",
    docs: { description: { component: "A responsive static SVG choropleth with an accessible native data table. Identical presentation is available in native Astro. Country paths use Natural Earth 1:110m public-domain geometry; small countries remain in the table. The values in these examples are invented." } },
  },
  args: {
    title: "Activity around the world", valueLabel: "Sessions", data: countryHeatmapSample,
    className: "max-w-4xl", note: "Illustrative values. Grey means no data; New Zealand has a measured zero. Singapore is retained in the data table.",
  },
} satisfies Meta<typeof CountryHeatmap>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole("img", { name: "Activity around the world" })).toBeVisible()
    canvas.getByText("View country data").focus()
    await userEvent.keyboard("{Enter}")
    const table = canvas.getByRole("table", { name: "Activity around the world: Sessions" })
    expect(table).toBeVisible()
    expect(within(table).getByRole("rowheader", { name: /Singapore/ })).toBeVisible()
    expect(within(table).getByRole("row", { name: /New Zealand NZ 0/ })).toBeVisible()
  },
}

export const LogScale: Story = { args: { title: "A broad range of values", data: countryHeatmapSkewed, scale: "log", note: "Log scale makes smaller values visible alongside a large outlier. The table always contains the original values." } }
export const Empty: Story = { args: { data: [], title: "No observations yet", note: "Missing observations are not a measured zero." } }
export const ZeroAndMissing: Story = { args: { data: [{ code: "NZ", value: 0 }, { code: "AU", value: null }], title: "Zero is a value", tableOpen: true, note: "New Zealand has a measured zero. Australia has no data. Other countries have not been supplied." } }
export const FixedDomain: Story = { args: { data: countryHeatmapSample, domain: [0, 1000], title: "Comparable reporting periods", note: "A fixed 0–1,000 color domain lets multiple reporting periods share one scale." } }
export const SignedValues: Story = { args: { data: countryHeatmapChange, domain: [-25, 25], title: "Change from last period", valueLabel: "Percentage points", tableOpen: true, note: "Linear scales accept negative values. Log scales use signed log1p to preserve zero and negative values." } }
export const Localized: Story = { args: { data: countryHeatmapSample, locale: "es-MX", title: "Actividad por país", countryLabel: "País", valueLabel: "Sesiones", noDataLabel: "Sin datos", tableLabel: "Ver datos por país", legendLabel: "Leyenda del mapa", unmappedLabel: "No aparece a esta escala", emptyLabel: "Aún no hay datos", description: "El color representa las sesiones. Los valores exactos están en la tabla, incluidos los países pequeños.", note: "Datos ilustrativos.", tableOpen: true } }
export const ExtremeValues: Story = { args: { data: countryHeatmapExtreme, scale: "log", title: "Very large and small values", tableOpen: true, note: "Long numeric labels wrap inside the legend. The native table can scroll horizontally to preserve precise values." } }
export const CustomFormatting: Story = { args: { data: countryHeatmapCustom, formatValue: formatCountryHeatmapLongValue, title: "Custom formatted values", tableOpen: true, note: "Even a long, unbroken custom value label stays inside a narrow viewport." } }

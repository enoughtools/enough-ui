// Neutral, invented demonstration values shared by both renderers.
export const countryHeatmapSample = [
  { code: 'US', value: 820 },
  { code: 'CA', value: 240 },
  { code: 'MX', value: 390 },
  { code: 'BR', value: 470 },
  { code: 'GB', value: 650 },
  { code: 'FR', value: 380 },
  { code: 'DE', value: 570 },
  { code: 'IN', value: 790 },
  { code: 'JP', value: 460 },
  { code: 'AU', value: 320 },
  { code: 'ZA', value: 180 },
  { code: 'SG', value: 125 },
  { code: 'NZ', value: 0 },
  { code: 'IS', value: null },
]

export const countryHeatmapSkewed = [
  { code: 'US', value: 10000 },
  { code: 'MX', value: 500 },
  { code: 'BR', value: 100 },
  { code: 'GB', value: 50 },
  { code: 'JP', value: 10 },
  { code: 'AU', value: 1 },
  { code: 'NZ', value: 0 },
]

export const countryHeatmapChange = [
  { code: 'US', value: 12.5 },
  { code: 'CA', value: -8 },
  { code: 'MX', value: 4.25 },
  { code: 'BR', value: -15 },
  { code: 'GB', value: 0 },
  { code: 'SG', value: 21 },
]

export const countryHeatmapExtreme = [
  { code: 'US', value: Number.MAX_VALUE },
  { code: 'CA', value: Number.MIN_VALUE },
]

export const countryHeatmapCustom = [
  { code: 'US', value: 1.25 },
  { code: 'CA', value: 8.5 },
]

export const formatCountryHeatmapLongValue = (value: number) => `${'VeryLongCustomMeasurement'.repeat(12)}: ${value}`

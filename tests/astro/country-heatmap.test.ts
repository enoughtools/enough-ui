import { expect, test } from 'vitest';
import { composeStories, renderStory } from '@storybook-astro/framework/testing';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as stories from '../../stories/astro/CountryHeatmap.stories.js';
import { CountryHeatmap } from '../../src/components/ui/country-heatmap.js';
import { countryHeatmapDescription } from '../../src/lib/country-heatmap.js';
import { countryHeatmapChange, countryHeatmapCustom, countryHeatmapExtreme, countryHeatmapSample, countryHeatmapSkewed, formatCountryHeatmapLongValue } from '../../stories/country-heatmap-data.js';

const composed = composeStories(stories);

function reactDocument(props: React.ComponentProps<typeof CountryHeatmap>) {
  return new DOMParser().parseFromString(renderToStaticMarkup(React.createElement(CountryHeatmap, props)), 'text/html');
}

function comparePresentation(react: Document) {
  const slots = ['country-heatmap', 'country-heatmap-map', 'country-heatmap-legend', 'country-heatmap-data', 'country-heatmap-table-scroll'];
  for (const slot of slots) {
    expect(document.querySelector(`[data-slot="${slot}"]`)!.getAttribute('class')).toBe(react.querySelector(`[data-slot="${slot}"]`)!.getAttribute('class'));
  }
  const paths = (source: Document) => Array.from(source.querySelectorAll('svg path'), (path) => ({
    code: path.getAttribute('data-country'), state: path.getAttribute('data-state'), d: path.getAttribute('d'), fill: path.getAttribute('fill'), title: path.textContent?.trim(),
  }));
  const astroPaths = paths(document);
  const reactPaths = paths(react);
  expect(astroPaths).toHaveLength(reactPaths.length);
  for (let index = 0; index < astroPaths.length; index++) {
    expect(astroPaths[index], `country ${astroPaths[index].code}`).toEqual(reactPaths[index]);
  }
  expect(document.querySelector('table')!.textContent).toBe(react.querySelector('table')!.textContent);
  expect(document.querySelector('[data-slot="country-heatmap-legend"]')!.textContent).toBe(react.querySelector('[data-slot="country-heatmap-legend"]')!.textContent);
}

test('native Astro country heatmap matches React geometry/colors/exact table without a client island', async () => {
  const html = await renderStory(composed.Default);
  comparePresentation(reactDocument({ data: countryHeatmapSample, title: 'Activity around the world', valueLabel: 'Sessions', className: 'max-w-4xl' }));
  expect(html).not.toMatch(/<astro-island|<script\b|font-mono/);
  expect(document.querySelectorAll('svg path')).toHaveLength(176);
  expect(document.querySelector('tbody tr[data-country="SG"]')!.textContent).toContain('SingaporeSGNot shown at this map scale125');
  expect(document.querySelector('svg path[data-country="NZ"]')!.getAttribute('data-state')).toBe('zero');
  expect(document.querySelector('svg path[data-country="IS"]')!.getAttribute('data-state')).toBe('no-data');
  const svg = document.querySelector('svg[role="img"]')!;
  expect(document.getElementById(svg.getAttribute('aria-labelledby')!)!.textContent).toBe('Activity around the world');
  expect(document.getElementById(svg.getAttribute('aria-describedby')!)!.textContent).toBe(countryHeatmapDescription);
  expect(svg.querySelector('[tabindex]')).toBeNull();
  expect(document.querySelector('[data-slot="country-heatmap-table-scroll"]')!.getAttribute('tabindex')).toBe('0');
  expect(document.querySelector('[data-slot="country-heatmap-table-scroll"]')!.getAttribute('aria-label')).toBe('Activity around the world: Sessions');
});

test('native log scales and explicit domains share React colors while keeping original values', async () => {
  await renderStory(composed.LogScale);
  comparePresentation(reactDocument({ data: countryHeatmapSkewed, title: 'A broad range of values', scale: 'log', valueLabel: 'Sessions', className: 'max-w-4xl' }));
  expect(document.querySelector('[data-slot="country-heatmap-legend"]')!.textContent).toContain('(Log scale)');
  expect(document.querySelector('tbody tr[data-country="US"]')!.textContent).toContain('10,000');
  await renderStory(composed.FixedDomain);
  comparePresentation(reactDocument({ data: countryHeatmapSample, title: 'Comparable reporting periods', domain: [0, 1000], valueLabel: 'Sessions', className: 'max-w-4xl' }));
});

test('native empty and all-zero presentations remain distinct', async () => {
  await renderStory(composed.Empty);
  comparePresentation(reactDocument({ data: [], title: 'No observations yet', valueLabel: 'Sessions', className: 'max-w-4xl' }));
  expect(document.querySelector('[data-slot="country-heatmap-empty"]')!.textContent).toContain('No country data to display');
  await renderStory(composed.ZeroAndMissing);
  comparePresentation(reactDocument({ data: [{ code: 'NZ', value: 0 }, { code: 'AU', value: null }], title: 'Zero is a value', valueLabel: 'Sessions', tableOpen: true, className: 'max-w-4xl' }));
  expect(document.querySelector('[data-slot="country-heatmap-empty"]')).toBeNull();
  expect(document.querySelector('details')!.open).toBe(true);
  expect(document.querySelectorAll('[role="listitem"]')).toHaveLength(2);
});

test('native signed values preserve exact positive/negative table values', async () => {
  await renderStory(composed.SignedValues);
  comparePresentation(reactDocument({ data: countryHeatmapChange, title: 'Change from last period', valueLabel: 'Percentage points', domain: [-25, 25], tableOpen: true, className: 'max-w-4xl' }));
  expect(document.querySelector('tbody tr[data-country="BR"]')!.textContent).toContain('-15');
  expect(document.querySelector('tbody tr[data-country="SG"]')!.textContent).toContain('21');
});

test('native country names and labels localize identically to React', async () => {
  await renderStory(composed.Localized);
  comparePresentation(reactDocument({ data: countryHeatmapSample, locale: 'es-MX', title: 'Actividad por país', valueLabel: 'Sesiones', countryLabel: 'País', noDataLabel: 'Sin datos', legendLabel: 'Leyenda del mapa', tableLabel: 'Ver datos por país', unmappedLabel: 'No aparece a esta escala', tableOpen: true, className: 'max-w-4xl' }));
  expect(document.querySelector('tbody tr[data-country="US"]')!.textContent).toContain('Estados Unidos');
  expect(document.querySelector('tbody tr[data-country="IS"]')!.textContent).toContain('Sin datos');
});

test('native extreme and long custom values preserve exact text and React presentation', async () => {
  await renderStory(composed.ExtremeValues);
  comparePresentation(reactDocument({ data: countryHeatmapExtreme, title: 'Very large and small values', scale: 'log', valueLabel: 'Sessions', tableOpen: true, className: 'max-w-4xl' }));
  expect(document.querySelector('tbody tr[data-country="US"] td')!.textContent!.length).toBeGreaterThan(300);
  expect(document.querySelector('tbody tr[data-country="CA"] td')!.textContent).toContain('0005');
  await renderStory(composed.CustomFormatting);
  comparePresentation(reactDocument({ data: countryHeatmapCustom, title: 'Custom formatted values', formatValue: formatCountryHeatmapLongValue, valueLabel: 'Sessions', tableOpen: true, className: 'max-w-4xl' }));
  expect(document.querySelector('tbody tr[data-country="US"] td')!.textContent).toBe(formatCountryHeatmapLongValue(1.25));
});

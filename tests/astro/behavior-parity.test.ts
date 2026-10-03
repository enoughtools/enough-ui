import { test, expect } from 'vitest';
import { composeStories, renderStory } from '@storybook-astro/framework/testing';
import * as progressStories from '../../stories/astro/Progress.stories.js';
import * as paginationStories from '../../stories/astro/Pagination.stories.js';
import * as fieldStories from '../../stories/astro/Fields.stories.js';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Progress } from '../../src/components/ui/progress.js';
import { PaginationNext, PaginationPrevious } from '../../src/components/ui/pagination.js';

const progress = composeStories(progressStories);

test.each([
  ['Halfway', { value: 50 }],
  ['Complete', { value: 100 }],
  ['Clamped', { value: 150 }],
  ['Indeterminate', {}],
  ['InvalidBounds', { value: 150, max: 0 }],
  ['InvalidValue', { value: NaN, max: Infinity }],
  ['CustomMaximum', { value: 3, max: 8, getValueLabel: (value: number, max: number) => `${value} of ${max} files` }],
] as const)('native Progress %s matches React accessible state and styling', async (name, props) => {
  const html = await renderStory(progress[name]);
  const native = document.querySelector('[role="progressbar"]')!;
  const react = new DOMParser().parseFromString(renderToStaticMarkup(React.createElement(Progress, { ...props, 'aria-label': 'Build progress' })), 'text/html').querySelector('[role="progressbar"]')!;

  for (const attribute of ['class', 'aria-label', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext', 'data-state', 'data-value', 'data-max']) {
    expect(native.getAttribute(attribute)).toBe(react.getAttribute(attribute));
  }
  expect(native.firstElementChild!.getAttribute('class')).toBe(react.firstElementChild!.getAttribute('class'));
  expect((native.firstElementChild as HTMLElement).style.transform).toBe((react.firstElementChild as HTMLElement).style.transform);
  expect(html).not.toMatch(/<astro-island|<script\b|NaN|Infinity/);
});

test('localized native pagination forwards the same labels, text and sizes as React', async () => {
  await renderStory(composeStories(paginationStories).Localized);
  const native = Array.from(document.querySelectorAll('a'));
  const html = renderToStaticMarkup(React.createElement(React.Fragment, {},
    React.createElement(PaginationPrevious, { text: 'Anterior', 'aria-label': 'Ir a la página anterior', size: 'sm', href: '?page=1' }),
    React.createElement(PaginationNext, { text: 'Siguiente', 'aria-label': 'Ir a la página siguiente', size: 'sm', href: '?page=3' }),
  ));
  const react = Array.from(new DOMParser().parseFromString(html, 'text/html').querySelectorAll('a'));
  for (const [nativeLink, reactLink] of [[native[0], react[0]], [native[2], react[1]]]) {
    expect(nativeLink.getAttribute('class')).toBe(reactLink.getAttribute('class'));
    expect(nativeLink.getAttribute('aria-label')).toBe(reactLink.getAttribute('aria-label'));
    expect(nativeLink.textContent).toBe(reactLink.textContent);
  }
});

test('native choice cards preserve a single associated label and require no hydration', async () => {
  const html = await renderStory(composeStories(fieldStories).ChoiceCard);
  const label = document.querySelector('label[for="native-choice-archive"]')!;
  expect(label.querySelector('[data-slot="field"]')).not.toBeNull();
  expect(label.querySelector('[data-slot="field-title"]')!.tagName).toBe('DIV');
  expect(label.querySelector('input[type="checkbox"]')!.id).toBe('native-choice-archive');
  expect(label.querySelector('label')).toBeNull();
  expect(html).not.toMatch(/<astro-island|<script\b/);
});

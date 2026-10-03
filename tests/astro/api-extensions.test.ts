import { test, expect } from 'vitest';
import { composeStories, renderStory } from '@storybook-astro/framework/testing';
import * as alerts from '../../stories/astro/Alert.stories.js';
import * as cards from '../../stories/astro/Card.stories.js';
import * as markers from '../../stories/astro/Marker.stories.js';
import * as popovers from '../../stories/astro/Popover.stories.js';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '../../src/components/ui/alert.js';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../src/components/ui/card.js';
import { Marker, MarkerContent, MarkerIcon } from '../../src/components/ui/marker.js';
import { PopoverDescription, PopoverHeader, PopoverTitle } from '../../src/components/ui/popover.js';

const element = React.createElement;

function expectPresentationParity(react: React.ReactElement, slots: string[]) {
  const reference = new DOMParser().parseFromString(renderToStaticMarkup(react), 'text/html');
  for (const slot of slots) {
    const native = document.querySelector(`[data-slot="${slot}"]`)!;
    const expected = reference.querySelector(`[data-slot="${slot}"]`)!;
    expect(native, `native ${slot}`).not.toBeNull();
    expect(native.tagName, `${slot} semantics`).toBe(expected.tagName);
    expect(native.getAttribute('class'), `${slot} shared classes`).toBe(expected.getAttribute('class'));
  }
}

test('native alert actions match React composition without hydration', async () => {
  const html = await renderStory(composeStories(alerts).WithAction);
  expectPresentationParity(element(Alert, null,
    element(AlertTitle, null, 'All set'),
    element(AlertDescription, null, 'Your project is ready.'),
    element(AlertAction, null, element('a', { href: '#native-alert-details' }, 'Details')),
  ), ['alert', 'alert-title', 'alert-description', 'alert-action']);
  expect(document.querySelector('[data-slot="alert-action"] a')?.getAttribute('href')).toBe('#native-alert-details');
  expect(html).not.toMatch(/<astro-island|<script\b/);
});

test('native compact cards keep their action and shared sizing styles', async () => {
  const html = await renderStory(composeStories(cards).Compact);
  expectPresentationParity(element(Card, { size: 'sm' },
    element(CardHeader, null,
      element(CardTitle, null, 'Ready to make something?'),
      element(CardDescription, null, 'Cards, type, forms and navigation use the same design tokens.'),
      element(CardAction, null, element('a', { href: '#native-card-details' }, 'Details')),
    ),
    element(CardContent, { id: 'native-card-details' }, 'Content'),
    element(CardFooter, null, 'Start here'),
  ), ['card', 'card-header', 'card-title', 'card-description', 'card-action', 'card-content', 'card-footer']);
  expect(document.querySelector('[data-slot="card"]')?.getAttribute('data-size')).toBe('sm');
  expect(html).not.toMatch(/<astro-island|<script\b/);
});

test('native marker status parts match React accessibility and wrapping', async () => {
  const html = await renderStory(composeStories(markers).Composed);
  expectPresentationParity(element(Marker, { variant: 'border', role: 'status' },
    element(MarkerIcon, null, '✓'),
    element(MarkerContent, null, 'Reviewed all project files'),
  ), ['marker', 'marker-icon', 'marker-content']);
  expect(document.querySelector('[data-slot="marker-icon"]')?.getAttribute('aria-hidden')).toBe('true');
  expect(document.querySelector('[data-slot="marker"]')?.getAttribute('role')).toBe('status');
  expect(html).not.toMatch(/<astro-island|<script\b/);
  await renderStory(composeStories(markers).Separator);
  expect(document.querySelector('[data-slot="marker"]')?.hasAttribute('role')).toBe(false);
  expect(document.querySelector('[data-slot="marker-content"]')?.textContent?.trim()).toBe('Today');
});

test('native popover heading parts match React without state or hydration', async () => {
  const html = await renderStory(composeStories(popovers).Header);
  expectPresentationParity(element(PopoverHeader, { id: 'native-popover-header' },
    element(PopoverTitle, { id: 'native-popover-title' }, 'Share this canvas'),
    element(PopoverDescription, { id: 'native-popover-description' }, 'Invite your team to review the latest version.'),
  ), ['popover-header', 'popover-title', 'popover-description']);
  expect(document.querySelector('h2')?.textContent).toBe('Share this canvas');
  expect(html).not.toMatch(/<astro-island|<script\b/);
});

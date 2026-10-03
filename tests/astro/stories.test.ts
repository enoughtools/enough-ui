import { test, expect } from 'vitest';
import { composeStories, renderStory } from '@storybook-astro/framework/testing';
import * as buttons from '../../stories/astro/Button.stories.js';
import * as fields from '../../stories/astro/Fields.stories.js';
import * as progress from '../../stories/astro/Progress.stories.js';
import * as pagination from '../../stories/astro/Pagination.stories.js';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '../../src/components/ui/button.js';

const buttonStories = composeStories(buttons);
test('native link matches React styles and requires no hydration', async () => {
  const html = await renderStory(buttonStories.Link);
  const link = document.querySelector('#native-button')!;
  expect(link.getAttribute('href')).toBe('#start');
  const react = renderToStaticMarkup(React.createElement(Button, {variant:'accent'},'Get started'));
  const reference = new DOMParser().parseFromString(react, 'text/html');
  expect(link.getAttribute('class')).toBe(reference.querySelector('button')!.getAttribute('class'));
  expect(html).not.toMatch(/<astro-island|<script\b/);
});
test('disabled link loses its destination and focus', async () => {
  await renderStory(buttonStories.DisabledLink);
  const link = document.querySelector('#disabled-button')!;
  expect(link.hasAttribute('href')).toBe(false);
  expect(link.getAttribute('aria-disabled')).toBe('true');
  expect(link.getAttribute('tabindex')).toBe('-1');
});
test('composed fields preserve labels, content and deduplicated errors', async () => {
  await renderStory(composeStories(fields).Composed);
  expect(document.querySelector('label[for="email"]')).not.toBeNull();
  expect(document.querySelector('textarea')!.textContent).toBe('Hello from Astro.');
  expect(document.querySelector('[role="alert"]')!.textContent).toBe('Please enter an email.');
});
test('progress clamps values to its maximum', async () => {
  await renderStory(composeStories(progress).Clamped);
  expect(document.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('100');
});
test('pagination identifies its current page and disables unavailable links', async () => {
  await renderStory(composeStories(pagination).Composed);
  expect(document.querySelector('nav[aria-label="Pagination"]')).not.toBeNull();
  expect(document.querySelector('[aria-current="page"]')!.textContent).toBe('1');
  expect(document.querySelector('[aria-disabled="true"]')!.hasAttribute('href')).toBe(false);
});

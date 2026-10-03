import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { test, expect } from 'vitest';
import { composeStories, renderStory } from '@storybook-astro/framework/testing';
import * as stories from '../../stories/astro/InputGroup.stories.js';
import { InputGroupButton } from '../../src/components/ui/input-group.js';

test('native embedded actions share React variant styles without hydration', async () => {
  const html = await renderStory(composeStories(stories).AccentAction);
  const native = document.querySelector('[data-slot=input-group-button]')!;
  const reference = new DOMParser().parseFromString(renderToStaticMarkup(React.createElement(InputGroupButton, { variant: 'accent' }, 'Search')), 'text/html').querySelector('button')!;
  expect(native.getAttribute('class')).toBe(reference.getAttribute('class'));
  expect(native.getAttribute('type')).toBe('button');
  expect(html).not.toMatch(/astro-island|<script\b/);
});

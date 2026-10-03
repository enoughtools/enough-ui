import { expect, test } from 'vitest';
import { composeStories, renderStory } from '@storybook-astro/framework/testing';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as aspectRatioStories from '../../stories/astro/AspectRatio.stories.js';
import * as avatarStories from '../../stories/astro/Avatar.stories.js';
import * as directionStories from '../../stories/astro/Direction.stories.js';
import * as nativeSelectStories from '../../stories/astro/NativeSelect.stories.js';
import { AspectRatio } from '../../src/components/ui/aspect-ratio.js';
import { Avatar, AvatarFallback } from '../../src/components/ui/avatar.js';
import { NativeSelect } from '../../src/components/ui/native-select.js';

function reactDocument(component: React.ReactElement) {
  return new DOMParser().parseFromString(renderToStaticMarkup(component), 'text/html');
}

test('native aspect ratios preserve the React layout and shared appearance', async () => {
  const html = await renderStory(composeStories(aspectRatioStories).Composed);
  const containers = document.querySelectorAll<HTMLElement>('[data-slot="aspect-ratio"]');
  expect(containers).toHaveLength(2);
  expect(containers[0].parentElement!.style.paddingBottom).toBe('56.25%');
  expect(containers[1].parentElement!.style.paddingBottom).toBe('100%');
  const react = reactDocument(React.createElement(AspectRatio, { ratio: 16 / 9 }));
  expect(containers[0].getAttribute('class')).toBe(react.querySelector('[data-slot="aspect-ratio"]')!.getAttribute('class'));
  expect(html).not.toMatch(/<astro-island|<script\b/);
});

test('native avatar composition adds only the server-selected image or fallback', async () => {
  const html = await renderStory(composeStories(avatarStories).Composed);
  const imageAvatar = document.querySelector('#composed-image-avatar')!;
  expect(imageAvatar.querySelector('img')!.getAttribute('alt')).toBe('Alex Morgan');
  expect(imageAvatar.querySelector('[data-slot="avatar-fallback"]')).toBeNull();
  const fallbackAvatar = document.querySelector('#composed-fallback-avatar')!;
  expect(fallbackAvatar.querySelectorAll('[data-slot="avatar-fallback"]')).toHaveLength(1);
  expect(fallbackAvatar.textContent!.trim()).toBe('SL');
  expect(fallbackAvatar.querySelector('img')).toBeNull();
  const react = reactDocument(React.createElement(Avatar, {}, React.createElement(AvatarFallback, {}, 'SL')));
  expect(fallbackAvatar.getAttribute('class')).toBe(react.querySelector('[data-slot="avatar"]')!.getAttribute('class'));
  expect(fallbackAvatar.querySelector('[data-slot="avatar-fallback"]')!.getAttribute('class')).toBe(react.querySelector('[data-slot="avatar-fallback"]')!.getAttribute('class'));
  expect(html).not.toMatch(/<astro-island|<script\b|\bonerror=/);
});

test('native select preserves selected options, labels, disabled and listbox attributes', async () => {
  await renderStory(composeStories(nativeSelectStories).Composed);
  const select = document.querySelector<HTMLSelectElement>('#framework')!;
  expect(document.querySelector('label[for="framework"]')!.textContent!.trim()).toBe('Framework');
  expect(select.name).toBe('framework');
  expect(select.value).toBe('astro');
  expect(document.querySelector<HTMLSelectElement>('#disabled-select')!.disabled).toBe(true);
  expect(document.querySelector('#invalid-select')!.getAttribute('aria-invalid')).toBe('true');
  const multiple = document.querySelector<HTMLSelectElement>('#roles')!;
  expect(multiple.multiple).toBe(true);
  expect(multiple.getAttribute('size')).toBe('4');
  expect(Array.from(multiple.selectedOptions, option => option.value)).toEqual(['admin', 'editor']);
  expect(multiple.parentElement!.querySelector('[data-slot="native-select-icon"]')).toBeNull();
  const react = reactDocument(React.createElement(NativeSelect));
  expect(select.getAttribute('class')).toBe(react.querySelector('select')!.getAttribute('class'));
});

test('native direction stories set inherited HTML direction without client scripts', async () => {
  const html = await renderStory(composeStories(directionStories).Composed);
  expect(document.querySelector('[dir="ltr"]')).not.toBeNull();
  expect(document.querySelector('[dir="rtl"]')).not.toBeNull();
  expect(html).not.toMatch(/<astro-island|<script\b/);
});

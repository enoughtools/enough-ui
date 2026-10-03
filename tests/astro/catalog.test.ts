import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { composeStories, renderStory } from '@storybook-astro/framework/testing';
import * as ui from '../../src/index.js';

// The actual catalog is the fixture inventory. Adding an Astro story adds a
// rendering test automatically, including every variant exported by that story.
const modules = import.meta.glob('../../stories/astro/**/*.stories.{js,ts}', { eager: true }) as Record<string, any>;
const pairs: Record<string, { component: string; selector: string; props?: Record<string, unknown> }> = {
  Alert: { component: 'Alert', selector: '[role="alert"]' },
  Badge: { component: 'Badge', selector: 'span' },
  Breadcrumb: { component: 'BreadcrumbList', selector: 'ol' },
  Button: { component: 'Button', selector: 'button, a' },
  Callout: { component: 'Callout', selector: 'aside' },
  ButtonGroup: { component: 'ButtonGroup', selector: '[data-slot="button-group"]' },
  Card: { component: 'Card', selector: 'div' },
  Empty: { component: 'Empty', selector: '[data-slot="empty"]' },
  FieldError: { component: 'FieldError', selector: '[role="alert"]' },
  Fields: { component: 'FieldSet', selector: 'fieldset' },
  GroupLabel: { component: 'GroupLabel', selector: 'div' },
  Input: { component: 'Input', selector: 'input' },
  InputGroup: { component: 'InputGroup', selector: '[data-slot="input-group"]' },
  Item: { component: 'Item', selector: '[data-slot="item"]' },
  Kbd: { component: 'KbdGroup', selector: '[data-slot="kbd-group"]' },
  Label: { component: 'Label', selector: 'label' },
  Marker: { component: 'Marker', selector: '[data-slot="marker"]' },
  Pagination: { component: 'Pagination', selector: 'nav' },
  Progress: { component: 'Progress', selector: '[role="progressbar"]' },
  Separator: { component: 'Separator', selector: 'div' },
  Skeleton: { component: 'Skeleton', selector: '[data-slot="skeleton"]' },
  Spinner: { component: 'Spinner', selector: '[role="status"]' },
  Table: { component: 'Table', selector: 'table' },
  Textarea: { component: 'Textarea', selector: 'textarea' },
  ToolRow: { component: 'ToolRow', selector: 'a, div', props: { onClick: () => {} } },
  TopNav: { component: 'TopNav', selector: 'header' },
  Typography: { component: 'Typography', selector: '[data-slot="typography"]' },
  AspectRatio: { component: 'AspectRatio', selector: '[data-slot="aspect-ratio"]' },
  Avatar: { component: 'Avatar', selector: '[data-slot="avatar"]' },
  NativeSelect: { component: 'NativeSelect', selector: 'select' },
};

for (const [file, module] of Object.entries(modules)) {
  const family = file.split('/').at(-1)!.split('.stories')[0];
  describe(`Astro catalog: ${family}`, () => {
    const stories = composeStories(module);
    for (const [name, story] of Object.entries(stories)) {
      test(`${name} renders native HTML and the shared React styling`, async () => {
        const html = await renderStory(story as any);
        expect(html).not.toMatch(/<astro-island\b|<script\b/);
        expect(html).not.toMatch(/font-mono|font-family\s*:\s*[^;]*monospace/);
        const pair = family === 'Fields' && name === 'ChoiceCard'
          ? { component: 'FieldLabel', selector: '[data-slot="field-label"]' }
          : pairs[family];
        if (!pair) {
          // Callout is an Astro extension; it still has native rendering and
          // semantic coverage. Stateful components belong to React islands.
          expect(html.trim().length, `${family}/${name} should render content`).toBeGreaterThan(0);
          return;
        }
        const native = document.querySelector(pair.selector);
        if (family === 'FieldError' && name === 'Empty') {
          expect(native).toBeNull();
          return;
        }
        expect(native, `${family}/${name} should preserve ${pair.selector}`).not.toBeNull();
        // Disabled native links add explicit noninteractive classes rather than
        // relying on the button pseudo-class. Their behavior has dedicated tests.
        if (family === 'Button' && name.startsWith('Disabled')) return;
        const component = (ui as Record<string, any>)[pair.component];
        expect(component, `${pair.component} must also have a React renderer`).toBeDefined();
        const args = { ...(module.default.args ?? {}), ...((module[name] as any)?.args ?? {}) };
        const { slots, label, href, for: htmlFor, class: className, ...props } = args;
        delete props.style; // The catalog can use CSS strings; React takes objects.
        const reactProps = { ...props, ...pair.props, className, ...(htmlFor ? { htmlFor } : {}), ...(family === 'Spinner' || family === 'Callout' ? { label } : {}) };
        const markup = renderToStaticMarkup(React.createElement(component, reactProps, family === 'Input' ? undefined : 'Catalog sample'));
        const reference = new DOMParser().parseFromString(markup, 'text/html');
        const react = reference.querySelector(pair.selector) ?? reference.body.firstElementChild!;
        expect(native!.getAttribute('class')).toBe(react!.getAttribute('class'));
      });
    }
  });
}

test('composed native fields keep labels and controls programmatically associated', async () => {
  const module = modules['../../stories/astro/Fields.stories.js'];
  await renderStory(composeStories(module).Composed);
  for (const control of document.querySelectorAll('input, textarea')) {
    expect(document.querySelector(`label[for="${control.id}"]`)).not.toBeNull();
  }
});

test('native table retains a caption, header cells, and body cells', async () => {
  const module = modules['../../stories/astro/Table.stories.js'];
  await renderStory(composeStories(module).Composed);
  expect(document.querySelector('caption')?.textContent).toBe('Component delivery');
  expect(document.querySelectorAll('thead th')).toHaveLength(2);
  expect(document.querySelectorAll('tbody td')).toHaveLength(2);
});

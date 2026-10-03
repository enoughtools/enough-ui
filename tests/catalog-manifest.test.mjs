import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createCatalogManifest } from '../scripts/build-catalog-manifest.mjs';

const manifest = await createCatalogManifest();
const component = (slug) => manifest.components.find((entry) => entry.slug === slug);

test('catalog preserves Storybook IDs and merges native and React families', () => {
  assert.ok(component('button').react.some((story) => story.id === 'ui-button--accent'));
  assert.ok(component('button').astro.some((story) => story.id === 'astro-button--accent'));
  assert.ok(component('field').react.length && component('field').astro.length);
  assert.ok(component('checkbox').react.some((story) => story.id === 'ui-interactive-catalog--checkbox'));
  assert.ok(component('dropdown-menu').react.some((story) => story.id === 'ui-interactive-catalog--dropdown-menu'));
  assert.ok(component('tool-row').astro.length);
  assert.equal(component('interactive-catalog'), undefined);
  const stories = manifest.components.flatMap((entry) => [...entry.react, ...entry.astro]);
  assert.equal(manifest.stats.stories, stories.length);
  assert.equal(new Set(stories.map((story) => story.id)).size, stories.length);
});

test('controls retain declared options and numeric bounds while excluding unsupported values', () => {
  const button = component('button').react.find((story) => story.id === 'ui-button--accent');
  assert.deepEqual(button.controls.find((control) => control.name === 'variant').options, ['ink', 'accent', 'outline', 'ghost', 'destructive']);
  assert.equal(button.args.variant, 'accent');
  assert.ok(!button.controls.some((control) => control.name === 'asChild'));
  const progress = component('progress').react.find((story) => story.id === 'ui-progress--default');
  assert.deepEqual(progress.controls.find((control) => control.name === 'value'), { name: 'value', type: 'range', value: 45, min: 0, max: 100, step: 1 });
  assert.ok(!progress.controls.some((control) => control.name === 'className'));
  const rendered = component('progress').react.find((story) => story.id === 'ui-progress--with-label');
  assert.deepEqual(rendered.controls, []);
});

test('source comes from reusable fixtures and references public renderer packages', async () => {
  const source = component('button').react.find((story) => story.id === 'ui-button--accent').source;
  assert.match(source, /@enoughtools\/ui-react\/button/);
  assert.match(source, /export const Accent: Story =/);
  assert.ok(!source.includes('export const Destructive: Story'));
  const astro = component('card').astro.find((story) => story.id === 'astro-card--compact').source;
  assert.match(astro, /export const Compact =/);
  assert.match(astro, /CardExample\.astro — native example/);
  assert.match(astro, /@enoughtools\/ui-astro\/card/);
  const nativeFixture = await readFile(new URL('../stories/astro/CardExample.astro', import.meta.url), 'utf8');
  assert.ok(astro.includes(nativeFixture.trim().split('\n').at(-1)));
});

test('every renderer package import resolves to a public export and private helpers are inlined', async () => {
  const packages = Object.fromEntries(await Promise.all(['react', 'astro'].map(async (renderer) => [renderer, JSON.parse(await readFile(new URL(`../packages/${renderer}/package.json`, import.meta.url), 'utf8')).exports])));
  for (const entry of manifest.components) {
    for (const story of [...entry.react, ...entry.astro]) {
      for (const match of story.source.matchAll(/['"]@enoughtools\/ui-(react|astro)(\/[^'"\s]+)?['"]/g)) {
        assert.ok(packages[match[1]][match[2] ? `.${match[2]}` : '.'], `${story.id} imports an unavailable package entry: ${match[0]}`);
      }
      assert.doesNotMatch(story.source, /from ['"]\.\.\/\.\.\/(?:src\/)?(?:lib|hooks)\//, `${story.id} must not require private source helpers`);
    }
  }
  const table = component('data-table').react[0];
  assert.match(table.source, /const sortIndicatorPaths =/);
  const group = component('input-group').astro[0];
  assert.match(group.source, /ComponentProps<typeof InputGroupButton>/);
  assert.ok(component('chart').react[0].imports.some((statement) => statement.includes('ChartContainer') && statement.includes('@enoughtools/ui-react/chart')));
  assert.ok(component('conversation').astro[0].imports.some((statement) => statement.includes('Message from') && statement.includes('@enoughtools/ui-astro/message')));
});

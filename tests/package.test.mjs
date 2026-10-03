import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as ui from '@rebnz/enough-ui';

const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));

test('every public entry point resolves without application aliases', async () => {
  for (const [subpath, target] of Object.entries(manifest.exports)) {
    if (typeof target === 'string') continue;
    const specifier = subpath === '.' ? manifest.name : manifest.name + subpath.slice(1);
    const exports = await import(specifier);
    assert.ok(Object.keys(exports).length, `${specifier} has exports`);
    await readFile(new URL('../' + target.types, import.meta.url));
  }
});

test('the root and component entry points share component and toast instances', async () => {
  assert.equal(ui.Button, (await import('@rebnz/enough-ui/button')).Button);
  assert.equal(ui.toast, (await import('@rebnz/enough-ui/use-toast')).toast);
});

test('components render on the server with the consuming React instance', () => {
  const html = renderToStaticMarkup(React.createElement(ui.Card, null,
    React.createElement(ui.CardTitle, null, 'Example'),
    React.createElement(ui.Button, { variant: 'accent' }, 'Save'),
    React.createElement(ui.Input, { 'aria-label': 'Name' }),
  ));
  assert.match(html, /Example/);
  assert.match(html, /<button/);
  assert.match(html, /aria-label="Name"/);
});

test('navigation uses the consuming project’s routes and branding', () => {
  const html = renderToStaticMarkup(React.createElement(ui.TopNav, {
    brand: 'Example', homeLabel: 'Example home', homeHref: '/dashboard',
    links: [{ label: 'Settings', href: '/settings' }], active: 'Settings',
    showLauncher: false, skipToHref: '#content',
  }));
  assert.match(html, /href="\/settings" aria-current="page"/);
  assert.match(html, /href="#content"/);
  assert.match(html, /aria-label="Example home"/);
  assert.doesNotMatch(html, /EnoughUI|data-palette-trigger/);
});

test('default navigation has no application routes or disconnected launcher', () => {
  const html = renderToStaticMarkup(React.createElement(ui.TopNav));
  assert.match(html, /EnoughUI/);
  assert.deepEqual([...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]), ['#main', '/']);
  assert.doesNotMatch(html, /data-palette-trigger/);
  const connected = renderToStaticMarkup(React.createElement(ui.TopNav, { onPalette() {} }));
  assert.match(connected, /data-palette-trigger/);
});

test('compiled styles include tokens and component utilities without Tailwind at runtime', async () => {
  for (const name of ['styles', 'components']) {
    const css = await readFile(new URL(`../dist/${name}.css`, import.meta.url), 'utf8');
    assert.match(css, /--color-accent:#3b4fe4/);
    assert.match(css, /drawer-sheet-overlay/);
    assert.match(css, /\.inline-flex/);
    assert.doesNotMatch(css, /@(?:import|source|theme|plugin)\b/);
  }
  const components = await readFile(new URL('../dist/components.css', import.meta.url), 'utf8');
  assert.doesNotMatch(components, /border-radius:0!important/);
  assert.doesNotMatch(components, /body\{/);
});

import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = resolve(root, 'storybook-static');
const output = resolve(root, 'artifacts/swift-gallery');
const manifest = JSON.parse(await readFile(resolve(root, '.storybook/catalog/swift-manifest.json'), 'utf8'));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const path = resolve(directory, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    assert.ok(path === directory || path.startsWith(directory + sep));
    const file = (await stat(path)).isDirectory() ? resolve(path, 'index.html') : path;
    response.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' }).end(await readFile(file));
  } catch { response.writeHead(404).end('Not found'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const url = process.env.STORYBOOK_URL ?? `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const checked = [];
const visit = async (slug = '') => {
  await page.goto(`${url}/swift${slug ? `?path=/swift/${slug}` : ''}`, { waitUntil: 'networkidle' });
  await page.locator('.eui-swift-catalog').waitFor();
};
const audit = async () => {
  const results = await new AxeBuilder({ page }).include('.eui-catalog').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  assert.deepEqual(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(n => n.target) })), []);
  const metrics = await page.evaluate(() => {
    const shell = document.querySelector('.eui-catalog');
    return { width: shell.clientWidth, scroll: shell.scrollWidth, mono: [...shell.querySelectorAll('*')].filter(el => /monospace/i.test(getComputedStyle(el).fontFamily)).map(el => el.className) };
  });
  assert.ok(metrics.scroll <= metrics.width + 1, `Horizontal overflow: ${JSON.stringify(metrics)}`);
  assert.deepEqual(metrics.mono, []);
};
try {
  await mkdir(output, { recursive: true });
  await visit();
  assert.equal(await page.locator('.eui-swift-grid .eui-tile').count(), manifest.components.length);
  for (const component of manifest.components) for (const preview of Object.values(component.previews)) {
    const response = await fetch(url + preview.path);
    assert.equal(response.status, 200, preview.path);
    const data = Buffer.from(await response.arrayBuffer());
    assert.ok(data.length > 1000, preview.path);
    assert.equal(data.readUInt32BE(16), preview.width);
  }
  await audit();
  await page.screenshot({ path: resolve(output, 'desktop.png') });
  checked.push('Dedicated entry route, all native screenshot assets, accessible desktop layout');
  await page.getByRole('searchbox').fill('buttons');
  await page.waitForFunction(count => document.querySelectorAll('.eui-swift-grid .eui-tile').length === count, manifest.components.filter(c => `${c.title} ${c.description} ${c.category}`.toLowerCase().includes('buttons')).length);
  await page.getByRole('searchbox').fill('no-such-component');
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByRole('button', { name: 'Forms', exact: true }).click();
  await page.waitForFunction(count => document.querySelectorAll('.eui-swift-grid .eui-tile').length === count, manifest.components.filter(c => c.category === 'Forms').length);
  checked.push('Search, category filtering and empty reset');
  for (const component of manifest.components) {
    await visit(component.id);
    await page.getByRole('heading', { name: component.title, exact: true }).waitFor();
    for (const platform of ['macos', 'ios']) for (const theme of ['light', 'dark']) {
      await page.getByRole('button', { name: platform === 'macos' ? 'macOS' : 'iPhone · iOS', exact: true }).click();
      await page.getByRole('button', { name: theme === 'light' ? 'Light' : 'Dark', exact: true }).click();
      const image = page.locator('.eui-swift-stage img');
      assert.equal(await image.getAttribute('src'), component.previews[`${platform}-${theme}`].path);
      await image.evaluate(img => img.decode());
      assert.ok(await image.evaluate(img => img.naturalWidth > 0));
    }
    await page.getByRole('button', { name: 'Copy Swift source' }).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), component.source);
  }
  checked.push(`${manifest.components.length} component routes, four native appearances each, exact source copy`);
  await visit('buttons');
  await page.getByRole('tab', { name: 'Swift source' }).click();
  await page.locator('.monaco-editor').waitFor();
  await audit();
  await page.screenshot({ path: resolve(output, 'source.png') });
  await page.getByRole('tab', { name: 'Swift source' }).focus();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.getByRole('tab', { name: 'Native preview' }).getAttribute('aria-selected'), 'true');
  checked.push('Swift editor, proportional typography and keyboard tabs');
  await visit('getting-started');
  await page.getByRole('heading', { name: 'A native starting point.' }).waitFor();
  await page.locator('.monaco-editor').waitFor();
  await audit();
  checked.push('SwiftPM installation and first-screen source');
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of ['', 'buttons', 'getting-started']) { await visit(slug); await audit(); assert.ok(await page.getByRole('link', { name: 'Swift · Apple apps', exact: true }).isVisible()); }
    await visit();
    await page.screenshot({ path: resolve(output, `mobile-${width}.png`) });
  }
  checked.push('Accessible gallery, detail and install layouts at 320, 390 and 768 pixels');
  await page.getByRole('link', { name: 'Web · React/Astro', exact: true }).click();
  await page.getByRole('heading', { name: 'Enough to build on.', exact: true }).waitFor();
  await page.getByRole('link', { name: 'Swift', exact: true }).click();
  await page.getByRole('heading', { name: 'Native, familiar, Enough.', exact: true }).waitFor();
  await visit('unknown');
  await page.getByRole('heading', { name: 'Component not found' }).waitFor();
  checked.push('Web/Swift navigation and missing component route');
  assert.deepEqual(errors, [], 'Browser runtime or console errors');
  await writeFile(resolve(output, 'verification.json'), JSON.stringify({ checked }, null, 2));
  console.log(`Swift gallery verified: ${checked.join('; ')}.`);
} finally { await browser.close(); await new Promise(done => server.close(done)); }

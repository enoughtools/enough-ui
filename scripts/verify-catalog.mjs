import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = resolve(root, 'storybook-static');
const output = resolve(root, 'artifacts/catalog');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const verified = [];
const failures = [];
const notes = [];
let server;
let browser;

try {
  await mkdir(output, { recursive: true });
  let url = process.env.STORYBOOK_URL;
  if (!url) {
    await stat(resolve(catalog, 'index.json')).catch(() => { throw new Error('Build the shared Storybook catalog first: pnpm build-storybook'); });
    server = createServer(async (request, response) => {
      try {
        const path = resolve(catalog, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
        if (path !== catalog && !path.startsWith(catalog + sep)) { response.writeHead(403).end(); return; }
        const file = (await stat(path)).isDirectory() ? resolve(path, 'index.html') : path;
        response.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' });
        response.end(await readFile(file));
      } catch { response.writeHead(404).end('Not found'); }
    });
    await new Promise((done) => server.listen(0, '127.0.0.1', done));
    url = `http://127.0.0.1:${server.address().port}`;
  }
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1040 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const runtimeErrors = [];
  const consoleErrors = [];
  const observedConsoleErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') { consoleErrors.push(message.text()); observedConsoleErrors.push(message.text()); } });
  const visit = async (path = '') => {
    await page.goto(`${url}/${path}`, { waitUntil: 'networkidle' });
    await page.locator('.eui-catalog').waitFor();
  };
  const check = async (name, action) => {
    runtimeErrors.length = 0;
    consoleErrors.length = 0;
    try {
      await action();
      assert.deepEqual(runtimeErrors, [], 'Catalog or preview has a runtime error');
      if (consoleErrors.length) { const unique = [...new Set(consoleErrors)]; const error = new Error(`${consoleErrors.length} console errors (${unique.length} distinct): ${unique[0]}`); error.details = { consoleErrors: unique }; throw error; }
      verified.push(name);
    }
    catch (error) { failures.push({ name, message: error.message, url: page.url(), ...(error.details ? { details: error.details } : {}) }); await page.screenshot({ path: resolve(output, `failure-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`) }).catch(() => {}); console.error(`${name}: ${error.message}`); }
  };
  const frame = () => page.frameLocator('.eui-playground iframe');
  const scan = async () => {
    const results = await new AxeBuilder({ page }).include('.eui-catalog').exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    if (results.violations.length) {
      const error = new Error(results.violations.map((violation) => `${violation.id} (${violation.impact})`).join(', '));
      error.details = results.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })) }));
      throw error;
    }
  };
  const fonts = async () => {
    const monospace = await page.locator('.eui-catalog').evaluate((element) => [...element.querySelectorAll('*')].filter((node) => /monospace/i.test(getComputedStyle(node).fontFamily)).map((node) => `${node.tagName}.${node.className}`));
    assert.deepEqual(monospace, [], 'Catalog text must use proportional typography.');
  };
  const noOverflow = async () => {
    const dimensions = await page.evaluate(() => {
      const shell = document.querySelector('.eui-catalog');
      return { page: document.documentElement.scrollWidth, viewport: innerWidth, shell: shell.scrollWidth, width: shell.clientWidth };
    });
    assert.ok(dimensions.page <= dimensions.viewport + 1 && dimensions.shell <= dimensions.width + 1, `Horizontal overflow: ${JSON.stringify(dimensions)}`);
  };

  await check('manifest preserves every built Storybook fixture', async () => {
    const manifest = JSON.parse(await readFile(resolve(root, '.storybook/catalog/manifest.json'), 'utf8'));
    const index = await (await fetch(`${url}/index.json`)).json();
    const expected = Object.values(index.entries).filter((entry) => entry.type === 'story').map((entry) => entry.id).sort();
    const actual = manifest.components.flatMap((component) => [...component.react, ...component.astro]).map((entry) => entry.id).sort();
    assert.deepEqual(actual, expected);
  });
  await check('root opens the component catalog', async () => {
    await visit();
    assert.equal(new URL(page.url()).searchParams.get('path'), '/catalog/');
    await page.getByRole('heading', { name: 'Enough to build on.', exact: true }).waitFor();
    assert.ok(await page.locator('.eui-grid .eui-tile').count() > 50);
    await fonts();
    await noOverflow();
    await page.screenshot({ path: resolve(output, 'desktop-index.png') });
  });
  await check('search, category filters, and empty reset', async () => {
    await visit();
    const total = await page.locator('.eui-grid .eui-tile').count();
    const search = page.getByRole('searchbox', { name: 'Find a component' });
    await search.fill('button');
    await page.locator('.eui-grid .eui-tile').filter({ has: page.getByRole('heading', { name: 'Button', exact: true }) }).waitFor();
    assert.ok(await page.locator('.eui-grid .eui-tile').count() < total);
    await search.fill('no such component xyz');
    await page.getByRole('heading', { name: 'No components found', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    assert.equal(await search.inputValue(), '');
    assert.equal(await page.locator('.eui-grid .eui-tile').count(), total);
    const forms = page.getByRole('group', { name: 'Filter by category' }).getByRole('button', { name: 'Forms', exact: true });
    await forms.click();
    assert.equal(await forms.getAttribute('aria-pressed'), 'true');
    const categories = await page.locator('.eui-grid .eui-tile-meta > span:first-child').allTextContents();
    assert.ok(categories.length > 0 && categories.every((category) => category === 'Forms'));
    await page.getByRole('group', { name: 'Filter by category' }).getByRole('button', { name: 'All components', exact: true }).click();
    assert.equal(await page.locator('.eui-grid .eui-tile').count(), total);
  });
  await check('component navigation and React live controls', async () => {
    await visit();
    await page.locator('.eui-grid .eui-tile').filter({ has: page.getByRole('heading', { name: 'Button', exact: true }) }).click();
    await page.getByRole('heading', { name: 'Button', exact: true, level: 1 }).waitFor();
    await frame().getByRole('button', { name: 'Button', exact: true }).waitFor();
    await page.locator('.eui-controls').getByLabel('variant', { exact: true }).selectOption('accent');
    await page.waitForFunction(() => new URL(document.querySelector('.eui-playground iframe').src).searchParams.get('args')?.includes('variant:accent'));
    await frame().getByRole('button', { name: 'Button', exact: true }).waitFor();
    assert.match(await frame().getByRole('button', { name: 'Button', exact: true }).getAttribute('class'), /bg-\[var\(--color-accent\)\]/);
    await page.locator('.eui-controls').getByLabel('children', { exact: true }).fill('Launch project');
    await frame().getByRole('button', { name: 'Launch project', exact: true }).waitFor();
    await page.locator('.eui-catalog').evaluate((element) => element.scrollTop = 0);
    await page.screenshot({ path: resolve(output, 'desktop-component.png') });
    await page.getByRole('button', { name: 'Reset example', exact: true }).click();
    await frame().getByRole('button', { name: 'Button', exact: true }).waitFor();
    assert.equal(new URL(await page.locator('.eui-playground iframe').getAttribute('src'), url).searchParams.has('args'), false);
  });
  await check('example selection and native Astro rendering', async () => {
    await visit('?path=/catalog/button');
    await page.getByLabel('Example', { exact: true }).selectOption('ui-button--outline');
    await frame().getByRole('button', { name: 'Button', exact: true }).waitFor();
    assert.equal(new URL(await page.locator('.eui-playground iframe').getAttribute('src'), url).searchParams.get('id'), 'ui-button--outline');
    await page.getByRole('group', { name: 'Renderer', exact: true }).getByRole('button', { name: /^Astro/ }).click();
    await frame().getByRole('button', { name: 'Get started', exact: true }).waitFor();
    assert.equal(await frame().locator('#storybook-root astro-island').count(), 0);
    assert.equal(await page.locator('.eui-controls').count(), 0, 'Static native previews must not advertise unsupported live args controls.');
    await page.getByLabel('Example', { exact: true }).selectOption('astro-button--accent');
    await page.waitForFunction(() => new URL(document.querySelector('.eui-playground iframe').src).searchParams.get('id') === 'astro-button--accent');
    await page.waitForFunction(() => document.querySelector('.eui-playground iframe')?.contentDocument?.querySelector('[data-slot="button"]')?.classList.contains('bg-[var(--color-accent)]'));
    await frame().getByRole('button', { name: 'Get started', exact: true }).waitFor();
    assert.match(await frame().getByRole('button', { name: 'Get started', exact: true }).getAttribute('class'), /bg-\[var\(--color-accent\)\]/);
    await page.getByLabel('Example', { exact: true }).selectOption('astro-button--link');
    await frame().getByRole('link', { name: 'Get started', exact: true }).waitFor();
    assert.equal(await frame().getByRole('link', { name: 'Get started', exact: true }).getAttribute('href'), '#start');
  });
  await check('source inspection and clipboard copy', async () => {
    await visit('?path=/catalog/button&renderer=react&example=ui-button--accent');
    await page.getByRole('tab', { name: 'Source', exact: true }).click();
    await page.locator('.eui-source .monaco-editor').waitFor();
    const source = await page.evaluate(async () => {
      const { monaco } = await import('/editor/editor.js');
      return monaco.editor.getEditors()[0].getValue();
    });
    assert.match(source, /@enoughtools\/ui-react\/button/);
    assert.match(source, /export const Accent: Story/);
    try { await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: url }); }
    catch { notes.push('Clipboard permissions unavailable; source text and copy control verified.'); return; }
    await page.getByRole('button', { name: 'Copy source', exact: true }).click();
    await page.getByRole('button', { name: 'Copied', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source);
    await page.getByRole('tab', { name: 'Source', exact: true }).focus();
    await page.keyboard.press('Home');
    assert.equal(await page.getByRole('tab', { name: 'Preview', exact: true }).getAttribute('aria-selected'), 'true');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.getByRole('tab', { name: 'Source', exact: true }).getAttribute('aria-selected'), 'true');
    assert.equal(await page.getByRole('tab', { name: 'Source', exact: true }).evaluate((element) => document.activeElement === element), true);
    await fonts();
  });
  await check('usage imports preserve compound React and native Astro exports', async () => {
    await visit('?path=/catalog/chart');
    const chart = await page.locator('.eui-import code').textContent();
    assert.match(chart, /ChartContainer/);
    assert.match(chart, /@enoughtools\/ui-react\/chart/);
    await visit('?path=/catalog/conversation&renderer=astro');
    const conversation = await page.locator('.eui-import code').textContent();
    assert.match(conversation, /import Message from ['"]@enoughtools\/ui-astro\/message/);
  });
  await check('deep links retain renderer and example', async () => {
    await visit('?path=/catalog/button&renderer=astro&example=astro-button--outline');
    assert.equal(await page.getByRole('group', { name: 'Renderer', exact: true }).getByRole('button', { name: /^Astro/ }).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.getByLabel('Example', { exact: true }).inputValue(), 'astro-button--outline');
    await frame().getByRole('button', { name: 'Get started', exact: true }).waitFor();
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.getByLabel('Example', { exact: true }).inputValue(), 'astro-button--outline');
  });
  await check('browser back returns to the component index', async () => {
    await visit();
    await page.locator('.eui-grid .eui-tile').filter({ has: page.getByRole('heading', { name: 'Button', exact: true }) }).click();
    await page.getByRole('heading', { name: 'Button', exact: true, level: 1 }).waitFor();
    await page.goBack({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Enough to build on.', exact: true }).waitFor();
  });
  for (const [name, path] of [['index', ''], ['component', '?path=/catalog/button'], ['source', '?path=/catalog/button'], ['setup', '?path=/catalog/getting-started']]) {
    await check(`desktop ${name} accessibility and typography`, async () => {
      await visit(path);
      if (name === 'source') await page.getByRole('tab', { name: 'Source', exact: true }).click();
      await scan();
      await fonts();
    });
  }
  await check('mobile menu navigation and layout', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit();
    await noOverflow();
    await page.getByRole('button', { name: 'Open component menu', exact: true }).click();
    assert.equal(await page.locator('.eui-sidebar').getAttribute('class'), 'eui-sidebar is-open');
    await page.getByRole('navigation', { name: 'Components', exact: true }).getByRole('link', { name: /^Button(?: Native Astro available)?$/ }).click();
    await page.getByRole('heading', { name: 'Button', exact: true, level: 1 }).waitFor();
    await page.getByRole('button', { name: 'Open component menu', exact: true }).waitFor();
    await frame().getByRole('button', { name: 'Button', exact: true }).waitFor();
    await noOverflow();
    await scan();
    await page.screenshot({ path: resolve(output, 'mobile-component.png') });
    await page.getByRole('button', { name: 'Open component menu', exact: true }).click();
    await page.getByRole('button', { name: 'Close component menu', exact: true }).first().click();
    assert.equal(await page.getByRole('button', { name: 'Open component menu', exact: true }).getAttribute('aria-expanded'), 'false');
  });
  await check('standard Storybook workbench remains available', async () => {
    await page.setViewportSize({ width: 1440, height: 1040 });
    await visit('?path=/catalog/button');
    await page.getByRole('link', { name: /^Storybook/ }).click();
    await page.locator('#storybook-preview-iframe').waitFor();
    assert.equal(new URL(page.url()).searchParams.get('path'), '/story/ui-button--ink');
    await page.frameLocator('#storybook-preview-iframe').getByRole('button', { name: 'Button', exact: true }).waitFor();
    assert.equal(await page.locator('.eui-catalog').count(), 0);
  });
  await writeFile(resolve(output, 'report.json'), `${JSON.stringify({ verified, failures, notes, consoleErrors: [...new Set(observedConsoleErrors)] }, null, 2)}\n`);
  console.log(`Catalog verification: ${verified.length} checks passed; ${failures.length} failures. Screenshots and report: artifacts/catalog.`);
  if (failures.length) process.exitCode = 1;
} finally {
  await browser?.close();
  if (server) await new Promise((done) => server.close(done));
}

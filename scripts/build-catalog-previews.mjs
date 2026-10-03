import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const built = resolve(root, 'storybook-static');
const output = resolve(root, '.storybook/catalog/previews');
const published = resolve(built, 'previews');
const dimensions = { width: 720, height: 440 };
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };

// These are existing stories, including native Astro fixtures. Keep the card
// image useful by choosing a visible composition and opening transient UI.
const examples = {
  alert: { id: 'ui-alert--with-icon', width: 480 },
  'alert-dialog': { click: ['button', 'Show Dialog'], capture: '[data-slot="alert-dialog-content"]' },
  attachment: { id: 'ui-attachment--image-group' },
  avatar: { id: 'ui-avatar--group' },
  button: { id: 'ui-button--accent' },
  carousel: { capture: '#storybook-root, #storybook-root button' },
  chart: { width: 640 },
  collapsible: { click: ['button', 'Expand repositories'] },
  combobox: { id: 'ui-combobox--open', width: 340, capture: '#storybook-root [data-slot="input-group"], [data-slot="combobox-content"]' },
  'context-menu': { id: 'ui-context-menu--with-selections', rightClick: 'Right-click to configure the view', capture: '#storybook-root, [role="menu"]' },
  conversation: { width: 560 },
  'country-heatmap': { width: 800 },
  'data-table': { id: 'ui-data-table--compact-page', width: 720 },
  'date-picker': { id: 'ui-date-picker--open', width: 340, capture: '[data-slot="date-picker-trigger"], [data-slot="popover-content"]' },
  dialog: { click: ['button', 'Edit project'], capture: '[data-slot="dialog-content"]' },
  drawer: { click: ['button', 'Open drawer'], capture: '[data-slot="drawer-content"]', compactPanel: true },
  'dropdown-menu': { click: ['button', 'Project actions'], capture: '#storybook-root, [role="menu"]' },
  empty: { width: 480 },
  field: { id: 'ui-field--settings-group', width: 460 },
  'field-error': { id: 'astro-fielderror--multiple', width: 360 },
  form: { width: 400 },
  'group-label': { id: 'astro-grouplabel--accent' },
  'hover-card': { hover: ['button', '@atlas'], capture: '#storybook-root, [data-radix-popper-content-wrapper] > div[data-state="open"]' },
  input: { width: 340 },
  'input-group': { id: 'ui-input-group--with-action', width: 400 },
  item: { id: 'ui-item--rich-content', width: 480 },
  kbd: { id: 'ui-kbd--key-combination' },
  label: { width: 340 },
  marker: { id: 'ui-marker--in-context', width: 540 },
  menubar: { click: ['menuitem', 'File'], capture: '[role="menubar"], [role="menu"]' },
  message: { width: 560 },
  'message-scroller': { width: 560 },
  'navigation-menu': { click: ['button', 'Products'], capture: '[data-slot="navigation-menu"], [data-slot="navigation-menu-viewport"]' },
  popover: { id: 'ui-popover--default', click: ['button', 'Edit dimensions'], capture: '#storybook-root, [data-slot="popover-content"]' },
  progress: { id: 'ui-progress--with-label', width: 420 },
  questionnaire: { width: 560 },
  'search-field': { width: 580 },
  select: { click: ['combobox', 'Framework'], capture: '[data-slot="select-trigger"], [role="listbox"]' },
  separator: { width: 420, height: 80 },
  sheet: { click: ['button', 'Edit profile'], capture: '[role="dialog"].drawer-sheet-content', compactPanel: true },
  sidebar: { width: 1060, height: 650 },
  skeleton: { id: 'ui-skeleton--profile' },
  slider: { id: 'ui-slider--with-value', width: 400 },
  sonner: { id: 'ui-sonner--persistent-preview', capture: '[data-sonner-toast]' },
  spinner: { id: 'ui-spinner--with-text' },
  switch: { id: 'ui-switch--settings', width: 440 },
  table: { width: 680 },
  tabs: { width: 480 },
  textarea: { id: 'ui-textarea--with-value', width: 400 },
  toast: { id: 'ui-toast--with-action', click: ['button', 'Show toast'], capture: 'li[data-state="open"]' },
  toaster: { click: ['button', 'Show notification'], capture: 'li[data-state="open"]' },
  toggle: { id: 'ui-toggle--states' },
  'tool-row': { width: 460 },
  tooltip: { id: 'ui-tooltip--default', hover: ['button', 'Publish draft'], capture: '#storybook-root, [data-slot="tooltip-content"]' },
  'top-nav': { id: 'astro-topnav--with-action', width: 1000 },
  typography: { id: 'ui-typography--scale', width: 720 },
};

let server;
let browser;

async function serve() {
  await stat(resolve(built, 'index.json')).catch(() => { throw new Error('Build Storybook before generating catalog previews.'); });
  server = createServer(async (request, response) => {
    try {
      const path = resolve(built, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
      if (path !== built && !path.startsWith(built + sep)) { response.writeHead(403).end(); return; }
      const file = (await stat(path)).isDirectory() ? resolve(path, 'index.html') : path;
      response.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' });
      response.end(await readFile(file));
    } catch { response.writeHead(404).end('Not found'); }
  });
  await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done); });
  return `http://127.0.0.1:${server.address().port}`;
}

async function compose(page, screenshot, background) {
  // Compose the actual browser capture into a fixed canvas without cropping.
  // No generated illustrations or substitute markup stand in for components.
  return page.evaluate(async ({ encoded, background, dimensions }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${encoded}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    Object.assign(canvas, dimensions);
    const context = canvas.getContext('2d');
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(2, (canvas.width - 64) / image.width, (canvas.height - 64) / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let changed = 0;
    const bg = [...pixels.slice(0, 3)];
    for (let i = 0; i < pixels.length; i += 4) {
      if (Math.max(...bg.map((channel, index) => Math.abs(channel - pixels[i + index]))) > 16) changed++;
    }
    if (changed < 250) throw new Error(`Blank preview: only ${changed} pixels differ from the background.`);
    return { encoded: canvas.toDataURL('image/png').split(',')[1], changed, source: { width: image.width, height: image.height } };
  }, { encoded: screenshot.toString('base64'), background, dimensions });
}

async function captureComponent(context, compositionPage, url, component) {
  const config = examples[component.slug] ?? {};
  const stories = [...component.react, ...component.astro];
  const story = config.id ? stories.find((entry) => entry.id === config.id) : stories[0];
  assert.ok(story, `Missing preview fixture for ${component.slug}: ${config.id}`);
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.setDefaultTimeout(12000);
  await page.route('**/*', async (route) => {
    const request = new URL(route.request().url());
    if (['data:', 'blob:'].includes(request.protocol) || request.origin === new URL(url).origin) return route.continue();
    external.push(request.origin + request.pathname);
    return route.abort('blockedbyclient');
  });
  try {
    // Embed disables Storybook play functions: interactions below are deliberate
    // setup for one image, never a story test that changes the example midway.
    await page.goto(`${url}/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story&embed=true`, { waitUntil: 'networkidle' });
    await page.locator('#storybook-root').waitFor();
    await page.waitForFunction(() => document.querySelector('#storybook-root')?.children.length > 0);
    const storyError = await page.locator('.sb-errordisplay, #error-message').filter({ visible: true }).count();
    assert.equal(storyError, 0, `Storybook could not render ${story.id}`);
    await page.addStyleTag({ content: `
      html, body { min-height: 100%; margin: 0 !important; overflow: visible !important; }
      body { padding: 32px !important; background: var(--color-paper); }
      #storybook-root { position: relative; width: ${config.width ? `${config.width}px` : 'max-content'}; max-width: none; margin: 0 auto; padding: 0; }
      #storybook-root > :first-child { min-height: 0; }
      ${config.height ? `#storybook-root, #storybook-root > :first-child { height: ${config.height}px; }` : ''}
      ${component.slug === 'separator' ? '#storybook-root { display: flex; align-items: center; } #storybook-root > :first-child { height: 1px; width: 100%; }' : ''}
      ${component.slug === 'sidebar' ? '#storybook-root > :first-child { position: relative; } [data-slot="sidebar-container"] { position: absolute !important; inset: 0 auto auto 0 !important; height: 650px !important; }' : ''}
      *, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; caret-color: transparent !important; }
    ` });
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => image.decode().catch(() => {}))); });
    await page.waitForTimeout(150);
    if (config.click) await page.getByRole(config.click[0], { name: config.click[1], exact: true }).click();
    if (config.rightClick) await page.getByText(config.rightClick, { exact: true }).click({ button: 'right', position: { x: 24, y: 16 } });
    if (config.hover) await page.getByRole(config.hover[0], { name: config.hover[1], exact: true }).hover();
    if (config.capture) {
      // A union may also include the always-visible trigger. Wait for the last
      // selector (the popup) so a closed overlay cannot pass as a useful image.
      await page.locator(config.capture.split(',').at(-1).trim()).filter({ visible: true }).first().waitFor();
    }
    await page.waitForTimeout(350);
    await page.evaluate(() => {
      document.activeElement?.blur();
      document.getSelection()?.removeAllRanges();
    });
    if (config.compactPanel) {
      await page.locator(config.capture).filter({ visible: true }).evaluateAll((elements) => {
        for (const element of elements) {
          Object.assign(element.style, { position: 'relative', inset: 'auto', height: 'auto', width: '460px', maxHeight: 'none', maxWidth: 'none', margin: '32px auto', transform: 'none' });
          for (const child of element.children) if (/^(sheet|drawer)-body$/.test(child.dataset.slot ?? '')) child.style.flex = 'none';
        }
      });
    }
    const selector = config.capture ?? '#storybook-root';
    const fontViolations = await page.locator(selector).filter({ visible: true }).evaluateAll((elements) => elements.flatMap((element) => [element, ...element.querySelectorAll('*')]).filter((element) => /monospace/i.test(getComputedStyle(element).fontFamily)).map((element) => element.tagName));
    assert.deepEqual(fontViolations, [], `${component.slug} uses a monospace font`);
    const bounds = await page.locator(selector).filter({ visible: true }).evaluateAll((elements) => {
      const content = elements.flatMap((element) => element.id === 'storybook-root' && element.firstElementChild ? [element, element.firstElementChild] : [element]);
      const rectangles = content.map((element) => element.getBoundingClientRect()).filter((rect) => rect.width > 0 && rect.height > 0);
      if (!rectangles.length) return null;
      return { x: Math.min(...rectangles.map((rect) => rect.left)), y: Math.min(...rectangles.map((rect) => rect.top)), right: Math.max(...rectangles.map((rect) => rect.right)), bottom: Math.max(...rectangles.map((rect) => rect.bottom)) };
    });
    assert.ok(bounds && bounds.right - bounds.x >= 10 && bounds.bottom - bounds.y >= 10, `No visible content for ${story.id}`);
    const padding = 12;
    const clip = { x: Math.max(0, Math.floor(bounds.x - padding)), y: Math.max(0, Math.floor(bounds.y - padding)) };
    clip.width = Math.ceil(bounds.right + padding - clip.x);
    clip.height = Math.ceil(bounds.bottom + padding - clip.y);
    const screenshot = await page.screenshot({ clip, animations: 'disabled' });
    assert.deepEqual(external, [], `${story.id} requires an external asset`);
    assert.deepEqual([...new Set(errors)], [], `${story.id} raised browser errors`);
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor || '#f5f3ee');
    const preview = await compose(compositionPage, screenshot, background);
    const path = resolve(output, `${component.slug}.png`);
    await writeFile(path, Buffer.from(preview.encoded, 'base64'));
    await copyFile(path, resolve(published, `${component.slug}.png`));
    return { slug: component.slug, story: story.id, ...dimensions, source: preview.source, contentPixels: preview.changed };
  } finally { await page.close(); }
}

try {
  const manifest = JSON.parse(await readFile(resolve(root, '.storybook/catalog/manifest.json'), 'utf8'));
  const onlyArgument = process.argv.find((argument) => argument.startsWith('--only='));
  const only = onlyArgument?.slice('--only='.length).split(',');
  const components = only ? manifest.components.filter((component) => only.includes(component.slug)) : manifest.components;
  if (only) assert.equal(components.length, only.length, 'Unknown component passed to --only');
  await Promise.all([mkdir(output, { recursive: true }), mkdir(published, { recursive: true })]);
  const url = await serve();
  const builtIndex = JSON.parse(await readFile(resolve(built, 'index.json'), 'utf8'));
  for (const component of components) {
    const id = examples[component.slug]?.id ?? component.react[0]?.id ?? component.astro[0]?.id;
    assert.ok(builtIndex.entries[id], `Build Storybook again: the preview fixture ${id} is missing.`);
  }
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light' });
  const queue = [...components];
  const previews = [];
  const failures = [];
  const concurrency = Math.min(4, Math.max(1, Number(process.env.CATALOG_PREVIEW_CONCURRENCY) || 4));
  await Promise.all(Array.from({ length: concurrency }, async () => {
    const compositionPage = await context.newPage();
    while (queue.length) {
      const component = queue.shift();
      try { previews.push(await captureComponent(context, compositionPage, url, component)); }
      catch (error) { failures.push({ slug: component.slug, message: error.message }); console.error(`Preview ${component.slug}: ${error.message}`); }
    }
    await compositionPage.close();
  }));
  if (!only) {
    const report = { dimensions, previews: previews.sort((a, b) => a.slug.localeCompare(b.slug)), failures };
    await writeFile(resolve(output, 'index.json'), `${JSON.stringify(report, null, 2)}\n`);
    await copyFile(resolve(output, 'index.json'), resolve(published, 'index.json'));
    if (!failures.length) {
      const review = resolve(root, 'artifacts/catalog');
      await mkdir(review, { recursive: true });
      const images = await Promise.all(previews.map(async (preview) => ({ slug: preview.slug, encoded: (await readFile(resolve(output, `${preview.slug}.png`))).toString('base64') })));
      const reviewPage = await context.newPage();
      const montage = await reviewPage.evaluate(async (images) => {
        const columns = 8;
        const tileWidth = 240;
        const tileHeight = 170;
        const canvas = document.createElement('canvas');
        canvas.width = columns * tileWidth;
        canvas.height = Math.ceil(images.length / columns) * tileHeight;
        const drawing = canvas.getContext('2d');
        drawing.fillStyle = '#f4f5f8';
        drawing.fillRect(0, 0, canvas.width, canvas.height);
        drawing.font = '600 13px Arial, sans-serif';
        drawing.textAlign = 'center';
        for (let index = 0; index < images.length; index++) {
          const entry = images[index];
          const image = new Image();
          image.src = `data:image/png;base64,${entry.encoded}`;
          await image.decode();
          const x = (index % columns) * tileWidth;
          const y = Math.floor(index / columns) * tileHeight;
          drawing.drawImage(image, x, y, tileWidth, tileWidth * image.height / image.width);
          drawing.fillStyle = '#12151c';
          drawing.fillText(entry.slug, x + tileWidth / 2, y + tileHeight - 8);
        }
        return canvas.toDataURL('image/png').split(',')[1];
      }, images);
      await writeFile(resolve(review, 'previews.png'), Buffer.from(montage, 'base64'));
      await reviewPage.close();
    }
  }
  console.log(`Catalog previews: ${previews.length}/${components.length} real Storybook fixtures captured at ${dimensions.width}×${dimensions.height}.`);
  if (failures.length) throw new Error(`${failures.length} component previews failed. Fix the fixtures or capture selections before publishing.`);
} finally {
  await browser?.close();
  if (server) await new Promise((done) => server.close(done));
}

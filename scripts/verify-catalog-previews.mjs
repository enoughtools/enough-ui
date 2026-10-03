import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = resolve(root, 'storybook-static');
const output = resolve(root, 'artifacts/catalog-previews');
const manifest = JSON.parse(await readFile(resolve(root, '.storybook/catalog/manifest.json'), 'utf8'));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const verified = [];
const failures = [];
const runtimeErrors = [];
let server;
let browser;
let page;
let url = process.env.STORYBOOK_URL?.replace(/\/$/, '');

try {
  await mkdir(output, { recursive: true });
  if (!url) {
    await stat(resolve(catalog, 'index.json')).catch(() => { throw new Error('Build the catalog and its previews first: pnpm build-storybook'); });
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
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  const visit = async (query = '') => {
    await page.goto(`${url}/${query}`, { waitUntil: 'networkidle' });
    await page.locator('.eui-catalog').waitFor();
  };
  const check = async (name, action) => {
    const initialErrors = runtimeErrors.length;
    try {
      await action();
      assert.deepEqual(runtimeErrors.slice(initialErrors), [], 'Catalog or map preview has a runtime error.');
      verified.push(name);
      console.log(`Passed: ${name}`);
    } catch (error) {
      failures.push({ name, message: error.message, url: page.url() });
      await page.screenshot({ path: resolve(output, `failure-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`) }).catch(() => {});
      console.error(`${name}: ${error.message}`);
    }
  };
  const waitForImages = async () => {
    await page.locator('.eui-tile-preview img').evaluateAll(async (images) => {
      await Promise.all(images.map(async (image) => { image.loading = 'eager'; await image.decode(); }));
    });
    const images = await page.locator('.eui-tile-preview img').evaluateAll((elements) => elements.map((image) => ({ src: image.getAttribute('src'), complete: image.complete, width: image.naturalWidth, height: image.naturalHeight })));
    assert.equal(images.length, manifest.components.length);
    assert.ok(images.every((image) => image.complete && image.width > 0 && image.height > 0), 'Every component card must display a decoded preview image.');
  };

  await check('all component preview files are published as PNG images', async () => {
    assert.equal(manifest.components.length, manifest.stats.components);
    const errors = [];
    for (let offset = 0; offset < manifest.components.length; offset += 8) {
      await Promise.all(manifest.components.slice(offset, offset + 8).map(async (component) => {
        try {
          const response = await context.request.get(`${url}/previews/${component.slug}.png`, { timeout: 20000 });
          assert.equal(response.status(), 200, `${component.slug}: image request failed.`);
          assert.match(response.headers()['content-type'] ?? '', /image\/png/, `${component.slug}: expected PNG content type.`);
          const image = await response.body();
          assert.ok(image.length > 1024, `${component.slug}: image is empty or too small.`);
          assert.ok(image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${component.slug}: invalid PNG signature.`);
          assert.ok(image.readUInt32BE(16) > 0 && image.readUInt32BE(20) > 0, `${component.slug}: invalid PNG dimensions.`);
        } catch (error) { errors.push(error.message); }
      }));
    }
    assert.deepEqual(errors, []);
  });
  await check('desktop catalog displays every preview and features Country Heatmap', async () => {
    await visit();
    await waitForImages();
    assert.equal(await page.locator('.eui-grid .eui-tile').count(), manifest.components.length);
    assert.equal(await page.locator('.eui-grid .eui-tile h2').first().textContent(), 'Country Heatmap');
    await page.screenshot({ path: resolve(output, 'desktop-index.png') });
  });

  let firstMapPresentation;
  const heatmap = manifest.components.find((component) => component.slug === 'country-heatmap');
  assert.ok(heatmap, 'Country Heatmap must be included in the component manifest.');
  await check('catalog opens the Country Heatmap playground', async () => {
    await page.locator('.eui-grid .eui-tile').filter({ has: page.getByRole('heading', { name: 'Country Heatmap', exact: true }) }).click();
    await page.getByRole('heading', { level: 1, name: 'Country Heatmap', exact: true }).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('path'), '/catalog/country-heatmap');
  });
  for (const renderer of ['react', 'astro']) {
    await check(`${renderer} map renders country geometry and its keyboard-accessible data table`, async () => {
      const example = heatmap[renderer].find((story) => story.name === 'Default');
      assert.ok(example, `${renderer} default map fixture must exist.`);
      await page.getByRole('group', { name: 'Renderer', exact: true }).getByRole('button', { name: renderer === 'react' ? /^React/ : /^Astro/ }).click();
      await page.getByLabel('Example', { exact: true }).selectOption(example.id);
      const frame = page.frameLocator('.eui-playground iframe');
      const map = frame.getByRole('img', { name: 'Activity around the world', exact: true });
      await map.waitFor({ state: 'visible' });
      assert.equal(new URL(await page.locator('.eui-playground iframe').getAttribute('src'), url).searchParams.get('id'), example.id);
      const details = frame.locator('[data-slot="country-heatmap-data"]');
      const summary = details.locator('summary');
      const table = frame.getByRole('table', { name: 'Activity around the world: Sessions', exact: true });
      if (await details.getAttribute('open') !== null) await summary.click();
      await table.waitFor({ state: 'hidden' });
      await summary.focus();
      await page.keyboard.press('Enter');
      await table.waitFor({ state: 'visible' });
      assert.equal(await table.locator('tbody tr').count(), 14);
      assert.match(await table.locator('tr[data-country="NZ"]').textContent(), /New ZealandNZ0/);
      assert.match(await table.locator('tr[data-country="IS"]').textContent(), /IcelandISNo data/);
      assert.match(await table.locator('tr[data-country="SG"]').textContent(), /SingaporeSGNot shown at this map scale125/);
      assert.equal(await map.locator('path[data-country="SG"]').count(), 0);
      const presentation = await map.evaluate((svg) => ({
        title: document.getElementById(svg.getAttribute('aria-labelledby'))?.textContent,
        description: document.getElementById(svg.getAttribute('aria-describedby'))?.textContent,
        paths: [...svg.querySelectorAll('path')].map((path) => ({ code: path.getAttribute('data-country'), state: path.getAttribute('data-state'), geometry: path.getAttribute('d'), fill: getComputedStyle(path).fill })),
      }));
      assert.ok(presentation.paths.length > 150, 'The world map must contain real country geometry.');
      assert.ok(presentation.paths.every((path) => path.geometry?.length > 10));
      const zero = presentation.paths.find((path) => path.code === 'NZ');
      const missing = presentation.paths.find((path) => path.code === 'IS');
      assert.equal(zero.state, 'zero');
      assert.equal(missing.state, 'no-data');
      assert.notEqual(zero.fill, missing.fill, 'A measured zero and missing data need different colors.');
      if (firstMapPresentation) assert.deepEqual(presentation, firstMapPresentation, 'React and Astro must render the same map and colors.');
      else firstMapPresentation = presentation;
      await page.keyboard.press('Space');
      await table.waitFor({ state: 'hidden' });
      // Capture the complete reusable story directly; the catalog iframe is
      // intentionally scrollable and would clip an element screenshot.
      const capture = await context.newPage();
      try {
        await capture.setViewportSize({ width: 1024, height: 900 });
        await capture.goto(`${url}/iframe.html?id=${encodeURIComponent(example.id)}&viewMode=story`, { waitUntil: 'networkidle' });
        await capture.getByRole('img', { name: 'Activity around the world', exact: true }).waitFor({ state: 'visible' });
        const capturedDetails = capture.locator('[data-slot="country-heatmap-data"]');
        if (await capturedDetails.getAttribute('open') !== null) await capturedDetails.locator('summary').click();
        await capture.locator('[data-slot="country-heatmap"]').screenshot({ path: resolve(output, `${renderer}-map-desktop.png`) });
      } finally { await capture.close(); }
      const localized = heatmap[renderer].find((story) => story.name === 'Localized');
      await page.getByLabel('Example', { exact: true }).selectOption(localized.id);
      await frame.getByRole('img', { name: 'Actividad por país', exact: true }).waitFor({ state: 'visible' });
      await frame.getByRole('table', { name: 'Actividad por país: Sesiones', exact: true }).waitFor({ state: 'visible' });
      await page.getByLabel('Example', { exact: true }).selectOption(example.id);
      await frame.getByRole('img', { name: 'Activity around the world', exact: true }).waitFor({ state: 'visible' });
    });
  }
  await check('mobile catalog displays previews without horizontal overflow', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit();
    await waitForImages();
    const dimensions = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth }));
    assert.ok(dimensions.document <= dimensions.width + 1, 'Mobile catalog must fit its viewport.');
    await page.screenshot({ path: resolve(output, 'mobile-index.png') });
  });

  await writeFile(resolve(output, 'report.json'), JSON.stringify({ url, components: manifest.components.length, verified, failures, runtimeErrors }, null, 2) + '\n');
  console.log(`Preview verification: ${manifest.components.length} images; ${verified.length} checks passed; ${failures.length} failures. Report and screenshots: artifacts/catalog-previews.`);
  if (failures.length) process.exitCode = 1;
} finally {
  await browser?.close();
  if (server) await new Promise((done) => server.close(done));
}

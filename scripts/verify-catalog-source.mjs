import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = resolve(root, 'storybook-static');
const output = resolve(root, 'artifacts/catalog-source');
const manifest = JSON.parse(await readFile(resolve(root, '.storybook/catalog/manifest.json'), 'utf8'));
const card = manifest.components.find((component) => component.slug === 'card');
assert.ok(card?.react.length && card?.astro.length, 'The source viewer needs shared React and Astro catalog fixtures.');
const reactDefault = card.react.find((example) => example.id === 'ui-card--default');
const astroDefault = card.astro.find((example) => example.id === 'astro-card--composed');
assert.ok(reactDefault && astroDefault);
const nativeMarker = (example) => {
  const marker = /\/\* ([^\n]+\.astro) — native example used by this story \*\/\r?\n/.exec(example.source);
  assert.ok(marker, `${example.id} must include its native Astro fixture.`);
  return marker;
};
const nativeSource = (example) => {
  const marker = nativeMarker(example);
  return example.source.slice(marker.index + marker[0].length).trim();
};
const nativeStorySource = (example) => example.source.slice(0, nativeMarker(example).index).trim();
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const verified = [];
const failures = [];
const runtimeErrors = [];
const consoleErrors = [];
const externalRequests = new Set();
// Cloudflare injects this verified site analytics script independently of
// Monaco. Keep it visible in the report; no other external URL is allowed.
const knownAnalyticsURL = 'https://static.cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85bb4c19e7a9bdbcba1788362987495';
let url = process.env.STORYBOOK_URL?.replace(/\/$/, '');
let server;
let browser;
let page;

try {
  await mkdir(output, { recursive: true });
  if (!url) {
    await stat(resolve(catalog, 'index.json')).catch(() => { throw new Error('Build Storybook with the Monaco viewer first: pnpm build-storybook'); });
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
  const origin = new URL(url).origin;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1040 }, reducedMotion: 'reduce' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  context.on('request', (request) => {
    const address = new URL(request.url());
    if (/^https?:$/.test(address.protocol) && address.origin !== origin) externalRequests.add(address.href);
  });
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  const check = async (name, action) => {
    try {
      await action();
      verified.push(name);
      console.log(`Passed: ${name}`);
    } catch (error) {
      failures.push({ name, message: error.message, url: page.url() });
      await page.screenshot({ path: resolve(output, `failure-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`) }).catch(() => {});
      console.error(`${name}: ${error.message}`);
    }
  };
  const editor = () => page.locator('.eui-source .monaco-editor');
  const editorInput = () => editor().getByRole('textbox', { name: 'Source code, read only', exact: true });
  const editorState = () => page.evaluate(async () => {
    const { monaco } = await import('/editor/editor.js');
    const host = document.querySelector('.eui-source');
    const instance = monaco.editor.getEditors().find((candidate) => host?.contains(candidate.getDomNode()));
    if (!instance?.getModel) throw new Error('Cannot inspect the mounted Monaco editor instance.');
    const model = instance.getModel();
    const options = instance.getRawOptions();
    return { value: model.getValue(), language: model.getLanguageId(), lines: model.getLineCount(), readOnly: options.readOnly, domReadOnly: options.domReadOnly, wordWrap: options.wordWrap };
  });
  const waitForSource = async (source) => {
    await editor().waitFor({ state: 'visible' });
    await page.waitForFunction(async (source) => {
      const { monaco } = await import('/editor/editor.js');
      const host = document.querySelector('.eui-source');
      const instance = monaco.editor.getEditors().find((candidate) => host?.contains(candidate.getDomNode()));
      return instance?.getModel?.()?.getValue().trim() === source.trim();
    }, source);
  };
  const copySource = async (expected) => {
    const copy = page.locator('.eui-preview-actions').getByRole('button', { name: /^(Copy source|Copied)$/ });
    await copy.click();
    await page.waitForFunction((source) => navigator.clipboard.readText().then((value) => value === source), expected);
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected, 'Copy must preserve the complete fixture source exactly.');
  };
  const tokenColors = () => editor().locator('.view-line span[class*="mtk"]').evaluateAll((tokens) => tokens.map((token) => ({ text: token.textContent?.replace(/\u00a0/g, ' '), color: getComputedStyle(token).color, family: getComputedStyle(token).fontFamily, classes: token.className })));
  const find = async (query) => {
    await page.getByRole('button', { name: 'Find in source', exact: true }).click();
    const widget = editor().locator('.find-widget');
    await widget.waitFor({ state: 'visible' });
    const input = widget.locator('.monaco-inputbox textarea, .monaco-inputbox input').first();
    await input.fill(query);
    await page.waitForFunction(() => {
      const count = document.querySelector('.eui-source .find-widget .matchesCount')?.textContent ?? '';
      return /\d/.test(count) && !/no results/i.test(count);
    });
    await editor().locator('.currentFindMatch').first().waitFor({ state: 'attached' });
    return input;
  };
  const showSource = async (renderer, example) => {
    const query = new URLSearchParams({ path: '/catalog/card', renderer, example: example.id });
    await page.goto(`${url}/?${query}`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Card', exact: true, level: 1 }).waitFor();
    await page.getByRole('tab', { name: 'Source', exact: true }).click();
    await waitForSource(renderer === 'astro' ? nativeSource(example) : example.source);
  };

  await check('React source uses a real readonly Monaco model with exact fixture text and line numbers', async () => {
    await showSource('react', reactDefault);
    const state = await editorState();
    assert.equal(state.value, reactDefault.source.trim());
    assert.equal(state.language, 'tsx');
    assert.equal(state.readOnly, true);
    assert.equal(state.domReadOnly, true);
    assert.equal(state.lines, reactDefault.source.trim().split('\n').length);
    assert.ok(await editor().locator('.line-numbers').count() > 5);
    await editorInput().focus();
    await page.keyboard.type('this text must not modify the source');
    assert.equal((await editorState()).value, reactDefault.source.trim(), 'Typing must leave the source model unchanged.');
    await copySource(reactDefault.source.trim());
  });
  await check('React source has distinct JSX syntax colors and working Find', async () => {
    const input = await find('<CardTitle');
    const icons = await editor().locator('.find-widget .codicon').evaluateAll((elements) => elements.map((element) => getComputedStyle(element).fontFamily));
    assert.ok(icons.length > 0 && icons.every((family) => /codicon/i.test(family)), 'Find controls must use the actual codicon icon font.');
    const font = await page.evaluate(async () => {
      const faces = await document.fonts.load('16px codicon');
      return { loaded: document.fonts.check('16px codicon'), faces: faces.map((face) => ({ family: face.family, status: face.status })) };
    });
    assert.ok(font.loaded && font.faces.length > 0 && font.faces.every((face) => face.status === 'loaded'), 'The self-hosted codicon font must load successfully.');
    await page.locator('.eui-source').screenshot({ path: resolve(output, 'react-source-find-desktop.png') });
    await input.press('Escape');
    const tokens = await tokenColors();
    assert.ok(tokens.some((token) => token.text?.includes('CardTitle')), 'Find must reveal the JSX tag.');
    assert.ok(new Set(tokens.filter((token) => token.text?.trim()).map((token) => token.color)).size >= 3, 'JSX must use distinct syntax colors.');
    assert.ok(tokens.every((token) => !/monospace/i.test(token.family)), 'Source tokens must use proportional typography.');
    await page.locator('.eui-source').screenshot({ path: resolve(output, 'react-source-desktop.png') });
  });
  await check('line wrapping can be toggled without changing or editing source', async () => {
    assert.equal((await editorState()).wordWrap, 'on');
    const wrap = page.getByRole('button', { name: 'Wrap lines', exact: true });
    await wrap.click();
    await page.waitForFunction(async () => {
      const { monaco } = await import('/editor/editor.js');
      const host = document.querySelector('.eui-source');
      return monaco.editor.getEditors().find((instance) => host?.contains(instance.getDomNode()))?.getRawOptions().wordWrap === 'off';
    });
    assert.equal((await editorState()).value, reactDefault.source.trim());
    await wrap.click();
    await page.waitForFunction(async () => {
      const { monaco } = await import('/editor/editor.js');
      const host = document.querySelector('.eui-source');
      return monaco.editor.getEditors().find((instance) => host?.contains(instance.getDomNode()))?.getRawOptions().wordWrap === 'on';
    });
  });
  await check('example changes keep Source selected and replace the Monaco model text', async () => {
    const next = card.react.find((example) => example.id !== reactDefault.id && example.source !== reactDefault.source);
    assert.ok(next, 'A second React fixture is required to check model updates.');
    await page.getByLabel('Example', { exact: true }).selectOption(next.id);
    assert.equal(await page.getByRole('tab', { name: 'Source', exact: true }).getAttribute('aria-selected'), 'true');
    await waitForSource(next.source);
    const state = await editorState();
    assert.equal(state.value, next.source.trim());
    assert.equal(state.readOnly, true);
    await copySource(next.source.trim());
  });
  await check('renderer changes keep Source selected and load native Astro highlighting', async () => {
    await page.getByRole('group', { name: 'Renderer', exact: true }).getByRole('button', { name: /^Astro/ }).click();
    await page.getByLabel('Example', { exact: true }).selectOption(astroDefault.id);
    assert.equal(await page.getByRole('tab', { name: 'Source', exact: true }).getAttribute('aria-selected'), 'true');
    await waitForSource(nativeSource(astroDefault));
    const state = await editorState();
    assert.equal(state.value.trim(), nativeSource(astroDefault));
    assert.equal(state.language, 'astro');
    assert.equal(state.readOnly, true);
    assert.match(state.value, /^---$/m);
    await copySource(state.value);
    const input = await find('---');
    await input.press('Escape');
    let tokens = await tokenColors();
    assert.ok(tokens.some((token) => token.text?.includes('---')), 'Astro frontmatter delimiters must be tokenized.');
    assert.ok(new Set(tokens.filter((token) => token.text?.trim()).map((token) => token.color)).size >= 3, 'Astro frontmatter must have syntax colors.');
    const tag = await find('<Card');
    await tag.press('Escape');
    tokens = await tokenColors();
    assert.ok(tokens.some((token) => /Card/.test(token.text ?? '')), 'Astro markup tags must be visible.');
    assert.ok(new Set(tokens.filter((token) => token.text?.trim()).map((token) => token.color)).size >= 3, 'Astro tags and attributes must have distinct colors.');
    assert.ok(tokens.every((token) => !/monospace/i.test(token.family)), 'Native Astro tokens must use proportional typography.');
    await page.locator('.eui-source').screenshot({ path: resolve(output, 'astro-source-desktop.png') });
  });
  await check('Astro source file selection separates the story from native component markup', async () => {
    const files = page.getByLabel('Source file', { exact: true });
    const options = await files.locator('option').evaluateAll((elements) => elements.map((element) => ({ value: element.value, label: element.textContent })));
    const nativeName = nativeMarker(astroDefault)[1];
    const native = options.find((option) => option.label?.includes(nativeName));
    const story = options.find((option) => /\.stories\.[jt]sx?$/.test(option.label ?? ''));
    assert.ok(native && story, 'Both the Storybook story and native Astro fixture must be selectable.');
    await files.selectOption(story.value);
    await waitForSource(nativeStorySource(astroDefault));
    let state = await editorState();
    assert.equal(state.language, 'javascript');
    assert.equal(state.value.trim(), nativeStorySource(astroDefault));
    assert.doesNotMatch(state.value, /^---$/m);
    await copySource(state.value);
    await files.selectOption(native.value);
    await waitForSource(nativeSource(astroDefault));
    state = await editorState();
    assert.equal(state.language, 'astro');
    assert.equal(state.value.trim(), nativeSource(astroDefault));
    await copySource(state.value);
  });
  await check('keyboard users can leave the readonly editor', async () => {
    const findInput = await find('Card');
    await findInput.press('Escape');
    await page.waitForFunction(() => {
      const widget = document.querySelector('.eui-source .find-widget');
      return widget?.getAttribute('aria-hidden') === 'true' && !widget.classList.contains('visible');
    });
    assert.equal(await editor().getByRole('dialog', { name: 'Find / Replace', exact: true }).count(), 0, 'Closed Find must leave the accessibility tree.');
    assert.equal(await page.getByRole('tab', { name: 'Source', exact: true }).evaluate((element) => document.activeElement === element), true, 'Escape must close Find and return focus to the Source tab.');
    await page.keyboard.press('Tab');
    assert.equal(await editor().evaluate((element) => element.contains(document.activeElement)), false, 'Escape then Tab must move keyboard focus out of the editor.');
  });
  await check('mobile React and Astro source viewers stay inside the viewport', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [renderer, example] of [['react', reactDefault], ['astro', astroDefault]]) {
      await showSource(renderer, example);
      const dimensions = await page.evaluate(() => {
        const shell = document.querySelector('.eui-catalog');
        const source = document.querySelector('.eui-source');
        const rectangle = source.getBoundingClientRect();
        return { viewport: innerWidth, document: document.documentElement.scrollWidth, shell: shell.scrollWidth, shellWidth: shell.clientWidth, left: rectangle.left, right: rectangle.right };
      });
      assert.ok(dimensions.document <= dimensions.viewport + 1 && dimensions.shell <= dimensions.shellWidth + 1, `Mobile source overflow: ${JSON.stringify(dimensions)}`);
      assert.ok(dimensions.left >= 0 && dimensions.right <= dimensions.viewport + 1, 'The Monaco source panel must fit the mobile viewport.');
      const fonts = await editor().locator('.view-line, .line-numbers').evaluateAll((elements) => [...new Set(elements.map((element) => getComputedStyle(element).fontFamily))]);
      assert.ok(fonts.every((font) => !/monospace/i.test(font)), 'Editor lines and numbers must use proportional typography.');
      await copySource((await editorState()).value);
      await page.screenshot({ path: resolve(output, `${renderer}-source-mobile.png`) });
    }
  });
  await check('Monaco assets stay self-hosted and the viewer has no browser errors', async () => {
    const unexpected = [...externalRequests].filter((address) => address !== knownAnalyticsURL);
    assert.deepEqual(unexpected, [], 'The source viewer must load its editor and workers from the site; only the verified Cloudflare analytics URL is allowed.');
    assert.deepEqual(runtimeErrors, [], 'The source viewer must not throw runtime errors.');
    assert.deepEqual([...new Set(consoleErrors)], [], 'The source viewer must not emit console errors.');
  });

  await writeFile(resolve(output, 'report.json'), JSON.stringify({ url, verified, failures, runtimeErrors, consoleErrors: [...new Set(consoleErrors)], externalRequests: [...externalRequests], knownAnalyticsRequests: [...externalRequests].filter((address) => address === knownAnalyticsURL), unexpectedExternalRequests: [...externalRequests].filter((address) => address !== knownAnalyticsURL) }, null, 2) + '\n');
  console.log(`Source viewer verification: ${verified.length} checks passed; ${failures.length} failures. Report and screenshots: artifacts/catalog-source.`);
  if (failures.length) process.exitCode = 1;
} finally {
  await browser?.close();
  if (server) await new Promise((done) => server.close(done));
}

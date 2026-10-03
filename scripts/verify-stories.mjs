import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = resolve(root, 'storybook-static');
const output = resolve(root, 'artifacts/storybook');
const filter = process.argv.find((arg) => arg.startsWith('--story='))?.slice(8);
const matches = (id) => !filter || filter.split(',').some((part) => id.includes(part));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
let server;
let browser;
const failures = [];
const verified = [];
const reportFailure = (id, stage, error) => {
  failures.push({ id, stage, message: error.message, ...(error.details ? { details: error.details } : {}) });
  console.error(`${id} (${stage}): ${error.message}`);
};

try {
  let url = process.env.STORYBOOK_URL;
  if (!url) {
    await stat(resolve(catalog, 'index.json')).catch(() => { throw new Error('Build the shared Astro/React Storybook first: pnpm build-storybook'); });
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
  const index = await (await fetch(`${url}/index.json`)).json();
  const stories = Object.values(index.entries).filter((entry) => entry.type === 'story' && matches(entry.id));
  assert.ok(stories.length, 'The catalog must contain stories matching the requested filter.');
  if (!filter) {
    assert.ok(stories.some((entry) => entry.title.startsWith('Astro/')), 'Native Astro stories must be present.');
    assert.ok(stories.some((entry) => entry.title.startsWith('UI/')), 'React stories must be present.');
  }
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  const visit = async (id) => {
    assert.ok(index.entries[id], `Missing story ${id}; component behavior must have a reusable catalog fixture.`);
    runtimeErrors.length = 0;
    await page.goto(`${url}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`, { waitUntil: 'networkidle' });
    try {
      await page.waitForFunction((empty) => {
        const story = document.querySelector('#storybook-root');
        const error = document.querySelector('.sb-errordisplay');
        return (error && getComputedStyle(error).display !== 'none' && error.getBoundingClientRect().height > 0) || (story && (empty || story.children.length > 0));
      }, id === 'astro-fielderror--empty');
    } catch (error) {
      error.details = {
        url: page.url(),
        runtimeErrors: [...runtimeErrors],
        render: await page.evaluate(() => ({
          readyState: document.readyState,
          root: document.querySelector('#storybook-root')?.outerHTML ?? null,
          errors: [...document.querySelectorAll('.sb-errordisplay')].filter((element) => getComputedStyle(element).display !== 'none').map((element) => element.textContent?.trim()),
        })),
      };
      throw error;
    }
    const errorDisplay = page.locator('.sb-errordisplay:visible');
    if (await errorDisplay.count()) throw new Error((await errorDisplay.textContent())?.trim() || 'Storybook rendering failed');
    assert.deepEqual(runtimeErrors, [], `${id} has a runtime error`);
  };
  const scan = async (id, stage = 'accessibility') => {
    const monospace = await page.evaluate(() => {
      // Component portals live outside the story root. Include their visible
      // content while excluding Storybook's hidden loading/docs scaffolding.
      const roots = document.querySelectorAll('#storybook-root, [data-slot], [role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [role="tooltip"], [data-radix-popper-content-wrapper], [data-sonner-toaster]');
      const elements = new Set([...roots].flatMap((root) => [root, ...root.querySelectorAll('*')]));
      return [...elements].filter((element) => {
        const style = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        return bounds.width > 0 && bounds.height > 0 && style.visibility === 'visible' && /monospace/i.test(style.fontFamily);
      }).map((element) => ({ tag: element.tagName, slot: element.getAttribute('data-slot'), role: element.getAttribute('role') }));
    });
    assert.deepEqual(monospace, [], `${id}: every rendered component, including portals, must use proportional typography.`);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    if (results.violations.length) {
      const error = new Error(`${stage}: ${results.violations.map((violation) => `${violation.id} (${violation.impact})`).join(', ')}`);
      error.details = results.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })) }));
      throw error;
    }
  };
  for (const [position, entry] of stories.entries()) {
    try {
      await visit(entry.id);
      await scan(entry.id);
      if (entry.title.startsWith('Astro/')) assert.equal(await page.locator('#storybook-root astro-island').count(), 0, 'Presentational Astro stories should render without hydration.');
      verified.push(entry.id);
    } catch (error) { reportFailure(entry.id, 'catalog', error); }
    if ((position + 1) % 50 === 0) console.log(`Catalog scan: ${position + 1}/${stories.length} stories; ${failures.length} failures.`);
  }
  const scenario = async (id, action) => {
    if (!matches(id)) return;
    try { await visit(id); await action(); assert.deepEqual(runtimeErrors, []); await scan(id, 'interaction state'); verified.push(`${id}:interaction`); }
    catch (error) { reportFailure(id, 'interaction', error); }
  };
  const focused = async (locator) => { const target = await locator.elementHandle(); assert.ok(target, 'The focus target must exist.'); await page.waitForFunction((element) => element === document.activeElement, target); };
  const focus = async (locator) => { await locator.focus(); await focused(locator); };
  const attr = async (locator, name, value) => { const element = await locator.elementHandle(); assert.ok(element); await page.waitForFunction(({ element, name, value }) => element.getAttribute(name) === value, { element, name, value }); };

  await scenario('ui-interactive-catalog--checkbox', async () => {
    const checkbox = page.getByRole('checkbox', { name: 'Accept terms' });
    await focus(checkbox); await page.keyboard.press('Space'); await attr(checkbox, 'aria-checked', 'true');
    assert.equal(await page.getByRole('checkbox', { name: 'Unavailable choice' }).isDisabled(), true);
  });
  await scenario('ui-interactive-catalog--dialog', async () => {
    const trigger = page.getByRole('button', { name: 'Open dialog' });
    await focus(trigger); await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Project settings' }); await dialog.waitFor();
    await page.waitForFunction((element) => element.contains(document.activeElement), await dialog.elementHandle());
    await scan('ui-interactive-catalog--dialog', 'open dialog');
    for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); await page.waitForFunction((element) => element.contains(document.activeElement), await dialog.elementHandle()); }
    await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' });
    await focused(trigger);
  });
  await scenario('ui-interactive-catalog--dropdown-menu', async () => {
    const trigger = page.getByRole('button', { name: 'Project actions' });
    await focus(trigger); await page.keyboard.press('ArrowDown');
    await page.getByRole('menuitem', { name: 'Rename project' }).waitFor();
    await focused(page.getByRole('menuitem', { name: 'Rename project' }));
    await page.keyboard.press('ArrowDown');
    await focused(page.getByRole('menuitem', { name: 'Duplicate project' }));
    assert.equal(await page.getByRole('menuitem', { name: 'Delete project' }).getAttribute('aria-disabled'), 'true');
    await page.keyboard.press('Escape'); await page.getByRole('menu').waitFor({ state: 'hidden' });
  });
  await scenario('ui-interactive-catalog--label', async () => { await page.getByText('Email address', { exact: true }).click(); assert.equal(await page.getByRole('textbox', { name: 'Email address' }).evaluate((element) => element === document.activeElement), true); });
  await scenario('ui-interactive-catalog--search-field', async () => { await focus(page.getByRole('button', { name: 'What do you need to ship?' })); await page.keyboard.press('Enter'); await page.getByRole('dialog', { name: 'Search your workspace' }).waitFor(); await focus(page.getByRole('textbox', { name: 'Search projects' })); });
  await scenario('ui-interactive-catalog--toaster', async () => { await page.getByRole('button', { name: 'Show notification' }).click(); await page.getByText('Project saved', { exact: true }).waitFor(); });
  await scenario('ui-interactive-catalog--tooltip', async () => { await focus(page.getByRole('button', { name: 'Save draft' })); await page.getByRole('tooltip').waitFor(); });
  await scenario('ui-tooltip--in-scroll-area', async () => {
    await focus(page.getByRole('button', { name: 'Archive project', exact: true }));
    const tooltip = page.getByRole('tooltip'); await tooltip.waitFor();
    assert.equal(await tooltip.evaluate((element) => Boolean(element.closest('[data-radix-scroll-area-viewport]'))), false, 'Tooltip content must escape the clipped viewport.');
  });
  await scenario('ui-switch--disabled', async () => { const switches = await page.getByRole('switch').all(); assert.equal(switches.length, 2); for (const control of switches) assert.equal(await control.isDisabled(), true); });
  await scenario('ui-tabs--with-disabled-tab', async () => {
    const first = page.getByRole('tab', { name: 'Published' }); await focus(first); await page.keyboard.press('ArrowRight');
    await attr(page.getByRole('tab', { name: 'Drafts' }), 'aria-selected', 'true');
    await page.keyboard.press('ArrowRight'); await focused(first);
    assert.equal(await page.getByRole('tab', { name: 'Archive' }).isDisabled(), true);
  });
  await scenario('ui-slider--steps', async () => { const slider = page.getByRole('slider'); await focus(slider); const start = Number(await slider.getAttribute('aria-valuenow')); await page.keyboard.press('ArrowRight'); await attr(slider, 'aria-valuenow', String(start + 10)); });
  await scenario('ui-radio-group--default', async () => { const radios = page.getByRole('radio'); await focus(radios.nth(0)); await page.keyboard.down('ArrowDown'); await focused(radios.nth(1)); await page.keyboard.up('ArrowDown'); await attr(radios.nth(1), 'aria-checked', 'true'); });
  await scenario('ui-combobox--default', async () => {
    const input = page.getByRole('combobox', { name: 'Framework', exact: true }); await focus(input); await input.fill('Astro');
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
    await page.getByRole('listbox').waitFor({ state: 'hidden' }); assert.equal(await input.inputValue(), 'Astro');
    await page.getByRole('status').filter({ hasText: 'Astro selected' }).waitFor();
  });
  await scenario('ui-combobox--disabled', async () => { assert.equal(await page.getByRole('combobox').isDisabled(), true); });
  await scenario('ui-select--default', async () => { const trigger = page.getByRole('combobox', { name: 'Framework' }); await focus(trigger); await page.keyboard.press('ArrowDown'); await page.getByRole('listbox').waitFor(); await page.keyboard.press('Enter'); await page.getByRole('listbox').waitFor({ state: 'hidden' }); assert.match(await trigger.textContent(), /Astro/); });
  await scenario('ui-drawer--default', async () => { const trigger = page.getByRole('button', { name: 'Open drawer' }); await focus(trigger); await page.keyboard.press('Enter'); const dialog = page.getByRole('dialog', { name: 'Project details' }); await dialog.waitFor(); await scan('ui-drawer--default', 'open drawer'); await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' }); assert.equal(await trigger.evaluate((element) => element === document.activeElement), true); });
  await scenario('ui-input-otp--default', async () => {
    const input = page.getByRole('textbox', { name: 'Verification code' });
    await focus(input); await input.pressSequentially('12A3456');
    assert.equal(await input.inputValue(), '123456');
    await page.getByText('Code complete. Ready to verify.', { exact: true }).waitFor();
    await page.keyboard.press('Backspace'); assert.equal(await input.inputValue(), '12345');
    await input.fill('');
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: url });
    await page.evaluate(() => navigator.clipboard.writeText('12-34 56'));
    await input.press('ControlOrMeta+V');
    await page.waitForFunction(() => document.querySelector('input')?.value === '123456');
  });
  await scenario('ui-input-otp--disabled', async () => { assert.equal(await page.getByRole('textbox', { name: 'Verification code' }).isDisabled(), true); });
  await scenario('ui-form--default', async () => {
    const input = page.getByRole('textbox', { name: 'Email address' });
    await page.getByRole('button', { name: 'Save preferences' }).click();
    await page.getByText('Enter an email address.', { exact: true }).waitFor();
    assert.equal(await input.getAttribute('aria-invalid'), 'true');
    assert.match(await input.evaluate((element) => element.getAttribute('aria-describedby').split(' ').map((id) => document.getElementById(id)?.textContent).join(' ')), /Enter an email address/);
    await input.fill('person@example.com'); await page.getByRole('button', { name: 'Save preferences' }).click();
    await page.getByRole('status').filter({ hasText: 'Your preferences have been saved.' }).waitFor();
  });
  await scenario('ui-sonner--default', async () => {
    await page.getByRole('button', { name: 'Show notification' }).click();
    const undo = page.getByRole('button', { name: 'Undo', exact: true }); await undo.waitFor();
    await scan('ui-sonner--default', 'action notification'); await focus(undo); await page.keyboard.press('Enter');
    await page.getByRole('status').filter({ hasText: 'The project has been restored.' }).waitFor();
  });
  await scenario('ui-data-table--tan-stack-composition', async () => {
    assert.equal(await page.locator('#storybook-root tbody tr').count(), 3);
    const sorter = page.getByRole('button', { name: 'Project', exact: true }); await focus(sorter); await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('#storybook-root tbody tr')?.textContent?.includes('Atlas Index'));
    await page.getByRole('checkbox', { name: 'Show tasks' }).uncheck(); assert.equal(await page.getByRole('columnheader', { name: 'Tasks', exact: true }).count(), 0);
    await page.getByRole('textbox', { name: 'Filter projects' }).fill('Atlas');
    await page.waitForFunction(() => document.querySelectorAll('#storybook-root tbody tr').length === 1);
    await page.getByRole('checkbox', { name: 'Select Atlas Index' }).check();
    await page.getByText('1 of 1 rows selected', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Next page' }).isDisabled(), true);
  });
  await scenario('ui-calendar--default', async () => {
    const day = page.getByRole('button', { name: 'Monday, October 12th, 2026', exact: true });
    await focus(day); await page.keyboard.press('ArrowRight');
    const next = page.getByRole('button', { name: 'Tuesday, October 13th, 2026', exact: true });
    await focused(next);
    await page.keyboard.press('Enter'); await attr(page.locator('[data-slot="calendar-day-button"][data-day="10/13/2026"]'), 'data-selected-single', 'true');
  });
  await scenario('ui-calendar--disabled-dates', async () => {
    assert.equal(await page.getByRole('button', { name: 'Saturday, October 10th, 2026', exact: true }).isDisabled(), true);
    await focus(page.getByRole('button', { name: 'Friday, October 9th, 2026', exact: true })); await page.keyboard.press('ArrowRight');
    await focused(page.getByRole('button', { name: 'Monday, October 12th, 2026', exact: true }));
  });
  await scenario('ui-date-picker--default', async () => {
    const trigger = page.getByRole('button', { name: 'Appointment date: Pick a date', exact: true });
    await focus(trigger); await page.keyboard.press('Enter');
    const day = page.getByRole('button', { name: 'Monday, October 12th, 2026', exact: true }); await day.waitFor();
    await focus(day); await page.keyboard.press('Enter'); await day.waitFor({ state: 'hidden' });
    const selected = page.getByRole('button', { name: 'Appointment date: October 12th, 2026', exact: true });
    await focused(selected);
  });
  await scenario('ui-date-picker--disabled', async () => { assert.equal(await page.getByRole('button', { name: 'Appointment date: Pick a date', exact: true }).isDisabled(), true); });
  await scenario('ui-sidebar--toggleable', async () => {
    const trigger = page.locator('[data-slot="sidebar-trigger"]');
    assert.equal(await trigger.getAttribute('aria-expanded'), 'true'); await focus(trigger); await page.keyboard.press('Enter'); await attr(trigger, 'aria-expanded', 'false');
    assert.equal(await page.getByRole('link', { name: 'Overview', exact: true }).count(), 1);
    await page.keyboard.press('ControlOrMeta+B'); await attr(trigger, 'aria-expanded', 'true');
    await focus(page.getByRole('textbox', { name: 'Search workspace' })); await page.keyboard.press('ControlOrMeta+B');
    assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
  });
  await scenario('ui-menubar--default', async () => {
    const file = page.getByRole('menuitem', { name: 'File', exact: true }); await focus(file); await page.keyboard.press('ArrowDown');
    await focused(page.getByRole('menuitem', { name: /^New Tab/ })); await page.keyboard.press('ArrowDown'); await focused(page.getByRole('menuitem', { name: /^New Window/ })); await page.keyboard.press('ArrowDown');
    await focused(page.getByRole('menuitem', { name: 'Share', exact: true }));
    assert.equal(await page.getByRole('menuitem', { name: 'New Incognito Window', exact: true }).getAttribute('aria-disabled'), 'true');
    await page.keyboard.press('ArrowRight'); await page.getByRole('menuitem', { name: 'Email link', exact: true }).waitFor();
    await scan('ui-menubar--default', 'submenu'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    await focused(file);
  });
  await scenario('astro-button--disabled-link', async () => { const link = page.locator('#disabled-button'); assert.equal(await link.getAttribute('href'), null); assert.equal(await link.getAttribute('tabindex'), '-1'); assert.equal(await link.getAttribute('aria-disabled'), 'true'); });
  await scenario('astro-fields--composed', async () => { await page.getByRole('textbox', { name: 'Email', exact: true }).fill('person@example.com'); await page.getByRole('textbox', { name: 'Note', exact: true }).fill('Native Astro forms work without hydration.'); });

  let countryHeatmapPresentation;
  for (const id of ['ui-countryheatmap--default', 'astro-countryheatmap--default']) {
    await scenario(id, async () => {
      const details = page.locator('[data-slot="country-heatmap-data"]');
      const summary = details.locator('summary');
      const table = page.getByRole('table', { name: 'Activity around the world: Sessions' });
      // Storybook can run the React story's play function on entry. Establish
      // the native collapsed state before testing both keyboard defaults.
      if (await details.getAttribute('open') !== null) await summary.click();
      assert.equal(await table.isVisible(), false);
      await focus(summary).catch((error) => { error.message = `Focus country summary before Enter: ${error.message}`; throw error; });
      await page.keyboard.press('Enter');
      await table.waitFor({ state: 'visible' });
      assert.equal(await table.locator('tbody tr').count(), 14);
      assert.match(await table.locator('tr[data-country="NZ"]').textContent(), /New ZealandNZ0/);
      assert.match(await table.locator('tr[data-country="IS"]').textContent(), /IcelandISNo data/);
      assert.match(await table.locator('tr[data-country="SG"]').textContent(), /SingaporeSGNot shown at this map scale125/);
      assert.equal(await page.locator('svg path[data-country="SG"]').count(), 0, 'Small-country data must remain visible without inventing map geometry.');
      assert.equal(await page.locator('svg path[data-country="NZ"]').getAttribute('data-state'), 'zero');
      assert.equal(await page.locator('svg path[data-country="IS"]').getAttribute('data-state'), 'no-data');
      const presentation = await page.locator('[data-slot="country-heatmap"]').evaluate((figure) => {
        const svg = figure.querySelector('svg');
        const references = ['aria-labelledby', 'aria-describedby'].map((attribute) => document.getElementById(svg.getAttribute(attribute))?.textContent);
        return {
          classes: figure.className, references,
          paths: [...svg.querySelectorAll('path')].map((path) => ({ code: path.getAttribute('data-country'), state: path.getAttribute('data-state'), geometry: path.getAttribute('d'), fill: getComputedStyle(path).fill })),
        };
      });
      assert.equal(presentation.references[0], 'Activity around the world');
      assert.match(presentation.references[1], /Missing data is separate from a measured zero/);
      assert.notEqual(presentation.paths.find((path) => path.code === 'NZ').fill, presentation.paths.find((path) => path.code === 'IS').fill);
      assert.equal(await page.locator('svg [tabindex]').count(), 0, 'The data table is the keyboard alternative to hundreds of shape stops.');
      if (countryHeatmapPresentation) assert.deepEqual(presentation, countryHeatmapPresentation, 'Both renderers must use the same geometry, computed colors, classes, and accessible descriptions.');
      else countryHeatmapPresentation = presentation;
      await scan(id, 'country data expanded');
      await page.keyboard.press('Space'); await table.waitFor({ state: 'hidden' });
      await focused(summary).catch(async (error) => {
        error.message = `Retain country summary focus after Space: ${error.message}`;
        error.details = await page.evaluate(() => ({ activeTag: document.activeElement?.tagName, activeSlot: document.activeElement?.getAttribute('data-slot'), summaryPresent: Boolean(document.querySelector('[data-slot="country-heatmap-data"] summary')) }));
        throw error;
      });
      await mkdir(output, { recursive: true });
      await page.locator('[data-slot="country-heatmap"]').screenshot({ path: resolve(output, `${id}-desktop.png`) });
      await page.keyboard.press('Space'); await table.waitFor({ state: 'visible' });
    });
  }

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const renderer of ['ui', 'astro']) {
      for (const variant of ['default', 'zero-and-missing', 'localized', 'extreme-values', 'custom-formatting']) {
        const id = `${renderer}-countryheatmap--${variant}`;
        if (!matches(id)) continue;
        try {
          await visit(id);
          const details = page.locator('[data-slot="country-heatmap-data"]');
          if (await details.getAttribute('open') === null) await details.locator('summary').click();
          await page.getByRole('table').waitFor({ state: 'visible' });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${id} overflows at ${width}px`);
          const map = await page.locator('[data-slot="country-heatmap-map"]').boundingBox();
          assert.ok(map && map.x >= 0 && map.x + map.width <= width, 'Country map must fit its narrow viewport.');
          if (variant === 'zero-and-missing') assert.equal(await page.locator('[data-slot="country-heatmap-empty"]').count(), 0, 'An all-zero dataset is not an empty dataset.');
          if (variant === 'localized') assert.match(await page.locator('tr[data-country="US"]').textContent(), /Estados Unidos/);
          if (variant === 'extreme-values') {
            assert.ok((await page.locator('tr[data-country="US"] td').textContent()).length > 300, 'A large measurement must preserve its formatted value.');
            assert.match(await page.locator('tr[data-country="CA"] td').textContent(), /0005/);
          }
          if (variant === 'custom-formatting') {
            assert.equal((await page.locator('tr[data-country="US"] td').textContent()).split('VeryLongCustomMeasurement').length - 1, 12, 'A custom formatter must keep its complete text.');
          }
          if (variant === 'extreme-values' || variant === 'custom-formatting') {
            const region = page.locator('[data-slot="country-heatmap-table-scroll"]');
            assert.equal(await region.getAttribute('role'), 'region');
            await focus(region); await page.keyboard.press('ArrowRight');
            await page.waitForFunction((element) => element.scrollLeft > 0, await region.elementHandle());
          }
          await scan(id, `country table at ${width}px`);
          if (variant === 'default' && width === 390) {
            await mkdir(output, { recursive: true });
            await page.locator('[data-slot="country-heatmap"]').screenshot({ path: resolve(output, `${id}-mobile.png`) });
          }
          verified.push(`${id}:mobile-${width}`);
        } catch (error) { reportFailure(id, `mobile-${width}`, error); }
      }
    }
  }

  // Responsive catalog rendering uses the same fixtures, without a showcase app.
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of ['ui-interactive-catalog--top-nav', 'astro-topnav--with-action', 'ui-drawer--default', 'ui-input-otp--default', 'ui-calendar--default', 'ui-date-picker--open']) {
    if (!matches(id)) continue;
    try { await visit(id); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${id} overflows on mobile`); verified.push(`${id}:mobile`); }
    catch (error) { reportFailure(id, 'mobile', error); }
  }
  await scenario('ui-sidebar--default', async () => {
    const trigger = page.locator('[data-slot="sidebar-trigger"]'); await focus(trigger); await page.keyboard.press('Enter');
    const sidebar = page.getByRole('dialog', { name: 'Sidebar', exact: true }); await sidebar.waitFor();
    await scan('ui-sidebar--default', 'mobile navigation');
    await page.getByRole('link', { name: 'Overview', exact: true }).waitFor(); await focus(page.getByRole('textbox', { name: 'Search workspace' })); await page.keyboard.press('Escape'); await sidebar.waitFor({ state: 'hidden' });
    await focused(trigger);
  });
  await scenario('ui-tooltip--long-text', async () => {
    await page.getByRole('tooltip').waitFor();
    const tooltip = page.locator('[data-slot="tooltip-content"]');
    const bounds = await tooltip.boundingBox(); assert.ok(bounds);
    assert.ok(bounds.width <= 358, 'Long tooltip text must wrap within the 390px viewport.');
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 390, 'The tooltip must remain inside the viewport.');
  });
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ storyCount: stories.length, verified, failures }, null, 2));
  console.log(`Storybook verification: ${verified.length} checks passed across ${stories.length} catalog stories; ${failures.length} failures.`);
  if (failures.length) process.exitCode = 1;
} finally {
  await browser?.close();
  if (server) await new Promise((done) => server.close(done));
}

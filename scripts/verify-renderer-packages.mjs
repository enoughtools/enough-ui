import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { artifactGraph } from './renderer-packages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const development = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const temporary = await mkdtemp(join(tmpdir(), 'enough-ui-renderers-'));
const run = (command, args, cwd) => {
  if (command === 'npm') args = [...args, '--cache', join(temporary, 'npm-cache')];
  try { return execFileSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } }); }
  catch (error) { throw new Error(`${command} ${args.join(' ')} failed:\n${error.stdout ?? ''}\n${error.stderr ?? ''}`, { cause: error }); }
};
const writeJSON = (path, value) => writeFile(path, JSON.stringify(value, null, 2) + '\n');

async function archiveInputs() {
  const index = process.argv.indexOf('--archives');
  if (index !== -1) {
    assert.ok(process.argv[index + 1], '--archives requires a directory containing release.json');
    const directory = resolve(process.argv[index + 1]);
    const release = JSON.parse(await readFile(join(directory, 'release.json'), 'utf8'));
    assert.deepEqual(release.packages.map(pkg => pkg.name).sort(), ['@enoughtools/ui-astro', '@enoughtools/ui-react']);
    return release.packages.map(pkg => {
      assert.equal(basename(pkg.filename), pkg.filename, 'Archive filenames stay inside the release directory');
      return { ...pkg, archive: join(directory, pkg.filename) };
    });
  }
  const packages = [];
  for (const renderer of ['react', 'astro']) {
    const directory = join(root, 'packages', renderer);
    const [archive] = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temporary], directory));
    packages.push({ ...archive, name: archive.name, version: archive.version, archive: join(temporary, archive.filename) });
  }
  return packages;
}

async function validateArchive(input) {
  const renderer = input.name.endsWith('-react') ? 'react' : 'astro';
  assert.equal(input.name, `@enoughtools/ui-${renderer}`);
  if (input.integrity) {
    const hash = createHash('sha512').update(await readFile(input.archive)).digest('base64');
    assert.equal(`sha512-${hash}`, input.integrity, `${input.name} archive integrity`);
  }
  const names = run('tar', ['-tzf', input.archive], temporary).trim().split('\n');
  for (const name of names) {
    assert.ok(name.startsWith('package/') && !name.split('/').includes('..'), `Safe archive path: ${name}`);
    assert.match(name, /^package\/(?:dist\/|package\.json$|README\.md$|LICENSE$|THIRD_PARTY_NOTICES\.md$)/, name);
    assert.doesNotMatch(name, /(?:\.(?:stories|test|spec)\.|\.map$|(?<!\.d)\.tsx?$|\/node_modules\/)/, name);
    if (renderer === 'react') assert.doesNotMatch(name, /\.astro$|\/dist\/astro\//, name);
    if (renderer === 'astro') assert.doesNotMatch(name, /\/dist\/(?:components|hooks)\//, name);
  }
  const unpacked = join(temporary, `unpacked-${renderer}`);
  await mkdir(unpacked);
  run('tar', ['-xzf', input.archive, '-C', unpacked], temporary);
  const directory = join(unpacked, 'package');
  const manifest = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
  assert.equal(manifest.name, input.name);
  assert.equal(manifest.version, input.version);
  assert.equal(manifest.private, undefined);
  assert.equal(manifest.publishConfig.access, 'public');
  for (const name of ['README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) assert.ok(names.includes(`package/${name}`), `${input.name} includes ${name}`);
  for (const [subpath, target] of Object.entries(manifest.exports)) {
    for (const file of typeof target === 'string' ? [target] : Object.values(target)) {
      assert.ok(names.includes(`package/${file.slice(2)}`), `${input.name}${subpath} resolves in the archive`);
    }
  }
  const entryFiles = names.filter(name => name.startsWith('package/dist/') && /\.(?:js|astro)$/.test(name)).map(name => name.slice('package/dist/'.length));
  const graph = await artifactGraph(join(directory, 'dist'), entryFiles, renderer);
  for (const name of graph.dependencies) assert.ok(name in manifest.dependencies || name in manifest.peerDependencies, `${input.name} declares ${name}`);
  for (const name of graph.files) {
    assert.doesNotMatch(await readFile(join(directory, 'dist', name), 'utf8'), /sourceMappingURL=/, name);
  }
  if (renderer === 'astro') {
    assert.deepEqual(Object.keys(manifest.peerDependencies), ['astro']);
    assert.ok(!Object.keys(manifest.dependencies).some(name => /react|radix/.test(name)));
  }
  console.log(`${input.name}@${input.version}: archive contents, export targets, import graph and integrity passed.`);
  return { ...input, renderer, manifest, unpacked: directory };
}

async function verifyReact(input) {
  const directory = join(temporary, 'react-consumer');
  await mkdir(directory);
  await writeJSON(join(directory, 'package.json'), {
    private: true, type: 'module',
    dependencies: { [input.name]: `file:${input.archive}`, react: development.devDependencies.react, 'react-dom': development.devDependencies['react-dom'] },
    devDependencies: Object.fromEntries(['typescript', '@types/react', '@types/react-dom', 'vite'].map(name => [name, development.devDependencies[name]])),
  });
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], directory);
  await writeFile(join(directory, 'index.html'), '<!doctype html><html lang="en"><head><title>EnoughUI package test</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
  await writeFile(join(directory, 'main.tsx'), `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Checkbox, CountryHeatmap, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, Toaster, toast } from '${input.name}';
import type { ButtonProps } from '${input.name}/button';
import '${input.name}/styles.css';
const props: ButtonProps = { variant: 'accent' };
createRoot(document.getElementById('root')!).render(<main><h1>Installed React package</h1>
  <Button {...props} onClick={() => toast({ title: 'Saved from package' })}>Save</Button>
  <Checkbox aria-label="Accept" />
  <Dialog><DialogTrigger asChild><Button>Open dialog</Button></DialogTrigger>
    <DialogContent><DialogTitle>Portable dialog</DialogTitle><DialogDescription>Installed from a tested archive.</DialogDescription></DialogContent>
  </Dialog><Toaster />
  <CountryHeatmap title="Packaged country values" data={[{ code: 'MX', value: 42 }, { code: 'NZ', value: 0 }, { code: 'SG', value: 7 }]} />
</main>);
`);
  await writeJSON(join(directory, 'tsconfig.json'), {
    compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'NodeNext', moduleResolution: 'NodeNext', jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: false },
    include: ['main.tsx'],
  });
  const imports = Object.entries(input.manifest.exports).filter(([, target]) => typeof target !== 'string').map(([key]) => key === '.' ? input.name : input.name + key.slice(1));
  await writeFile(join(directory, 'smoke.mjs'), `
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, toast } from '${input.name}';
import { Button as SubpathButton } from '${input.name}/button';
import { toast as subpathToast } from '${input.name}/use-toast';
for (const name of ${JSON.stringify(imports)}) assert.ok(Object.keys(await import(name)).length, name);
assert.equal(Button, SubpathButton);
assert.equal(toast, subpathToast);
assert.match(renderToStaticMarkup(React.createElement(Button, null, 'Portable')), /Portable/);
`);
  run('node', ['smoke.mjs'], directory);
  run('node', ['node_modules/typescript/bin/tsc'], directory);
  run('node', ['node_modules/vite/bin/vite.js', 'build'], directory);
  console.log(`${input.name}: isolated installed imports, shared instances, server rendering, strict TypeScript and production build passed.`);
  if (process.argv.includes('--browser')) await verifyReactBrowser(directory);
}

async function verifyReactBrowser(directory) {
  const require = createRequire(join(directory, 'package.json'));
  const { preview } = await import(require.resolve('vite'));
  const { chromium } = await import('playwright');
  const server = await preview({ root: directory, preview: { host: '127.0.0.1', port: 0 } });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(server.resolvedUrls.local[0]);
    const save = page.getByRole('button', { name: 'Save', exact: true });
    await save.waitFor();
    assert.equal(await save.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(59, 79, 228)');
    await page.getByRole('checkbox', { name: 'Accept' }).check();
    assert.equal(await page.getByRole('checkbox', { name: 'Accept' }).isChecked(), true);
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await page.getByRole('dialog', { name: 'Portable dialog' }).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await save.click();
    await page.getByText('Saved from package', { exact: true }).waitFor();
    const countryData = page.getByText('View country data', { exact: true });
    await countryData.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('row', { name: /Singapore.*SG.*7/ }).waitFor();
    assert.equal(await page.locator('svg [data-country="NZ"]').getAttribute('data-state'), 'zero');
    assert.deepEqual(errors, []);
    console.log('Installed React package browser: theme, checkbox, dialog dismissal, toast and country heatmap table passed.');
  } finally {
    await browser.close();
    await new Promise(resolve => server.httpServer.close(resolve));
  }
}

async function verifyAstro(input) {
  const directory = join(temporary, 'astro-consumer');
  await mkdir(join(directory, 'src/pages'), { recursive: true });
  await writeJSON(join(directory, 'package.json'), {
    private: true, type: 'module',
    dependencies: { [input.name]: `file:${input.archive}`, astro: development.devDependencies.astro },
    devDependencies: { '@astrojs/check': development.devDependencies['@astrojs/check'], typescript: development.devDependencies.typescript },
  });
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], directory);
  const installed = JSON.parse(await readFile(join(directory, 'package-lock.json'), 'utf8'));
  for (const name of Object.keys(installed.packages)) assert.doesNotMatch(name, /(?:^|\/)node_modules\/(?:react|react-dom|@astrojs\/react)$/, 'Astro consumer installs no React renderer');
  await writeJSON(join(directory, 'tsconfig.json'), { extends: 'astro/tsconfigs/strict', include: ['.astro/types.d.ts', '**/*'], exclude: ['dist'] });
  await writeFile(join(directory, 'astro.config.mjs'), "import { defineConfig } from 'astro/config';\nexport default defineConfig({ output: 'static' });\n");
  const components = Object.entries(input.manifest.exports).filter(([, target]) => typeof target === 'string' && target.endsWith('.astro'));
  const imports = components.map(([key], index) => `import Component${index} from '${input.name}${key.slice(1)}';`).join('\n');
  await writeFile(join(directory, 'src/pages/index.astro'), `---
import { Button } from '${input.name}';
import '${input.name}/styles.css';
${imports}
---
<!doctype html><html lang="en"><head><title>Installed Astro package</title></head><body><main>
<h1>Installed native Astro package</h1><Button variant="accent">Portable Astro button</Button>
${components.map(([key], index) => `<Component${index}${key === './callout' ? ' label="Package callout"' : key === './tool-row' ? ' title="Package tool"' : key === './country-heatmap' ? ' data={[{ code: "MX", value: 42 }, { code: "NZ", value: 0 }, { code: "SG", value: 7 }]}' : ''}>Native export</Component${index}>`).join('\n')}
</main></body></html>
`);
  run('node', ['node_modules/astro/bin/astro.mjs', 'check'], directory);
  run('node', ['node_modules/astro/bin/astro.mjs', 'build'], directory);
  const html = await readFile(join(directory, 'dist/index.html'), 'utf8');
  assert.match(html, /Portable Astro button/);
  assert.match(html, /data-slot="country-heatmap"/);
  assert.match(html, /data-country="NZ" data-state="zero"/);
  assert.doesNotMatch(html, /astro-island|react\/jsx-runtime/);
  console.log(`${input.name}: every native export and named barrel passed Astro check and static production build without React installed.`);
}

try {
  const inputs = await archiveInputs();
  const packages = [];
  for (const input of inputs) packages.push(await validateArchive(input));
  const [astro] = packages.filter(pkg => pkg.renderer === 'astro');
  const [react] = packages.filter(pkg => pkg.renderer === 'react');
  for (const name of ['styles.css', 'components.css']) {
    assert.deepEqual(await readFile(join(astro.unpacked, 'dist', name)), await readFile(join(react.unpacked, 'dist', name)), `Shared ${name}`);
  }
  if (!process.argv.includes('--static')) {
    await verifyReact(react);
    await verifyAstro(astro);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}

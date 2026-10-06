import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, test } from 'node:test';
import { artifactGraph, astroComponentNames, astroExports, componentNames, hookNames, reactExports, rootExports, packageReadme } from '../scripts/renderer-packages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const packCache = await mkdtemp(join(tmpdir(), 'enough-ui-pack-cache-'));
after(() => rm(packCache, { recursive: true, force: true }));
const readManifest = async directory => JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));

test('package documentation resolves artwork and guides without rewriting examples or external links', () => {
  const source = '[![Preview](docs/assets/brand/repo-hero.png)](https://enoughui.com)\n[Parity](docs/parity.md)\n[License](./LICENSE)\n[Demo](https://enoughui.com)\n[React](#react)\nimport DateControl from "./DateControl";';
  const result = packageReadme(source, '0.4.0');
  assert.match(result, /!\[Preview\]\(https:\/\/raw\.githubusercontent\.com\/enoughtools\/enough-ui\/v0\.4\.0\/docs\/assets\/brand\/repo-hero\.png\)/);
  assert.match(result, /\[Parity\]\(https:\/\/github\.com\/enoughtools\/enough-ui\/blob\/v0\.4\.0\/docs\/parity\.md\)/);
  assert.match(result, /\[License\]\(https:\/\/github\.com\/enoughtools\/enough-ui\/blob\/v0\.4\.0\/LICENSE\)/);
  assert.ok(result.includes('[Demo](https://enoughui.com)'));
  assert.ok(result.includes('[React](#react)'));
  assert.ok(result.includes(')](https://enoughui.com)'));
  assert.ok(result.includes('import DateControl from "./DateControl";'));
});

test('root development package is private and split exports follow source components', async () => {
  const rootManifest = await readManifest(root);
  const reactNames = await componentNames(root);
  const astroNames = await astroComponentNames(root);
  const hooks = await hookNames(root);
  assert.equal(rootManifest.private, true);
  assert.deepEqual(rootManifest.exports, rootExports(reactNames, astroNames, hooks));
  for (const renderer of ['react', 'astro']) {
    const pkg = await readManifest(join(root, 'packages', renderer));
    assert.equal(pkg.name, `@enoughtools/ui-${renderer}`);
    assert.equal(pkg.version, rootManifest.version);
    assert.equal(pkg.publishConfig.access, 'public');
    assert.deepEqual(pkg.exports, renderer === 'react' ? reactExports(reactNames, hooks) : astroExports(astroNames));
  }
});

for (const renderer of ['react', 'astro']) {
  test(`${renderer} archive contains complete exports and no repository or opposite renderer files`, async () => {
    const directory = join(root, 'packages', renderer);
    const manifest = await readManifest(directory);
    const [archive] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts', '--cache', packCache], {
      cwd: directory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }));
    const files = new Set(archive.files.map(file => file.path));
    for (const file of files) {
      assert.match(file, /^(?:dist\/|package\.json$|README\.md$|LICENSE$|THIRD_PARTY_NOTICES\.md$)/, file);
      assert.doesNotMatch(file, /(?:\.(?:stories|test|spec)\.|\.map$|(?<!\.d)\.tsx?$|(?:^|\/)node_modules\/|^dist\/(?:stories|tests)\/)/, file);
      if (renderer === 'react') assert.doesNotMatch(file, /\.astro$|^dist\/astro\//, file);
      if (renderer === 'astro') assert.doesNotMatch(file, /^dist\/(?:components|hooks)\//, file);
    }
    for (const [subpath, target] of Object.entries(manifest.exports)) {
      for (const file of typeof target === 'string' ? [target] : Object.values(target)) {
        assert.ok(files.has(file.slice(2)), `${manifest.name}${subpath} packs ${file}`);
      }
    }
    for (const document of ['README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) assert.ok(files.has(document), document);
    const entryFiles = [...files].filter(file => file.startsWith('dist/') && /\.(?:js|astro)$/.test(file)).map(file => file.slice(5));
    const graph = await artifactGraph(join(directory, 'dist'), entryFiles, renderer);
    for (const dependency of graph.dependencies) {
      assert.ok(dependency in manifest.dependencies || dependency in manifest.peerDependencies, `${manifest.name} declares ${dependency}`);
    }
    for (const file of graph.files) {
      assert.ok(files.has(`dist/${file}`), file);
      assert.doesNotMatch(await readFile(join(directory, 'dist', file), 'utf8'), /sourceMappingURL=/, file);
    }
    if (renderer === 'astro') {
      assert.deepEqual(Object.keys(manifest.peerDependencies), ['astro']);
      assert.equal(manifest.peerDependenciesMeta.astro.optional, true);
      assert.ok(!Object.keys(manifest.dependencies).some(name => /react|radix/.test(name)));
    }
  });
}

test('both packages ship identical compiled styles', async () => {
  for (const name of ['styles.css', 'components.css']) {
    const react = await readFile(join(root, 'packages/react/dist', name));
    const astro = await readFile(join(root, 'packages/astro/dist', name));
    assert.deepEqual(astro, react);
  }
});

test('Astro graph rejects transitive React imports and references outside its package', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'enough-ui-artifact-'));
  try {
    await mkdir(join(directory, 'astro'));
    await mkdir(join(directory, 'lib'));
    await writeFile(join(directory, 'astro/Button.astro'), '---\nimport { helper } from "../lib/helper.js";\n---\n<button />\n');
    await writeFile(join(directory, 'lib/helper.js'), 'import React from "react"; export const helper = React;\n');
    await assert.rejects(artifactGraph(directory, ['astro/Button.astro'], 'astro'), /Native Astro cannot depend on react/);
    await writeFile(join(directory, 'lib/helper.js'), 'export { helper } from "../../private.js";\n');
    await assert.rejects(artifactGraph(directory, ['astro/Button.astro'], 'astro'), /Invalid astro artifact import/);
    await writeFile(join(directory, 'astro/Button.astro'), '<button /><script>import React from "react";</script>\n');
    await assert.rejects(artifactGraph(directory, ['astro/Button.astro'], 'astro'), /Native Astro cannot depend on react/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

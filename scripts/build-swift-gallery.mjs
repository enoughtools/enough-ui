import assert from 'node:assert/strict';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { renderingInputs, screenshotHashes } from './swift-gallery-evidence.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = join(root, 'examples/swift-catalog/Sources/EnoughUICatalog/Gallery');
const files = (await readdir(directory)).filter(name => name.endsWith('.swift')).sort();
const components = [];
for (const file of files) {
  const contents = await readFile(join(directory, file), 'utf8');
  const [header, ...body] = contents.split('\n');
  assert.ok(header.startsWith('// gallery: '), `Missing gallery metadata: ${file}`);
  const component = JSON.parse(header.slice('// gallery: '.length));
  component.source = body.join('\n');
  component.file = file;
  component.sourceHash = createHash('sha256').update(contents).digest('hex');
  component.previews = {};
  for (const platform of ['macos', 'ios']) for (const theme of ['light', 'dark']) {
    const name = `${component.id}-${platform}-${theme}.png`;
    const image = await readFile(join(root, 'docs/assets/swift', name));
    assert.equal(image.subarray(1, 4).toString(), 'PNG', `Invalid native screenshot: ${name}`);
    component.previews[`${platform}-${theme}`] = { path: `/swift-previews/${name}`, width: image.readUInt32BE(16), height: image.readUInt32BE(20) };
  }
  components.push(component);
}
const evidence = JSON.parse(await readFile(join(root, 'docs/assets/swift/provenance.json'), 'utf8'));
assert.deepEqual(evidence.renderingInputs, await renderingInputs(root), 'Native rendering inputs changed. Regenerate native captures.');
assert.deepEqual(evidence.screenshots, await screenshotHashes(root), 'Native screenshot evidence changed. Regenerate native captures.');
for (const component of components) assert.equal(evidence.sources[component.id], component.sourceHash, `Native screenshot source changed: ${component.id}. Regenerate native captures.`);
assert.equal(new Set(components.map(item => item.id)).size, components.length);
const sourceRef = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
assert.match(sourceRef, /^[a-f0-9]{40}$/);
const output = JSON.stringify({ components, platforms: ['macos', 'ios'], sourceRef, evidence }, null, 2) + '\n';
const destination = join(root, '.storybook/catalog/swift-manifest.json');
if (process.argv.includes('--check')) assert.equal(await readFile(destination, 'utf8'), output, 'Swift gallery manifest is stale.');
else { await mkdir(join(root, '.storybook/catalog'), { recursive: true }); await writeFile(destination, output); }
console.log(`Swift gallery: ${components.length} compiled examples, ${components.length * 4} native screenshots.`);

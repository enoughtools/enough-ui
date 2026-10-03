import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

test('native Astro package exports exist and have no React imports', () => {
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const entries = Object.entries(manifest.exports).filter(([key]) => key.startsWith('./astro/'));
  const sourceNames = readdirSync(new URL('../src/astro/', import.meta.url)).filter(name => name.endsWith('.astro') && !name.startsWith('_')).sort();
  assert.deepEqual(entries.map(([, target]) => target).sort(), sourceNames.map(name => `./dist/astro/${name}`), 'Every native source component must have a built public export, without stale entries.');
  for (const [, target] of entries) {
    assert.ok(existsSync(new URL('../' + target, import.meta.url)), target);
    const source = readFileSync(new URL('../' + target, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /from ['"](?:react|.*components\/ui\/)/);
  }
});

test('split Astro artifact exposes exactly the native source components', () => {
  const rootManifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const astroManifest = JSON.parse(readFileSync(new URL('../packages/astro/package.json', import.meta.url)));
  const expected = Object.fromEntries(Object.entries(rootManifest.exports).filter(([key]) => key.startsWith('./astro/')).map(([key, target]) => [key.replace('./astro/', './'), target]));
  const actual = Object.fromEntries(Object.entries(astroManifest.exports).filter(([, target]) => typeof target === 'string' && target.endsWith('.astro')));
  assert.deepEqual(actual, expected);
  for (const target of Object.values(actual)) assert.ok(existsSync(new URL('../packages/astro/' + target, import.meta.url)), target);
});

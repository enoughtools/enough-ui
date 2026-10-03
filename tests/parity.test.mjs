import assert from 'node:assert/strict';
import { test } from 'node:test';
import { inspectParity, readParityManifest, validateParityManifest } from '../scripts/check-parity.mjs';

test('the pinned baseline accounts for every current Radix family and legacy Form', async () => {
  const manifest = await readParityManifest();
  assert.deepEqual(validateParityManifest(manifest), []);
  assert.equal(manifest.families.length, 66);
  assert.equal(manifest.families.find(family => family.id === 'form').origin, 'legacy-registry');
  assert.equal(manifest.families.find(family => family.id === 'sonner').origin, 'radix-registry');
  assert.equal(manifest.families.find(family => family.id === 'date-picker').origin, 'documentation-composition');
});

test('every family has its public exports and required native Astro components', async () => {
  const result = await inspectParity({ built: true });
  assert.deepEqual(result.issues, [], result.issues.join('\n'));
});

test('the coverage manifest cannot hide a missing or duplicate catalog family', async () => {
  const manifest = await readParityManifest();
  const missing = structuredClone(manifest);
  missing.families.pop();
  assert.ok(validateParityManifest(missing).some(issue => issue.includes('every family')));
  const duplicate = structuredClone(manifest);
  duplicate.families.push(duplicate.families[0]);
  assert.ok(validateParityManifest(duplicate).some(issue => issue.includes('exactly once')));
});

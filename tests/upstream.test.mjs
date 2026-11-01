import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inspectSnapshot, checkUpstream } from '../scripts/check-upstream.mjs';

test('archived upstream source matches immutable provenance', async () => { await checkUpstream(); });
test('a modified archive and missing catalog entries cannot pass', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../docs/shadcn-snapshot.json', import.meta.url)));
  const manifest = JSON.parse(await readFile(new URL('../docs/shadcn-radix-parity.json', import.meta.url)));
  const first = Object.keys(snapshot.files)[0];
  snapshot.files[first].content += '\nmodified';
  assert.ok(inspectSnapshot(snapshot, manifest).some(issue => issue.includes('archived bytes')));
  manifest.reference.commit = snapshot.commit;
  manifest.families = [];
  assert.ok(inspectSnapshot(snapshot, manifest).some(issue => issue.includes('missing catalog family')));
});

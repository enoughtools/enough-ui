import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export function inspectSnapshot(snapshot, manifest) {
  const issues = [];
  const hash = (algorithm, value) => createHash(algorithm).update(value).digest('hex');
  if (!/^[a-f0-9]{40}$/.test(snapshot.commit ?? '')) issues.push('Invalid archived commit.');
  for (const [path, file] of Object.entries(snapshot.files)) {
    const content = Buffer.from(file.content);
    const blob = hash('sha1', Buffer.concat([Buffer.from(`blob ${content.length}\0`), content]));
    if (file.blob !== blob || file.sha256 !== hash('sha256', content)) issues.push(`${path}: archived bytes do not match provenance.`);
  }
  for (const [path, blob] of Object.entries(snapshot.catalog)) {
    if (snapshot.files[path]?.blob !== blob) issues.push(`${path}: catalog entry lacks matching source.`);
  }
  const covered = new Set(manifest.families.map(family => family.upstreamSource).filter(Boolean));
  for (const family of manifest.families) {
    if (family.upstreamSource && snapshot.files[family.upstreamSource]?.blob !== family.upstreamBlob) {
      issues.push(`${family.id}: baseline source does not match archived upstream.`);
    }
  }
  // A newer discovery snapshot may contain additions. Once adopted, completeness
  // is independently checked against its catalog, rather than manifest counts.
  if (manifest.reference.commit === snapshot.commit) {
    for (const path of Object.keys(snapshot.catalog)) if (!covered.has(path)) issues.push(`${path}: missing catalog family.`);
  }
  return issues;
}

export async function checkUpstream({ online = false } = {}) {
  const snapshot = JSON.parse(await readFile(new URL('../docs/shadcn-snapshot.json', import.meta.url)));
  const manifest = JSON.parse(await readFile(new URL('../docs/shadcn-radix-parity.json', import.meta.url)));
  const issues = inspectSnapshot(snapshot, manifest);
  if (online) {
    const response = await fetch(`https://api.github.com/repos/shadcn-ui/ui/git/trees/${snapshot.commit}?recursive=1`);
    if (!response.ok) throw new Error(`Upstream provenance unavailable: ${response.status}`);
    const tree = await response.json();
    if (tree.truncated) throw new Error('Upstream returned a truncated tree.');
    const blobs = new Map(tree.tree.map(entry => [entry.path, entry.sha]));
    for (const [path, file] of Object.entries(snapshot.files)) if (blobs.get(path) !== file.blob) issues.push(`${path}: immutable upstream mismatch.`);
    const liveResponse = await fetch('https://api.github.com/repos/shadcn-ui/ui/git/trees/main?recursive=1');
    if (!liveResponse.ok) throw new Error(`Upstream discovery unavailable: ${liveResponse.status}`);
    const live = await liveResponse.json();
    if (live.truncated) throw new Error('Upstream returned a truncated discovery tree.');
    const changed = live.tree.filter(entry => entry.path.startsWith(snapshot.registryDirectory + '/') && entry.path.endsWith('.tsx') && snapshot.catalog[entry.path] !== entry.sha);
    const currentPaths = new Set(live.tree.map(entry => entry.path));
    const currentBlobs = new Map(live.tree.map(entry => [entry.path, entry.sha]));
    const removed = Object.keys(snapshot.catalog).filter(path => !currentPaths.has(path));
    const evidenceChanges = Object.entries(snapshot.files).filter(([path,file])=>currentBlobs.get(path)!==file.blob).map(([path])=>({
      path, kind:path.includes('/content/docs/')?'documentation':path.endsWith('package.json')?'dependencies':path.endsWith('registry.ts')?'registry-metadata':'supporting-source',
      state:currentPaths.has(path)?'changed':'removed',
    }));
    console.log(JSON.stringify({ observedCommit: live.sha, changed: changed.map(entry => entry.path), removed, evidenceChanges }, null, 2));
  }
  if (issues.length) throw new Error(issues.join('\n'));
  console.log(`Upstream provenance: ${Object.keys(snapshot.files).length} files verified; supported baseline ${manifest.reference.commit}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await checkUpstream({ online: process.argv.includes('--online') });

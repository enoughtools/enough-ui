import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parseReleaseTag } from './release.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const tag = process.env.GITHUB_REF_TYPE === 'tag' ? process.env.GITHUB_REF_NAME : `v${source.version}`;
const release = parseReleaseTag(tag);
assert.equal(release.version, source.version, 'Swift archive must match the EnoughUI release version.');
execFileSync(process.execPath, ['scripts/build-swift-tokens.mjs', '--check'], { cwd: root, stdio: 'inherit' });
const output = join(root, 'artifacts/swift-release');
await mkdir(output, { recursive: true });
const filename = `EnoughUI-Swift-${release.version}.tar.gz`;
// An installable source package, retaining the same root manifest/target paths as Git.
// Explicit inputs exclude build products, machine state and untracked files.
execFileSync('tar', ['-czf', join(output, filename), 'Package.swift', 'LICENSE',
  'THIRD_PARTY_NOTICES.md', 'packages/swift/README.md', 'packages/swift/Sources', 'packages/swift/Tests'], { cwd: root });
const sha256 = createHash('sha256').update(await readFile(join(output, filename))).digest('hex');
await writeFile(join(output, 'SHA256SUMS'), `${sha256}  ${filename}\n`);
console.log(`Prepared ${filename} (${sha256})`);

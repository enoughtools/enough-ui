import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'artifacts/release');
const registry = 'https://registry.npmjs.org';
const repository = 'enoughtools/enough-ui';
const renderers = [
  { name: '@enoughtools/ui-react', directory: 'packages/react' },
  { name: '@enoughtools/ui-astro', directory: 'packages/astro' },
];
const json = async path => JSON.parse(await readFile(path, 'utf8'));

export function parseReleaseTag(tag) {
  const version = tag?.startsWith('v') ? tag.slice(1) : '';
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(version);
  assert.ok(match, 'Use a version tag such as v1.2.3 or v1.2.3-rc.1; build metadata is not supported.');
  const prerelease = match[4]?.split('.') ?? [];
  assert.ok(prerelease.every(id => !/^\d+$/.test(id) || id === '0' || !id.startsWith('0')), 'Numeric prerelease identifiers cannot have leading zeroes.');
  return { tag, version, channel: prerelease.length ? 'next' : 'latest', numbers: match.slice(1, 4).map(BigInt), prerelease };
}

export function compareVersions(left, right) {
  for (let index = 0; index < 3; index++) {
    if (left.numbers[index] !== right.numbers[index]) return left.numbers[index] > right.numbers[index] ? 1 : -1;
  }
  if (!left.prerelease.length || !right.prerelease.length) return left.prerelease.length === right.prerelease.length ? 0 : left.prerelease.length ? -1 : 1;
  for (let index = 0; index < Math.max(left.prerelease.length, right.prerelease.length); index++) {
    const a = left.prerelease[index];
    const b = right.prerelease[index];
    if (a === b) continue;
    if (a === undefined || b === undefined) return a === undefined ? -1 : 1;
    const aNumeric = /^\d+$/.test(a);
    const bNumeric = /^\d+$/.test(b);
    if (aNumeric && bNumeric) return BigInt(a) > BigInt(b) ? 1 : -1;
    if (aNumeric !== bNumeric) return aNumeric ? -1 : 1;
    return a > b ? 1 : -1;
  }
  return 0;
}

export function validatePublicPackage(pkg, renderer, release) {
  assert.equal(pkg.name, renderer.name, `Unexpected package name in ${renderer.directory}.`);
  assert.equal(pkg.version, release.version, `${pkg.name} must match ${release.tag}.`);
  assert.notEqual(pkg.private, true, `${pkg.name} is marked private.`);
  assert.equal(pkg.license, 'MIT', `${pkg.name} must include the project license.`);
  assert.equal(pkg.publishConfig?.access, 'public', `${pkg.name} must explicitly publish publicly.`);
  assert.ok(!pkg.publishConfig?.registry || pkg.publishConfig.registry.replace(/\/$/, '') === registry, `${pkg.name} uses an unexpected registry.`);
  assert.notEqual(pkg.publishConfig?.provenance, false, `${pkg.name} must enable provenance.`);
  assert.ok(!pkg.publishConfig?.tag || pkg.publishConfig.tag === release.channel, `${pkg.name} has a conflicting publish tag.`);
  assert.equal(pkg.repository?.url?.replace(/^git\+/, ''), `https://github.com/${repository}.git`, `${pkg.name} has an unexpected repository URL.`);
  assert.equal(pkg.repository?.directory, renderer.directory, `${pkg.name} has an unexpected repository directory.`);
  assert.ok(pkg.exports && typeof pkg.exports === 'object' && Object.keys(pkg.exports).length > 2, `${pkg.name} has no built component exports; run pnpm build first.`);
  assert.equal(pkg.exports['./styles.css'], './dist/styles.css', `${pkg.name} must export its stylesheet.`);
  if (renderer.directory === 'packages/astro') {
    const dependencies = { ...pkg.dependencies, ...pkg.peerDependencies };
    assert.ok(!Object.keys(dependencies).some(name => name === 'react' || name === 'react-dom' || name.startsWith('@radix-ui/react-')), 'The native Astro package must not require React.');
  }
  return pkg;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed:\n${result.stdout ?? ''}\n${result.stderr ?? ''}`);
  return result.stdout;
}

async function checkRelease(tag, requireBuiltPackages = true) {
  const release = parseReleaseTag(tag);
  const source = await json(join(root, 'package.json'));
  assert.equal(source.version, release.version, `Root version must match ${release.tag}.`);
  assert.equal(source.private, true, 'The source package must stay private; publish only renderer packages.');
  const packages = requireBuiltPackages ? await Promise.all(renderers.map(async renderer => ({
    ...renderer,
    pkg: validatePublicPackage(await json(join(root, renderer.directory, 'package.json')), renderer, release),
  }))) : renderers;
  console.log(`Release ${release.version}: both renderers use npm dist-tag ${release.channel}.`);
  return { ...release, packages };
}

const integrity = bytes => `sha512-${createHash('sha512').update(bytes).digest('base64')}`;

async function packRelease(tag) {
  const release = await checkRelease(tag);
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  const packages = [];
  const cache = await mkdtemp(join(tmpdir(), 'enough-ui-release-cache-'));
  try {
    for (const renderer of release.packages) {
      const [packed] = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', output, '--cache', cache], { cwd: join(root, renderer.directory) }));
      assert.equal(basename(packed.filename), packed.filename, 'Unexpected archive path.');
      assert.equal(packed.name, renderer.name);
      assert.equal(packed.version, release.version);
      const files = new Set(packed.files.map(file => file.path));
      for (const required of ['package.json', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) {
        assert.ok(files.has(required), `${renderer.name} archive is missing ${required}.`);
      }
      const verifyExport = value => {
        if (typeof value === 'string' && value.startsWith('./')) assert.ok(files.has(value.slice(2)), `${renderer.name} archive is missing export ${value}.`);
        else if (value && typeof value === 'object') Object.values(value).forEach(verifyExport);
      };
      verifyExport(renderer.pkg.exports);
      const bytes = await readFile(join(output, packed.filename));
      assert.equal(integrity(bytes), packed.integrity, 'npm pack integrity does not match the archive.');
      packages.push({ name: renderer.name, directory: renderer.directory, version: release.version, filename: packed.filename, integrity: packed.integrity });
      console.log(`Packed ${renderer.name}@${release.version}.`);
    }
  } finally {
    await rm(cache, { recursive: true, force: true });
  }
  await writeFile(join(output, 'release.json'), JSON.stringify({
    tag: release.tag, version: release.version, channel: release.channel,
    commit: process.env.GITHUB_SHA ?? null, packages,
  }, null, 2) + '\n');
  console.log('Release archives are ready in artifacts/release/. No packages were published.');
}

export function parseRegistryResult(result, spec) {
  if (result.error) throw result.error;
  let value;
  try { value = JSON.parse(result.stdout); }
  catch { throw new Error(`Invalid npm registry response for ${spec}: ${result.stderr ?? result.stdout}`); }
  if (result.status === 0) {
    assert.ok(typeof value === 'string' && value.length > 0, `Missing registry metadata for ${spec}.`);
    return value;
  }
  if (value?.error?.code === 'E404') return null;
  throw new Error(`Unable to query ${spec}: ${value?.error?.code ?? result.status} ${value?.error?.summary ?? result.stderr ?? ''}`);
}

function registryValue(spec, field) {
  return parseRegistryResult(spawnSync('npm', ['view', spec, field, '--json', '--registry', registry, '--prefer-online'], {
    cwd: root, encoding: 'utf8',
  }), spec);
}

export function planPublication(packages, release, lookup) {
  return packages.map(pkg => {
    const existing = lookup(`${pkg.name}@${release.version}`, 'dist.integrity');
    if (existing !== null) {
      assert.equal(existing, pkg.integrity, `${pkg.name}@${release.version} already exists with a different archive; publish a new version.`);
      return { ...pkg, skip: true };
    }
    const current = lookup(`${pkg.name}@${release.channel}`, 'version');
    if (current !== null) {
      const published = parseReleaseTag(`v${current}`);
      assert.ok(compareVersions(release, published) > 0, `${pkg.name}: ${release.version} would move ${release.channel} backwards from ${current}.`);
    }
    return { ...pkg, skip: false };
  });
}

async function publishRelease(tag) {
  assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Publishing runs only in the protected GitHub release workflow.');
  assert.equal(process.env.GITHUB_REPOSITORY, repository, 'Publishing is restricted to the EnoughTools repository.');
  assert.equal(process.env.GITHUB_EVENT_NAME, 'push', 'Publishing requires a pushed release tag.');
  assert.equal(process.env.GITHUB_REF_TYPE, 'tag', 'Publishing requires a release tag.');
  assert.equal(process.env.GITHUB_REF_NAME, tag, 'The requested tag does not match the workflow tag.');
  assert.ok(process.env.ACTIONS_ID_TOKEN_REQUEST_URL && process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN, 'GitHub OIDC credentials are unavailable; verify id-token: write.');
  assert.ok(!process.env.NODE_AUTH_TOKEN && !process.env.NPM_TOKEN, 'Remove token authentication; this workflow uses trusted publishing.');
  const nodeVersion = process.versions.node.split('.').map(Number);
  assert.ok(nodeVersion[0] > 22 || (nodeVersion[0] === 22 && nodeVersion[1] >= 14), 'Trusted publishing requires Node.js >=22.14.0.');
  const npmVersion = run('npm', ['--version']).trim().split('.').map(Number);
  assert.ok(npmVersion[0] > 11 || (npmVersion[0] === 11 && (npmVersion[1] > 5 || (npmVersion[1] === 5 && npmVersion[2] >= 1))), 'Trusted publishing requires npm >=11.5.1.');

  const release = await checkRelease(tag, false);
  const manifest = await json(join(output, 'release.json'));
  for (const key of ['tag', 'version', 'channel']) assert.equal(manifest[key], release[key], `Artifact ${key} does not match the release.`);
  assert.equal(manifest.commit, process.env.GITHUB_SHA, 'Release archives were built from another commit.');
  assert.equal(manifest.packages.length, renderers.length, 'Both renderer archives must be present.');
  const packages = [];
  for (const renderer of renderers) {
    const matches = manifest.packages.filter(pkg => pkg.name === renderer.name);
    assert.equal(matches.length, 1, `Expected exactly one archive for ${renderer.name}.`);
    const pkg = matches[0];
    assert.equal(pkg.directory, renderer.directory);
    assert.equal(pkg.version, release.version);
    assert.equal(basename(pkg.filename), pkg.filename, 'Unexpected archive path.');
    assert.match(pkg.filename, /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.tgz$/, 'Unexpected archive filename.');
    const archive = join(output, pkg.filename);
    assert.equal(integrity(await readFile(archive)), pkg.integrity, `${pkg.name} archive integrity changed.`);
    const packedManifest = JSON.parse(run('tar', ['-xOf', archive, 'package/package.json']));
    validatePublicPackage(packedManifest, renderer, release);
    packages.push(pkg);
  }
  // Check both packages before making either registry write.
  const plan = planPublication(packages, release, registryValue);
  for (const pkg of plan) {
    if (pkg.skip) {
      console.log(`${pkg.name}@${release.version} already exists with identical integrity; skipped.`);
      continue;
    }
    run('npm', ['publish', join(output, pkg.filename), '--access', 'public', '--provenance', '--tag', release.channel, '--ignore-scripts', '--registry', registry], { stdio: 'inherit' });
  }
  console.log(`Both renderer packages are available at ${release.version}; channel ${release.channel}.`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  assert.ok(['check', 'pack', 'publish'].includes(command), 'Usage: node scripts/release.mjs <check|pack|publish> --tag v1.2.3');
  assert.ok(args.length === 0 || (args.length === 2 && args[0] === '--tag'), 'Only --tag vX.Y.Z is supported.');
  const tag = args[1] ?? process.env.GITHUB_REF_NAME;
  if (command === 'check') await checkRelease(tag);
  if (command === 'pack') await packRelease(tag);
  if (command === 'publish') await publishRelease(tag);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}

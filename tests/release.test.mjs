import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseReleaseTag, parseRegistryResult, planPublication, validatePublicPackage } from '../scripts/release.mjs';

const renderer = { name: '@enoughtools/ui-react', directory: 'packages/react' };
const publicPackage = {
  name: renderer.name, version: '1.2.3', license: 'MIT',
  publishConfig: { access: 'public' },
  repository: { url: 'git+https://github.com/enoughtools/enough-ui.git', directory: renderer.directory },
  exports: { '.': './dist/index.js', './button': './dist/components/ui/button.js', './styles.css': './dist/styles.css' },
};

test('stable releases use latest; every prerelease uses next', () => {
  assert.equal(parseReleaseTag('v1.2.3').channel, 'latest');
  assert.equal(parseReleaseTag('v1.2.3-rc.1').channel, 'next');
  assert.equal(parseReleaseTag('v0.0.0-alpha.0').channel, 'next');
  for (const tag of ['1.2.3', 'v01.2.3', 'v1.2', 'v1.2.3+build', 'v1.2.3-rc.01', 'v1.2.3-']) {
    assert.throws(() => parseReleaseTag(tag), undefined, tag);
  }
});

test('publication rejects the wrong version, private package, repository, or dist-tag', () => {
  const release = parseReleaseTag('v1.2.3');
  validatePublicPackage(publicPackage, renderer, release);
  for (const patch of [
    { version: '1.2.4' }, { private: true }, { license: 'UNLICENSED' },
    { name: '@rebnz/enough-ui' }, { repository: { ...publicPackage.repository, url: 'https://github.com/example/enough-ui.git' } },
    { publishConfig: { access: 'public', tag: 'next' } },
    { publishConfig: { access: 'public', provenance: false } },
    { exports: undefined },
  ]) assert.throws(() => validatePublicPackage({ ...publicPackage, ...patch }, renderer, release));
});

test('only a structured registry E404 means a version is absent', () => {
  assert.equal(parseRegistryResult({ status: 1, stdout: '{"error":{"code":"E404"}}' }, 'pkg@1'), null);
  assert.equal(parseRegistryResult({ status: 0, stdout: '"sha512-existing"' }, 'pkg@1'), 'sha512-existing');
  for (const code of ['E401', 'E403', 'ENOTFOUND', 'ETIMEDOUT']) {
    assert.throws(() => parseRegistryResult({ status: 1, stdout: JSON.stringify({ error: { code } }) }, 'pkg@1'));
  }
  assert.throws(() => parseRegistryResult({ status: 1, stdout: '', stderr: 'network unavailable' }, 'pkg@1'));
  assert.throws(() => parseRegistryResult({ status: 0, stdout: 'null' }, 'pkg@1'));
  assert.throws(() => parseRegistryResult({ status: 0, stdout: '{}' }, 'pkg@1'));
});

test('partial publication retries skip identical archives and reject conflicting archives', () => {
  const packages = [{ name: renderer.name, integrity: 'sha512-react' }, { name: '@enoughtools/ui-astro', integrity: 'sha512-astro' }];
  const release = parseReleaseTag('v1.2.3');
  const lookup = (spec, field) => spec === `${renderer.name}@1.2.3` ? 'sha512-react' : field === 'version' ? '1.2.2' : null;
  assert.deepEqual(planPublication(packages, release, lookup).map(pkg => pkg.skip), [true, false]);
  assert.throws(() => planPublication(packages, release, () => 'sha512-conflict'), /different archive/);
});

test('an older stable release cannot move latest backwards', () => {
  const packages = [{ name: renderer.name, integrity: 'sha512-react' }];
  assert.throws(() => planPublication(packages, parseReleaseTag('v1.2.3'), (_, field) => field === 'version' ? '2.0.0' : null), /backwards/);
  assert.equal(planPublication(packages, parseReleaseTag('v1.2.3'), (_, field) => field === 'version' ? '1.2.3-rc.1' : null)[0].skip, false);
  const prerelease = parseReleaseTag('v1.1.0-rc.1');
  assert.equal(planPublication(packages, prerelease, () => null)[0].skip, false);
});

test('an older prerelease cannot move next backwards; numeric identifiers follow semver order', () => {
  const packages = [{ name: renderer.name, integrity: 'sha512-react' }];
  assert.throws(() => planPublication(packages, parseReleaseTag('v1.2.3-rc.1'), (_, field) => field === 'version' ? '1.2.4-rc.1' : null), /next backwards/);
  assert.throws(() => planPublication(packages, parseReleaseTag('v1.2.3-rc.2'), (_, field) => field === 'version' ? '1.2.3-rc.10' : null), /next backwards/);
  assert.equal(planPublication(packages, parseReleaseTag('v1.2.3-rc.10'), (_, field) => field === 'version' ? '1.2.3-rc.2' : null)[0].skip, false);
});

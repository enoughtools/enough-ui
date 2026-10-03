import { readFile, access } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

export async function readParityManifest(rootDir = repositoryRoot) {
  return JSON.parse(await readFile(path.join(rootDir, 'docs/shadcn-radix-parity.json'), 'utf8'));
}

export function validateParityManifest(manifest) {
  const issues = [];
  if (manifest.schemaVersion !== 1) issues.push('Unsupported parity manifest version.');
  if (!/^[a-f0-9]{40}$/.test(manifest.reference?.commit ?? '')) issues.push('Pin a complete upstream commit.');
  const families = manifest.families ?? [];
  const ids = families.map(family => family.id);
  if (new Set(ids).size !== ids.length) issues.push('Each catalog family must appear exactly once.');
  const active = families.filter(family => !family.origin.startsWith('legacy-'));
  const legacy = families.filter(family => family.origin.startsWith('legacy-'));
  // Toast is listed in the current Radix docs even though its implementation is legacy.
  const currentLegacy = legacy.filter(family => family.id === 'toast');
  if (active.length + currentLegacy.length !== manifest.reference?.activeCatalogFamilies) {
    issues.push('The manifest must account for every family in the pinned active catalog.');
  }
  if (legacy.length - currentLegacy.length !== manifest.reference?.legacyCompatibilityFamilies) {
    issues.push('The manifest must account for its declared legacy compatibility families.');
  }
  for (const family of families) {
    if (!family.react?.runtimeExports?.length) issues.push(`${family.id}: define required public React exports.`);
    if (!family.requiredCapabilities?.length) issues.push(`${family.id}: document behavior beyond module names.`);
    if (!['native', 'native-with-island-behavior', 'react-island'].includes(family.astro?.mode)) {
      issues.push(`${family.id}: declare an explicit renderer contract.`);
    }
    if (family.origin.endsWith('registry') && (!family.upstreamSource || !family.upstreamBlob)) {
      issues.push(`${family.id}: include the pinned source path and blob.`);
    }
    if (family.astro?.mode !== 'react-island' && !family.astro?.requiredComponents?.length) {
      issues.push(`${family.id}: identify native Astro components.`);
    }
  }
  return issues;
}

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

/**
 * This is a structural coverage gate. Browser and renderer tests must establish
 * behavior, accessibility and visual quality separately.
 */
export async function inspectParity({ rootDir = repositoryRoot, built = false } = {}) {
  const manifest = await readParityManifest(rootDir);
  const issues = validateParityManifest(manifest);
  const sourcePaths = manifest.families.map(family =>
    path.join(rootDir, 'src/components/ui', `${family.id}.tsx`));
  const configuration = ts.readConfigFile(path.join(rootDir, 'tsconfig.json'), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(configuration.config ?? {}, ts.sys, rootDir);
  const program = ts.createProgram(sourcePaths, parsed.options);
  const checker = program.getTypeChecker();
  let reactFamilies = 0;
  let nativeComponents = 0;

  for (const [index, family] of manifest.families.entries()) {
    const sourcePath = sourcePaths[index];
    const source = program.getSourceFile(sourcePath);
    if (!source) {
      issues.push(`${family.id}: missing React source module.`);
    } else {
      const moduleSymbol = checker.getSymbolAtLocation(source);
      const exports = new Set(moduleSymbol ? checker.getExportsOfModule(moduleSymbol).map(symbol => symbol.name) : []);
      const required = [...family.react.runtimeExports, ...family.react.typeExports];
      const missing = required.filter(name => !exports.has(name));
      if (missing.length) issues.push(`${family.id}: missing public exports: ${missing.join(', ')}.`);
      else reactFamilies++;
    }

    for (const name of family.astro.requiredComponents) {
      if (await exists(path.join(rootDir, 'src/astro', `${name}.astro`))) nativeComponents++;
      else issues.push(`${family.id}: missing native Astro component ${name}.`);
      if (built && !(await exists(path.join(rootDir, 'dist/astro', `${name}.astro`)))) {
        issues.push(`${family.id}: missing built native Astro component ${name}; rebuild dist.`);
      }
    }

    if (built) {
      const entry = path.join(rootDir, 'dist/components/ui', `${family.id}.js`);
      const declarations = path.join(rootDir, 'dist/components/ui', `${family.id}.d.ts`);
      if (!(await exists(entry)) || !(await exists(declarations))) {
        issues.push(`${family.id}: missing JavaScript or declarations; rebuild dist.`);
        continue;
      }
      try {
        const runtime = await import(pathToFileURL(entry).href);
        const missing = family.react.runtimeExports.filter(name => !(name in runtime));
        if (missing.length) issues.push(`${family.id}: built entry lacks ${missing.join(', ')}.`);
      } catch (error) {
        issues.push(`${family.id}: built import failed: ${error.message}`);
      }
    }
  }
  return {
    upstreamCommit: manifest.reference.commit,
    totalFamilies: manifest.families.length,
    reactFamilies,
    requiredNativeComponents: manifest.families.reduce((sum, family) => sum + family.astro.requiredComponents.length, 0),
    nativeComponents,
    issues,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await inspectParity({ built: process.argv.includes('--built') });
  console.log(`Pinned shadcn coverage: ${result.reactFamilies}/${result.totalFamilies} React families; ${result.nativeComponents}/${result.requiredNativeComponents} native Astro components.`);
  if (result.issues.length) {
    for (const issue of result.issues) console.error(issue);
    process.exitCode = 1;
  } else {
    console.log('Public export coverage passed. Behavior and UI quality still require the rendering and browser checks.');
  }
}

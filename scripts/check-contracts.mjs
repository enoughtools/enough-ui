import { readFile, writeFile, mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(join(root, '.cache'), { recursive: true });
const directory = await mkdtemp(join(root, '.cache', 'contracts-'));
try {
  const manifest = JSON.parse(await readFile(join(root, 'docs/shadcn-radix-parity.json')));
  const snapshot = JSON.parse(await readFile(join(root, 'docs/shadcn-snapshot.json')));
  const assertions = [];
  for (const family of manifest.families) {
    for (const [component, props] of Object.entries(family.react.requiredProps ?? {})) {
      assertions.push(`import { ${component} as ${family.id.replaceAll('-', '_')}_${component} } from '#ui/${family.id}';`);
      for (const [prop, values] of Object.entries(props)) {
        const type = `React.ComponentProps<typeof ${family.id.replaceAll('-', '_')}_${component}>[${JSON.stringify(prop)}]`;
        const allowed = values.map(value => ['boolean', 'number', 'string'].includes(value) ? value : JSON.stringify(value)).join(' | ');
        assertions.push(`type Check_${assertions.length} = Expect<NotAny<${type}>>;`, `type Check_${assertions.length}_values = Expect<[${allowed}] extends [${type}] ? true : false>;`);
        if (!values.some(value => ['boolean', 'number', 'string'].includes(value))) assertions.push(`type Check_${assertions.length}_closed = Expect<string extends NonNullable<${type}> ? false : true>;`);
      }
    }
  }
  const fixture = await readFile(join(root, 'tests/contracts/public.tsx'), 'utf8');
  const fixtureSource = `import type * as React from 'react';\ntype Expect<T extends true> = T;\ntype NotAny<T> = 0 extends (1 & T) ? false : true;\n${assertions.join('\n')}\n${fixture}`;
  await writeFile(join(directory, 'fixture.tsx'), fixtureSource);
  await mkdir(join(directory, 'node_modules/@enoughtools'), {recursive:true});
  await symlink(join(root, 'packages/react'), join(directory, 'node_modules/@enoughtools/ui-react'), 'dir');
  await writeFile(join(directory, 'public.tsx'), fixtureSource.replaceAll("'#ui/", "'@enoughtools/ui-react/") + '\nimport { Trace as PublicTrace, CodeBlock as PublicBlock } from "@enoughtools/ui-react";\nconst rootExports = <PublicTrace><PublicBlock /></PublicTrace>;\nvoid rootExports;\n');
  // Reconstruct the immutable reference with reviewed import-only transforms.
  // Component bodies, signatures, defaults and primitive types stay upstream's.
  for (const [path, file] of Object.entries(snapshot.files)) {
    if (!path.startsWith('apps/v4/registry/bases/radix/')) continue;
    const local = path.slice('apps/v4/registry/bases/radix/'.length);
    const target = join(directory, 'reference', local);
    await mkdir(dirname(target), { recursive: true });
    let code = file.content.replaceAll('"cn"', JSON.stringify(join(root, 'src/lib/utils.js')))
      .replaceAll(/"@\/registry\/bases\/radix\/([^\"]+)"/g, (_, name) => JSON.stringify(join(directory, 'reference', name)))
      .replaceAll(/"@\/app\/\(create\)\/components\/icon-placeholder"/g, '"../icon-placeholder"');
    await writeFile(target, code);
  }
  await writeFile(join(directory, 'reference/icon-placeholder.tsx'), 'export function IconPlaceholder(props: Record<string, string>) { return <svg aria-hidden="true" /> }\n');
  const targets = {
    reference: join(directory, 'reference/ui/*'),
    source: join(root, 'src/components/ui/*'),
    built: join(root, 'packages/react/dist/components/ui/*'),
  };
  for (const [label, target] of Object.entries(targets)) {
    const program = ts.createProgram([join(directory, label === 'built' ? 'public.tsx' : 'fixture.tsx')], {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
      strict: true, skipLibCheck: true, noEmit: true, esModuleInterop: true,
      baseUrl: root, ...(label === 'built' ? {} : { paths: { '#ui/*': [target] } }),
    });
    const errors = ts.getPreEmitDiagnostics(program);
    if (errors.length) throw new Error(`${label} interface fixtures failed:\n${ts.formatDiagnosticsWithColorAndContext(errors, { getCurrentDirectory: () => root, getCanonicalFileName: file => file, getNewLine: () => '\n' })}`);
    console.log(`Public interface fixtures: ${label} passed, including ${assertions.length} required-prop assertions/imports.`);
  }
} finally { await rm(directory, { recursive: true, force: true }); }

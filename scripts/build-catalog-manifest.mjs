import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { toId, storyNameFromExport } from 'storybook/internal/csf';

const defaultRoot = fileURLToPath(new URL('../', import.meta.url));
const unknown = Symbol('not a static value');
const urlSafe = /^[a-zA-Z0-9 _-]*$/;
const excludedControls = new Set(['class', 'className', 'style', 'asChild', 'id', 'type']);

function unwrap(node) {
  while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression;
  return node;
}

function propertyName(node) {
  return node && (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) ? node.text : undefined;
}

// Parse only literal data and local constant references. Story files are never
// imported or evaluated, so browser-only fixtures and callbacks cannot run.
function literal(node, constants, seen = new Set()) {
  node = unwrap(node);
  if (!node) return unknown;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
    const value = literal(node.operand, constants, seen);
    return typeof value === 'number' ? -value : unknown;
  }
  if (ts.isIdentifier(node) && constants.has(node.text) && !seen.has(node.text)) {
    return literal(constants.get(node.text), constants, new Set([...seen, node.text]));
  }
  if (ts.isArrayLiteralExpression(node)) {
    const values = node.elements.map((element) => literal(element, constants, seen));
    return values.includes(unknown) ? unknown : values;
  }
  if (ts.isObjectLiteralExpression(node)) {
    const result = {};
    for (const property of node.properties) {
      if (ts.isSpreadAssignment(property)) {
        const spread = literal(property.expression, constants, seen);
        if (spread !== unknown && spread && typeof spread === 'object' && !Array.isArray(spread)) Object.assign(result, spread);
      } else if (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) {
        const name = propertyName(property.name);
        const value = literal(ts.isPropertyAssignment(property) ? property.initializer : property.name, constants, seen);
        if (name && value !== unknown) result[name] = value;
      }
    }
    return result;
  }
  return unknown;
}

function objectNode(node, constants) {
  node = unwrap(node);
  if (node && ts.isIdentifier(node)) node = unwrap(constants.get(node.text));
  return node && ts.isObjectLiteralExpression(node) ? node : undefined;
}

function propertyNode(node, name, constants) {
  const object = objectNode(node, constants);
  return object?.properties.find((property) => propertyName(property.name) === name)?.initializer;
}

function canControl(node, constants) {
  const render = unwrap(propertyNode(node, 'render', constants));
  return !render || (!(ts.isArrowFunction(render) || ts.isFunctionExpression(render)) || render.parameters.length > 0);
}

function scalar(value) {
  return typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value)) || (typeof value === 'string' && urlSafe.test(value));
}

function controlsFor(meta, story, args, acceptsArgs) {
  if (!acceptsArgs) return [];
  const declarations = { ...(meta.argTypes ?? {}), ...(story.argTypes ?? {}) };
  const names = new Set([...Object.keys(declarations), ...Object.keys(args)]);
  const controls = [];
  for (const name of names) {
    if (excludedControls.has(name) || !urlSafe.test(name)) continue;
    const declared = declarations[name];
    if (declared?.control === false || declared?.table?.disable || declared?.mapping) continue;
    const config = typeof declared?.control === 'object' ? declared.control : {};
    let type = typeof declared?.control === 'string' ? declared.control : config.type;
    const value = args[name];
    if (!type && scalar(value)) type = typeof value === 'string' ? 'text' : typeof value;
    if (['radio', 'inline-radio', 'select', 'inline-check', 'check', 'multi-select'].includes(type)) {
      if (['inline-check', 'check', 'multi-select'].includes(type)) continue;
      const options = declared?.options?.filter(scalar);
      if (!options?.length || options.length !== declared.options.length) continue;
      controls.push({ name, type: 'select', options, ...(value !== undefined && scalar(value) ? { value } : {}) });
    } else if (['boolean', 'number', 'range', 'text'].includes(type)) {
      if (value !== undefined && value !== null && !scalar(value)) continue;
      controls.push({ name, type, ...(value !== undefined ? { value } : {}), ...Object.fromEntries(['min', 'max', 'step'].filter((key) => typeof config[key] === 'number').map((key) => [key, config[key]])) });
    }
  }
  return controls;
}

function words(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2').replace(/[_-]+/g, ' ');
}

function componentName(title, exportName) {
  const family = title.slice(title.indexOf('/') + 1);
  if (family === 'Interactive catalog') return storyNameFromExport(exportName);
  return words(family === 'Fields' ? 'Field' : family);
}

function rewriteImports(source, renderer) {
  if (renderer === 'react') {
    return source.replace(/(['"])\.\/([a-z0-9-]+)\.js\1/g, (_, quote, module) => `${quote}@enoughtools/ui-react/${module}${quote}`)
      .replace(/(['"])\.\.\/\.\.\/hooks\/use-toast\.js\1/g, (_, quote) => `${quote}@enoughtools/ui-react/use-toast${quote}`);
  }
  return source.replace(/(['"])\.\.\/\.\.\/src\/astro\/([A-Za-z0-9]+)\.astro\1/g, (_, quote, component) => `${quote}@enoughtools/ui-astro/${words(component).toLowerCase().replaceAll(' ', '-')}${quote}`)
    .replace("import type { VariantProps } from 'class-variance-authority';\nimport { buttonVariants } from '../../src/lib/variants.js';", "import type { ComponentProps } from 'astro/types';")
    .replace(/VariantProps<typeof buttonVariants>/g, 'ComponentProps<typeof InputGroupButton>');
}

async function inlineFixtureData(file, source, ast) {
  for (const node of ast.statements) {
    if (!ts.isImportDeclaration(node)) continue;
    const path = node.moduleSpecifier.text;
    // Keep shared example data readable and portable without evaluating it.
    // The fixture contains only declarations and has no runtime imports.
    if (!path.startsWith('.') || !path.endsWith('/country-heatmap-data.js')) continue;
    const fixture = await readFile(resolve(dirname(file), path.replace(/\.js$/, '.ts')), 'utf8');
    source = source.replace(node.getText(ast), fixture.replace(/^export /gm, '').trim());
  }
  return source;
}

async function fixtureSource(file, source, ast, statement, renderer) {
  const kept = ast.statements.filter((node) => node === statement || !ts.isVariableStatement(node) || !node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));
  let snippet = await inlineFixtureData(file, rewriteImports(kept.map((node) => node.getText(ast)).join('\n\n'), renderer), ast);
  const imports = kept.filter(ts.isImportDeclaration).map((node) => rewriteImports(node.getText(ast), renderer)).filter((text) => text.includes(`@enoughtools/ui-${renderer}/`));
  if (renderer === 'react') {
    for (const node of ast.statements) {
      if (!ts.isImportDeclaration(node) || node.moduleSpecifier.text !== '../../lib/direction-icons.js') continue;
      const helper = await readFile(resolve(dirname(file), '../../lib/direction-icons.ts'), 'utf8');
      snippet = snippet.replace(node.getText(ast), helper.replace(/^export /gm, '').trim());
    }
  }
  if (renderer !== 'astro') return { source: snippet, imports: [...new Set(imports)] };
  const examples = [];
  for (const node of ast.statements) {
    if (!ts.isImportDeclaration(node)) continue;
    const path = node.moduleSpecifier.text;
    if (!path.startsWith('./') || !path.endsWith('.astro')) continue;
    const nativeFile = resolve(dirname(file), path);
    let nativeSource = rewriteImports(await readFile(nativeFile, 'utf8'), renderer).trim();
    const frontmatter = nativeSource.split(/^---\s*$/m)[1] ?? '';
    const nativeAst = ts.createSourceFile(path, frontmatter, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    nativeSource = await inlineFixtureData(nativeFile, nativeSource, nativeAst);
    examples.push(`/* ${path.slice(2)} — native example used by this story */\n${nativeSource}`);
    imports.push(...nativeAst.statements.filter(ts.isImportDeclaration).map((statement) => statement.getText(nativeAst)).filter((text) => text.includes('@enoughtools/ui-astro/')));
  }
  return { source: [snippet, ...examples].join('\n\n'), imports: [...new Set(imports)] };
}

export async function createCatalogManifest(root = defaultRoot) {
  const groups = new Map();
  const folders = [resolve(root, 'src/components/ui'), resolve(root, 'stories/astro')];
  const files = (await Promise.all(folders.map(async (folder) => (await readdir(folder)).filter((file) => /\.stories\.(tsx?|js)$/.test(file)).map((file) => resolve(folder, file))))).flat().sort();
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.JS);
    const constants = new Map();
    for (const statement of ast.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) constants.set(declaration.name.text, declaration.initializer);
      }
    }
    const defaultExport = ast.statements.find(ts.isExportAssignment);
    const meta = literal(defaultExport?.expression, constants);
    if (meta === unknown || !meta?.title) throw new Error(`Missing literal Storybook title: ${relative(root, file)}`);
    const renderer = meta.title.startsWith('Astro/') ? 'astro' : 'react';
    for (const statement of ast.statements) {
      if (!ts.isVariableStatement(statement) || !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !objectNode(declaration.initializer, constants)) continue;
        const exportName = declaration.name.text;
        const story = literal(declaration.initializer, constants);
        const name = componentName(meta.title, exportName);
        const slug = name.toLowerCase().replaceAll(' ', '-');
        if (!groups.has(slug)) groups.set(slug, { slug, name, react: [], astro: [] });
        const args = { ...(meta.args ?? {}), ...(story.args ?? {}) };
        groups.get(slug)[renderer].push({
          id: toId(meta.id ?? meta.title, storyNameFromExport(exportName)),
          name: story.name ?? storyNameFromExport(exportName),
          ...(await fixtureSource(file, source, ast, statement, renderer)),
          args,
          controls: controlsFor(meta, story, args, canControl(defaultExport?.expression, constants) && canControl(declaration.initializer, constants)),
        });
      }
    }
  }
  const components = [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
  const react = components.reduce((count, component) => count + component.react.length, 0);
  const astro = components.reduce((count, component) => count + component.astro.length, 0);
  return { version: 1, stats: { components: components.length, stories: react + astro, react, astro }, components };
}

export async function writeCatalogManifest(root = defaultRoot) {
  const manifest = await createCatalogManifest(root);
  const output = resolve(root, '.storybook/catalog/manifest.json');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Catalog manifest: ${manifest.stats.components} components, ${manifest.stats.stories} shared React/Astro examples.`);
  return manifest;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await writeCatalogManifest();

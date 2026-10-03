import type * as Monaco from 'monaco-editor';
// Monaco provides its grammar definition as JavaScript without a declaration.
// @ts-expect-error The public package export resolves to its shipped ESM grammar.
import { language as shippedTypeScript } from 'monaco-editor/languages/definitions/typescript/typescript.js';

type Monarch = Monaco.languages.IMonarchLanguage;
type Rule = Monaco.languages.IMonarchLanguageRule;
type Runtime = typeof import('monaco-editor');
const registered = new WeakSet<object>();

const jsxOpening: Rule[] = [
  [/<>/, { token: 'delimiter', next: '@jsxChildren' }],
  [/(<)(?!(?:typeof|keyof|infer|const|extends)\b)([A-Za-z_$][\w$.:-]*)(?=\s|\/?>)/, [{ token: 'delimiter' }, { token: 'tag', next: '@jsxTag' }]],
];

function tsxLanguage(): Monarch {
  const base = shippedTypeScript as Monarch;
  const code: Rule[] = [
    // Consume named type arguments before seeing their '<' as JSX. This also
    // handles React.ComponentProps<T> and useState<T> in the actual fixtures.
    [/([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)(<)/, ['type.identifier', { token: 'delimiter', next: '@genericType' }]],
    ...jsxOpening,
    [/[{}]/, 'delimiter.bracket'],
    { include: 'common' },
  ];
  return {
    ...base,
    tokenPostfix: '.tsx',
    tokenizer: {
      ...base.tokenizer,
      root: code,
      genericType: [
        [/</, { token: 'delimiter', next: '@push' }],
        [/>/, { token: 'delimiter', next: '@pop' }],
        [/[{}]/, 'delimiter.bracket'],
        { include: 'common' },
      ],
      jsxTag: [
        [/\s+/, ''],
        [/\/>/, { token: 'delimiter', next: '@pop' }],
        [/>/, { token: 'delimiter', switchTo: '@jsxChildren' }],
        [/\{/, { token: 'delimiter.bracket', next: '@jsxExpression' }],
        [/[A-Za-z_:][\w:.-]*/, 'attribute.name'],
        [/=/, 'delimiter'],
        [/"/, 'attribute.value', '@jsxAttributeDouble'],
        [/'/, 'attribute.value', '@jsxAttributeSingle'],
        [/[^\s/>={}"']+/, 'attribute.value'],
      ],
      jsxAttributeDouble: [[/[^"\\]+/, 'attribute.value'], [/\\./, 'attribute.value'], [/"/, 'attribute.value', '@pop']],
      jsxAttributeSingle: [[/[^'\\]+/, 'attribute.value'], [/\\./, 'attribute.value'], [/'/, 'attribute.value', '@pop']],
      jsxChildren: [
        [/(<\/)([A-Za-z_$][\w$.:-]*)(\s*>)/, ['delimiter', 'tag', { token: 'delimiter', next: '@pop' }]],
        [/<\/>/, { token: 'delimiter', next: '@pop' }],
        ...jsxOpening,
        [/\{/, { token: 'delimiter.bracket', next: '@jsxExpression' }],
        [/[^<{]+/, 'string'],
        [/[<{]/, 'delimiter'],
      ],
      jsxExpression: [
        [/\{/, { token: 'delimiter.bracket', next: '@push' }],
        [/\}/, { token: 'delimiter.bracket', next: '@pop' }],
        ...code.filter((rule) => !(Array.isArray(rule) && String(rule[0]) === String(/[{}]/))),
      ],
    },
  };
}

function astroLanguage(): Monarch {
  const typescript = tsxLanguage();
  return {
  ...typescript,
  defaultToken: '',
  tokenPostfix: '.astro',
  tokenizer: {
    ...typescript.tokenizer,
    root: [
      [/^---\s*$/, { token: 'delimiter', next: '@frontmatter', nextEmbedded: 'typescript' }],
      [/<!--/, 'comment', '@htmlComment'],
      [/<!DOCTYPE\b[^>]*>/i, 'metatag'],
      [/(<\/?)([A-Za-z][\w:.-]*)/, ['delimiter', { token: 'tag', next: '@tag' }]],
      [/<\/?\s*>/, 'delimiter'],
      [/\{/, { token: 'delimiter.bracket', next: '@expression' }],
      [/[^<{]+/, ''],
      [/[<{]/, 'delimiter'],
    ],
    frontmatter: [
      [/^---\s*$/, { token: 'delimiter', next: '@pop', nextEmbedded: '@pop' }],
      [/./, ''],
    ],
    htmlComment: [[/-->/, 'comment', '@pop'], [/[^-]+/, 'comment'], [/-/, 'comment']],
    tag: [
      [/\s+/, ''],
      [/\/?>/, 'delimiter', '@pop'],
      [/\{/, { token: 'delimiter.bracket', next: '@expression' }],
      [/[A-Za-z_:][\w:.-]*/, 'attribute.name'],
      [/=/, 'delimiter'],
      [/"/, 'attribute.value', '@attributeDouble'],
      [/'/, 'attribute.value', '@attributeSingle'],
      [/[^\s/>={}"']+/, 'attribute.value'],
    ],
    attributeDouble: [[/[^"\\]+/, 'attribute.value'], [/\\./, 'attribute.value'], [/"/, 'attribute.value', '@pop']],
    attributeSingle: [[/[^'\\]+/, 'attribute.value'], [/\\./, 'attribute.value'], [/'/, 'attribute.value', '@pop']],
    // Monarch's nextEmbedded scanner cannot count nested braces and would end
    // at a brace inside a string or JSX prop. Reuse its TypeScript states here
    // so objects, templates, comments, regexes and nested JSX remain balanced.
    expression: typescript.tokenizer.jsxExpression,
  },
  };
}

/** Register once per Monaco instance; all imports remain in the source bundle. */
export function registerSourceLanguages(monaco: Runtime): void {
  if (registered.has(monaco)) return;
  registered.add(monaco);
  if (!monaco.languages.getLanguages().some(({ id }) => id === 'typescript')) monaco.languages.register({ id: 'typescript', extensions: ['.ts'] });
  monaco.languages.setMonarchTokensProvider('typescript', shippedTypeScript as Monarch);
  monaco.languages.register({ id: 'tsx', aliases: ['TypeScript JSX', 'TSX'], extensions: ['.tsx'] });
  monaco.languages.setMonarchTokensProvider('tsx', tsxLanguage());
  monaco.languages.setLanguageConfiguration('tsx', {
    comments: { lineComment: '//', blockComment: ['/*', '*/'] },
    brackets: [['{', '}'], ['[', ']'], ['(', ')']],
  });
  monaco.languages.register({ id: 'astro', aliases: ['Astro'], extensions: ['.astro'] });
  monaco.languages.setMonarchTokensProvider('astro', astroLanguage());
  monaco.languages.setLanguageConfiguration('astro', {
    comments: { blockComment: ['<!--', '-->'] },
    brackets: [['{', '}'], ['[', ']'], ['(', ')']],
    autoClosingPairs: [{ open: '{', close: '}' }, { open: '"', close: '"' }, { open: "'", close: "'" }],
  });
}

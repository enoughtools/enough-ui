import { expect, test } from 'vitest';
import { loadHighlighter } from '../../src/lib/highlighter.js';

test.each(['constructor', 'toString', '__proto__', 'hasOwnProperty', 'unknown-language'])(
  'unsupported language %s falls back without loading a grammar', async (language) => {
    await expect(loadHighlighter(language)).resolves.toBeNull();
  },
);

test('supported aliases and mixed-case names still highlight source', async () => {
  for (const language of ['TS', 'TypeScript']) {
    const highlighter = await loadHighlighter(language);
    expect(highlighter).not.toBeNull();
    expect(highlighter!.highlight('const ready = true;').lines).toHaveLength(1);
  }
});

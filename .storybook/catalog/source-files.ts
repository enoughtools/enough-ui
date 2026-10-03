export type SourceFile = {
  name: string;
  language: 'tsx' | 'javascript' | 'astro';
  value: string;
};

/** Keep complete files intact instead of highlighting Astro markup as TSX. */
export function createSourceFiles(source: string, slug: string, renderer: 'react' | 'astro'): SourceFile[] {
  const filename = slug.replace(/[^a-zA-Z0-9_-]/g, '-') || 'component';
  if (renderer === 'react') return [{ name: `${filename}.stories.tsx`, language: 'tsx', value: source.trim() }];
  const boundaries = [...source.matchAll(/^\/\*\s+([^\r\n]+?\.astro)\s+— native example used by this story \*\/\r?$/gm)];
  if (!boundaries.length) {
    const native = /^\s*---\s*(?:\r?\n|$)/.test(source);
    return [{ name: `${filename}.${native ? 'astro' : 'stories.js'}`, language: native ? 'astro' : 'javascript', value: source.trim() }];
  }
  const files: SourceFile[] = [];
  const story = source.slice(0, boundaries[0].index).trim();
  if (story) files.push({ name: `${filename}.stories.js`, language: 'javascript', value: story });
  boundaries.forEach((boundary, index) => {
    const start = boundary.index! + boundary[0].length;
    const end = boundaries[index + 1]?.index ?? source.length;
    files.push({ name: boundary[1].trim(), language: 'astro', value: source.slice(start, end).trim() });
  });
  return files;
}

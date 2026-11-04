import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

export async function renderingInputs(root) {
  const paths = ['Package.swift', 'examples/swift-catalog/Sources/EnoughUICatalog/GalleryFixtures.swift', 'examples/swift-catalog/Sources/EnoughUICatalog/GalleryCapture.swift', 'scripts/swift/GalleryCaptureApp.swift'];
  const collect = async directory => {
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) await collect(path);
      else if (entry.name.endsWith('.swift')) paths.push(path);
    }
  };
  await collect('packages/swift/Sources/EnoughUI');
  await collect('examples/swift-catalog/Sources/EnoughUICatalog/Gallery');
  return Object.fromEntries(await Promise.all(paths.sort().map(async path => [path, createHash('sha256').update(await readFile(join(root, path))).digest('hex')])));
}

export async function screenshotHashes(root) {
  const directory = join(root, 'docs/assets/swift');
  const files = (await readdir(directory)).filter(file => file.endsWith('.png')).sort();
  return Object.fromEntries(await Promise.all(files.map(async file => [file, createHash('sha256').update(await readFile(join(directory, file))).digest('hex')])));
}

import { execFileSync } from 'node:child_process';
import { mkdir, readdir, readFile, copyFile, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { renderingInputs, screenshotHashes } from './swift-gallery-evidence.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const run = (command, args, options = {}) => execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...options });
const output = join(root, 'docs/assets/swift');
await mkdir(output, { recursive: true });
run('swift', ['run', '--package-path', 'examples/swift-catalog', 'EnoughUICatalog', '--gallery-output', output], { stdio: 'inherit' });
run('xcodebuild', ['-scheme', 'EnoughUI', '-destination', 'generic/platform=iOS Simulator', '-derivedDataPath', 'artifacts/swift-gallery-derived', 'CODE_SIGNING_ALLOWED=NO', 'build'], { stdio: 'ignore' });
const app = join(root, 'artifacts/SwiftGalleryCapture.app');
await rm(app, { recursive: true, force: true });
await mkdir(app, { recursive: true });
const sdk = run('xcrun', ['--sdk', 'iphonesimulator', '--show-sdk-path']).trim();
const product = join(root, 'artifacts/swift-gallery-derived/Build/Products/Debug-iphonesimulator');
const fixtureDirectory = join(root, 'examples/swift-catalog/Sources/EnoughUICatalog/Gallery');
const fixtures = (await readdir(fixtureDirectory)).filter(file => file.endsWith('.swift')).map(file => join(fixtureDirectory, file));
run('xcrun', ['swiftc', '-module-name', 'SwiftGalleryCapture', '-profile-generate', '-parse-as-library', '-sdk', sdk, '-target', 'arm64-apple-ios16.0-simulator', '-I', product,
  join(product, 'EnoughUI.o'), ...fixtures, 'examples/swift-catalog/Sources/EnoughUICatalog/GalleryFixtures.swift',
  'scripts/swift/GalleryCaptureApp.swift', '-o', join(app, 'SwiftGalleryCapture')]);
await writeFile(join(app, 'Info.plist'), `<?xml version="1.0" encoding="UTF-8"?><plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>SwiftGalleryCapture</string><key>CFBundleIdentifier</key><string>com.enoughtools.SwiftGalleryCapture</string>
<key>CFBundleName</key><string>SwiftGalleryCapture</string><key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleSupportedPlatforms</key><array><string>iPhoneSimulator</string></array><key>MinimumOSVersion</key><string>16.0</string>
<key>UIDeviceFamily</key><array><integer>1</integer><integer>2</integer></array><key>UILaunchScreen</key><dict/>
<key>UIApplicationSceneManifest</key><dict><key>UIApplicationSupportsMultipleScenes</key><false/><key>UISceneConfigurations</key><dict><key>UIWindowSceneSessionRoleApplication</key><array><dict><key>UISceneConfigurationName</key><string>Default</string><key>UISceneClassName</key><string>UIWindowScene</string><key>UISceneDelegateClassName</key><string>SwiftGalleryCapture.GalleryCaptureScene</string></dict></array></dict></dict>
</dict></plist>`);
run('codesign', ['--force', '--sign', '-', app]);
const runtimes = JSON.parse(run('xcrun', ['simctl', 'list', 'runtimes', '--json'])).runtimes;
const runtime = runtimes.find(item => item.isAvailable && item.name.startsWith('iOS') && (!process.env.ENOUGH_UI_IOS_RUNTIME || item.name === process.env.ENOUGH_UI_IOS_RUNTIME));
if (!runtime) throw new Error('Install an iOS simulator runtime in Xcode before capturing native previews.');
const device = run('xcrun', ['simctl', 'create', 'EnoughUI Gallery Capture', 'com.apple.CoreSimulator.SimDeviceType.iPhone-16', runtime.identifier]).trim();
try {
  run('xcrun', ['simctl', 'boot', device]);
  run('xcrun', ['simctl', 'bootstatus', device, '-b']);
  run('xcrun', ['simctl', 'install', device, app]);
  run('xcrun', ['simctl', 'launch', device, 'com.enoughtools.SwiftGalleryCapture']);
  const container = run('xcrun', ['simctl', 'get_app_container', device, 'com.enoughtools.SwiftGalleryCapture', 'data']).trim();
  let files;
  for (let attempt = 0; attempt < 180; attempt++) {
    try { files = await readdir(join(container, 'Documents/SwiftGallery')); if (files.includes('DONE')) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!files?.includes('DONE')) throw new Error('Native iOS capture did not finish. Inspect the simulator app before publishing.');
  for (const file of files.filter(file => file.endsWith('.png'))) await copyFile(join(container, 'Documents/SwiftGallery', file), join(output, file));
} finally {
  try { run('xcrun', ['simctl', 'shutdown', device]); } catch {}
  run('xcrun', ['simctl', 'delete', device]);
}
const sources = {};
for (const file of fixtures) {
  const source = await readFile(file);
  const metadata = JSON.parse(source.toString().split('\n')[0].slice('// gallery: '.length));
  sources[metadata.id] = createHash('sha256').update(source).digest('hex');
}
await writeFile(join(output, 'provenance.json'), JSON.stringify({
  swift: run('swift', ['--version']).trim().split('\n')[0],
  xcode: run('xcodebuild', ['-version']).trim(),
  iosRuntime: runtime.name, iosDevice: 'iPhone 16',
  capture: 'Actual NSHostingView/AppKit and UIHostingController/UIKit hierarchies from the native demo fixtures.', sources,
  renderingInputs: await renderingInputs(root), screenshots: await screenshotHashes(root)
}, null, 2) + '\n');
run(process.execPath, ['scripts/build-swift-gallery.mjs'], { stdio: 'inherit' });

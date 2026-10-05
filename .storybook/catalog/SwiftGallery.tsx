import React, { useEffect, useMemo, useState } from 'react';
import { updateCanonicalURL } from './canonical';
import { useStorybookState } from 'storybook/manager-api';
import { ArrowLeft, Check, Code, Copy, Search } from 'lucide-react';
import manifestData from './swift-manifest.json';
import { SourceEditor } from './SourceEditor';

type Platform = 'macos' | 'ios';
type Theme = 'light' | 'dark';
type Preview = { path: string; width: number; height: number };
type Component = { id: string; title: string; category: string; description: string; file: string; source: string; previews: Record<string, Preview> };
const manifest = manifestData as { components: Component[]; sourceRef: string; evidence: { iosDevice: string; iosRuntime: string } };
const categories = ['All components', 'Actions', 'Forms', 'Content', 'Feedback', 'Layout', 'Navigation'];
const href = (slug = '') => `/swift?${new URLSearchParams({ path: `/swift/${slug}` })}`;
const repository = 'https://github.com/enoughtools/enough-ui';

function CopyButton({ value, label = 'Copy Swift source' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => { if (copied) { const timer = setTimeout(() => setCopied(false), 1800); return () => clearTimeout(timer); } }, [copied]);
  return <button className="eui-button eui-small" aria-label={copied ? 'Copied' : label} onClick={async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setError(false); } catch { setError(true); }
  }}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy'}{error && <span role="status">Select the text to copy.</span>}</button>;
}

function PreviewOptions({ platform, theme, setPlatform, setTheme }: { platform: Platform; theme: Theme; setPlatform: (platform: Platform) => void; setTheme: (theme: Theme) => void }) {
  return <div className="eui-swift-options">
    <div className="eui-category-tabs" role="group" aria-label="Preview platform">
      <button aria-pressed={platform === 'macos'} onClick={() => setPlatform('macos')}>macOS</button>
      <button aria-pressed={platform === 'ios'} onClick={() => setPlatform('ios')}>iPhone · iOS</button>
    </div>
    <div className="eui-category-tabs" role="group" aria-label="Preview appearance">
      <button aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>Light</button>
      <button aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>Dark</button>
    </div>
  </div>;
}

export function SwiftGallery() {
  const state = useStorybookState();
  const route = (state.path ?? '/swift').replace(/^\/swift\/?/, '');
  const component = manifest.components.find(item => item.id === route);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All components');
  const [platform, setPlatform] = useState<Platform>('macos');
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => { document.title = `${component?.title ?? (route === 'getting-started' ? 'Install Swift' : 'SwiftUI components')} — EnoughUI`; updateCanonicalURL('swift', route); document.querySelector('.eui-catalog')?.scrollTo(0, 0); }, [route, component]);
  const matches = useMemo(() => manifest.components.filter(item =>
    (category === 'All components' || item.category === category) && `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase())
  ), [category, query]);
  return <div className="eui-catalog eui-swift-catalog">
    <a className="eui-skip" href={`${href(route)}#swift-content`}>Skip to content</a>
    <header className="eui-header">
      <a href="/?path=/catalog/" className="eui-brand" aria-label="EnoughUI home"><picture><source media="(max-width: 400px)" srcSet="/brand/mark-ink.svg" /><img className="eui-brand-logo" src="/brand/enough-ui-ink.svg" alt="" width="147" height="32" /></picture></a>
      <nav className="eui-header-nav" aria-label="Primary navigation">
        <a href="/?path=/catalog/">Web · React/Astro</a>
        <a href="/swift" aria-current="page">Swift · Apple apps</a>
      </nav>
      <div className="eui-header-right"><a className="eui-swift-install-link" href={href('getting-started')}>Install</a><a className="eui-github" href={repository} aria-label="EnoughUI on GitHub"><Code size={18} /></a></div>
    </header>
    <main id="swift-content" className="eui-main eui-swift-main">
      {component ? <SwiftComponent key={component.id} component={component} platform={platform} theme={theme} setPlatform={setPlatform} setTheme={setTheme} /> : route === 'getting-started' ? <SwiftInstallation /> : route ? <div className="eui-not-found"><h1>Component not found</h1><a href="/swift">Browse Swift components</a></div> : <>
        <div className="eui-page-heading eui-swift-heading"><div><div className="eui-eyebrow">ENOUGHUI FOR APPLE APPS</div><h1>Native, familiar, Enough.</h1><p>Paper surfaces. Fine rules. Clear type.<br />The EnoughUI language, at home in SwiftUI.</p><div className="eui-swift-hero-actions"><a className="eui-button eui-swift-primary" href={href('getting-started')}>Get started with Swift</a><a className="eui-button" href={`${repository}/tree/${manifest.sourceRef}/examples/swift-catalog`}>Try the native examples</a></div></div><div className="eui-heading-count"><strong>{manifest.components.length}</strong><span>component families<br />macOS + iOS/iPadOS</span></div></div>
        <div className="eui-swift-intro"><p>A native library for macOS 13+ and iOS/iPadOS 16+. No third-party dependencies.</p><p>Browse real native captures below. Run the Swift demo to edit fields, open menus and try interactions.</p></div>
        <PreviewOptions {...{ platform, theme, setPlatform, setTheme }} />
        <div className="eui-swift-search-row"><label className="eui-search"><Search size={17} /><input type="search" placeholder="Find a Swift component…" aria-label="Find a Swift component" value={query} onChange={event => setQuery(event.target.value)} /></label><span className="eui-result-count" aria-live="polite">{matches.length} component families</span></div>
        <div className="eui-catalog-toolbar"><div className="eui-category-tabs" role="group" aria-label="Filter Swift components">{categories.map(name => <button key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}</div></div>
        {matches.length === 0 ? <div className="eui-empty"><h2>No components found</h2><p>Try a different name or category.</p><button className="eui-button" onClick={() => { setQuery(''); setCategory('All components'); }}>Clear filters</button></div> : <div className="eui-grid eui-swift-grid">{matches.map(item => {
          const preview = item.previews[`${platform}-${theme}`];
          return <a className="eui-tile has-preview" key={item.id} href={href(item.id)}><div className={`eui-tile-preview eui-swift-tile-preview is-${theme}`}><img src={preview.path} alt={`${item.title} rendered with SwiftUI on ${platform === 'macos' ? 'macOS' : 'iOS'} in ${theme} appearance`} width={preview.width} height={preview.height} loading="lazy" decoding="async" /></div><div className="eui-tile-body"><div className="eui-tile-title"><h2>{item.title}</h2></div><p>{item.description}</p><div className="eui-tile-meta"><span>{item.category}</span><span>SwiftUI</span></div></div></a>;
        })}</div>}
        <section className="eui-swift-native-note"><h2>Build with the platform.</h2><p>System controls keep their native shape, focus, editing and accessibility behavior. Tables, charts, context menus and file dialogs compose directly with EnoughUI. iPad apps use the same library with adaptive SwiftUI layouts.</p><a href={`${repository}/blob/${manifest.sourceRef}/packages/swift/README.md`}>Read the Swift component guide</a></section>
      </>}
      <footer className="eui-page-footer"><span>EnoughUI · SwiftUI · Open source · MIT</span><a href="/?path=/catalog/">Explore React & Astro</a></footer>
    </main>
  </div>;
}

function SwiftComponent({ component, platform, theme, setPlatform, setTheme }: { component: Component; platform: Platform; theme: Theme; setPlatform: (platform: Platform) => void; setTheme: (theme: Theme) => void }) {
  const [tab, setTab] = useState<'preview' | 'source'>('preview');
  const [wrap, setWrap] = useState(true);
  const [findRequest, setFindRequest] = useState(0);
  const preview = component.previews[`${platform}-${theme}`];
  const activateTab = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'preview' : event.key === 'End' ? 'source' : tab === 'source' ? 'preview' : 'source';
    setTab(next); document.getElementById(next === 'source' ? 'source-tab' : 'swift-preview-tab')?.focus();
  };
  return <>
    <a className="eui-breadcrumb" href="/swift"><ArrowLeft size={14} />All Swift components</a>
    <div className="eui-component-heading"><div><div className="eui-eyebrow">SWIFTUI · {component.category.toUpperCase()}</div><h1>{component.title}</h1><p>{component.description}</p></div><a className="eui-button" href={`${repository}/blob/${manifest.sourceRef}/examples/swift-catalog/Sources/EnoughUICatalog/Gallery/${component.file}`}>View on GitHub</a></div>
    <PreviewOptions {...{ platform, theme, setPlatform, setTheme }} />
    <div className="eui-playground">
      <div className="eui-playground-top"><div className="eui-view-tabs" role="tablist" aria-label="Swift example view">
        <button id="swift-preview-tab" role="tab" aria-selected={tab === 'preview'} tabIndex={tab === 'preview' ? 0 : -1} aria-controls="swift-preview-panel" onKeyDown={activateTab} onClick={() => setTab('preview')}>Native preview</button>
        <button id="source-tab" role="tab" aria-selected={tab === 'source'} tabIndex={tab === 'source' ? 0 : -1} aria-controls="swift-source-panel" onKeyDown={activateTab} onClick={() => setTab('source')}>Swift source</button>
      </div><CopyButton value={component.source} /></div>
      <div id="swift-preview-panel" role="tabpanel" aria-labelledby="swift-preview-tab" hidden={tab !== 'preview'}><div className={`eui-swift-stage is-${theme} is-${platform}`}><img src={preview.path} alt={`${component.title}: actual ${platform === 'macos' ? 'macOS' : 'iPhone'} SwiftUI rendering in ${theme} appearance`} width={preview.width} height={preview.height} /></div><p className="eui-swift-caption">{platform === 'macos' ? 'Captured from native macOS controls.' : `Captured on ${manifest.evidence.iosDevice} in the ${manifest.evidence.iosRuntime} simulator.`} {['presentations', 'menus', 'combobox'].includes(component.id) ? 'This preview shows the trigger; open the native demo to try its presentation.' : 'Run the native example to try interactions.'}</p></div>
      <div id="swift-source-panel" role="tabpanel" aria-labelledby="source-tab" hidden={tab !== 'source'} className="eui-source"><div className="eui-source-file"><span>{component.file}</span><div className="eui-source-tools"><button className="eui-button eui-small" aria-pressed={wrap} onClick={() => setWrap(!wrap)}>Wrap lines</button><button className="eui-button eui-small" onClick={() => setFindRequest(findRequest + 1)}>Find in source</button></div></div>{tab === 'source' && <SourceEditor value={component.source} language="swift" filename={component.file} wrap={wrap} findRequest={findRequest} />}</div>
    </div>
    <div className="eui-swift-native-note"><h2>Try it in your app.</h2><p>Place this example inside <code>EnoughThemeProvider</code>. SwiftUI bindings keep state in your app; commands, validation and destinations remain yours.</p><div className="eui-swift-hero-actions"><a className="eui-button" href={href('getting-started')}>Install EnoughUI</a><a className="eui-button" href={`${repository}/tree/${manifest.sourceRef}/examples/swift-catalog`}>Run the native demo</a></div></div>
  </>;
}

function SwiftInstallation() {
  const install = '.package(url: "https://github.com/enoughtools/enough-ui.git", from: "0.5.0")';
  const example = `import SwiftUI\nimport EnoughUI\n\nstruct WelcomeView: View {\n    var body: some View {\n        EnoughThemeProvider {\n            EnoughCard {\n                EnoughCardHeader("Welcome", description: "Make yourself at home.")\n                EnoughButton("Get started", variant: .primary) { }\n            }.padding()\n        }\n    }\n}\n`;
  return <>
    <a className="eui-breadcrumb" href="/swift"><ArrowLeft size={14} />All Swift components</a>
    <div className="eui-page-heading"><div><div className="eui-eyebrow">SWIFT PACKAGE MANAGER</div><h1>A native starting point.</h1><p>macOS 13+ · iOS/iPadOS 16+ · Swift 5.9+</p></div></div>
    <div className="eui-swift-install-grid">
      <section className="eui-swift-install-card"><h2>Add it in Xcode.</h2><p>Choose <strong>File → Add Package Dependencies</strong>, enter the repository URL, then add the <strong>EnoughUI</strong> product to your app target. Use a release containing Swift support, version 0.5.0 or later.</p><div className="eui-swift-copy-line"><code>https://github.com/enoughtools/enough-ui.git</code><CopyButton value="https://github.com/enoughtools/enough-ui.git" label="Copy package URL" /></div><a href={`${repository}/releases`}>View available releases</a></section>
      <section className="eui-swift-install-card"><h2>Use a Swift package.</h2><p>Add the package dependency to your manifest, then add <code>.product(name: "EnoughUI", package: "enough-ui")</code> to your target dependencies.</p><div className="eui-swift-copy-line"><code>{install}</code><CopyButton value={install} label="Copy Swift package dependency" /></div><p>SwiftPM downloads the tagged sources. Node, npm and web frameworks are not required.</p></section>
    </div>
    <section className="eui-swift-install-card eui-swift-first-example"><h2>Build your first screen.</h2><div className="eui-source-file"><span>WelcomeView.swift</span><CopyButton value={example} /></div><div className="eui-source"><SourceEditor value={example} language="swift" filename="WelcomeView.swift" wrap findRequest={0} /></div></section>
    <section className="eui-swift-native-note"><h2>Try every component.</h2><p>Clone EnoughUI, then run the native demo from the repository:</p><div className="eui-swift-copy-line"><code>swift run --package-path examples/swift-catalog EnoughUICatalog</code><CopyButton value="swift run --package-path examples/swift-catalog EnoughUICatalog" label="Copy native demo command" /></div><p>The same compiled examples produce this gallery’s screenshots. The demo has editable controls, native menus, selection and presentations.</p><a href={`${repository}/tree/${manifest.sourceRef}/examples/swift-catalog`}>Open the native example sources</a></section>
  </>;
}

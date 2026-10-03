import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStorybookApi, useStorybookState } from 'storybook/manager-api';
import { ArrowLeft, Search, Copy, Check, X, Menu, SlidersHorizontal, RotateCcw, Monitor, Smartphone, Code, Blocks } from 'lucide-react';
import manifestData from './manifest.json';
import { componentInfo, categoryOrder } from './descriptions';
import { SourceEditor } from './SourceEditor';
import { createSourceFiles } from './source-files';

type Control = { name: string; type: string; options?: (string | number)[]; min?: number; max?: number; step?: number };
type Example = { id: string; name: string; source: string; imports?: string[]; args: Record<string, unknown>; controls: Control[] };
type Component = { slug: string; name: string; react: Example[]; astro: Example[] };
type Renderer = 'react' | 'astro';
const manifest = manifestData as unknown as { components: Component[]; stats: { components: number; stories: number } };
const featured = ['country-heatmap', 'button', 'card', 'input', 'dialog', 'badge', 'tabs', 'select', 'accordion', 'message'];
const info = (item: Component) => componentInfo[item.slug] ?? { description: 'Explore examples and available variants.', category: 'Layout' };
const href = (slug = '', renderer?: Renderer, example?: string) => {
  const params = new URLSearchParams({ path: `/catalog/${slug}` });
  if (renderer) params.set('renderer', renderer);
  if (example) params.set('example', example);
  return `?${params}`;
};
const previewURL = (example: Example, values: Record<string, unknown> = {}) => {
  const query = new URLSearchParams({ id: example.id, viewMode: 'story', embed: 'true' });
  const args = Object.entries(values).filter(([, value]) => typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string' && /^[a-zA-Z0-9 _-]*$/.test(value)).map(([key, value]) => `${key}:${typeof value === 'boolean' ? `!${value}` : value}`).join(';');
  if (args) query.set('args', args);
  return `iframe.html?${query}`;
};

function CopyButton({ value, label = 'Copy source' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => { if (copied) { const timer = setTimeout(() => setCopied(false), 1800); return () => clearTimeout(timer); } }, [copied]);
  return <button className="eui-button eui-small" onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setError(false); } catch { setError(true); } }} aria-label={copied ? 'Copied' : label}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy'}{error && <span role="status">Select the text to copy.</span>}</button>;
}

function StoryFrame({ example, values, small = false, mobile = false, reset = 0 }: { example: Example; values?: Record<string, unknown>; small?: boolean; mobile?: boolean; reset?: number }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const url = previewURL(example, values);
  useEffect(() => { setLoaded(false); setFailed(false); }, [url, reset]);
  return <div className={`eui-stage ${small ? 'eui-stage-small' : ''} ${mobile ? 'eui-stage-mobile' : ''}`}>
    {!loaded && !small && <span className="eui-loading" role="status">Loading example…</span>}
    <iframe key={`${url}-${reset}`} ref={frameRef} title={`${example.name} live example`} src={url} data-is-storybook="true" loading={small ? 'lazy' : 'eager'} tabIndex={small ? -1 : 0} onLoad={() => {
      setLoaded(true);
      try {
        const doc = frameRef.current?.contentDocument;
        if (doc) {
          const style = doc.createElement('style');
          style.textContent = 'html,body{background:#fff!important}html{scrollbar-gutter:auto!important}body{margin:0!important}body.sb-show-main.sb-main-padded{padding:24px!important}';
          doc.head.appendChild(style);
          setFailed(Boolean(doc.querySelector('.sb-errordisplay') && getComputedStyle(doc.querySelector('.sb-errordisplay')!).display !== 'none'));
        }
      } catch { /* Browser still provides the direct example link. */ }
    }} onError={() => setFailed(true)} />
    {failed && <div className="eui-frame-error" role="alert">This example could not load. <a href={`?path=/story/${example.id}`}>Open it in Storybook</a>.</div>}
  </div>;
}

function ComponentThumbnail({ component }: { component: Component }) {
  const [unavailable, setUnavailable] = useState(false);
  const example = component.react[0] ?? component.astro[0];
  return <div className="eui-tile-preview" aria-hidden="true" inert>
    {unavailable ? <StoryFrame example={example} small /> : <img src={`previews/${component.slug}.png`} alt="" width="720" height="440" loading="lazy" decoding="async" onError={() => setUnavailable(true)} />}
  </div>;
}

export function Catalog() {
  const api = useStorybookApi();
  const state = useStorybookState();
  const route = (state.path ?? '/catalog').replace(/^\/catalog\/?/, '');
  const component = manifest.components.find(item => item.slug === route);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All components');
  const [menuOpen, setMenuOpen] = useState(false);
  const [smallScreen, setSmallScreen] = useState(() => window.matchMedia('(max-width: 650px)').matches);
  const searchRef = useRef<HTMLInputElement>(null);
  const go = (url: string) => { api.navigate(url, { plain: true }); setMenuOpen(false); };
  const link = (event: React.MouseEvent, url: string) => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) { event.preventDefault(); go(url); } };
  useEffect(() => { document.title = `${component?.name ?? (route === 'getting-started' ? 'Get started' : 'Components')} — EnoughUI`; }, [route, component]);
  useEffect(() => { document.querySelector('.eui-catalog')?.scrollTo(0, 0); }, [route]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 650px)');
    const update = () => setSmallScreen(media.matches);
    media.addEventListener('change', update); return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => { if (menuOpen && smallScreen) searchRef.current?.focus(); }, [menuOpen, smallScreen]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setMenuOpen(true); searchRef.current?.focus(); } if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, []);
  const matches = useMemo(() => manifest.components.filter(item => {
    const detail = info(item);
    return (category === 'All components' || detail.category === category) && `${item.name} ${detail.description} ${detail.category}`.toLowerCase().includes(query.toLowerCase());
  }).sort((a, b) => {
    const first = featured.indexOf(a.slug), second = featured.indexOf(b.slug);
    return (first < 0 ? 100 : first) - (second < 0 ? 100 : second) || a.name.localeCompare(b.name);
  }), [category, query]);
  const navItems = manifest.components.filter(item => `${item.name} ${info(item).description}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  return <div className="eui-catalog">
    <a className="eui-skip" href="#catalog-content">Skip to content</a>
    <header className="eui-header">
      <a href={href()} className="eui-brand" onClick={event => link(event, href())} aria-label="EnoughUI home"><picture><source media="(max-width: 400px)" srcSet="/brand/mark-ink.svg" /><img className="eui-brand-logo" src="/brand/enough-ui-ink.svg" alt="" width="147" height="32" /></picture></a>
      <nav aria-label="Primary navigation" className="eui-header-nav">
        <a href={href()} onClick={event => link(event, href())} aria-current={route !== 'getting-started' ? 'page' : undefined}>Components</a>
        <a href={href('getting-started')} onClick={event => link(event, href('getting-started'))} aria-current={route === 'getting-started' ? 'page' : undefined}>Get started</a>
      </nav>
      <div className="eui-header-right"><span className="eui-status"><i />React & Astro</span><a className="eui-github" href="https://github.com/enoughtools/enough-ui" target="_blank" rel="noreferrer" aria-label="EnoughUI on GitHub"><Code size={18} /></a><button className="eui-mobile-menu eui-icon-button" aria-label={menuOpen ? 'Close component menu' : 'Open component menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </header>
    {menuOpen && <button className="eui-menu-backdrop" aria-label="Close component menu" onClick={() => setMenuOpen(false)} />}
    <aside className={`eui-sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Component navigation" inert={smallScreen && !menuOpen} aria-hidden={smallScreen && !menuOpen ? true : undefined}>
      <label className="eui-search"><Search size={17} /><input ref={searchRef} type="search" placeholder="Find a component…" aria-label="Find a component" value={query} onChange={event => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label>
      <div className="eui-side-intro"><a href={href()} onClick={event => link(event, href())} className={!route ? 'is-current' : ''}><Blocks size={16} />All components<span>{manifest.stats.components}</span></a><a href={href('getting-started')} onClick={event => link(event, href('getting-started'))} className={route === 'getting-started' ? 'is-current' : ''}>Get started</a></div>
      <div className="eui-side-caption">COMPONENTS<span>{navItems.length}</span></div>
      <nav className="eui-component-nav" aria-label="Components">{navItems.map(item => <a key={item.slug} href={href(item.slug)} onClick={event => link(event, href(item.slug))} aria-current={item.slug === route ? 'page' : undefined} className={item.slug === route ? 'is-current' : ''}>{item.name}{item.astro.length > 0 && <span className="eui-native-dot" title="Native Astro available" />}</a>)}{navItems.length === 0 && <p className="eui-side-empty">No matching components.</p>}</nav>
      <div className="eui-sidebar-footer">Square edges. Clear type.<br /><a href="https://github.com/enoughtools/enough-ui/blob/main/LICENSE" target="_blank" rel="noreferrer">Open source · MIT </a></div>
    </aside>
    <main id="catalog-content" className="eui-main">
      {component ? <ComponentPage key={component.slug} component={component} /> : route === 'getting-started' ? <GettingStarted /> : route ? <div className="eui-not-found"><h1>Component not found</h1><a href={href()} onClick={event => link(event, href())}>Browse the catalog </a></div> : <>
        <div className="eui-page-heading"><div><div className="eui-eyebrow">THE COMPONENT LIBRARY</div><h1>Enough to build on.</h1><p>Find your next component. Try it, inspect it, make it yours.</p></div><div className="eui-heading-count"><strong>{manifest.stats.components}</strong><span>components<br />React + Astro</span></div></div>
        <div className="eui-catalog-toolbar"><div className="eui-category-tabs" role="group" aria-label="Filter by category">{categoryOrder.map(name => <button key={name} onClick={() => setCategory(name)} aria-pressed={category === name}>{name}</button>)}</div><span className="eui-result-count" aria-live="polite">{matches.length} components</span></div>
        {matches.length === 0 ? <div className="eui-empty"><Search size={26} /><h2>No components found</h2><p>Try a different name or category.</p><button className="eui-button" onClick={() => { setQuery(''); setCategory('All components'); }}>Clear filters</button></div> : <div className="eui-grid">{matches.map(item => {
          return <a className="eui-tile has-preview" key={item.slug} href={href(item.slug)} onClick={event => link(event, href(item.slug))}>
            <ComponentThumbnail component={item} />
            <div className="eui-tile-body"><div className="eui-tile-title"><h2>{item.name}</h2></div><p>{info(item).description}</p><div className="eui-tile-meta"><span>{info(item).category}</span><span>{item.react.length > 0 ? 'React' : ''}{item.react.length > 0 && item.astro.length > 0 ? ' + ' : ''}{item.astro.length > 0 ? 'Astro' : ''}</span></div></div>
          </a>;
        })}</div>}
        <footer className="eui-page-footer"><span>EnoughUI · {manifest.stats.stories} live examples</span><span>One library. Two renderers.</span></footer>
      </>}
    </main>
  </div>;
}

function ComponentPage({ component }: { component: Component }) {
  const params = new URLSearchParams(location.search);
  const initialRenderer = params.get('renderer') === 'astro' && component.astro.length ? 'astro' : component.react.length ? 'react' : 'astro';
  const [renderer, setRenderer] = useState<Renderer>(initialRenderer);
  const examples = component[renderer];
  const [selected, setSelected] = useState(params.get('example') ?? examples[0]?.id);
  const example = examples.find(item => item.id === selected) ?? examples[0];
  const [tab, setTab] = useState('preview');
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [mobile, setMobile] = useState(false);
  const [reset, setReset] = useState(0);
  const [shared, setShared] = useState(false);
  const [sourceFilename, setSourceFilename] = useState('');
  const [wrapSource, setWrapSource] = useState(true);
  const [findRequest, setFindRequest] = useState(0);
  const sourceFiles = useMemo(() => createSourceFiles(example.source, component.slug, renderer), [example.source, component.slug, renderer]);
  const sourceFile = sourceFiles.find(file => file.name === sourceFilename) ?? sourceFiles.find(file => file.language === 'astro') ?? sourceFiles[0];
  // Storybook Astro pre-renders static exports; its compiled variants remain
  // selectable, while React stories can accept live argument updates.
  const controls = renderer === 'react' ? example.controls ?? [] : [];
  const choose = (nextRenderer: Renderer, nextId?: string) => {
    setRenderer(nextRenderer); setSelected(nextId ?? component[nextRenderer][0].id); setValues({}); setReset(value => value + 1);
    if (nextRenderer !== renderer) setSourceFilename('');
    const url = new URL(location.href); url.searchParams.set('renderer', nextRenderer); url.searchParams.set('example', nextId ?? component[nextRenderer][0].id); history.replaceState(null, '', url);
  };
  const publicImports = example.imports ?? example.source.split('\n').filter(line => /^import /.test(line) && line.includes(`@enoughtools/ui-${renderer}/`));
  const componentImports = publicImports.filter(line => line.includes(`/${component.slug}'`) || line.includes(`/${component.slug}"`));
  const importText = (componentImports.length ? componentImports : publicImports).join('\n');
  return <>
    <div className="eui-breadcrumb"><a href={href()}>Components</a><span>/</span>{component.name}</div>
    <div className="eui-component-heading"><div><span className="eui-eyebrow">{info(component).category}</span><h1>{component.name}</h1><p>{info(component).description}</p></div><a className="eui-button eui-small" href={`?path=/story/${example.id}`}><SlidersHorizontal size={15} />Storybook </a></div>
    <div className="eui-renderer-tabs" role="group" aria-label="Renderer">{(['react', 'astro'] as Renderer[]).filter(type => component[type].length > 0).map(type => <button key={type} aria-pressed={renderer === type} onClick={() => choose(type)}>{type === 'react' ? 'React' : 'Astro'}<span>{component[type].length}</span></button>)}<span className="eui-runtime-label">{renderer === 'astro' ? 'Native HTML · select an example' : 'Interactive React components'}</span></div>
    <section className="eui-playground" aria-label={`${component.name} playground`}>
      <div className="eui-playground-top"><div className="eui-view-tabs" role="tablist" aria-label="Example view" onKeyDown={event => { if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? "preview" : event.key === "End" ? "source" : tab === "preview" ? "source" : "preview"; setTab(next); document.getElementById(`${next}-tab`)?.focus(); } }}><button role="tab" id="preview-tab" aria-controls="example-preview" aria-selected={tab === 'preview'} tabIndex={tab === 'preview' ? 0 : -1} onClick={() => setTab('preview')}>Preview</button><button role="tab" id="source-tab" aria-controls="example-source" aria-selected={tab === 'source'} tabIndex={tab === 'source' ? 0 : -1} onClick={() => setTab('source')}>Source</button></div><div className="eui-preview-actions">{tab === 'preview' ? <><button className="eui-icon-button" aria-label="Desktop preview" aria-pressed={!mobile} onClick={() => setMobile(false)}><Monitor size={17} /></button><button className="eui-icon-button" aria-label="Mobile preview" aria-pressed={mobile} onClick={() => setMobile(true)}><Smartphone size={17} /></button><button className="eui-icon-button" aria-label="Reset example" onClick={() => { setValues({}); setReset(value => value + 1); }}><RotateCcw size={16} /></button></> : <CopyButton value={sourceFile.value} />}</div></div>
      <div className="eui-example-select"><label htmlFor="example-select">Example</label><select id="example-select" value={example.id} onChange={event => choose(renderer, event.target.value)}>{examples.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><span>{examples.length} {examples.length === 1 ? 'example' : 'examples'}</span></div>
      {tab === 'preview' ? <div role="tabpanel" id="example-preview" aria-labelledby="preview-tab"><StoryFrame example={example} values={values} mobile={mobile} reset={reset} /></div> : <div className="eui-source" role="tabpanel" id="example-source" aria-labelledby="source-tab"><div className="eui-source-note"><div className="eui-source-file">{sourceFiles.length > 1 ? <label>Source file<select aria-label="Source file" value={sourceFile.name} onChange={event => setSourceFilename(event.target.value)}>{sourceFiles.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}</select></label> : <span>{sourceFile.name}</span>}<span className="eui-source-language">{sourceFile.language === 'astro' ? 'Astro' : sourceFile.language === 'javascript' ? 'JavaScript' : 'TSX'}</span></div><div className="eui-source-tools"><button className="eui-text-button" aria-label="Find in source" onClick={() => setFindRequest(request => request + 1)}>Find</button><button className="eui-text-button" aria-pressed={wrapSource} onClick={() => setWrapSource(!wrapSource)}>Wrap lines</button></div></div><SourceEditor value={sourceFile.value} language={sourceFile.language} filename={sourceFile.name} wrap={wrapSource} findRequest={findRequest} /></div>}
      <div className="eui-playground-footer"><span>{example.name} / {renderer === 'react' ? 'React' : 'Astro'}</span><a href={previewURL(example, values)} target="_blank" rel="noreferrer">Open preview </a></div>
    </section>
    {renderer === 'astro' && <p className="eui-native-note">Astro examples render native HTML. Choose an example above to explore the compiled variants.</p>}
    {controls.length > 0 && <section className="eui-controls"><div className="eui-section-heading"><h2>Make it yours</h2><span>Adjust the live example</span></div><div className="eui-control-grid">{controls.map(control => <label className={`eui-control ${control.type === 'boolean' ? 'eui-control-boolean' : ''}`} key={control.name}><span>{control.name}</span>{control.type === 'select' || control.options ? <select aria-label={control.name} value={String(values[control.name] ?? example.args[control.name] ?? control.options?.[0] ?? '')} onChange={event => setValues(previous => ({ ...previous, [control.name]: control.options?.find(option => String(option) === event.target.value) ?? event.target.value }))}>{control.options?.map(option => <option key={String(option)} value={option}>{option}</option>)}</select> : control.type === 'boolean' ? <input aria-label={control.name} type="checkbox" checked={Boolean(values[control.name] ?? example.args[control.name])} onChange={event => setValues(previous => ({ ...previous, [control.name]: event.target.checked }))} /> : <input aria-label={control.name} type={(control.type === 'number' || control.type === 'range') ? 'number' : 'text'} pattern={(control.type === 'number' || control.type === 'range') ? undefined : '[a-zA-Z0-9 _-]*'} min={control.min} max={control.max} step={control.step} value={String(values[control.name] ?? example.args[control.name] ?? '')} onChange={event => { if ((control.type === 'number' || control.type === 'range')) { if (event.target.value !== '') setValues(previous => ({ ...previous, [control.name]: Number(event.target.value) })); } else if (/^[a-zA-Z0-9 _-]*$/.test(event.target.value)) setValues(previous => ({ ...previous, [control.name]: event.target.value })); }} />}</label>)}</div></section>}
    <section className="eui-usage"><div className="eui-section-heading"><h2>Use this component</h2><a href={href('getting-started')}>Setup guide </a></div><div className="eui-import"><code>{importText}</code><CopyButton value={importText} label="Copy import" /></div>{renderer === 'astro' && <p>Use native attributes and slots. Keep stateful controls together in a React island.</p>}</section>
    <section className="eui-example-links"><div className="eui-section-heading"><h2>All examples</h2><span>{examples.length} variations</span></div><div>{examples.map(item => <button key={item.id} className={item.id === example.id ? 'is-selected' : ''} onClick={() => { choose(renderer, item.id); setTab('preview'); document.querySelector('.eui-playground')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{item.name}</button>)}</div></section>
    <footer className="eui-page-footer"><a href={href()}><ArrowLeft size={14} />All components</a><button className="eui-text-button" onClick={async () => { try { await navigator.clipboard.writeText(location.href); setShared(true); setTimeout(() => setShared(false), 1800); } catch { setShared(false); } }}>{shared ? 'Link copied' : 'Copy example link'}<Copy size={14} /></button></footer>
  </>;
}

function GettingStarted() {
  const reactCode = `import { Button } from '@enoughtools/ui-react/button';\nimport '@enoughtools/ui-react/styles.css';\n\nexport function SaveButton() {\n  return <Button variant="accent">Save changes</Button>;\n}`;
  const astroCode = `---\nimport Button from '@enoughtools/ui-astro/button';\nimport '@enoughtools/ui-astro/styles.css';\n---\n<Button href="/start" variant="accent">Get started</Button>`;
  return <div className="eui-guide"><span className="eui-eyebrow">START BUILDING</span><h1>A little structure.<br />A lot of possibility.</h1><p className="eui-guide-intro">Shared styles. Native Astro markup. Interactive React controls. Choose the renderer that fits your page.</p><section><h2>01 / Choose your renderer</h2><div className="eui-guide-options"><div><h3>React</h3><p>For React apps and interactive islands in Astro. State, keyboard behavior, and accessibility live together.</p><code>@enoughtools/ui-react</code></div><div><h3>Astro</h3><p>For presentational components rendered as native HTML. Shared variants and styling, with no React dependency.</p><code>@enoughtools/ui-astro</code></div></div></section><section><h2>02 / Install your renderer</h2><p>Install the public npm package for your renderer. Use both when an Astro page needs interactive React islands.</p><h3>React</h3><div className="eui-guide-code"><CopyButton value="pnpm add @enoughtools/ui-react react react-dom" /><pre>pnpm add @enoughtools/ui-react react react-dom</pre></div><h3>Astro</h3><div className="eui-guide-code"><CopyButton value="pnpm add @enoughtools/ui-astro" /><pre>pnpm add @enoughtools/ui-astro</pre></div><p>When working on the library locally, rebuild the source and use a directory dependency on <code>packages/react</code> or <code>packages/astro</code>.</p></section><section><h2>03 / Import a component and its styles</h2><h3>React</h3><div className="eui-guide-code"><CopyButton value={reactCode} /><pre>{reactCode}</pre></div><h3>Astro</h3><div className="eui-guide-code"><CopyButton value={astroCode} /><pre>{astroCode}</pre></div><p>Import <code>styles.css</code> once for the complete theme and reset. Use <code>components.css</code> when your app supplies its own base styles.</p></section><section><h2>04 / Add interaction in Astro</h2><p>Install the React renderer and Astro’s React integration. Put related stateful controls into one React component, then hydrate that composition with <code>client:load</code> or <code>client:visible</code>.</p><a className="eui-button" href="https://github.com/enoughtools/enough-ui#astro" target="_blank" rel="noreferrer">Read the full setup guide </a></section><section><h2>Keep your own visual language.</h2><p>Theme tokens control color and typography. All text uses proportional fonts, including code and keyboard hints.</p><div className="eui-guide-code"><CopyButton value={':root {\n  --color-accent: #6d28d9;\n  --font-sans: "Inter", system-ui, sans-serif;\n}'} /><pre>{':root {\n  --color-accent: #6d28d9;\n  --font-sans: "Inter", system-ui, sans-serif;\n}'}</pre></div></section></div>;
}

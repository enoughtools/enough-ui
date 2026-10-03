import React, { useEffect, useRef, useState } from 'react';

type Controller = {
  update(value: string, language: string, wrap: boolean): void;
  find(): void;
  dispose(): void;
};
type Runtime = { createSourceEditor(host: HTMLElement, value: string, language: string, filename: string, wrap: boolean, onExit: () => void): Controller };
let runtimePromise: Promise<Runtime> | undefined;

function loadRuntime() {
  if (!runtimePromise) {
    const styles = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLLinkElement>('link[data-enough-editor]');
      if (existing?.sheet) { resolve(); return; }
      const link = existing ?? document.createElement('link');
      link.rel = 'stylesheet'; link.href = '/editor/editor.css'; link.dataset.enoughEditor = 'true';
      link.onload = () => resolve(); link.onerror = () => { link.remove(); reject(new Error('Editor styles could not load')); };
      if (!existing) document.head.appendChild(link);
    });
    const runtimeURL = new URL('/editor/editor.js', location.origin).href;
    runtimePromise = Promise.all([styles, import(/* @vite-ignore */ runtimeURL)]).then(([, runtime]) => runtime as Runtime).catch(error => { runtimePromise = undefined; throw error; });
  }
  return runtimePromise;
}

export function SourceEditor({ value, language, filename, wrap, findRequest }: { value: string; language: string; filename: string; wrap: boolean; findRequest: number }) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<Controller | null>(null);
  const pendingFind = useRef(false);
  const latest = useRef({ value, language, wrap });
  latest.current = { value, language, wrap };
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  useEffect(() => {
    let active = true;
    setStatus('loading');
    loadRuntime().then(runtime => {
      if (!active || !host.current) return;
      const current = latest.current;
      controller.current = runtime.createSourceEditor(host.current, current.value, current.language, filename, current.wrap, () => document.getElementById('source-tab')?.focus());
      if (pendingFind.current) { controller.current.find(); pendingFind.current = false; }
      setStatus('ready');
    }).catch(() => { if (active) setStatus('failed'); });
    return () => { active = false; controller.current?.dispose(); controller.current = null; };
  }, [filename]);
  useEffect(() => { controller.current?.update(value, language, wrap); }, [value, language, wrap]);
  useEffect(() => {
    if (!findRequest) return;
    if (controller.current) controller.current.find();
    else pendingFind.current = true;
  }, [findRequest]);
  return <>
    {status === 'loading' && <div className="eui-editor-status" role="status">Loading source viewer…</div>}
    {status === 'failed' && <div className="eui-editor-fallback"><p role="status">The editor could not load. Source is available below.</p><pre tabIndex={0}><code>{value}</code></pre></div>}
    <div className="eui-source-editor" ref={host} hidden={status === 'failed'} />
    <div className="eui-source-help">Find with ⌘ F or Ctrl F · Press Esc to leave the viewer</div>
  </>;
}

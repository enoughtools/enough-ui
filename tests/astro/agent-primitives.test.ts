import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { composeStories, renderStory } from '@storybook-astro/framework/testing';
import * as stories from '../../stories/astro/AgentPrimitives.stories.js';
import { Trace, TraceLine, TraceTitle } from '../../src/components/ui/trace.js';
import { CodeBlock, CodeBlockContent } from '../../src/components/ui/code-block.js';

test('native trace and numbered code use the same styles and whitespace contract', async () => {
  const html = await renderStory(composeStories(stories).Numbered);
  expect(html).not.toMatch(/<script\b|astro-island|font-mono/);
  const reference = new DOMParser().parseFromString(renderToStaticMarkup(React.createElement(React.Fragment, null,
    React.createElement(Trace, null, React.createElement(TraceLine, null, React.createElement(TraceTitle, null, 'Read the source'))),
    React.createElement(CodeBlock, null, React.createElement(CodeBlockContent, {lineNumbers:true,startLine:10}, 'const ready = true;\n\nexport { ready };\n')))), 'text/html');
  for (const slot of ['trace', 'trace-line', 'trace-title', 'code-block', 'code-block-content', 'code-block-code', 'code-block-line']) {
    expect(document.querySelector(`[data-slot="${slot}"]`)?.getAttribute('class')).toBe(reference.querySelector(`[data-slot="${slot}"]`)?.getAttribute('class'));
  }
  expect(document.querySelector('pre')?.getAttribute('dir')).toBe('ltr');
  expect(document.querySelectorAll('[data-slot="code-block-line-content"]')[1].textContent).toBe('\n');
});
test('native diff retains added/removed/highlighted lines', async () => {
  await renderStory(composeStories(stories).Diff);
  for (const variant of ['added', 'removed', 'highlighted']) expect(document.querySelector(`[data-slot="code-block-line"][data-variant="${variant}"]`)).not.toBeNull();
});

test('native agent work shares status hierarchy and nested spacing with React', async () => {
  const compositions = await import('../../stories/astro/AgentCompositions.stories.js');
  const { AgentWork } = await import('../../src/components/ui/agent-work.js');
  const html = await renderStory(composeStories(compositions).Transcript);
  expect(html).not.toMatch(/<script\b|astro-island/);
  const native = document.querySelector('[data-slot="trace"]')!;
  const reference = new DOMParser().parseFromString(renderToStaticMarkup(React.createElement(AgentWork, {steps:[{id:'agent',title:'Research agent',status:'completed'}]})), 'text/html');
  for (const slot of ['trace','trace-line','trace-title','trace-icon']) {
    const actual = slot === 'trace' ? native : native.querySelector(`[data-slot="${slot}"]`)!;
    expect(actual.getAttribute('class')).toBe(reference.querySelector(`[data-slot="${slot}"]`)?.getAttribute('class'));
  }
  expect(native.textContent).toContain('Completed:');
  expect(native.querySelectorAll('.enough-agent-step')).toHaveLength(2);
});

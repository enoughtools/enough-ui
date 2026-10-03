import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { composeStories, renderStory } from '@storybook-astro/framework/testing';
import * as stories from '../../stories/astro/Conversation.stories.js';
import * as attachments from '../../src/components/ui/attachment.js';
import * as bubbles from '../../src/components/ui/bubble.js';
import * as messages from '../../src/components/ui/message.js';

const composed = composeStories(stories);

test('native conversation parts share React styles and render without hydration', async () => {
  const html = await renderStory(composed.Composed);
  const reference = renderToStaticMarkup(React.createElement(messages.MessageGroup, { className: 'w-[min(38rem,calc(100vw-2rem))]' },
    React.createElement(messages.Message, {},
      React.createElement(messages.MessageAvatar, { className: 'h-8 w-8 text-xs font-semibold' }, 'AL'),
      React.createElement(messages.MessageContent, {},
        React.createElement(messages.MessageHeader, {}, 'Alex'),
        React.createElement(bubbles.BubbleGroup, {},
          React.createElement(bubbles.Bubble, { variant: 'secondary' }, React.createElement(bubbles.BubbleContent, {}, 'Ready'), React.createElement(bubbles.BubbleReactions, {}, '1'))),
        React.createElement(attachments.AttachmentGroup, {},
          React.createElement(attachments.Attachment, {}, React.createElement(attachments.AttachmentMedia, {}, 'File'), React.createElement(attachments.AttachmentContent, {}, React.createElement(attachments.AttachmentTitle, {}, 'summary.pdf'), React.createElement(attachments.AttachmentDescription, {}, 'PDF')),
            React.createElement(attachments.AttachmentActions, {}, React.createElement(attachments.AttachmentAction, { size: 'sm' }, 'Download')), React.createElement(attachments.AttachmentTrigger, {}))),
        React.createElement(messages.MessageFooter, {}, 'Delivered')))));
  const react = new DOMParser().parseFromString(reference, 'text/html');
  for (const element of react.querySelectorAll('[data-slot]')) {
    expect(document.querySelector(`[data-slot="${element.getAttribute('data-slot')}"]`)?.getAttribute('class')).toBe(element.getAttribute('class'));
  }
  expect(document.querySelector('[data-slot="attachment-trigger"]')?.getAttribute('aria-label')).toBe('Preview research-summary.pdf');
  expect(document.querySelector('[data-slot="attachment-action"]')?.getAttribute('download')).toBe('research-summary.pdf');
  expect(html).not.toMatch(/<astro-island|<script\b/);
});

test('native upload states communicate progress and errors', async () => {
  await renderStory(composed.Uploading);
  expect(document.querySelector('[data-slot="attachment"]')?.getAttribute('aria-busy')).toBe('true');
  expect(document.querySelector('[data-slot="attachment-description"]')?.textContent).toContain('Uploading · 64%');
  await renderStory(composed.FailedUpload);
  expect(document.querySelector('[data-slot="attachment-description"]')?.textContent).toContain('Upload failed. Please try again.');
});

test('disabled native attachment links cannot be activated or focused', async () => {
  await renderStory(composed.Disabled);
  for (const slot of ['attachment-trigger', 'attachment-action']) {
    const element = document.querySelector(`[data-slot="${slot}"]`)!;
    expect(element.hasAttribute('href')).toBe(false);
    expect(element.getAttribute('aria-disabled')).toBe('true');
    expect(element.getAttribute('tabindex')).toBe('-1');
  }
});

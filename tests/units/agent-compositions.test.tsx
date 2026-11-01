import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { AgentConfirmation } from '../../src/components/ui/agent-confirmation.js';
import * as composers from '../../src/components/ui/prompt-composer.stories.js';
import * as work from '../../src/components/ui/agent-work.stories.js';
import { Sources, InlineCitation } from '../../src/components/ui/sources.js';

test('failed approvals remain retryable and settled transcript receipts cannot execute', async () => {
  const onDecision = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValue(undefined);
  const request = {id:'one',title:'Run command?'};
  const { rerender } = render(<AgentConfirmation request={request} onDecision={onDecision} />);
  fireEvent.click(screen.getByRole('button',{name:'Approve'}));
  await screen.findByRole('alert');
  expect(screen.getByRole('button',{name:'Approve'})).toBeEnabled();
  fireEvent.click(screen.getByRole('button',{name:'Approve'}));
  await screen.findByText('Approved');
  expect(screen.queryByRole('button')).toBeNull();
  rerender(<AgentConfirmation request={{...request,id:'two'}} resolution="expired" onDecision={onDecision} />);
  expect(screen.getByText('Request expired')).toBeVisible();
  expect(screen.queryByRole('button')).toBeNull();
  expect(onDecision).toHaveBeenCalledTimes(2);
});
test('a late approval for a previous request does not settle the next request', async () => {
  let finish!: () => void;
  const pending = new Promise<void>(resolve => {finish=resolve;});
  const { rerender } = render(<AgentConfirmation request={{id:'one',title:'Old request'}} onDecision={() => pending} />);
  fireEvent.click(screen.getByRole('button',{name:'Approve'}));
  rerender(<AgentConfirmation request={{id:'two',title:'New request'}} onDecision={() => {}} />);
  finish();
  await waitFor(() => expect(screen.getByRole('button',{name:'Approve'})).toBeEnabled());
  expect(screen.queryByText('Approved')).toBeNull();
});
test('composer preserves failed drafts, respects IME and supports stop', async () => {
  const { unmount } = render(composers.Failure.render!({} as never, {} as never));
  const input = screen.getByRole('textbox',{name:'Message'});
  fireEvent.keyDown(input,{key:'Enter',isComposing:true});
  expect(screen.queryByRole('alert')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Send'}));
  await screen.findByRole('alert');
  expect(input).toHaveValue('Help me plan the launch.');
  expect(screen.getByRole('button',{name:'Send'})).toBeEnabled();
  unmount();
  render(composers.Controlled.render!({} as never, {} as never));
  fireEvent.click(screen.getByRole('button',{name:'Send'}));
  const stop = await screen.findByRole('button',{name:'Stop'});
  fireEvent.click(stop);
  await screen.findByRole('button',{name:'Send'});
  expect(screen.getByRole('textbox',{name:'Message'})).toHaveFocus();
});
test('stream updates preserve the user’s collapsed trace choice and expose retry', async () => {
  render(work.Streaming.render!({} as never, {} as never));
  const trigger = screen.getByRole('button',{name:/Reading output/});
  expect(trigger).toHaveAttribute('aria-expanded','true');
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('button',{name:'Append chunk'}));
  expect(trigger).toHaveAttribute('aria-expanded','false');
  fireEvent.click(screen.getByRole('button',{name:'Cancel run'}));
  expect(screen.getByText('Cancelled')).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'Retry Read output'}));
  expect(screen.getByRole('button',{name:/Reading output/})).toHaveAttribute('aria-expanded','false');
});
test('citations are keyboard reachable and source schemes are constrained', () => {
  const source = {id:'x',title:'Reference',href:'https://example.com',description:'Source details'};
  render(<><Sources sources={[{...source,id:'bad',href:'javascript:alert(1)'}]} /><InlineCitation source={source} index={1} /></>);
  expect(screen.getByText('Reference')).not.toHaveAttribute('href');
  fireEvent.click(screen.getByRole('button',{name:'Source 1: Reference'}));
  expect(screen.getByRole('link',{name:'Reference'})).toHaveAttribute('href','https://example.com/');
});

test('composer attachment removal restores focus to the message', () => {
  render(composers.WithAttachment.render!({} as never, {} as never));
  fireEvent.click(screen.getByRole('button',{name:'Remove launch-brief.pdf'}));
  expect(screen.queryByText('launch-brief.pdf')).toBeNull();
  expect(screen.getByRole('textbox',{name:'Message'})).toHaveFocus();
});

test('composer mode menu composes with the message field', async () => {
  render(composers.Controlled.render!({} as never, {} as never));
  fireEvent.pointerDown(screen.getByRole('button',{name:'Message mode: Plan'}),{button:0,ctrlKey:false});
  fireEvent.click(await screen.findByRole('menuitemradio',{name:'Review'}));
  expect(screen.getByRole('button',{name:'Message mode: Review'})).toBeVisible();
  expect(screen.getByRole('textbox',{name:'Message'})).toHaveValue('Help me plan the launch.');
});

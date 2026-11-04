import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import * as traces from '../../src/components/ui/trace.stories.js';
import { CodeBlockCopyButton } from '../../src/components/ui/code-block.js';
import * as blocks from '../../src/components/ui/code-block.stories.js';

test('trace exposes expandable detail through keyboard-compatible native buttons', () => {
  render(traces.Expandable.render!({} as never, {} as never));
  const trigger = screen.getByRole('button', { name: 'Ran pnpm test' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('All tests passed.')).toBeVisible();
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
test('controlled trace follows the host and permits user changes', () => {
  render(traces.Controlled.render!({} as never, {} as never));
  const trigger = screen.getByRole('button', { name: 'Inspecting a streamed result' });
  fireEvent.click(screen.getByRole('button', { name: 'Toggle details' }));
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
test('copy preserves exact source, handles refusal and respects consumer cancellation', async () => {
  const writeText = vi.fn().mockRejectedValueOnce(new Error('denied')).mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  const { rerender } = render(<CodeBlockCopyButton value={'one\n\nthree\n'} />);
  fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('button', { name: 'Copy' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument());
  expect(writeText).toHaveBeenLastCalledWith('one\n\nthree\n');
  rerender(<CodeBlockCopyButton value="cancelled" onClick={event => event.preventDefault()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Copied' }));
  expect(writeText).toHaveBeenCalledTimes(2);
});
test('numbered lines keep blank lines and preserve directional/variant markup', () => {
  const { container } = render(blocks.Numbered.render!({} as never, {} as never));
  expect(container.querySelector('pre')).toHaveAttribute('dir', 'ltr');
  expect(container.querySelector('pre')).toHaveStyle({ counterReset: 'line 9' });
  expect(container.querySelectorAll('[data-slot="code-block-line"]')).toHaveLength(3);
  expect(container.querySelectorAll('[data-slot="code-block-line-content"]')[1].textContent).toBe('\n');
});

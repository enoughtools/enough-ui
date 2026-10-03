import * as React from 'react';
import { expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupTextarea } from '../../src/components/ui/input-group.js';

test('addon focuses its editable control and honors a prevented click', () => {
  const handler = vi.fn();
  const result = render(<InputGroup><InputGroupAddon onClick={handler}>Search</InputGroupAddon><InputGroupInput aria-label="Query" /></InputGroup>);
  fireEvent.click(screen.getByText('Search'));
  expect(screen.getByRole('textbox')).toHaveFocus();
  expect(handler).toHaveBeenCalledOnce();
  result.rerender(<InputGroup><InputGroupAddon onClick={event => event.preventDefault()}>Search</InputGroupAddon><InputGroupTextarea aria-label="Query" /></InputGroup>);
  fireEvent.click(screen.getByText('Search'));
  expect(screen.getByRole('textbox')).not.toHaveFocus();
});

test('embedded actions preserve their callback without redirecting focus', () => {
  const action = vi.fn();
  render(<InputGroup><InputGroupInput aria-label="Query" /><InputGroupAddon><InputGroupButton variant="accent" onClick={action}>Go</InputGroupButton></InputGroupAddon></InputGroup>);
  const button = screen.getByRole('button', { name: 'Go' });
  button.focus();
  fireEvent.click(button);
  expect(action).toHaveBeenCalledOnce();
  expect(button).toHaveFocus();
});

test('embedded buttons default to non-submitting actions while allowing submit', () => {
  const submit = vi.fn(event => event.preventDefault());
  render(<form onSubmit={submit}><InputGroupButton>Action</InputGroupButton><InputGroupButton type="submit">Submit</InputGroupButton></form>);
  fireEvent.click(screen.getByRole('button', { name: 'Action' }));
  expect(submit).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(submit).toHaveBeenCalledOnce();
});

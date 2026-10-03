import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { waitFor, within } from '@testing-library/react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '../../src/components/ui/dialog.js';
import { DataTable, TanStackDataTable } from '../../src/components/ui/data-table.js';
import dataTableMeta, {
  SearchableAndSelectable,
} from '../../src/components/ui/data-table.stories.js';
import { Progress } from '../../src/components/ui/progress.js';
import {
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../src/components/ui/pagination.js';
import { FirstPage } from '../../src/components/ui/pagination.stories.js';
import { ChoiceCard } from '../../src/components/ui/field.stories.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<{ root: Root; container: HTMLDivElement }> = [];

async function mount(children: React.ReactNode) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  const render = async (next: React.ReactNode) => {
    await act(async () => {
      root.render(next);
    });
  };
  await render(children);
  return { container, render };
}

afterEach(async () => {
  for (const { root, container } of mounted.splice(0)) {
    await act(async () => root.unmount());
    container.remove();
  }
});

async function click(element: HTMLElement) {
  await act(async () => element.click());
}

async function type(input: HTMLInputElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function button(container: ParentNode, label: string) {
  const found = Array.from(container.querySelectorAll('button')).find((item) =>
    item.getAttribute('aria-label') === label || item.textContent?.trim() === label,
  );
  expect(found, `button ${label}`).toBeDefined();
  return found!;
}

function dialogFixture(contentProps: React.ComponentProps<typeof DialogContent> = {}, footerClose = false) {
  return (
    <Dialog>
      <DialogTrigger>Edit account</DialogTrigger>
      <DialogContent {...contentProps}>
        <DialogTitle>Account settings</DialogTitle>
        <DialogDescription>Update your display name.</DialogDescription>
        <label>Display name<input aria-label="Display name" defaultValue="Robin" /></label>
        <DialogFooter showCloseButton={footerClose} />
      </DialogContent>
    </Dialog>
  );
}

describe('Dialog', () => {
  test('opens accessibly, focuses its content, closes with Escape and restores trigger focus', async () => {
    const { container } = await mount(dialogFixture());
    const trigger = button(container, 'Edit account');
    trigger.focus();
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    await click(trigger);
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    expect(trigger.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)!.textContent).toBe('Account settings');
    expect(document.getElementById(dialog.getAttribute('aria-describedby')!)!.textContent).toBe('Update your display name.');
    expect(dialog.contains(document.activeElement)).toBe(true);

    await act(async () => {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    // Radix restores focus after its unmount autofocus event runs asynchronously.
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  test('its default close control dismisses the dialog', async () => {
    const { container } = await mount(dialogFixture());
    await click(button(container, 'Edit account'));
    const dialog = document.querySelector('[role="dialog"]')!;
    const close = Array.from(dialog.querySelectorAll('button')).find((item) => item.textContent?.includes('Close'))!;
    await click(close);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  test('Tab and Shift+Tab wrap at the modal focus boundaries', async () => {
    const { container } = await mount(dialogFixture());
    await click(button(container, 'Edit account'));
    const dialog = document.querySelector('[role="dialog"]')!;
    const first = dialog.querySelector<HTMLInputElement>('input')!;
    const last = dialog.querySelector<HTMLButtonElement>('[data-slot="dialog-close"]')!;
    await act(async () => {
      last.focus();
      last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    });
    expect(document.activeElement).toBe(first);
    await act(async () => {
      first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    });
    expect(document.activeElement).toBe(last);
  });

  test.each([
    { showCloseButton: false },
    { hideClose: true },
  ])('supports close suppression and the legacy hideClose prop: %j', async (props) => {
    const { container } = await mount(dialogFixture(props));
    await click(button(container, 'Edit account'));
    expect(document.querySelector('[role="dialog"] button')).toBeNull();
  });

  test('the current close-control prop takes precedence over the legacy prop', async () => {
    const { container } = await mount(dialogFixture({ hideClose: true, showCloseButton: true }));
    await click(button(container, 'Edit account'));
    expect(document.querySelector('[role="dialog"] [data-slot="dialog-close"]')).not.toBeNull();
  });

  test('offers the optional footer Close action when the corner control is hidden', async () => {
    const { container } = await mount(dialogFixture({ showCloseButton: false }, true));
    await click(button(container, 'Edit account'));
    await click(button(document.querySelector('[role="dialog"]')!, 'Close'));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});

describe('Field choice cards', () => {
  test('names the checkbox from its title and toggles it when the card is selected', async () => {
    const Story = ChoiceCard.render as React.ComponentType;
    const { container } = await mount(<Story />);
    const checkbox = within(container).getByRole('checkbox', { name: 'Archive completed projects' });
    expect(checkbox).toHaveAccessibleDescription('Select the card or checkbox to update this preference.');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await click(container.querySelector<HTMLLabelElement>('label[for="field-choice-archive"]')!);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });
});

describe('Progress', () => {
  test.each([
    { value: 250, max: 200, current: '200', maximum: '200', transform: 'translateX(-0%)', state: 'complete' },
    { value: -5, max: 200, current: '0', maximum: '200', transform: 'translateX(-100%)', state: 'loading' },
    { value: 25, max: 50, current: '25', maximum: '50', transform: 'translateX(-50%)', state: 'loading' },
    { value: 25, max: 0, current: '25', maximum: '100', transform: 'translateX(-75%)', state: 'loading' },
    { value: 25, max: Number.NaN, current: '25', maximum: '100', transform: 'translateX(-75%)', state: 'loading' },
    { value: 25, max: Number.POSITIVE_INFINITY, current: '25', maximum: '100', transform: 'translateX(-75%)', state: 'loading' },
    { value: null, max: 100, current: null, maximum: '100', transform: 'translateX(-100%)', state: 'indeterminate' },
    { value: Number.NaN, max: 100, current: null, maximum: '100', transform: 'translateX(-100%)', state: 'indeterminate' },
    { value: Number.POSITIVE_INFINITY, max: 100, current: null, maximum: '100', transform: 'translateX(-100%)', state: 'indeterminate' },
  ])('keeps its accessible value and indicator in agreement: %j', ({ value, max, current, maximum, transform, state }) => {
    const reference = new DOMParser().parseFromString(
      renderToStaticMarkup(<Progress value={value} max={max} aria-label="Upload" />),
      'text/html',
    );
    const progress = reference.querySelector<HTMLElement>('[role="progressbar"]')!;
    expect(progress.getAttribute('aria-valuenow')).toBe(current);
    expect(progress.getAttribute('aria-valuemax')).toBe(maximum);
    expect(progress.getAttribute('data-state')).toBe(state);
    expect(progress.firstElementChild!.getAttribute('style')).toContain(transform);
    expect(progress.outerHTML).not.toMatch(/NaN|Infinity/);
  });
});

describe('Pagination', () => {
  test('the first-page catalog story identifies the current page and disables its previous link', async () => {
    const Story = FirstPage.render as React.ComponentType;
    const { container } = await mount(<Story />);
    expect(container.querySelector('nav')!.getAttribute('aria-label')).toBe('Search results pages');
    expect(container.querySelector('[aria-current="page"]')!.textContent).toBe('1');
    const previous = container.querySelector('a[aria-label="Go to previous page"]')!;
    expect(previous.getAttribute('aria-disabled')).toBe('true');
    expect(previous.hasAttribute('href')).toBe(false);
    expect(previous.getAttribute('tabindex')).toBe('-1');
  });

  test.each([{ disabled: true }, { 'aria-disabled': true as const }, { 'aria-disabled': 'true' as const }])(
    'disabled links cannot navigate or call the consumer click handler: %j',
    async (props) => {
      const onClick = vi.fn();
      const { container } = await mount(<PaginationLink href="?page=2" tabIndex={0} onClick={onClick} {...props}>2</PaginationLink>);
      const link = container.querySelector('a')!;
      expect(link.hasAttribute('href')).toBe(false);
      expect(link.tabIndex).toBe(-1);
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      await act(async () => link.dispatchEvent(event));
      expect(event.defaultPrevented).toBe(true);
      expect(onClick).not.toHaveBeenCalled();
    },
  );

  test('disabled asChild links suppress the child destination, tab stop and both click handlers', async () => {
    const onClick = vi.fn();
    const onChildClick = vi.fn();
    const { container } = await mount(
      <PaginationLink asChild disabled href="#parent-page" onClick={onClick}>
        <a href="#child-page" tabIndex={0} onClick={onChildClick}>2</a>
      </PaginationLink>,
    );
    const link = container.querySelector('a')!;
    expect.soft(link.hasAttribute('href')).toBe(false);
    expect.soft(link.tabIndex).toBe(-1);
    expect.soft(link.getAttribute('aria-disabled')).toBe('true');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    await act(async () => link.dispatchEvent(event));
    expect.soft(event.defaultPrevented).toBe(true);
    expect.soft(onClick).not.toHaveBeenCalled();
    expect.soft(onChildClick).not.toHaveBeenCalled();
  });

  test('enabled asChild links preserve their child destination and compose both click handlers', async () => {
    const onClick = vi.fn();
    const onChildClick = vi.fn();
    const { container } = await mount(
      <PaginationLink asChild onClick={onClick}>
        <a href="#next-page" tabIndex={0} onClick={onChildClick}>2</a>
      </PaginationLink>,
    );
    const link = container.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('#next-page');
    expect(link.tabIndex).toBe(0);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    await act(async () => link.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(false);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onChildClick).toHaveBeenCalledOnce();
  });

  test('custom directional text is supported and children take precedence', async () => {
    const { container } = await mount(
      <>
        <PaginationPrevious text="Earlier" href="?page=1" />
        <PaginationNext text="Later" href="?page=3" />
        <PaginationNext text="Unused" href="?page=4">Continue</PaginationNext>
      </>,
    );
    const links = container.querySelectorAll('a');
    expect(links[0].textContent).toContain('Earlier');
    expect(links[1].textContent).toContain('Later');
    expect(links[2].textContent).toContain('Continue');
    expect(links[2].textContent).not.toContain('Unused');
    expect(links[2].hasAttribute('text')).toBe(false);
  });
});

const projectProps = { ...dataTableMeta.args, ...SearchableAndSelectable.args };

function projectNames(container: ParentNode) {
  return Array.from(container.querySelectorAll('tbody tr')).map((row) => row.querySelectorAll('td')[2]?.textContent);
}

describe('DataTable catalog behavior', () => {
  test('sorts both directions and returns to the original data order on the third click', async () => {
    const { container } = await mount(<DataTable {...projectProps} initialSort={undefined} />);
    const header = container.querySelector('th:nth-child(3)')!;
    const sort = header.querySelector('button')!;
    expect(projectNames(container)[0]).toBe('Northstar');
    await click(sort);
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    expect(projectNames(container)).toEqual(['Atlas Index', 'Common Ground', 'Field Notes', 'Northstar', 'Open Ledger']);
    await click(sort);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    expect(projectNames(container)[0]).toBe('Signal Room');
    await click(sort);
    expect(header.getAttribute('aria-sort')).toBe('none');
    expect(projectNames(container)[0]).toBe('Northstar');
  });

  test('filtering resets the page, reports empty results and can be cleared', async () => {
    const { container } = await mount(<DataTable {...projectProps} />);
    await click(button(container, 'Next'));
    expect(projectNames(container)).toEqual(['Paper Trail', 'Signal Room']);
    const input = container.querySelector<HTMLInputElement>('input[type="search"]')!;
    await type(input, 'north');
    expect(projectNames(container)).toEqual(['Northstar']);
    expect(button(container, 'Prev').disabled).toBe(true);
    expect(button(container, 'Next').disabled).toBe(true);
    expect(container.textContent).toContain('1–1 of 1');
    await type(input, 'nothing matches');
    expect(container.textContent).toContain('No results found.');
    expect(container.textContent).toContain('0–0 of 0');
    await click(button(container, 'Clear filter'));
    expect(input.value).toBe('');
    expect(projectNames(container)).toHaveLength(5);
    expect(container.textContent).toContain('1–5 of 7');
  });

  test('selects visible pages independently and preserves selection across pagination', async () => {
    const onSelectionChange = vi.fn();
    const { container } = await mount(<DataTable {...projectProps} onSelectionChange={onSelectionChange} />);
    await click(button(container, 'Select all rows on this page'));
    expect(onSelectionChange.mock.lastCall![0]).toHaveLength(5);
    expect(container.querySelectorAll('tbody tr[data-state="selected"]')).toHaveLength(5);
    await click(button(container, 'Next'));
    expect(button(container, 'Select all rows on this page').getAttribute('aria-checked')).toBe('false');
    await click(button(container, 'Select row 6'));
    expect(onSelectionChange.mock.lastCall![0]).toHaveLength(6);
    expect(button(container, 'Select all rows on this page').getAttribute('aria-checked')).toBe('mixed');
    await click(button(container, 'Prev'));
    expect(button(container, 'Select all rows on this page').getAttribute('aria-checked')).toBe('true');
    await click(button(container, 'Select all rows on this page'));
    expect(onSelectionChange.mock.lastCall![0].map((row: { name: string }) => row.name)).toEqual(['Paper Trail']);
  });

  test('a shrinking dataset keeps its current page in bounds', async () => {
    const { container, render } = await mount(<DataTable {...projectProps} />);
    await click(button(container, 'Next'));
    await render(<DataTable {...projectProps} data={projectProps.data.slice(0, 1)} />);
    expect(projectNames(container)).toEqual(['Northstar']);
    expect(container.textContent).toContain('1 / 1');
    expect(button(container, 'Next').disabled).toBe(true);
    await render(<DataTable {...projectProps} data={[]} />);
    expect(container.textContent).toContain('0–0 of 0');
    expect(container.textContent).toContain('1 / 1');
  });

  test.each([
    [Number.NaN, 5],
    [Number.POSITIVE_INFINITY, 5],
    [0, 1],
    [-2, 1],
    [2.8, 2],
  ])('normalizes page size %s to %s whole rows', async (pageSize, expectedCount) => {
    const { container } = await mount(<DataTable {...projectProps} pageSize={pageSize} />);
    expect(projectNames(container)).toHaveLength(expectedCount);
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
  });
});

type AuditRow = { id: string; name: string; points: number; privateNote: string };
const auditRows: AuditRow[] = [
  { id: 'a', name: 'Alex', points: 3, privateNote: 'hidden a' },
  { id: 'b', name: 'Blair', points: 1, privateNote: 'hidden b' },
  { id: 'c', name: 'Casey', points: 2, privateNote: 'hidden c' },
];
const auditColumns: ColumnDef<AuditRow>[] = [
  {
    id: 'select',
    header: 'Select',
    cell: ({ row }) => <button aria-label={`Select ${row.original.name}`} onClick={() => row.toggleSelected()}>Select</button>,
  },
  {
    header: 'Participant',
    columns: [
      { accessorKey: 'name', header: 'Name' },
      {
        accessorKey: 'points',
        sortDescFirst: false,
        header: ({ column }) => <button onClick={column.getToggleSortingHandler()}>Points</button>,
        cell: ({ getValue }) => <strong>{getValue<number>()} points</strong>,
      },
      { accessorKey: 'privateNote', header: 'Private note' },
    ],
  },
];

function AuditTable({ data = auditRows }: { data?: AuditRow[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const table = useReactTable({
    data,
    columns: auditColumns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    initialState: { columnVisibility: { privateNote: false }, pagination: { pageSize: 2 } },
  });
  return (
    <>
      <TanStackDataTable table={table} caption="Audit participants" />
      <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next participants</button>
      <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous participants</button>
    </>
  );
}

describe('TanStackDataTable adapter', () => {
  test('renders grouped headers, visible columns and custom cells from a real TanStack instance', async () => {
    const { container } = await mount(<AuditTable />);
    expect(container.querySelector('caption')!.textContent).toBe('Audit participants');
    const group = Array.from(container.querySelectorAll('th')).find((cell) => cell.textContent === 'Participant')!;
    expect(group.getAttribute('colspan')).toBe('2');
    expect(container.querySelectorAll('thead tr')).toHaveLength(2);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(container.querySelectorAll('tbody tr:first-child td')).toHaveLength(3);
    expect(container.querySelector('tbody strong')!.textContent).toBe('3 points');
    expect(container.textContent).not.toContain('Private note');
    expect(container.textContent).not.toContain('hidden a');
  });

  test('reflects TanStack sorting, selection and pagination without taking over their state', async () => {
    const { container } = await mount(<AuditTable />);
    await click(button(container, 'Points'));
    expect(container.querySelector('tbody tr')!.textContent).toContain('Blair');
    await click(button(container, 'Select Blair'));
    expect(container.querySelector('tbody tr')!.getAttribute('data-state')).toBe('selected');
    await click(button(container, 'Next participants'));
    expect(container.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(container.querySelector('tbody')!.textContent).toContain('Alex');
    expect(button(container, 'Next participants').disabled).toBe(true);
    await click(button(container, 'Previous participants'));
    expect(container.querySelector('tbody tr')!.getAttribute('data-state')).toBe('selected');
  });

  test('empty states span only the visible columns', async () => {
    const { container } = await mount(<AuditTable data={[]} />);
    expect(container.querySelector('tbody td')!.getAttribute('colspan')).toBe('3');
    expect(container.querySelector('tbody')!.textContent).toContain('No results found.');
  });
});

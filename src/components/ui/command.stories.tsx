import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from './button.js';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command.js';

const meta = {
  parameters: { renderer: 'react' },
  title: 'UI/Command',
  component: Command,
  tags: ['autodocs'],
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: '40px', background: 'var(--color-scrim)', display: 'flex', justifyContent: 'center' }}>
      <Command label="Commands" className="w-full max-w-[450px]">
        <CommandInput aria-label="Search commands" placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              Profile
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              Billing
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              Settings
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('combobox', { name: 'Search commands' });

    await userEvent.type(search, 'calculator');
    await waitFor(() => expect(canvas.getAllByRole('option')).toHaveLength(1));
    await expect(canvas.getByRole('option', { name: 'Calculator' })).toBeVisible();
    await userEvent.clear(search);
    await userEvent.type(search, 'no-matching-command');
    await expect(await canvas.findByText('No results found.')).toBeVisible();
    await userEvent.clear(search);
  },
};

function DialogExample({ showCloseButton = false }: { showCloseButton?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState('No command selected.');

  const select = (value: string) => {
    setSelected(`Selected ${value}.`);
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-start gap-4 p-8">
      <Button variant="outline" onClick={() => setOpen(true)}>Open quick actions</Button>
      <p role="status" className="font-sans text-sm text-[var(--color-text-3)]">{selected}</p>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Quick actions"
        description="Find an action for your workspace."
        showCloseButton={showCloseButton}
      >
        <Command label="Workspace actions">
          <CommandInput aria-label="Search workspace actions" placeholder="Search workspace actions..." />
          <CommandList>
            <CommandEmpty>No actions found.</CommandEmpty>
            <CommandGroup heading="Workspace">
              <CommandItem value="calendar" onSelect={select}>Calendar</CommandItem>
              <CommandItem value="archived" disabled onSelect={select}>Archived workspace</CommandItem>
              <CommandItem value="calculator" onSelect={select}>Calculator</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Account">
              <CommandItem value="profile" onSelect={select}>
                Profile<CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}

export const Dialog: Story = {
  render: () => <DialogExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Open quick actions' });
    await userEvent.click(trigger);

    const dialog = await page.findByRole('dialog', { name: 'Quick actions' });
    const palette = within(dialog);
    const search = palette.getByRole('combobox', { name: 'Search workspace actions' });
    await expect(dialog).toHaveAccessibleDescription('Find an action for your workspace.');
    await expect(search).toHaveFocus();
    await expect(palette.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    await expect(palette.getByRole('option', { name: 'Archived workspace' })).toHaveAttribute('aria-disabled', 'true');

    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(palette.getByRole('option', { name: 'Calculator' })).toHaveAttribute('aria-selected', 'true'));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('status')).toHaveTextContent('Selected calculator.');
    await expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await page.findByRole('dialog', { name: 'Quick actions' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const DialogWithCloseButton: Story = {
  render: () => <DialogExample showCloseButton />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Open quick actions' });
    await userEvent.click(trigger);
    const dialog = await page.findByRole('dialog', { name: 'Quick actions' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

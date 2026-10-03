import * as React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar.js';
import { DirectionProvider, useDirection } from '../../src/components/ui/direction.js';
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '../../src/components/ui/native-select.js';
import {
  Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem,
  MenubarCheckboxItem, MenubarSub, MenubarSubTrigger, MenubarSubContent,
} from '../../src/components/ui/menubar.js';

describe('native select', () => {
  it('preserves native labeling, selection and form submission', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<HTMLSelectElement>();
    const submit = vi.fn();
    render(
      <form onSubmit={(event) => {
        event.preventDefault();
        submit(new FormData(event.currentTarget).get('framework'));
      }}>
        <label htmlFor="framework">Framework</label>
        <NativeSelect ref={ref} id="framework" name="framework" defaultValue="astro" required>
          <NativeSelectOptGroup label="Available">
            <NativeSelectOption value="astro">Astro</NativeSelectOption>
            <NativeSelectOption value="react">React</NativeSelectOption>
          </NativeSelectOptGroup>
          <NativeSelectOptGroup label="Unavailable" disabled>
            <NativeSelectOption value="legacy">Legacy</NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
        <button type="submit">Save</button>
      </form>,
    );
    const select = screen.getByRole('combobox', { name: 'Framework' });
    expect(ref.current).toBe(select);
    expect(select).toHaveValue('astro');
    await user.selectOptions(select, 'react');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(submit).toHaveBeenCalledWith('react');
    await user.selectOptions(select, 'legacy');
    expect(select).toHaveValue('react');
  });

  it('keeps native multi-selection and omits dropdown decoration', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <NativeSelect multiple name="members" aria-label="Members" defaultValue={['alex']}>
        <NativeSelectOption value="alex">Alex</NativeSelectOption>
        <NativeSelectOption value="sam">Sam</NativeSelectOption>
      </NativeSelect>,
    );
    const select = screen.getByRole('listbox', { name: 'Members' });
    await user.selectOptions(select, 'sam');
    expect(select).toHaveValue(['alex', 'sam']);
    expect(container.querySelector('[data-slot="native-select-icon"]')).toBeNull();
  });
});

describe('direction provider', () => {
  it('scopes Radix direction without adding layout wrappers', () => {
    function CurrentDirection({ label }: { label: string }) {
      return <output aria-label={label}>{useDirection()}</output>;
    }
    const { container } = render(
      <>
        <CurrentDirection label="Default" />
        <DirectionProvider direction="rtl">
          <CurrentDirection label="Outer" />
          <DirectionProvider direction="ltr" dir="rtl"><CurrentDirection label="Nested" /></DirectionProvider>
        </DirectionProvider>
      </>,
    );
    expect(screen.getByLabelText('Default')).toHaveTextContent('ltr');
    expect(screen.getByLabelText('Outer')).toHaveTextContent('rtl');
    expect(screen.getByLabelText('Nested')).toHaveTextContent('ltr');
    expect(container.children).toHaveLength(3);
  });
});

describe('avatar loading', () => {
  it('switches from a loaded image to fallback when a new image fails', async () => {
    const images: HTMLImageElement[] = [];
    const ImageMock = function () {
      const image = document.createElement('img');
      Object.defineProperties(image, {
        complete: { configurable: true, get: () => false },
        naturalWidth: { configurable: true, get: () => 0 },
      });
      images.push(image);
      return image;
    };
    vi.spyOn(window, 'Image').mockImplementation(ImageMock as unknown as typeof Image);
    const status = vi.fn();
    const contents = (src: string) => (
      <Avatar aria-label="Alex Morgan">
        <AvatarImage src={src} alt="Alex Morgan" onLoadingStatusChange={status} />
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
    );
    const { rerender } = render(contents('/alex.png'));
    expect(screen.getByText('AM')).toBeVisible();
    const loadedImage = images.at(-1)!;
    Object.defineProperties(loadedImage, {
      complete: { get: () => true }, naturalWidth: { get: () => 48 },
    });
    act(() => loadedImage.dispatchEvent(new Event('load')));
    await waitFor(() => expect(screen.getByRole('img', { name: 'Alex Morgan' })).toBeVisible());
    expect(screen.queryByText('AM')).toBeNull();

    rerender(contents('/missing.png'));
    act(() => images.at(-1)!.dispatchEvent(new Event('error')));
    await waitFor(() => expect(status).toHaveBeenCalledWith('error'));
    expect(screen.getByText('AM')).toBeVisible();
    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('menubar keyboard behavior', () => {
  it('opens from keyboard, skips disabled commands, selects and restores focus', async () => {
    const user = userEvent.setup();
    const selected = vi.fn();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled>Unavailable</MenubarItem>
            <MenubarItem onSelect={selected}>New document</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const trigger = screen.getByRole('menuitem', { name: 'File' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    const command = await screen.findByRole('menuitem', { name: 'New document' });
    expect(command).toHaveFocus();
    expect(screen.getByRole('menuitem', { name: 'Unavailable' })).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Enter}');
    expect(selected).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it('preserves controlled checkboxes and keyboard submenu navigation', async () => {
    const user = userEvent.setup();
    const selected = vi.fn();
    function Example() {
      const [checked, setChecked] = React.useState(false);
      return (
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem checked={checked} onCheckedChange={setChecked}>Sidebar</MenubarCheckboxItem>
              <MenubarSub>
                <MenubarSubTrigger>Zoom</MenubarSubTrigger>
                <MenubarSubContent><MenubarItem onSelect={selected}>Fit page</MenubarItem></MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );
    }
    render(<Example />);
    const trigger = screen.getByRole('menuitem', { name: 'View' });
    await user.click(trigger);
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Sidebar' }));
    await user.click(trigger);
    expect(screen.getByRole('menuitemcheckbox', { name: 'Sidebar' })).toHaveAttribute('aria-checked', 'true');
    screen.getByRole('menuitem', { name: 'Zoom' }).focus();
    await user.keyboard('{ArrowRight}');
    const command = await screen.findByRole('menuitem', { name: 'Fit page' });
    expect(command).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(selected).toHaveBeenCalledOnce();
  });
});

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./menubar.js";

const meta = {
  title: "UI/Menubar",
  component: Menubar,
  tags: ["autodocs"],
  parameters: {
    renderer: "react",
    layout: "centered",
  },
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menubar className="w-fit">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
              <MenubarItem>AirDrop</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print… <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="destructive">
            Close Window <MenubarShortcut>⌘W</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>Shift ⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Find</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Search the web</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                Find… <MenubarShortcut>⌘F</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Find Next <MenubarShortcut>⌘G</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Find Previous <MenubarShortcut>Shift ⌘G</MenubarShortcut>
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Cut <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Copy <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Paste <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>
            Always Show Bookmarks Bar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked={false}>
            Always Show Full URLs
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem inset>
            Reload <MenubarShortcut>⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled inset>
            Force Reload <MenubarShortcut>Shift ⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Toggle Fullscreen</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Profiles</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarLabel>Switch Profile</MenubarLabel>
            <MenubarRadioGroup value="andy">
              <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
              <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
              <MenubarRadioItem value="luis">Luis</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarItem inset>Manage Profiles…</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const Controlled: Story = {
  render: function ControlledMenubar() {
    const [showBookmarks, setShowBookmarks] = React.useState(true);
    const [showUrls, setShowUrls] = React.useState(false);
    const [syncIndeterminate, setSyncIndeterminate] = React.useState(true);
    const [profile, setProfile] = React.useState("benoit");

    return (
      <div className="flex flex-col gap-4 font-sans items-center">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Options</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Preferences</MenubarLabel>
              <MenubarCheckboxItem
                checked={showBookmarks}
                onCheckedChange={(checked) => setShowBookmarks(Boolean(checked))}
              >
                Show Bookmarks Bar
              </MenubarCheckboxItem>
              <MenubarCheckboxItem
                checked={showUrls}
                onCheckedChange={(checked) => setShowUrls(Boolean(checked))}
              >
                Show Full URLs
              </MenubarCheckboxItem>
              <MenubarCheckboxItem
                checked={syncIndeterminate ? "indeterminate" : true}
                onCheckedChange={() =>
                  setSyncIndeterminate((prev) => !prev)
                }
              >
                Cloud Sync (Indeterminate test)
              </MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarItem variant="destructive">
                Reset Preferences
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>User</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Active Account</MenubarLabel>
              <MenubarRadioGroup value={profile} onValueChange={setProfile}>
                <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
                <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
                <MenubarRadioItem value="luis">Luis</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <div className="text-xs text-[var(--color-text-3)] font-sans border border-[var(--color-hairline)] p-3 bg-[var(--color-paper)] min-w-[280px]">
          <div>Bookmarks: {showBookmarks ? "Enabled" : "Disabled"}</div>
          <div>URLs: {showUrls ? "Enabled" : "Disabled"}</div>
          <div>Sync: {syncIndeterminate ? "Indeterminate" : "Synchronized"}</div>
          <div>Active Profile: {profile}</div>
        </div>
      </div>
    );
  },
};

export const Rtl: Story = {
  render: () => (
    <div dir="rtl" className="w-[520px] max-w-full font-sans flex flex-col gap-4">
      <div className="text-xs text-[var(--color-text-3)]">
        RTL Layout: note chevron direction on submenus, start indicators, and end shortcuts.
      </div>
      <Menubar dir="rtl">
        <MenubarMenu>
          <MenubarTrigger>ملف</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              علامة تبويب جديدة <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              نافذة جديدة <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled>نافذة خاصة جديدة</MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>مشاركة</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>رابط البريد</MenubarItem>
                <MenubarItem>رسائل</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem variant="destructive">
              إغلاق النافذة <MenubarShortcut>⌘W</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>عرض</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked>
              إظهار شريط الإشارات
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={false}>
              إظهار العناوين الكاملة
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarRadioGroup value="first">
              <MenubarRadioItem value="first">الخيار الأول</MenubarRadioItem>
              <MenubarRadioItem value="second">الخيار الثاني</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  ),
};

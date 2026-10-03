import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "./avatar.js";

const avatarSvg1 =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%233b4fe4%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2238%22%20r%3D%2220%22%20fill%3D%22%23fafbfc%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2295%22%20r%3D%2238%22%20fill%3D%22%23fafbfc%22%2F%3E%3C%2Fsvg%3E";

const avatarSvg2 =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%2312151c%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2238%22%20r%3D%2220%22%20fill%3D%22%23fafbfc%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2295%22%20r%3D%2238%22%20fill%3D%22%23fafbfc%22%2F%3E%3C%2Fsvg%3E";

const avatarSvg3 =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23626b7a%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2238%22%20r%3D%2220%22%20fill%3D%22%23fafbfc%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2295%22%20r%3D%2238%22%20fill%3D%22%23fafbfc%22%2F%3E%3C%2Fsvg%3E";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: {
    renderer: "react",
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "Size preset for avatar container",
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "default",
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={avatarSvg1} alt="Leslie Alexander's profile avatar" />
      <AvatarFallback>LA</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Avatar size="sm">
          <AvatarImage src={avatarSvg1} alt="Small avatar demonstration" />
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <span className="font-sans text-xs text-[var(--color-text-3)]">Small</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Avatar size="default">
          <AvatarImage src={avatarSvg2} alt="Default avatar demonstration" />
          <AvatarFallback>DF</AvatarFallback>
        </Avatar>
        <span className="font-sans text-xs text-[var(--color-text-3)]">Default</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Avatar size="lg">
          <AvatarImage src={avatarSvg3} alt="Large avatar demonstration" />
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
        <span className="font-sans text-xs text-[var(--color-text-3)]">Large</span>
      </div>
    </div>
  ),
};

export const Fallback: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>EU</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Avatar>
        <AvatarImage src={avatarSvg1} alt="Active member avatar with status" />
        <AvatarFallback>ON</AvatarFallback>
        <AvatarBadge variant="online" title="Online" />
      </Avatar>

      <Avatar>
        <AvatarImage src={avatarSvg2} alt="Busy member avatar with status" />
        <AvatarFallback>BY</AvatarFallback>
        <AvatarBadge variant="destructive" title="Busy" />
      </Avatar>

      <Avatar>
        <AvatarFallback>NA</AvatarFallback>
        <AvatarBadge variant="default" title="Default badge" />
      </Avatar>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="mb-2 font-sans text-xs font-semibold text-[var(--color-text-3)]">
          Standard Avatar Group
        </h4>
        <AvatarGroup>
          <Avatar>
            <AvatarImage src={avatarSvg1} alt="Contributor 1 profile" />
            <AvatarFallback>C1</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src={avatarSvg2} alt="Contributor 2 profile" />
            <AvatarFallback>C2</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src={avatarSvg3} alt="Contributor 3 profile" />
            <AvatarFallback>C3</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+4</AvatarGroupCount>
        </AvatarGroup>
      </div>

      <div>
        <h4 className="mb-2 font-sans text-xs font-semibold text-[var(--color-text-3)]">
          Small Avatar Group
        </h4>
        <AvatarGroup size="sm">
          <Avatar size="sm">
            <AvatarImage src={avatarSvg1} alt="Contributor 1 profile" />
            <AvatarFallback>C1</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarImage src={avatarSvg2} alt="Contributor 2 profile" />
            <AvatarFallback>C2</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarImage src={avatarSvg3} alt="Contributor 3 profile" />
            <AvatarFallback>C3</AvatarFallback>
          </Avatar>
          <AvatarGroupCount size="sm">+2</AvatarGroupCount>
        </AvatarGroup>
      </div>
    </div>
  ),
};

export const LoadFailureFallback: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage
          src="data:image/png;base64,invalid"
          alt="Broken link testing automatic load failure fallback"
        />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>
      <span className="font-sans text-xs text-[var(--color-text-3)]">
        Demonstrates Radix dynamic load failure fallback to &quot;FB&quot;
      </span>
    </div>
  ),
};

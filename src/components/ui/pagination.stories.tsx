import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination.js"

const meta = {
  title: "UI/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Pagination aria-label="Search results pages">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="?page=1" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=1" aria-label="Go to page 1">
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=2" aria-label="Page 2, current page" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=3" aria-label="Go to page 3">
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=12" aria-label="Go to page 12">
            12
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="?page=3" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

export const FirstPage: Story = {
  render: () => (
    <Pagination aria-label="Search results pages">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="?page=1" disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=1" aria-label="Page 1, current page" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=2" aria-label="Go to page 2">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=3" aria-label="Go to page 3">
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="?page=2" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

export const LastPage: Story = {
  render: () => (
    <Pagination aria-label="Search results pages">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="?page=11" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=10" aria-label="Go to page 10">
            10
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=11" aria-label="Go to page 11">
            11
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=12" aria-label="Page 12, current page" isActive>
            12
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="?page=12" disabled />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

export const LongRange: Story = {
  render: () => (
    <div className="w-[min(48rem,calc(100vw-2rem))]">
      <Pagination aria-label="Article pages">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="?page=7" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="?page=1" aria-label="Go to page 1">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="?page=7" aria-label="Go to page 7">7</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="?page=8" aria-label="Page 8, current page" isActive>8</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="?page=9" aria-label="Go to page 9">9</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="?page=24" aria-label="Go to page 24">24</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="?page=9" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  ),
}

export const NarrowViewport: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => (
    <div className="w-[min(22rem,calc(100vw-2rem))]">
      <Pagination aria-label="Mobile results pages">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="?page=3" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="?page=3" aria-label="Go to page 3">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="?page=4" aria-label="Page 4, current page" isActive>4</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="?page=5" aria-label="Go to page 5">5</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="?page=5" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  ),
}

export const Localized: Story = {
  render: () => (
    <Pagination aria-label="Páginas de resultados">
      <PaginationContent>
        <PaginationItem><PaginationPrevious href="?page=1" text="Anterior" aria-label="Ir a la página anterior" size="sm" /></PaginationItem>
        <PaginationItem><PaginationLink href="?page=2" isActive aria-label="Página 2, página actual" size="icon-sm">2</PaginationLink></PaginationItem>
        <PaginationItem><PaginationNext href="?page=3" text="Siguiente" aria-label="Ir a la página siguiente" size="sm" /></PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

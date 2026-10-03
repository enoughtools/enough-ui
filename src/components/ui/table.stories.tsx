import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table.js"

const meta = {
  title: "UI/Table",
  component: Table,
  parameters: {
    renderer: 'react',
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-4xl p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const invoices = [
  {
    invoice: "INV-001",
    status: "Paid",
    method: "Credit card",
    amount: "$250.00",
  },
  {
    invoice: "INV-002",
    status: "Pending",
    method: "Bank transfer",
    amount: "$150.00",
  },
  {
    invoice: "INV-003",
    status: "Unpaid",
    method: "PayPal",
    amount: "$350.00",
  },
  {
    invoice: "INV-004",
    status: "Paid",
    method: "Credit card",
    amount: "$450.00",
  },
]

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-sans font-medium">
              {invoice.invoice}
            </TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right font-medium">
              {invoice.amount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$1,200.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

export const SelectedRow: Story = {
  render: () => (
    <Table className="min-w-[560px]">
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead className="text-right">Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Atlas</TableCell>
          <TableCell>R. Chen</TableCell>
          <TableCell>Review</TableCell>
          <TableCell className="text-right">Today</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableCell className="font-medium">Northstar</TableCell>
          <TableCell>A. Mensah</TableCell>
          <TableCell>In progress</TableCell>
          <TableCell className="text-right">Yesterday</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Signal</TableCell>
          <TableCell>M. Ortiz</TableCell>
          <TableCell>Complete</TableCell>
          <TableCell className="text-right">Sep 6</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const PaletteShadow: Story = {
  render: () => (
    <Table className="min-w-[520px] [&_[data-slot=table-head]]:uppercase [&_[data-slot=table-head]]:tracking-wide">
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Stock</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Field notebook</TableCell>
          <TableCell>Stationery</TableCell>
          <TableCell className="text-right">24</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Mechanical pencil</TableCell>
          <TableCell>Stationery</TableCell>
          <TableCell className="text-right">61</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Canvas pouch</TableCell>
          <TableCell>Storage</TableCell>
          <TableCell className="text-right">8</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  decorators: [
    (Story) => (
      <div className="[&_[data-slot=table-container]]:shadow-[var(--shadow-palette)]">
        <Story />
      </div>
    ),
  ],
}

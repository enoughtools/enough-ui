import type { Meta, StoryObj } from "@storybook/react-vite"
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, type ColumnDef } from "@tanstack/react-table"

import { DataTable, TanStackDataTable, type DataTableColumn } from "./data-table.js"
import { Button } from "./button.js"
import { Checkbox } from "./checkbox.js"
import { Input } from "./input.js"
import { Field, FieldLabel } from "./field.js"
import { directionIconClass, sortIndicatorPaths } from "../../lib/direction-icons.js"

type Project = {
  id: string
  name: string
  owner: string
  status: "Active" | "Review" | "Paused"
  updated: string
  tasks: number
}

const projects: Project[] = [
  { id: "PX-104", name: "Northstar", owner: "A. Chen", status: "Active", updated: "Sep 08, 2026", tasks: 18 },
  { id: "PX-103", name: "Atlas Index", owner: "M. Okafor", status: "Review", updated: "Sep 07, 2026", tasks: 9 },
  { id: "PX-102", name: "Field Notes", owner: "S. Rivera", status: "Active", updated: "Sep 04, 2026", tasks: 24 },
  { id: "PX-101", name: "Signal Room", owner: "J. Kim", status: "Paused", updated: "Aug 29, 2026", tasks: 12 },
  { id: "PX-100", name: "Paper Trail", owner: "R. Singh", status: "Review", updated: "Aug 25, 2026", tasks: 7 },
  { id: "PX-099", name: "Open Ledger", owner: "T. Brooks", status: "Active", updated: "Aug 22, 2026", tasks: 31 },
  { id: "PX-098", name: "Common Ground", owner: "L. Martin", status: "Paused", updated: "Aug 18, 2026", tasks: 15 },
]

const statusStyles: Record<Project["status"], string> = {
  Active: "bg-[var(--color-ok)] text-[var(--color-surface)]",
  Review: "bg-[var(--color-warn)] text-white",
  Paused: "border border-[var(--color-border-mid)] bg-[var(--color-paper)] text-[var(--color-text-3)]",
}

const columns: DataTableColumn<Project>[] = [
  {
    id: "id",
    header: "Project ID",
    accessorKey: "id",
    sortable: true,
    className: "font-sans text-[12px] text-[var(--color-text-3)]",
  },
  {
    id: "name",
    header: "Project",
    accessorKey: "name",
    sortable: true,
    className: "font-semibold text-[var(--color-text-main)]",
  },
  {
    id: "owner",
    header: "Owner",
    accessorKey: "owner",
    sortable: true,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
    cell: (project) => (
      <span
        className={`inline-flex rounded-none px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] ${statusStyles[project.status]}`}
      >
        {project.status}
      </span>
    ),
  },
  {
    id: "tasks",
    header: "Tasks",
    accessorKey: "tasks",
    sortable: true,
    align: "right",
    className: "font-sans tabular-nums",
  },
  {
    id: "updated",
    header: "Updated",
    accessorKey: "updated",
    align: "right",
    className: "whitespace-nowrap text-[var(--color-text-3)]",
  },
]

const meta = {
  title: "UI/Data Table",
  component: DataTable<Project>,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "padded",
  },
  args: {
    columns,
    data: projects,
    getRowId: (project: Project) => project.id,
    caption: "Project portfolio",
    pageSize: 5,
  },
} satisfies Meta<typeof DataTable<Project>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SearchableAndSelectable: Story = {
  args: {
    selectable: true,
    searchKey: "name",
    searchPlaceholder: "Filter projects…",
    initialSort: { columnId: "name", direction: "asc" },
  },
}

export const Empty: Story = {
  args: {
    data: [],
    searchKey: "name",
    emptyMessage: "No projects match this view.",
  },
}

export const CompactPage: Story = {
  args: {
    selectable: true,
    pageSize: 3,
  },
}

const tanStackColumns: ColumnDef<Project>[] = [
  {
    id: "select",
    header: ({ table }) => <Checkbox aria-label="Select all rows on this page" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() ? "indeterminate" : false)} onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)} className="border-[var(--color-dark-text-3)] bg-[var(--color-ink-2)] data-[state=checked]:border-[var(--color-dark-text)] data-[state=checked]:bg-[var(--color-dark-text)] data-[state=checked]:text-[var(--color-ink)] data-[state=indeterminate]:border-[var(--color-dark-text)] data-[state=indeterminate]:bg-[var(--color-dark-text)] data-[state=indeterminate]:text-[var(--color-ink)]" />,
    cell: ({ row }) => <Checkbox aria-label={`Select ${row.original.name}`} checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(value === true)} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Project details",
    columns: [
      {
        accessorKey: "name",
        header: ({ column }) => <Button variant="ghost" size="sm" onClick={column.getToggleSortingHandler()} className="text-[var(--color-dark-text)] hover:bg-[var(--color-ink-2)] hover:text-[var(--color-dark-text)] focus-visible:ring-[var(--color-accent-on-ink)]">Project <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={directionIconClass}><path d={sortIndicatorPaths[column.getIsSorted() || "none"]} /></svg></Button>,
        cell: ({ row }) => <span className="font-semibold">{row.getValue("name")}</span>,
      },
      { accessorKey: "owner", header: "Owner" },
    ],
  },
  { accessorKey: "tasks", header: "Tasks" },
]

/** The application composes controls using the same headless TanStack API as shadcn. */
function TanStackExample() {
  const table = useReactTable({
    data: projects,
    columns: tanStackColumns,
    getRowId: (project) => project.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 3, pageIndex: 0 } },
  })

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="grid w-full max-w-sm gap-2 text-sm">
          Filter projects
          <Input value={(table.getColumn("name")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)} placeholder="Search by name…" />
        </label>
        <Field orientation="horizontal" className="w-auto">
          <Checkbox id="tanstack-show-tasks" checked={table.getColumn("tasks")?.getIsVisible()} onCheckedChange={(value) => table.getColumn("tasks")?.toggleVisibility(value === true)} />
          <FieldLabel htmlFor="tanstack-show-tasks">Show tasks</FieldLabel>
        </Field>
      </div>
      <TanStackDataTable table={table} caption="Project portfolio" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm">{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} rows selected</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous page</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next page</Button>
        </div>
      </div>
    </div>
  )
}

export const TanStackComposition: Story = {
  parameters: { docs: { description: { story: "Compose column definitions, filtering, sorting, visibility, selection, and pagination with TanStack Table. TanStackDataTable renders the resulting row model using EnoughUI Table primitives." } } },
  render: () => <TanStackExample />,
}

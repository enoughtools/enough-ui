import * as React from 'react'
import { composeStories } from '@storybook/react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import * as stories from '../../src/components/ui/data-table.stories.js'

const { TanStackV9Composition } = composeStories(stories)

test('v9 catalog composition keeps filtering, sorting and paging reactive', async () => {
  const user = userEvent.setup()
  render(<TanStackV9Composition />)
  const table = screen.getByRole('table', { name: 'TanStack v9 projects' })
  const rows = () => within(table.querySelector('tbody')!).getAllByRole('row')
  expect(rows()).toHaveLength(3)
  expect(within(table).getByRole('columnheader', { name: 'Project details' })).toHaveAttribute('colspan', '2')
  expect(rows()[0]).toHaveTextContent('18 tasks')
  expect(rows()[0]).toHaveTextContent('Northstar')
  await user.click(screen.getByRole('button', { name: 'Project', exact: true }))
  expect(rows()[0]).toHaveTextContent('Atlas Index')
  await user.click(screen.getByRole('checkbox', { name: 'Select Atlas Index' }))
  expect(rows()[0]).toHaveAttribute('data-state', 'selected')
  await user.click(screen.getByRole('button', { name: 'Next page', exact: true }))
  expect(rows()[0]).toHaveTextContent('Northstar')
  await user.type(screen.getByLabelText('Filter projects'), 'Atlas')
  expect(rows()).toHaveLength(1)
  expect(rows()[0]).toHaveTextContent('Atlas Index')
  expect(screen.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled()
})

test('v9 tables work without optional sorting, selection or visibility features', async () => {
  const { useTable } = await import('@tanstack/react-table')
  const { TanStackDataTable } = await import('../../src/components/ui/data-table.js')
  function MinimalTable() {
    const table = useTable({ features: {}, data: [{ name: 'Minimal' }], columns: [{ accessorKey: 'name', header: 'Name' }] })
    return <TanStackDataTable table={table} caption="Minimal v9" />
  }
  render(<MinimalTable />)
  expect(within(screen.getByRole('table', { name: 'Minimal v9' })).getByRole('cell', { name: 'Minimal', exact: true })).toBeVisible()
})

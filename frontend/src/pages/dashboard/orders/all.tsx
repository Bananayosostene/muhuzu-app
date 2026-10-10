import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { OrderStatus as StatusBadge } from '@/components/shared/OrderStatus'
import { Button } from '@/components/ui/button'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { formatDate, formatPrice } from '@/lib/format'
import { getAllOrders, getStaffOrder } from '@/services/staff-orders'
import type { OrderStatus, OrderSummary } from '@/types/order'
import { DataTable, type Column } from '../_components/DataTable'
import { PageHeader } from '../_components/PageHeader'
import { StaffOrderDialog } from './_components/StaffOrderDialog'

const filters: Record<OrderStatus | '', string> = {
  '': 'All orders',
  awaiting_payment: 'Waiting for payment',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}
const isFilter = (value: string): value is OrderStatus | '' => value in filters

/** Staff: every order on the marketplace, from the moment a buyer places it. */
export default function AllOrders() {
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [opened, setOpened] = useState<string | null>(null)
  const { data, error } = useQuery({ queryKey: ['all-orders', status], queryFn: () => getAllOrders(status) })
  const { data: detail } = useQuery({
    queryKey: ['all-orders', 'one', opened],
    queryFn: () => getStaffOrder(opened ?? ''),
    enabled: opened !== null,
  })

  const columns: Column<OrderSummary>[] = [
    {
      header: 'Order',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.order_number}</p>
          <p className="text-xs text-muted-foreground">{formatDate(row.created_at)}</p>
        </div>
      ),
    },
    { header: 'Total', cell: (row) => <span className="font-medium">{formatPrice(row.total_amount)}</span> },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: '', className: 'text-right', cell: (row) => <Button variant="outline" size="sm" onClick={() => setOpened(row.id)}>Open</Button> },
  ]

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every order buyers have placed. An unpaid one reaches its sellers once you confirm its payment."
      >
        <Link to="/dashboard/payments" className="text-sm font-medium text-primary hover:underline">Confirm payments</Link>
      </PageHeader>
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      <DataTable
        rows={data?.items ?? []}
        columns={columns}
        search={(row) => row.order_number}
        toolbar={
          <NativeSelect aria-label="Show" value={status} onChange={(event) => isFilter(event.target.value) && setStatus(event.target.value)}>
            {Object.entries(filters).map(([value, label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}
          </NativeSelect>
        }
      />
      <StaffOrderDialog order={detail} open={opened !== null} onClose={() => setOpened(null)} />
    </>
  )
}

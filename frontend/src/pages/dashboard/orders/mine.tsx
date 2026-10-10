import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { OrderStatus } from '@/components/shared/OrderStatus'
import { Button } from '@/components/ui/button'
import { formatDate, formatPrice } from '@/lib/format'
import {
  getSellerOrder, getSellerOrders, moveSellerOrder, type SellerOrderAction, type SellerOrderSummary,
} from '@/services/seller-orders'
import { DataTable, type Column } from '../_components/DataTable'
import { Field, FormDialog } from '../_components/FormDialog'
import { PageHeader } from '../_components/PageHeader'
import { OrderDialog } from './_components/OrderDialog'

// The one step a seller can take next, by the order's current status.
const next: Partial<Record<SellerOrderSummary['status'], { action: SellerOrderAction; label: string }>> = {
  pending: { action: 'accept', label: 'Accept' },
  accepted: { action: 'ship', label: 'Mark as shipped' },
  shipped: { action: 'deliver', label: 'Mark as delivered' },
}

/** The seller's side: the shop's part of each paid order. */
export default function MyOrders() {
  const client = useQueryClient()
  const { data, error } = useQuery({ queryKey: ['seller-orders'], queryFn: getSellerOrders })
  const [opened, setOpened] = useState<string | null>(null)
  const { data: detail } = useQuery({
    queryKey: ['seller-orders', opened],
    queryFn: () => getSellerOrder(opened ?? ''),
    enabled: opened !== null,
  })
  const [rejecting, setRejecting] = useState<SellerOrderSummary | null>(null)
  const move = useMutation({
    mutationFn: moveSellerOrder,
    onSuccess: () => client.invalidateQueries({ queryKey: ['seller-orders'] }),
    onError: (failure) => toast.error(failure.message),
  })

  const columns: Column<SellerOrderSummary>[] = [
    {
      header: 'Order',
      cell: (row) => (
        <button type="button" className="text-left hover:text-primary" onClick={() => setOpened(row.id)}>
          <p className="font-medium underline-offset-2 hover:underline">{row.order_number}</p>
          <p className="text-xs text-muted-foreground">{formatDate(row.created_at)}</p>
        </button>
      ),
    },
    { header: 'Buyer', cell: (row) => row.recipient_name },
    { header: 'Items total', cell: (row) => formatPrice(row.subtotal) },
    { header: 'You earn', cell: (row) => <span className="font-medium text-primary">{formatPrice(row.seller_amount)}</span> },
    { header: 'Status', cell: (row) => <OrderStatus status={row.status} /> },
    {
      header: '',
      className: 'text-right',
      cell: (row) => {
        const step = next[row.status]
        return step && (
          <div className="flex justify-end gap-1">
            <Button variant="outline" size="sm" disabled={move.isPending} onClick={() => move.mutate({ id: row.id, action: step.action })}>
              {step.label}
            </Button>
            {row.status === 'pending' && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setRejecting(row)}>Reject</Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader title="Orders" description="Orders reach you once Muhuze has confirmed the buyer's payment. Accept, ship, then deliver." />
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      <DataTable rows={data?.items ?? []} columns={columns} search={(row) => `${row.order_number} ${row.recipient_name}`} />
      <OrderDialog order={detail} open={opened !== null} onClose={() => setOpened(null)} />
      <FormDialog
        open={rejecting !== null}
        onClose={() => setRejecting(null)}
        title={`Reject order ${rejecting?.order_number}`}
        description="The buyer sees this reason. What you would have earned is taken back out of your wallet."
        onSubmit={(form) => rejecting && move.mutate({ id: rejecting.id, action: 'reject', reason: String(form.get('reason')) })}
      >
        <Field label="Reason" name="reason" minLength={5} maxLength={500} required />
      </FormDialog>
    </>
  )
}

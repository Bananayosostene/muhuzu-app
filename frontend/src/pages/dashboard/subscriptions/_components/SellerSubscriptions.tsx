import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatDate, formatPrice } from '@/lib/format'
import type { Subscription } from '@/services/plans'
import { DataTable, type Column } from '../../_components/DataTable'
import { Field, FormDialog } from '../../_components/FormDialog'
import { StatusBadge } from '../../_components/StatusBadge'

type Step = 'activate' | 'reject' | 'cancel'

interface Props {
  subscriptions: Subscription[]
  /** Shop names by seller id, when the viewer may read sellers. */
  shops: Map<string, string>
  onDecide: (decision: { id: string; step: Step; reason?: string; payment_reference?: string }) => void
}

const dialogs: Record<Step, { title: string; description: string; field: string }> = {
  activate: { title: 'Record payment for', description: 'Money is received outside the app. Saving starts the plan for this seller.', field: 'Payment reference (optional)' },
  reject: { title: 'Decline the request of', description: 'The seller sees this reason.', field: 'Reason' },
  cancel: { title: 'End the subscription of', description: 'The seller sees this reason and goes back to the default commission.', field: 'Reason' },
}

/** An `active` subscription applies only between its dates. */
function Status({ row }: { row: Subscription }) {
  if (row.status === 'pending') return <StatusBadge tone="warning">Requested · waiting for payment</StatusBadge>
  if (row.status === 'rejected') return <StatusBadge tone="danger">Declined</StatusBadge>
  if (row.status === 'cancelled') return <StatusBadge tone="neutral">Cancelled</StatusBadge>
  if (row.is_applicable) return <StatusBadge tone="success">Active</StatusBadge>
  const scheduled = row.starts_at !== null && new Date(row.starts_at) > new Date()
  return <StatusBadge tone="neutral">{scheduled ? 'Scheduled' : 'Ended'}</StatusBadge>
}

export function SellerSubscriptions({ subscriptions, shops, onDecide }: Props) {
  const [asking, setAsking] = useState<{ row: Subscription; step: Step } | null>(null)
  const name = (row: Subscription) => shops.get(row.seller_id) ?? 'Seller'
  const running = (row: Subscription) => row.status === 'active' && row.ends_at !== null && new Date(row.ends_at) > new Date()

  const columns: Column<Subscription>[] = [
    { header: 'Seller', cell: (row) => <span className="font-medium">{name(row)}</span> },
    { header: 'Plan', cell: (row) => `${row.plan_name} · ${formatPrice(row.price)} / ${row.duration_days} days` },
    { header: 'Commission', cell: (row) => `${Number(row.commission_rate)}%` },
    { header: 'Status', cell: (row) => <Status row={row} /> },
    { header: 'Paid until', cell: (row) => (row.ends_at ? formatDate(row.ends_at) : '—') },
    {
      header: '',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          {row.status === 'pending' && <Button variant="outline" size="sm" onClick={() => setAsking({ row, step: 'activate' })}>Record payment</Button>}
          {row.status === 'pending' && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setAsking({ row, step: 'reject' })}>Decline</Button>}
          {running(row) && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setAsking({ row, step: 'cancel' })}>End</Button>}
        </div>
      ),
    },
  ]
  const dialog = asking && dialogs[asking.step]

  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-semibold">Sellers</h2>
      <DataTable rows={subscriptions} columns={columns} search={(row) => `${name(row)} ${row.plan_name}`} />
      <FormDialog
        open={asking !== null}
        onClose={() => setAsking(null)}
        title={`${dialog?.title ?? ''} ${asking ? name(asking.row) : ''}`}
        description={dialog?.description ?? ''}
        onSubmit={(data) => {
          if (!asking) return
          const text = String(data.get('text')).trim()
          onDecide({ id: asking.row.id, step: asking.step, ...(asking.step === 'activate' ? text && { payment_reference: text } : { reason: text }) })
        }}
      >
        <Field
          key={asking?.step}
          label={dialog?.field ?? ''}
          name="text"
          {...(asking?.step === 'activate' ? { maxLength: 100 } : { required: true, minLength: 5, maxLength: 500 })}
        />
      </FormDialog>
    </section>
  )
}

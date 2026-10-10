import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { formatDate, formatPrice } from '@/lib/format'
import { approvePayment, getPayments, rejectPayment, type StaffPayment } from '@/services/payments'
import { DataTable, type Column } from '../_components/DataTable'
import { Field, FormDialog } from '../_components/FormDialog'
import { PageHeader } from '../_components/PageHeader'
import { StatusBadge } from '../_components/StatusBadge'

const statuses = {
  awaiting_verification: { tone: 'warning', label: 'Waiting for you' },
  paid: { tone: 'success', label: 'Confirmed' },
  rejected: { tone: 'danger', label: 'Rejected' },
} as const

export default function DashboardPayments() {
  const client = useQueryClient()
  const { data, error } = useQuery({ queryKey: ['payments'], queryFn: getPayments })
  const [rejecting, setRejecting] = useState<StaffPayment | null>(null)
  const settle = {
    onSuccess: () => client.invalidateQueries({ queryKey: ['payments'] }),
    onError: (failure: Error) => toast.error(failure.message),
  }
  const approve = useMutation({ mutationFn: approvePayment, ...settle })
  const reject = useMutation({ mutationFn: rejectPayment, ...settle })

  const columns: Column<StaffPayment>[] = [
    {
      header: 'Order',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.order_number}</p>
          <p className="text-xs text-muted-foreground">{formatDate(row.created_at)}</p>
        </div>
      ),
    },
    { header: 'Reference', cell: (row) => <span className="font-mono text-xs">{row.reference}</span> },
    { header: 'Amount', cell: (row) => <span className="font-medium">{formatPrice(row.amount)}</span> },
    { header: 'Paid to', cell: (row) => `${row.destination_provider} · ${row.destination_account_reference}` },
    { header: 'Paid by', cell: (row) => [row.payer_name, row.payer_phone].filter(Boolean).join(' · ') },
    {
      header: 'Status',
      cell: (row) => (
        <div>
          <StatusBadge tone={statuses[row.status].tone}>{statuses[row.status].label}</StatusBadge>
          {row.rejection_reason && <p className="mt-1 max-w-48 text-xs text-muted-foreground">{row.rejection_reason}</p>}
        </div>
      ),
    },
    {
      header: '',
      className: 'text-right',
      cell: (row) => row.status === 'awaiting_verification' && (
        <div className="flex justify-end gap-1">
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>Payment received</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm {formatPrice(row.amount)} for {row.order_number}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Check Muhuze's own statement first: reference {row.reference}, the amount, the account and the sender.
                  Confirming releases the order to its sellers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => approve.mutate(row.id)}>Payment received</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setRejecting(row)}>Reject</Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Payments" description="Buyers pay Muhuze outside the app and report it here. Confirm each one against the statement." />
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      <DataTable rows={data?.items ?? []} columns={columns} search={(row) => `${row.order_number} ${row.reference} ${row.payer_phone}`} />
      <FormDialog
        open={rejecting !== null}
        onClose={() => setRejecting(null)}
        title={`Reject payment for ${rejecting?.order_number}`}
        description="The buyer sees this reason and can submit a payment again."
        onSubmit={(form) => rejecting && reject.mutate({ id: rejecting.id, reason: String(form.get('reason')) })}
      >
        <Field label="Reason" name="reason" minLength={5} maxLength={500} required />
      </FormDialog>
    </>
  )
}

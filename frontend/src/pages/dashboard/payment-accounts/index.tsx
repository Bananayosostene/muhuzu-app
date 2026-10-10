import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  createDestination, deleteDestination, getDestinations, moveDestination, paymentMethods, updateDestination,
  type Destination, type PaymentMethod,
} from '@/services/payments'
import { DataTable, type Column } from '../_components/DataTable'
import { Field, FormDialog, SelectField } from '../_components/FormDialog'
import { PageHeader } from '../_components/PageHeader'
import { RowActions } from '../_components/RowActions'
import { StatusBadge } from '../_components/StatusBadge'

const isMethod = (value: string): value is PaymentMethod => value in paymentMethods

/** Staff: where buyers send their money. An order cannot be paid without a visible account. */
export default function DashboardPaymentAccounts() {
  const client = useQueryClient()
  const [target, setTarget] = useState<Destination | 'new' | null>(null)
  const account = target === 'new' ? null : target

  const { data, error } = useQuery({ queryKey: ['destinations'], queryFn: getDestinations })

  const changed = (message: string) => ({
    onSuccess: () => {
      toast.success(message)
      return client.invalidateQueries({ queryKey: ['destinations'] })
    },
    onError: (failure: Error) => toast.error(failure.message),
  })
  const create = useMutation({ mutationFn: createDestination, ...changed('Account added') })
  const update = useMutation({ mutationFn: updateDestination, ...changed('Account saved') })
  const remove = useMutation({ mutationFn: deleteDestination, ...changed('Account deleted') })
  const move = useMutation({ mutationFn: moveDestination, ...changed('Saved') })

  const columns: Column<Destination>[] = [
    {
      header: 'Account',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.provider} · {row.account_reference}</p>
          <p className="text-xs text-muted-foreground">{paymentMethods[row.method]} · {row.registered_name}</p>
        </div>
      ),
    },
    { header: 'Instructions', cell: (row) => <span className="text-muted-foreground">{row.instructions ?? '—'}</span> },
    {
      header: 'Shown first',
      cell: (row) => (row.is_default
        ? <StatusBadge tone="success">Default</StatusBadge>
        : row.is_active && <Button variant="outline" size="sm" disabled={move.isPending} onClick={() => move.mutate({ id: row.id, step: 'set-default' })}>Make default</Button>),
    },
    {
      header: 'Visible',
      cell: (row) => (
        <Switch
          checked={row.is_active}
          disabled={move.isPending}
          aria-label={`Show ${row.provider} ${row.account_reference} to buyers`}
          onCheckedChange={(active) => move.mutate({ id: row.id, step: active ? 'activate' : 'deactivate' })}
        />
      ),
    },
    { header: '', cell: (row) => <RowActions name={`${row.provider} ${row.account_reference}`} onEdit={() => setTarget(row)} onDelete={() => remove.mutate(row.id)} /> },
  ]

  return (
    <>
      <PageHeader title="Payment accounts" description="Muhuze's own accounts. A buyer sees the visible ones on their order and pays one of them outside the app.">
        <Button onClick={() => setTarget('new')}><Plus /> Add account</Button>
      </PageHeader>
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      <DataTable rows={data?.items ?? []} columns={columns} search={(row) => `${row.provider} ${row.account_reference} ${row.registered_name}`} />
      <FormDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        title={account ? 'Edit account' : 'New account'}
        description="Buyers are told to check the registered name before they pay."
        onSubmit={(form) => {
          const method = String(form.get('method'))
          if (!isMethod(method)) return
          const values = {
            method,
            provider: String(form.get('provider')).trim(),
            account_reference: String(form.get('account_reference')).trim(),
            registered_name: String(form.get('registered_name')).trim(),
            instructions: String(form.get('instructions')).trim() || null,
          }
          if (account) update.mutate({ id: account.id, ...values })
          else create.mutate(values)
        }}
      >
        <SelectField label="Method" name="method" defaultValue={account?.method} options={Object.entries(paymentMethods).map(([value, label]) => ({ value, label }))} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Network or bank" name="provider" maxLength={100} placeholder="MTN MoMo" defaultValue={account?.provider} required />
          <Field label="Number, code or account" name="account_reference" maxLength={100} defaultValue={account?.account_reference} required />
        </div>
        <Field label="Registered name" name="registered_name" maxLength={150} defaultValue={account?.registered_name} required />
        <Field label="Instructions for buyers (optional)" name="instructions" maxLength={500} defaultValue={account?.instructions ?? ''} />
      </FormDialog>
    </>
  )
}

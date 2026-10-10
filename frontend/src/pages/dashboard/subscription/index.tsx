import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatDate, formatPrice } from '@/lib/format'
import { getMyTerms, getOfferedPlans, requestPlan, withdrawRequest, type Plan } from '@/services/plans'
import { FormDialog } from '../_components/FormDialog'
import { PageHeader } from '../_components/PageHeader'
import { StatusBadge } from '../_components/StatusBadge'

/** The seller's side: the commission they pay now, the plans on offer, and asking for one. */
export default function DashboardSubscription() {
  const client = useQueryClient()
  const { data: terms, error } = useQuery({ queryKey: ['my-terms'], queryFn: getMyTerms })
  const { data: plans } = useQuery({ queryKey: ['offered-plans'], queryFn: getOfferedPlans })
  const [choosing, setChoosing] = useState<Plan | null>(null)

  const changed = (message: string) => ({
    onSuccess: () => {
      toast.success(message)
      return client.invalidateQueries({ queryKey: ['my-terms'] })
    },
    onError: (failure: Error) => toast.error(failure.message),
  })
  const request = useMutation({ mutationFn: requestPlan, ...changed('Request sent. Your plan starts when Muhuze confirms the payment.') })
  const withdraw = useMutation({ mutationFn: withdrawRequest, ...changed('Request withdrawn') })

  const current = terms?.subscription
  const pending = terms?.pending_request
  const steps = [
    `Send ${choosing ? formatPrice(choosing.price) : ''} to Muhuze, outside the app.`,
    'Send this request.',
    'Muhuze confirms the payment and your plan starts.',
  ]

  return (
    <>
      <PageHeader title="My subscription" description="A plan lowers the commission Muhuze takes from your sales, for a period." />
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      {terms && (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-5">
          {terms.commission_rate !== null && <p className="font-heading text-lg font-semibold">You pay {Number(terms.commission_rate)}% commission</p>}
          {current && <StatusBadge tone="success">{current.plan_name}{current.ends_at && ` until ${formatDate(current.ends_at)}`}</StatusBadge>}
          {terms.source === 'default' && <StatusBadge tone="neutral">Muhuze's default rate · no plan</StatusBadge>}
          {terms.source === 'not_set' && <StatusBadge tone="danger">Muhuze has not set its commission rate yet</StatusBadge>}
          {terms.upcoming.map((next) => (
            <StatusBadge key={next.id} tone="neutral">{next.plan_name}{next.starts_at && ` starts ${formatDate(next.starts_at)}`}</StatusBadge>
          ))}
          {pending && (
            <>
              <StatusBadge tone="warning">{pending.plan_name} requested · waiting for Muhuze to confirm your payment</StatusBadge>
              <Button variant="ghost" size="sm" className="text-destructive" disabled={withdraw.isPending} onClick={() => withdraw.mutate(pending.id)}>Withdraw request</Button>
            </>
          )}
        </section>
      )}

      <h2 className="font-heading text-lg font-semibold">Muhuze plans</h2>
      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans?.items.map((plan) => (
          <article key={plan.id} className="flex flex-col rounded-2xl border bg-card p-5 transition hover:shadow-lg hover:shadow-primary/10">
            <h3 className="font-medium">{plan.name}</h3>
            <p className="mt-3 font-heading text-2xl font-bold text-primary">{formatPrice(plan.price)}</p>
            <p className="text-sm text-muted-foreground">for {plan.duration_days} days · {Number(plan.commission_rate)}% commission</p>
            {plan.description && <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>}
            {/* One request at a time: the backend refuses a second while one is waiting. */}
            <Button className="mt-4" variant={current?.plan_name === plan.name ? 'outline' : 'default'} disabled={Boolean(pending)} onClick={() => setChoosing(plan)}>
              {current?.plan_name === plan.name ? 'Renew' : 'Subscribe'}
            </Button>
          </article>
        ))}
        {plans && !plans.items.length && <p className="text-sm text-muted-foreground sm:col-span-2">Muhuze has no plans on offer right now.</p>}
      </div>

      <FormDialog
        open={choosing !== null}
        onClose={() => setChoosing(null)}
        title={`Subscribe to ${choosing?.name}`}
        description="Payment is made outside the app."
        onSubmit={() => choosing && request.mutate(choosing.id)}
      >
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
          {steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </FormDialog>
    </>
  )
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { useSession } from '@/hooks/use-session'
import {
  createPlan, decideSubscription, deletePlan, getAllPlans, getSubscriptions, movePlan, updatePlan,
} from '@/services/plans'
import { getSellers } from '@/services/sellers'
import { PageHeader } from '../_components/PageHeader'
import { Plans } from './_components/Plans'
import { SellerSubscriptions } from './_components/SellerSubscriptions'

/** Staff: the plans offered to sellers, and each seller's requests and subscriptions. */
export default function DashboardSubscriptions() {
  const client = useQueryClient()
  const { can } = useSession()
  const managesPlans = can('seller_plan.manage')
  const managesSubscriptions = can('seller_subscription.manage')
  const { data: plans, error } = useQuery({ queryKey: ['plans'], queryFn: getAllPlans, enabled: managesPlans })
  const { data: subscriptions } = useQuery({ queryKey: ['subscriptions'], queryFn: getSubscriptions, enabled: managesSubscriptions })
  // A subscription carries only its shop's id; the names come from the sellers list, for staff allowed to read it.
  const { data: sellers } = useQuery({ queryKey: ['sellers', ''], queryFn: () => getSellers(''), enabled: can('seller.read') })

  const changed = (key: string, message: string) => ({
    onSuccess: () => {
      toast.success(message)
      return client.invalidateQueries({ queryKey: [key] })
    },
    onError: (failure: Error) => toast.error(failure.message),
  })
  const create = useMutation({ mutationFn: createPlan, ...changed('plans', 'Plan created') })
  const update = useMutation({ mutationFn: updatePlan, ...changed('plans', 'Plan saved') })
  const offer = useMutation({ mutationFn: movePlan, ...changed('plans', 'Saved') })
  const remove = useMutation({ mutationFn: deletePlan, ...changed('plans', 'Plan deleted') })
  const decide = useMutation({ mutationFn: decideSubscription, ...changed('subscriptions', 'Saved') })

  return (
    <>
      <PageHeader title="Subscriptions" description="Plans give a seller a lower commission for a period. A seller without one pays the default rate.">
        {can('default_commission_rate.manage') && <Link to="/dashboard/commission" className="text-sm font-medium text-primary hover:underline">Default commission</Link>}
      </PageHeader>
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      {managesPlans && (
        <Plans
          plans={plans?.items ?? []}
          onSave={({ id, code, ...plan }) => (id ? update.mutate({ id, ...plan }) : create.mutate({ code: code ?? '', ...plan }))}
          onOffer={(id, offered) => offer.mutate({ id, step: offered ? 'reactivate' : 'retire' })}
          onDelete={remove.mutate}
        />
      )}
      {managesSubscriptions && (
        <SellerSubscriptions
          subscriptions={subscriptions?.items ?? []}
          shops={new Map(sellers?.items.map((seller) => [seller.id, seller.business_name]))}
          onDecide={decide.mutate}
        />
      )}
    </>
  )
}

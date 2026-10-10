import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Plan, PlanInput } from '@/services/plans'
import { Field, FormDialog } from '../../_components/FormDialog'
import { RowActions } from '../../_components/RowActions'

interface Props {
  plans: Plan[]
  /** `code` is present only for a new plan: it can never be changed afterwards. */
  onSave: (plan: PlanInput & { id?: string; code?: string }) => void
  /** Offer the plan to sellers, or stop offering it. */
  onOffer: (id: string, offered: boolean) => void
  onDelete: (id: string) => void
}

export function Plans({ plans, onSave, onOffer, onDelete }: Props) {
  const [target, setTarget] = useState<Plan | 'new' | null>(null)
  const plan = target === 'new' ? null : target

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">Plans</h2>
        <Button variant="outline" onClick={() => setTarget('new')}><Plus /> New plan</Button>
      </div>
      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((item) => (
          <article key={item.id} className={cn('rounded-2xl border bg-card p-5 transition hover:shadow-lg hover:shadow-primary/10', item.status === 'retired' && 'opacity-60')}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{item.name}</h3>
              <Switch checked={item.status === 'active'} aria-label={`Offer the ${item.name} plan`} onCheckedChange={(offered) => onOffer(item.id, offered)} />
            </div>
            <p className="mt-3 font-heading text-2xl font-bold text-primary">{formatPrice(item.price)}</p>
            <p className="text-sm text-muted-foreground">every {item.duration_days} days · {Number(item.commission_rate)}% commission</p>
            {item.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
            <div className="mt-3 border-t pt-2">
              <RowActions name={`${item.name} plan`} onEdit={() => setTarget(item)} onDelete={() => onDelete(item.id)} />
            </div>
          </article>
        ))}
        {!plans.length && <p className="text-sm text-muted-foreground sm:col-span-2">No plans yet. Sellers without a plan pay the default commission.</p>}
      </div>
      <FormDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        title={plan ? `Edit ${plan.name}` : 'New plan'}
        description="Set any price, duration and commission. Subscriptions already made keep the terms they were agreed on."
        onSubmit={(data) => onSave({
          id: plan?.id,
          ...(!plan && { code: String(data.get('code')).trim().toLowerCase() }),
          name: String(data.get('name')).trim(),
          description: String(data.get('description')).trim() || null,
          price: String(data.get('price')),
          duration_days: Number(data.get('duration_days')),
          commission_rate: String(data.get('commission_rate')),
        })}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Plan name" name="name" maxLength={100} defaultValue={plan?.name} required />
          <Field
            label="Code (a short name, no spaces)"
            name="code"
            defaultValue={plan?.code}
            disabled={plan !== null}
            // The backend wants a letter first, then letters, digits or underscores; capitals are lowered on save.
            pattern="[A-Za-z][A-Za-z0-9_]{1,49}"
            title="Start with a letter, then use only letters, numbers or underscores (2 to 50 characters, no spaces). Example: business_plan"
            placeholder="business_plan"
            required
          />
          <Field label="Price (RWF)" name="price" type="number" min={0} step="0.01" defaultValue={plan ? Number(plan.price) : undefined} required />
          <Field label="Duration (days)" name="duration_days" type="number" min={1} max={3660} defaultValue={plan?.duration_days} required />
        </div>
        <Field label="Commission on sales (%)" name="commission_rate" type="number" min={0} max={100} step="0.01" defaultValue={plan ? Number(plan.commission_rate) : undefined} required />
        <Field label="Description (optional)" name="description" maxLength={1000} defaultValue={plan?.description ?? ''} />
      </FormDialog>
    </section>
  )
}

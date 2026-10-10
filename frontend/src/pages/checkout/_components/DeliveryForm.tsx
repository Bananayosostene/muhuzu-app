import { Field } from '@/components/shared/FormField'
import { RegionFields } from '@/components/shared/RegionFields'
import { Button } from '@/components/ui/button'
import { phoneField, toE164 } from '@/lib/phone'
import type { OrderRequest } from '@/types/order'

interface Props {
  /** Known when the buyer is signed in. */
  defaultName?: string
  pending: boolean
  onSubmit: (details: Omit<OrderRequest, 'items'>) => void
}

export function DeliveryForm({ defaultName, pending, onSubmit }: Props) {
  return (
    <form
      className="grid gap-8 rounded-2xl border bg-card p-6"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const text = (name: string) => String(data.get(name) ?? '').trim()
        onSubmit({
          delivery: {
            recipient_name: text('recipient_name'), recipient_phone: toE164(text('recipient_phone')),
            province: text('province'), district: text('district'), sector: text('sector'),
            ...(text('address') && { address: text('address') }),
          },
          ...(text('note') && { note: text('note') }),
        })
      }}
    >
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 font-heading text-lg font-semibold">Who is receiving it?</legend>
        <Field label="Full name" name="recipient_name" autoComplete="name" maxLength={150} defaultValue={defaultName} />
        <Field label="Phone number" name="recipient_phone" autoComplete="tel" {...phoneField} />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 font-heading text-lg font-semibold">Where should it be delivered?</legend>
        <RegionFields />
        <Field label="Cell, street or landmark (optional)" name="address" required={false} maxLength={255} />
      </fieldset>

      <Field label="Note for the seller (optional)" name="note" required={false} maxLength={500} placeholder="Call before delivery" />

      <Button type="submit" size="lg" disabled={pending} className="h-12 rounded-full text-base shadow-lg shadow-primary/30">
        {pending ? 'Placing order…' : 'Place order'}
      </Button>
    </form>
  )
}

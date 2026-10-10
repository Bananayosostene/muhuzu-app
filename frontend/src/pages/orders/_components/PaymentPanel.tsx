import { Clock, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/format'
import { phoneField, toE164 } from '@/lib/phone'
import type { PaymentInstructions, PaymentRequest } from '@/types/order'

interface Props {
  payment: PaymentInstructions
  pending: boolean
  onSubmit: (request: PaymentRequest) => void
}

/** How to pay MUHUZE outside the app, and the form to report the payment. */
export function PaymentPanel({ payment, pending, onSubmit }: Props) {
  const latest = payment.attempts.at(0)

  if (latest?.status === 'awaiting_verification') {
    return (
      <section className="flex items-start gap-3 rounded-2xl border border-highlight/50 bg-highlight/15 p-5">
        <Clock className="mt-0.5 size-5 shrink-0" />
        <div>
          <h2 className="font-heading font-semibold">Waiting for Muhuze to confirm your payment</h2>
          <p className="text-sm text-muted-foreground">Reference {latest.reference}. This page updates by itself once it is confirmed.</p>
        </div>
      </section>
    )
  }
  if (!payment.can_pay) {
    return (
      <p className="flex items-start gap-2 rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        Muhuze cannot take a payment for this order right now. Please try again later.
      </p>
    )
  }

  return (
    <form
      className="grid gap-5 rounded-2xl border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        onSubmit({
          destination_id: String(data.get('destination_id')),
          reference: String(data.get('reference')).trim(),
          payer_phone: toE164(String(data.get('payer_phone'))),
        })
      }}
    >
      <div>
        <h2 className="font-heading text-lg font-semibold">Pay {formatPrice(payment.amount)}</h2>
        <p className="text-sm text-muted-foreground">Send the money to one of these Muhuze accounts with your own mobile-money or bank app, then tell us below. The order is prepaid: there is no cash on delivery.</p>
      </div>
      {latest?.status === 'rejected' && (
        <p className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0" />
          Your last payment ({latest.reference}) was not accepted: {latest.rejection_reason} You can submit again.
        </p>
      )}
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Account you paid to</legend>
        {payment.pay_to.map((account, index) => (
          <label key={account.id} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 has-checked:border-primary has-checked:bg-primary/5">
            <input type="radio" name="destination_id" value={account.id} defaultChecked={index === 0} required className="mt-1 accent-primary" />
            <span className="text-sm">
              <span className="block font-medium">{account.provider} · {account.account_reference}</span>
              <span className="block text-muted-foreground">Check that the name shown is <strong className="text-foreground">{account.registered_name}</strong></span>
              {account.instructions && <span className="block text-muted-foreground">{account.instructions}</span>}
            </span>
          </label>
        ))}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="reference">Transaction reference</Label>
          <Input id="reference" name="reference" required minLength={3} maxLength={100} placeholder="From the confirmation message" className="h-10" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="payer_phone">Number you paid from</Label>
          <Input id="payer_phone" name="payer_phone" required className="h-10" {...phoneField} />
        </div>
      </div>
      <Button type="submit" size="lg" disabled={pending} className="h-11 text-base">
        {pending ? 'Sending…' : 'I have paid'}
      </Button>
    </form>
  )
}

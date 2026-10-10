import { Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field } from '../../_components/FormDialog'

interface Props {
  /** The rate in force, e.g. "10.00"; null when none was ever set. */
  rate: string | null
  pending: boolean
  onSave: (input: { rate: string; note?: string }) => void
}

/** The commission MUHUZE takes from a sale when the seller has no plan. */
export function CommissionCard({ rate, pending, onSave }: Props) {
  return (
    <form
      className="flex flex-wrap items-end gap-4 rounded-2xl border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const note = String(data.get('note')).trim()
        onSave({ rate: String(data.get('rate')), ...(note && { note }) })
      }}
    >
      <div className="flex min-w-56 flex-1 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-highlight/25 text-highlight-foreground dark:text-highlight">
          <Percent className="size-5" />
        </span>
        <div>
          <h2 className="font-heading font-semibold">{rate === null ? 'No commission rate yet' : `Current rate: ${Number(rate)}%`}</h2>
          <p className="text-sm text-muted-foreground">
            {rate === null
              ? 'Buyers cannot place orders until you set one.'
              : 'Taken from each sale of a seller without a plan. Orders already placed keep their rate.'}
          </p>
        </div>
      </div>
      <Field key={rate} label="New rate %" name="rate" type="number" min={0} max={100} step="0.01" defaultValue={rate === null ? undefined : Number(rate)} className="w-28" required />
      <Field label="Note (optional)" name="note" maxLength={500} placeholder="Why it changed" className="w-56" />
      <Button type="submit" disabled={pending}>Save rate</Button>
    </form>
  )
}

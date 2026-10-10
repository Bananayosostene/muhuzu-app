import { useQuery } from '@tanstack/react-query'
import { ArrowDownLeft, ArrowUpRight, Banknote, Clock, Info, PiggyBank, Wallet } from 'lucide-react'
import { formatDate, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { getMyMovements, getMyWallet, movementKinds, type Movement } from '@/services/wallets'
import { DataTable, type Column } from '../_components/DataTable'
import { PageHeader } from '../_components/PageHeader'
import { StatCard } from '../_components/StatCard'

/** A signed amount: green with a plus when money came in, plain when it went out, a dash for no change. */
function Change({ value }: { value: string }) {
  const amount = Number(value)
  if (!amount) return <span className="text-muted-foreground">—</span>
  return <span className={cn('font-medium tabular-nums', amount > 0 && 'text-primary')}>{amount > 0 && '+'}{formatPrice(amount)}</span>
}

const columns: Column<Movement>[] = [
  {
    header: 'Movement',
    cell: (row) => {
      // Money counts as coming in when either balance grew.
      const incoming = Number(row.pending_change) + Number(row.available_change) >= 0
      return (
        <div className="flex items-center gap-3">
          <span className={cn('grid size-9 shrink-0 place-items-center rounded-full', incoming ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
            {incoming ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
          </span>
          <p className="font-medium">{movementKinds[row.kind]}</p>
        </div>
      )
    },
  },
  { header: 'Date', cell: (row) => formatDate(row.created_at) },
  { header: 'On the way', cell: (row) => <Change value={row.pending_change} /> },
  { header: 'Ready to withdraw', cell: (row) => <Change value={row.available_change} /> },
  { header: 'Ready after', className: 'text-right', cell: (row) => <span className="tabular-nums">{formatPrice(row.available_after)}</span> },
]

/** The seller's wallet: what MUHUZE owes the shop, and every movement behind it. */
export default function DashboardEarnings() {
  const { data: wallet, error } = useQuery({ queryKey: ['my-wallet'], queryFn: getMyWallet })
  const { data: movements } = useQuery({ queryKey: ['my-wallet', 'movements'], queryFn: getMyMovements })
  const money = (value?: string) => (value === undefined ? '…' : formatPrice(value))

  return (
    <>
      <PageHeader title="My wallet" description="What Muhuze owes your shop for the orders buyers paid." />
      <p className="flex items-start gap-2 rounded-xl border border-highlight/50 bg-highlight/15 p-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0" />
        These are amounts Muhuze owes you, not money already in your hands. A sale becomes ready to withdraw once its buyer confirms receiving it.
      </p>
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ready to withdraw" value={money(wallet?.available_balance)} hint="Buyers confirmed these sales" icon={Wallet} />
        <StatCard label="On the way" value={money(wallet?.pending_balance)} hint="Paid, waiting for the buyer to confirm" icon={Clock} />
        <StatCard label="Total earned" value={money(wallet?.total_earned)} hint="After Muhuze's commission" icon={PiggyBank} />
        <StatCard label="Withdrawn" value={money(wallet?.total_withdrawn)} hint="Already paid out to you" icon={Banknote} />
      </div>
      <DataTable rows={movements?.items ?? []} columns={columns} search={(row) => movementKinds[row.kind]} />
    </>
  )
}

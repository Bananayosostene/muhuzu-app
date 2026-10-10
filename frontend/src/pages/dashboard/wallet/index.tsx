import { useQuery } from '@tanstack/react-query'
import { Banknote, Info, Percent, ShoppingBag, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/use-session'
import { formatDate, formatPrice } from '@/lib/format'
import { getSellers } from '@/services/sellers'
import { getRevenue, getRevenueSummary, getSellerWallet, type RevenueRecord } from '@/services/wallets'
import { DataTable, type Column } from '../_components/DataTable'
import { PageHeader } from '../_components/PageHeader'
import { StatCard } from '../_components/StatCard'
import { StatusBadge } from '../_components/StatusBadge'
import { SellerWalletDialog } from './_components/SellerWalletDialog'

/** Staff: the revenue record of every sale. MUHUZE has no wallet of its own; its income is the commission. */
export default function DashboardWallet() {
  const { can } = useSession()
  const [opened, setOpened] = useState<string | null>(null)
  const { data: summary, error } = useQuery({ queryKey: ['revenue', 'summary'], queryFn: getRevenueSummary })
  const { data: revenue } = useQuery({ queryKey: ['revenue'], queryFn: getRevenue })
  // A record carries only its shop's id; the names come from the sellers list, for staff allowed to read it.
  const { data: sellers } = useQuery({ queryKey: ['sellers', ''], queryFn: () => getSellers(''), enabled: can('seller.read') })
  const { data: wallet } = useQuery({ queryKey: ['seller-wallet', opened], queryFn: () => getSellerWallet(opened ?? ''), enabled: opened !== null })

  const shops = new Map(sellers?.items.map((seller) => [seller.id, seller.business_name]))
  const money = (value?: string) => (value === undefined ? '…' : formatPrice(value))

  const columns: Column<RevenueRecord>[] = [
    {
      header: 'Sale',
      cell: (row) => (
        <div>
          <p className="font-medium">{shops.get(row.seller_id) ?? 'Seller'}</p>
          <p className="text-xs text-muted-foreground">{formatDate(row.created_at)}</p>
        </div>
      ),
    },
    { header: 'Buyer paid', cell: (row) => formatPrice(row.gross_amount) },
    {
      header: 'Muhuze commission',
      cell: (row) => <span className="font-medium text-primary">+{formatPrice(row.commission_amount)} <span className="text-xs font-normal text-muted-foreground">({Number(row.commission_rate)}%)</span></span>,
    },
    { header: 'Owed to seller', cell: (row) => formatPrice(row.seller_amount) },
    { header: 'Status', cell: (row) => <StatusBadge tone={row.reversed_at ? 'danger' : 'success'}>{row.reversed_at ? 'Reversed' : 'Counted'}</StatusBadge> },
    {
      header: '',
      className: 'text-right',
      cell: (row) => can('wallet.read') && <Button variant="outline" size="sm" onClick={() => setOpened(row.seller_id)}><Wallet /> Seller wallet</Button>,
    },
  ]

  return (
    <>
      <PageHeader title="Wallet" description="What buyers paid, Muhuze's commission, and what is owed to sellers." />
      <p className="flex items-start gap-2 rounded-xl border border-highlight/50 bg-highlight/15 p-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0" />
        Balances are records only. Real money moves outside the app; income from seller subscriptions is not included here.
      </p>
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Muhuze commission" value={money(summary?.commission_amount)} hint="Income from sales" icon={Percent} />
        <StatCard label="Buyers paid" value={money(summary?.gross_amount)} hint="Across confirmed payments" icon={Banknote} />
        <StatCard label="Owed to sellers" value={money(summary?.seller_amount)} hint="Their share of those sales" icon={Wallet} />
        <StatCard label="Sales" value={summary ? String(summary.sales) : '…'} hint="Shop orders, reversed ones left out" icon={ShoppingBag} />
      </div>
      <DataTable rows={revenue?.items ?? []} columns={columns} search={(row) => shops.get(row.seller_id) ?? ''} />
      <SellerWalletDialog open={opened !== null} shop={opened ? shops.get(opened) : undefined} wallet={wallet} onClose={() => setOpened(null)} />
    </>
  )
}

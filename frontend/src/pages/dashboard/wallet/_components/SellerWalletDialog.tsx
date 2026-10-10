import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format'
import type { Wallet } from '@/services/wallets'

interface Props {
  open: boolean
  /** The shop's name, when the viewer may read sellers. */
  shop?: string
  /** Undefined while it loads. */
  wallet?: Wallet
  onClose: () => void
}

/** What MUHUZE owes one shop right now. */
export function SellerWalletDialog({ open, shop, wallet, onClose }: Props) {
  const rows = wallet && [
    ['Ready to withdraw', wallet.available_balance],
    ['On the way (buyer has not confirmed)', wallet.pending_balance],
    ['Total earned', wallet.total_earned],
    ['Already paid out', wallet.total_withdrawn],
  ]

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{shop ?? 'Seller'} · wallet</DialogTitle>
          <DialogDescription>What Muhuze owes this shop. Paying it out happens through a withdrawal.</DialogDescription>
        </DialogHeader>
        {!rows && <Skeleton className="h-32 rounded-xl" />}
        {rows && (
          <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-sm">
            {rows.map(([label, amount]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium tabular-nums">{formatPrice(amount)}</dd>
              </div>
            ))}
          </dl>
        )}
      </DialogContent>
    </Dialog>
  )
}

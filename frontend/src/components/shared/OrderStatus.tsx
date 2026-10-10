import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OrderStatus as Status, SellerOrderStatus } from '@/types/order'

const labels: Record<Status | SellerOrderStatus, { text: string; tone: string }> = {
  awaiting_payment: { text: 'Waiting for payment', tone: 'bg-highlight/25 text-highlight-foreground dark:text-highlight' },
  in_progress: { text: 'In progress', tone: 'bg-primary/10 text-primary' },
  pending: { text: 'Paid · waiting for the shop', tone: 'bg-highlight/25 text-highlight-foreground dark:text-highlight' },
  accepted: { text: 'Being prepared', tone: 'bg-primary/10 text-primary' },
  shipped: { text: 'On its way', tone: 'bg-primary/10 text-primary' },
  delivered: { text: 'Delivered', tone: 'bg-primary/10 text-primary' },
  completed: { text: 'Completed', tone: 'bg-primary/10 text-primary' },
  rejected: { text: 'Declined by the shop', tone: 'bg-destructive/10 text-destructive' },
  cancelled: { text: 'Cancelled', tone: 'bg-muted text-muted-foreground' },
}

/** The status of an order, or of one shop's part of it, in words. */
export function OrderStatus({ status }: { status: Status | SellerOrderStatus }) {
  return (
    <Badge variant="secondary" className={cn(labels[status].tone)}>
      <span className="size-1.5 rounded-full bg-current" />
      {labels[status].text}
    </Badge>
  )
}

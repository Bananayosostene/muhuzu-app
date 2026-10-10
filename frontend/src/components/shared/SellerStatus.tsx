import { Badge } from '@/components/ui/badge'
import type { SellerStatus as Status } from '@/types/seller'

const labels: Record<Status, { text: string; tone: string }> = {
  draft: { text: 'Draft · not sent yet', tone: 'bg-muted text-muted-foreground' },
  pending_review: { text: 'Waiting for review', tone: 'bg-highlight/25 text-highlight-foreground dark:text-highlight' },
  active: { text: 'Approved · open', tone: 'bg-primary/10 text-primary' },
  rejected: { text: 'Not approved', tone: 'bg-destructive/10 text-destructive' },
  suspended: { text: 'Suspended by Muhuze', tone: 'bg-destructive/10 text-destructive' },
  deactivated: { text: 'Closed by the seller', tone: 'bg-muted text-muted-foreground' },
}

/** Where a seller application stands, in words. */
export function SellerStatus({ status }: { status: Status }) {
  return (
    <Badge variant="secondary" className={labels[status].tone}>
      <span className="size-1.5 rounded-full bg-current" />
      {labels[status].text}
    </Badge>
  )
}

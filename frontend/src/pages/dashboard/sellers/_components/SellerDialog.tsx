import { SellerStatus } from '@/components/shared/SellerStatus'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { documentTypes, identityTypes, type DocumentType, type Seller } from '@/types/seller'

type Step = 'approve' | 'reject' | 'suspend' | 'reinstate'

interface Props {
  /** Undefined while it loads. */
  seller?: Seller
  open: boolean
  /** From the reviewer's permissions: `seller.review` and `seller.suspend`. */
  canReview: boolean
  canSuspend: boolean
  pending: boolean
  onClose: () => void
  onOpenDocument: (type: DocumentType) => void
  onDecide: (step: Step, reason?: string) => void
}

/** Everything staff need to check an application, and the decisions open in its current status. */
export function SellerDialog({ seller, open, canReview, canSuspend, pending, onClose, onOpenDocument, onDecide }: Props) {
  // Declining needs a reason the seller will read; which step it is follows from the status.
  const decline = seller?.status === 'pending_review' && canReview ? 'reject' : seller?.status === 'active' && canSuspend ? 'suspend' : null
  const place = seller?.location

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{seller?.business_name ?? 'Seller'}</DialogTitle>
          <DialogDescription>Check the identity document against the details before deciding.</DialogDescription>
        </DialogHeader>
        {!seller && <Skeleton className="h-64 rounded-xl" />}
        {seller && place && (
          <div className="grid gap-4 text-sm">
            <div><SellerStatus status={seller.status} /></div>
            {seller.status_reason && <p className="rounded-lg bg-destructive/10 p-3">Reason given: {seller.status_reason}</p>}
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
              <dt className="text-muted-foreground">Phone</dt><dd>{seller.business_phone}</dd>
              <dt className="text-muted-foreground">Sells</dt><dd>{seller.business_description ?? '—'}</dd>
              <dt className="text-muted-foreground">{identityTypes[seller.identity_document_type]}</dt><dd className="font-mono">{seller.identity_document_number}</dd>
              <dt className="text-muted-foreground">Location</dt>
              <dd>{[place.street_address, place.village, place.cell, place.sector, place.district, place.province].filter(Boolean).join(', ')}</dd>
            </dl>
            <ul className="divide-y rounded-xl border">
              {seller.documents.map((file) => (
                <li key={file.document_type} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span>{documentTypes[file.document_type]}</span>
                  <Button variant="outline" size="sm" onClick={() => onOpenDocument(file.document_type)}>Open</Button>
                </li>
              ))}
              {!seller.documents.length && <li className="px-3 py-2 text-muted-foreground">No documents uploaded.</li>}
            </ul>

            {seller.status === 'pending_review' && canReview && (
              <Button disabled={pending} onClick={() => onDecide('approve')}>Approve: the shop can start selling</Button>
            )}
            {seller.status === 'suspended' && canSuspend && (
              <Button disabled={pending} onClick={() => onDecide('reinstate')}>Reinstate the shop</Button>
            )}
            {decline && (
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  onDecide(decline, String(new FormData(event.currentTarget).get('reason')).trim())
                }}
              >
                <Input name="reason" required minLength={5} maxLength={500} aria-label="Reason" placeholder="Reason, shown to the seller" />
                <Button type="submit" variant="destructive" disabled={pending}>{decline === 'reject' ? 'Reject' : 'Suspend'}</Button>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

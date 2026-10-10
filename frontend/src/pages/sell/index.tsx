import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { SellerStatus } from '@/components/shared/SellerStatus'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { openLink } from '@/lib/open-link'
import {
  applyAsSeller, getMyDocumentUrl, getMySeller, moveMySeller, removeMyDocument, updateMySeller, uploadMyDocument,
} from '@/services/sellers'
import type { Seller } from '@/types/seller'
import { ApplicationForm } from './_components/ApplicationForm'
import { Documents } from './_components/Documents'

const KEY = ['seller', 'me']

// What the person is told at each step of the application.
const notes: Record<Seller['status'], string> = {
  draft: 'Complete the details, upload your identity document, then send the application for review.',
  rejected: 'Muhuze did not approve the application. Fix what is described below and send it again.',
  pending_review: 'Muhuze is reviewing your application. You will be able to list products once it is approved.',
  active: 'Your shop is approved and open. Manage it from the dashboard.',
  suspended: 'Muhuze has suspended your shop. You can still sign in and buy.',
  deactivated: 'You closed your shop. Reopen it whenever you want to sell again.',
}

export default function Sell() {
  const client = useQueryClient()
  const { data: seller } = useQuery({ queryKey: KEY, queryFn: getMySeller })
  // Every change returns the whole application, so it replaces the cached one.
  const saved = (message: string) => ({
    onSuccess: (next: Seller) => {
      client.setQueryData(KEY, next)
      toast.success(message)
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const apply = useMutation({ mutationFn: applyAsSeller, ...saved('Application started. Now add your documents.') })
  const update = useMutation({ mutationFn: updateMySeller, ...saved('Changes saved') })
  const upload = useMutation({ mutationFn: uploadMyDocument, ...saved('Document uploaded') })
  const remove = useMutation({ mutationFn: removeMyDocument, ...saved('Document removed') })
  const move = useMutation({ mutationFn: moveMySeller, ...saved('Done') })

  const status = seller?.status
  // Approval gives the account its seller permissions; pick them up so the dashboard opens.
  useEffect(() => {
    if (status === 'active') void client.invalidateQueries({ queryKey: ['me'] })
  }, [status, client])

  if (seller === undefined) return <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8"><Skeleton className="h-96 rounded-2xl" /></main>

  const editable = status === 'draft' || status === 'rejected'

  return (
    <main className="mx-auto grid w-full max-w-3xl flex-1 content-start gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="animate-rise font-heading text-3xl font-bold">{seller ? seller.business_name : 'Sell on Muhuze'}</h1>
        {seller && <SellerStatus status={seller.status} />}
      </div>
      <p className="text-muted-foreground">
        {seller ? notes[seller.status] : 'Open a shop and sell to buyers across Rwanda. Muhuze checks who every seller is before they can trade, so start by telling us about your shop.'}
      </p>
      {seller?.status_reason && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm"><strong>Reason from Muhuze:</strong> {seller.status_reason}</p>
      )}

      {!seller && <ApplicationForm submit="Start my application" pending={apply.isPending} onSubmit={apply.mutate} />}

      {seller && editable && (
        <>
          <ApplicationForm key={seller.id} defaults={seller} submit="Save changes" pending={update.isPending} onSubmit={update.mutate} />
          <Documents
            seller={seller}
            busy={upload.isPending || remove.isPending}
            onUpload={(type, file) => upload.mutate({ type, file })}
            onOpen={(type) => openLink(() => getMyDocumentUrl(type))}
            onRemove={remove.mutate}
          />
          <Button size="lg" className="h-12 text-base" disabled={seller.missing_documents.length > 0 || move.isPending} onClick={() => move.mutate('submit')}>
            Send for review
          </Button>
        </>
      )}

      {status === 'active' && (
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard" className={buttonVariants({ size: 'lg' })}>Open my dashboard</Link>
          <Button variant="outline" size="lg" disabled={move.isPending} onClick={() => move.mutate('deactivate')}>Close my shop</Button>
        </div>
      )}
      {status === 'deactivated' && (
        <Button size="lg" className="justify-self-start" disabled={move.isPending} onClick={() => move.mutate('reactivate')}>Reopen my shop</Button>
      )}
    </main>
  )
}

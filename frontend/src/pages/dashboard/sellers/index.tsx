import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { SellerStatus as StatusBadge } from '@/components/shared/SellerStatus'
import { Button } from '@/components/ui/button'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useSession } from '@/hooks/use-session'
import { formatDate } from '@/lib/format'
import { openLink } from '@/lib/open-link'
import { getDocumentUrl, getSeller, getSellers, reviewSeller } from '@/services/sellers'
import type { SellerStatus, SellerSummary } from '@/types/seller'
import { DataTable, type Column } from '../_components/DataTable'
import { PageHeader } from '../_components/PageHeader'
import { SellerDialog } from './_components/SellerDialog'

const filters: Record<SellerStatus | '', string> = {
  pending_review: 'Waiting for review',
  '': 'All sellers',
  active: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
  deactivated: 'Closed',
  draft: 'Drafts',
}
const isFilter = (value: string): value is SellerStatus | '' => value in filters

/** Staff: review seller applications, and suspend or reinstate shops. */
export default function DashboardSellers() {
  const client = useQueryClient()
  const { can } = useSession()
  // The review queue is what staff come here for.
  const [status, setStatus] = useState<SellerStatus | ''>('pending_review')
  const [opened, setOpened] = useState<string | null>(null)
  const { data, error } = useQuery({ queryKey: ['sellers', status], queryFn: () => getSellers(status) })
  const { data: detail } = useQuery({
    queryKey: ['sellers', 'one', opened],
    queryFn: () => getSeller(opened ?? ''),
    enabled: opened !== null,
  })
  const decide = useMutation({
    mutationFn: reviewSeller,
    onSuccess: () => {
      toast.success('Saved')
      setOpened(null)
      return client.invalidateQueries({ queryKey: ['sellers'] })
    },
    onError: (failure) => toast.error(failure.message),
  })

  const columns: Column<SellerSummary>[] = [
    {
      header: 'Shop',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.business_name}</p>
          <p className="text-xs text-muted-foreground">{row.business_phone}</p>
        </div>
      ),
    },
    { header: 'District', cell: (row) => row.district },
    { header: 'Sent', cell: (row) => (row.submitted_at ? formatDate(row.submitted_at) : '—') },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: '', className: 'text-right', cell: (row) => <Button variant="outline" size="sm" onClick={() => setOpened(row.id)}>Open</Button> },
  ]

  return (
    <>
      <PageHeader title="Sellers" description="A shop can trade only after its application is approved here." />
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      <DataTable
        rows={data?.items ?? []}
        columns={columns}
        search={(row) => `${row.business_name} ${row.business_phone} ${row.district}`}
        toolbar={
          <NativeSelect aria-label="Show" value={status} onChange={(event) => isFilter(event.target.value) && setStatus(event.target.value)}>
            {Object.entries(filters).map(([value, label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}
          </NativeSelect>
        }
      />
      <SellerDialog
        seller={detail}
        open={opened !== null}
        canReview={can('seller.review')}
        canSuspend={can('seller.suspend')}
        pending={decide.isPending}
        onClose={() => setOpened(null)}
        onOpenDocument={(type) => opened && openLink(() => getDocumentUrl({ id: opened, type }))}
        onDecide={(step, reason) => opened && decide.mutate({ id: opened, step, reason })}
      />
    </>
  )
}

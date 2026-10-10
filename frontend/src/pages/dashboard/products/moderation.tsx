import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { useSession } from '@/hooks/use-session'
import { formatPrice } from '@/lib/format'
import { getAllProducts, moderateProduct } from '@/services/seller-products'
import { getSellers } from '@/services/sellers'
import type { OwnProductSummary, ProductStatus } from '@/types/product'
import { DataTable, type Column } from '../_components/DataTable'
import { PageHeader } from '../_components/PageHeader'
import { ListingCell, ProductStatusBadge, StatusTabs } from './_components/ProductCells'

/** Staff: every shop's listings. A listing is on sale as soon as its seller publishes it; staff can hide one. */
export default function ProductModeration() {
  const client = useQueryClient()
  const { can } = useSession()
  const [status, setStatus] = useState<ProductStatus | ''>('')
  const { data, error } = useQuery({ queryKey: ['all-products', status], queryFn: () => getAllProducts(status) })
  // A listing row carries only its shop's id; the names come from the sellers list, for staff allowed to read it.
  const { data: sellers } = useQuery({ queryKey: ['sellers', ''], queryFn: () => getSellers(''), enabled: can('seller.read') })
  const shops = new Map(sellers?.items.map((seller) => [seller.id, seller.business_name]))

  const moderate = useMutation({
    mutationFn: moderateProduct,
    onSuccess: (_, { step }) => {
      toast.success(step === 'hide' ? 'Listing hidden from the store' : 'Listing restored')
      return client.invalidateQueries({ queryKey: ['all-products'] })
    },
    onError: (failure) => toast.error(failure.message),
  })

  const columns: Column<OwnProductSummary>[] = [
    { header: 'Listing', cell: (row) => <ListingCell product={row} detail={shops.get(row.seller_id)} /> },
    { header: 'Status', cell: (row) => <ProductStatusBadge product={row} /> },
    { header: 'Price', cell: (row) => <span className="font-medium">{formatPrice(row.price)}</span> },
    {
      header: 'Visible',
      cell: (row) => (
        <Switch
          checked={!row.hidden_by_staff_at}
          disabled={moderate.isPending}
          aria-label={`Allow ${row.name} in the store`}
          onCheckedChange={(allowed) => moderate.mutate({ id: row.id, step: allowed ? 'restore' : 'hide' })}
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Products" description="Every listing on the marketplace. Switch one off to hide it from buyers; its seller cannot put it back." />
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      <DataTable
        rows={data?.items ?? []}
        columns={columns}
        search={(row) => `${row.name} ${shops.get(row.seller_id) ?? ''}`}
        toolbar={<StatusTabs value={status} onChange={setStatus} />}
      />
    </>
  )
}

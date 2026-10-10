import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { formatPrice } from '@/lib/format'
import { getCategory, getMyCategories } from '@/services/categories'
import {
  addProductImage, createProduct, deleteProduct, getMyProduct, getMyProducts, moveProduct, orderProductImages,
  removeProductImage, updateProduct,
} from '@/services/seller-products'
import type { OwnProduct, OwnProductSummary, ProductStatus } from '@/types/product'
import { DataTable, type Column } from '../_components/DataTable'
import { PageHeader } from '../_components/PageHeader'
import { RowActions } from '../_components/RowActions'
import { ImageManager } from './_components/ImageManager'
import { ListingForm } from './_components/ListingForm'
import { ListingCell, ProductStatusBadge, StatusTabs } from './_components/ProductCells'

/** The seller's own listings. */
export default function MyProducts() {
  const client = useQueryClient()
  const [status, setStatus] = useState<ProductStatus | ''>('')
  /** The listing open in the form: its id, 'new', or null when closed. */
  const [target, setTarget] = useState<string | null>(null)
  const editing = target !== null && target !== 'new' ? target : null

  const { data, error } = useQuery({ queryKey: ['my-products', status], queryFn: () => getMyProducts(status) })
  const { data: categories } = useQuery({ queryKey: ['my-categories'], queryFn: getMyCategories })
  // The form needs each category's attributes; a shop has few categories, so they are loaded when it opens.
  const usable = categories?.items.filter((category) => category.is_active) ?? []
  const details = useQueries({
    queries: usable.map((category) => ({ queryKey: ['category', category.id], queryFn: () => getCategory(category.id), enabled: target !== null })),
  }).flatMap((query) => query.data ?? [])
  const { data: product } = useQuery({ queryKey: ['my-product', editing], queryFn: () => getMyProduct(editing ?? ''), enabled: editing !== null })

  const refresh = () => client.invalidateQueries({ queryKey: ['my-products'] })
  const failed = (failure: Error) => toast.error(failure.message)
  // Every change to one listing returns it whole: it replaces the open one and the table is reloaded.
  const kept = (message?: string) => ({
    onSuccess: (next: OwnProduct) => {
      client.setQueryData(['my-product', next.id], next)
      if (message) toast.success(message)
      return refresh()
    },
    onError: failed,
  })
  const create = useMutation({
    mutationFn: createProduct,
    ...kept('Draft saved. Add pictures, then switch it to visible.'),
    // Keep the form open on the new draft so pictures can be added.
    onSettled: (created) => created && setTarget(created.id),
  })
  const update = useMutation({ mutationFn: updateProduct, ...kept('Listing saved') })
  const move = useMutation({ mutationFn: moveProduct, ...kept() })
  const addImage = useMutation({ mutationFn: addProductImage, ...kept() })
  const removeImage = useMutation({ mutationFn: removeProductImage, ...kept() })
  const orderImages = useMutation({ mutationFn: orderProductImages, ...kept() })
  const remove = useMutation({ mutationFn: deleteProduct, onSuccess: () => { toast.success('Listing deleted'); return refresh() }, onError: failed })

  const names = new Map(categories?.items.map((category) => [category.id, category.name]))
  const columns: Column<OwnProductSummary>[] = [
    { header: 'Listing', cell: (row) => <ListingCell product={row} detail={names.get(row.category_id)} /> },
    { header: 'Status', cell: (row) => <ProductStatusBadge product={row} /> },
    { header: 'Price', cell: (row) => <span className="font-medium">{formatPrice(row.price)}</span> },
    {
      header: 'Visible',
      cell: (row) => (
        <Switch
          checked={row.status === 'published' && !row.hidden_by_staff_at}
          // A listing Muhuze hid cannot be put back on sale by its seller.
          disabled={move.isPending || row.hidden_by_staff_at !== null}
          aria-label={`Show ${row.name} in the store`}
          onCheckedChange={(visible) => move.mutate({ id: row.id, step: visible ? 'publish' : 'archive' })}
        />
      ),
    },
    {
      header: '',
      cell: (row) => <RowActions name={row.name} onEdit={() => setTarget(row.id)} onDelete={() => remove.mutate(row.id)} />,
    },
  ]

  const images = product?.images ?? []
  const busy = addImage.isPending || removeImage.isPending || orderImages.isPending

  return (
    <>
      <PageHeader title="Products" description="Everything your shop lists on the marketplace.">
        <Button disabled={!usable.length} onClick={() => setTarget('new')}><Plus /> Add listing</Button>
      </PageHeader>
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      {categories && !usable.length && (
        <p className="rounded-xl border border-highlight/50 bg-highlight/15 p-3 text-sm">
          Every listing sits in one of your own categories. <Link to="/dashboard/categories" className="font-medium text-primary hover:underline">Create your first category</Link> to start listing.
        </p>
      )}
      <DataTable rows={data?.items ?? []} columns={columns} search={(row) => row.name} toolbar={<StatusTabs value={status} onChange={setStatus} />} />
      {/* The key gives a fresh form for each listing, and once its saved values have loaded. */}
      <ListingForm
        key={`${target}-${product?.id}`}
        open={target !== null && (target === 'new' || product !== undefined)}
        product={editing ? product : undefined}
        categories={details}
        pending={create.isPending || update.isPending}
        onClose={() => setTarget(null)}
        onSubmit={(input) => (editing ? update.mutate({ id: editing, ...input }) : create.mutate(input))}
      >
        {editing && (
          <ImageManager
            images={images}
            busy={busy}
            onAdd={(file) => addImage.mutate({ id: editing, file })}
            onRemove={(imageId) => removeImage.mutate({ id: editing, imageId })}
            onMakeMain={(imageId) => orderImages.mutate({ id: editing, image_ids: [imageId, ...images.map((image) => image.id).filter((id) => id !== imageId)] })}
          />
        )}
      </ListingForm>
    </>
  )
}

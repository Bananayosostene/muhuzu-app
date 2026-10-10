import { useState, type ReactNode } from 'react'
import { Field, SelectField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import type { Category } from '@/types/category'
import type { OwnProduct, ProductInput } from '@/types/product'
import { readAttributes } from '../attributes'
import { AttributeFields } from './AttributeFields'

interface Props {
  open: boolean
  /** The listing being edited; undefined for a new one. */
  product?: OwnProduct
  /** The seller's categories that can take products, each with its attributes. */
  categories: Category[]
  pending: boolean
  onSubmit: (input: ProductInput) => void
  onClose: () => void
  /** The pictures section; only an existing listing can have pictures. */
  children?: ReactNode
}

/** Create or edit a listing. Stays open with what was typed when saving fails. */
export function ListingForm({ open, product, categories, pending, onSubmit, onClose, children }: Props) {
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const category = categories.find((item) => item.id === categoryId)
  // A switched-off attribute can no longer be set.
  const attributes = category?.attributes.filter((attribute) => attribute.is_active) ?? []

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            onSubmit({
              name: String(data.get('name')).trim(),
              description: String(data.get('description')).trim() || null,
              price: String(data.get('price')),
              category_id: categoryId,
              attributes: readAttributes(data, attributes),
            })
          }}
        >
          <DialogHeader>
            <DialogTitle>{product ? 'Edit listing' : 'New listing'}</DialogTitle>
            <DialogDescription>
              {product ? 'Changes are saved to the listing straight away.' : 'It is saved as a draft. Add pictures next, then switch it to visible.'}
            </DialogDescription>
          </DialogHeader>

          {product && product.publish_blockers.length > 0 && (
            <p className="rounded-xl border border-highlight/50 bg-highlight/15 p-3 text-sm">
              Before it can be visible: {product.publish_blockers.join('; ')}.
            </p>
          )}

          <Field label="Title" name="name" maxLength={200} defaultValue={product?.name} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Category"
              name="category_id"
              options={Object.fromEntries(categories.map((item) => [item.id, item.name]))}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            />
            <Field label="Price (RWF)" name="price" type="number" min={1} step="0.01" defaultValue={product && Number(product.price)} />
          </div>
          <Field label="Description (optional)" name="description" required={false} maxLength={20000} defaultValue={product?.description ?? ''} />

          {attributes.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Values belong to a category: they start empty when another one is chosen. */}
              <AttributeFields key={categoryId} attributes={attributes} values={categoryId === product?.category_id ? product.attributes : undefined} />
            </div>
          )}

          {children}

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

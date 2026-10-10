import { Package } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { OwnProductSummary, ProductStatus } from '@/types/product'
import { StatusBadge } from '../../_components/StatusBadge'

/** Picture, name and a second line (category, or shop for staff). */
export function ListingCell({ product, detail }: { product: OwnProductSummary; detail?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
        {product.main_image_url
          ? <img src={product.main_image_url} alt="" loading="lazy" className="size-full object-cover" />
          : <Package className="size-5" />}
      </span>
      <div>
        <p className="font-medium">{product.name}</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </div>
    </div>
  )
}

export function ProductStatusBadge({ product }: { product: OwnProductSummary }) {
  if (product.hidden_by_staff_at) return <StatusBadge tone="danger">Hidden by Muhuze</StatusBadge>
  if (product.status === 'published') return <StatusBadge tone="success">On sale</StatusBadge>
  return <StatusBadge tone={product.status === 'draft' ? 'warning' : 'neutral'}>{product.status === 'draft' ? 'Draft' : 'Archived'}</StatusBadge>
}

const tabs: { value: ProductStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'published', label: 'On sale' },
  { value: 'draft', label: 'Drafts' },
  { value: 'archived', label: 'Archived' },
]

/** The table's filter: which status to show. */
export function StatusTabs({ value, onChange }: { value: ProductStatus | ''; onChange: (status: ProductStatus | '') => void }) {
  return (
    <Tabs value={value || 'all'} onValueChange={(next: ProductStatus | 'all') => onChange(next === 'all' ? '' : next)}>
      <TabsList>
        {tabs.map((tab) => <TabsTrigger key={tab.value} value={tab.value || 'all'} className="px-4">{tab.label}</TabsTrigger>)}
      </TabsList>
    </Tabs>
  )
}

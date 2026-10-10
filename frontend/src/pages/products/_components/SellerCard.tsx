import { Link } from 'react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import type { Product } from '@/types/product'

export function SellerCard({ shop }: { shop: Product['shop'] }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
      <Avatar className="size-12">
        <AvatarFallback className="bg-primary text-primary-foreground">{shop.name[0]}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Sold by</p>
        <p className="truncate font-semibold">{shop.name}</p>
      </div>
      <Link to={`/products?seller_id=${shop.id}`} className={buttonVariants({ variant: 'outline', className: 'shrink-0 rounded-full' })}>
        All listings
      </Link>
    </div>
  )
}

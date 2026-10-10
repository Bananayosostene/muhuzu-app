import { Check, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { cn } from '@/lib/utils'

export function CartButton({ id, className }: { id: string; className?: string }) {
  const { ids, toggle } = useCart()
  const added = ids.includes(id)

  return (
    <Button
      variant={added ? 'secondary' : 'default'}
      aria-pressed={added}
      className={cn('rounded-full transition active:scale-95', className)}
      onClick={() => toggle(id)}
    >
      {added ? <Check /> : <ShoppingCart />} {added ? 'In cart' : 'Add to cart'}
    </Button>
  )
}

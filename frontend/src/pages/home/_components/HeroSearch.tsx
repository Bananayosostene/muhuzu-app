import { Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/** Hero search: type what you want, see the matching listings. */
export function HeroSearch() {
  const navigate = useNavigate()

  return (
    <form
      role="search"
      className="mx-auto mt-8 flex max-w-lg items-center border bg-card transition focus-within:border-foreground md:mx-0"
      action={(data) => navigate(`/products?q=${encodeURIComponent(String(data.get('q') ?? '').trim())}`)}
    >
      <Input
        name="q"
        required
        maxLength={100}
        aria-label="Search products"
        placeholder="What are you looking for?"
        className="h-13 rounded-none border-0 bg-transparent px-5 text-base shadow-none focus-visible:ring-0 md:text-base dark:bg-transparent"
      />
      <Search className="mr-3 size-5 shrink-0 text-muted-foreground" />
      <Button type="submit" className="h-13 shrink-0 rounded-none bg-foreground px-8 text-sm font-medium tracking-widest text-background uppercase hover:bg-foreground/85">
        Find it
      </Button>
    </form>
  )
}

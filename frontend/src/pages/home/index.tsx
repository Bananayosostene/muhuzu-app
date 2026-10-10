import { useProducts } from '@/hooks/use-products'
import { BestPrices } from './_components/BestPrices'
import { FeaturedCards } from './_components/FeaturedCards'
import { Hero } from './_components/Hero'
import { Trending } from './_components/Trending'

export default function Home() {
  // Newest first is the backend's default order.
  const { data: newest } = useProducts({ page_size: 16 })
  const { data: cheapest } = useProducts({ sort: 'price', page_size: 12 })
  const products = newest?.items

  return (
    <main className="flex-1">
      <Hero products={products?.filter((product) => product.main_image_url).slice(0, 3) ?? []} />
      <FeaturedCards products={products?.slice(0, 8) ?? []} />
      <Trending products={products?.slice(8)} />
      <BestPrices products={cheapest?.items ?? []} />
    </main>
  )
}

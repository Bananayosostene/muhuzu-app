import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'

/** The product's pictures: a large one, and the others to switch to. The first is the main picture. */
export function Gallery({ images, alt }: { images: Product['images']; alt: string }) {
  const [shown, setShown] = useState(images[0])

  if (!shown) return <div className="aspect-square w-full rounded-3xl border bg-muted" />

  return (
    <div className="grid gap-3">
      <img src={shown.url} alt={alt} width={640} height={640} className="aspect-square w-full rounded-3xl border bg-muted object-cover" />
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Picture ${index + 1}`}
              aria-pressed={image.id === shown.id}
              className={cn('size-16 shrink-0 overflow-hidden rounded-xl border-2 transition', image.id === shown.id ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100')}
              onClick={() => setShown(image)}
            >
              <img src={image.url} alt="" width={64} height={64} loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

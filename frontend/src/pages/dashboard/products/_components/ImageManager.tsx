import { ImagePlus, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { OwnProduct } from '@/types/product'

interface Props {
  images: OwnProduct['images']
  busy: boolean
  onAdd: (file: File) => void
  onRemove: (imageId: string) => void
  /** Moves a picture to the front: the first one is what buyers see in lists. */
  onMakeMain: (imageId: string) => void
}

const MAX_IMAGES = 8

/** The product's pictures. A product needs at least one to go on sale. */
export function ImageManager({ images, busy, onAdd, onRemove, onMakeMain }: Props) {
  return (
    <section className="grid gap-2">
      <p className="text-sm font-medium">Pictures <span className="font-normal text-muted-foreground">· JPEG or PNG, up to 5 MB, {MAX_IMAGES} at most. The first is the main one.</span></p>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl border bg-muted">
            <img src={image.url} alt="" loading="lazy" className="size-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
              <Button type="button" variant="ghost" size="icon-xs" aria-label="Make this the main picture" disabled={busy || index === 0} className="text-white hover:bg-white/20 hover:text-white" onClick={() => onMakeMain(image.id)}>
                <Star />
              </Button>
              <Button type="button" variant="ghost" size="icon-xs" aria-label="Remove this picture" disabled={busy} className="text-white hover:bg-white/20 hover:text-white" onClick={() => onRemove(image.id)}>
                <Trash2 />
              </Button>
            </div>
            {index === 0 && <span className="absolute top-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">Main</span>}
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <label className={`grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed text-muted-foreground transition hover:border-primary hover:text-primary ${busy ? 'pointer-events-none opacity-50' : ''}`}>
            <ImagePlus className="size-6" />
            <span className="sr-only">Add a picture</span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onAdd(file)
                // Lets the same file be chosen again after a failed upload.
                event.target.value = ''
              }}
            />
          </label>
        )}
      </div>
    </section>
  )
}

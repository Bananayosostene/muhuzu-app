import { Trash2 } from 'lucide-react'
import { Field, SelectField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { attributeTypes, type AttributeInput, type AttributeType, type Category, type CategoryInput } from '@/types/category'

interface Props {
  open: boolean
  /** The category being edited; undefined for a new one. */
  category?: Category
  pending: boolean
  onClose: () => void
  onSave: (input: CategoryInput) => void
  onAddAttribute: (input: AttributeInput) => void
  onRemoveAttribute: (id: string) => void
  onToggleAttribute: (id: string, is_active: boolean) => void
}

const isType = (value: string): value is AttributeType => value in attributeTypes
const check = 'flex items-center gap-2 text-sm'

/** A category and the details ("attributes") every product in it can carry. */
export function CategoryDialog({ open, category, pending, onClose, onSave, onAddAttribute, onRemoveAttribute, onToggleAttribute }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{category ? `Edit ${category.name}` : 'New category'}</DialogTitle>
          <DialogDescription>Categories belong to your shop. Buyers use them to browse your listings.</DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            onSave({ name: String(data.get('name')).trim(), description: String(data.get('description')).trim() || null })
          }}
        >
          <Field label="Name" name="name" maxLength={100} defaultValue={category?.name} />
          <Field label="Description (optional)" name="description" required={false} maxLength={500} defaultValue={category?.description ?? ''} />
          <Button type="submit" disabled={pending} className="justify-self-start">{category ? 'Save' : 'Create category'}</Button>
        </form>

        {category && (
          <>
            <section className="grid gap-2 border-t pt-4">
              <h3 className="font-heading font-semibold">Product details</h3>
              <p className="text-sm text-muted-foreground">What you fill in for each product here, such as Storage or Colour. Switch one off to stop using it.</p>
              <ul className="divide-y rounded-xl border">
                {category.attributes.map((attribute) => (
                  <li key={attribute.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{attribute.name}{attribute.unit && ` (${attribute.unit})`}{attribute.is_required && ' *'}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {attributeTypes[attribute.data_type]}{attribute.options.length > 0 && `: ${attribute.options.map((option) => option.value).join(', ')}`}
                      </p>
                    </div>
                    <Switch checked={attribute.is_active} aria-label={`Use ${attribute.name}`} onCheckedChange={(active) => onToggleAttribute(attribute.id, active)} />
                    <Button variant="ghost" size="icon-sm" aria-label={`Delete ${attribute.name}`} className="text-destructive" onClick={() => onRemoveAttribute(attribute.id)}>
                      <Trash2 />
                    </Button>
                  </li>
                ))}
                {!category.attributes.length && <li className="px-3 py-2 text-sm text-muted-foreground">No details yet.</li>}
              </ul>
            </section>

            <form
              className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault()
                const form = event.currentTarget
                const data = new FormData(form)
                const type = String(data.get('data_type'))
                if (!isType(type)) return
                const options = String(data.get('options')).split(',').map((option) => option.trim()).filter(Boolean)
                const unit = String(data.get('unit')).trim()
                onAddAttribute({
                  name: String(data.get('attribute_name')).trim(),
                  data_type: type,
                  is_required: data.has('is_required'),
                  is_filterable: data.has('is_filterable'),
                  // The backend accepts a unit only for numbers, and choices only for the two choice types.
                  ...(type === 'number' && unit && { unit }),
                  ...((type === 'select' || type === 'multi_select') && { options }),
                })
                form.reset()
              }}
            >
              <Field label="New detail" name="attribute_name" maxLength={100} placeholder="Storage" />
              <SelectField label="Type (cannot be changed later)" name="data_type" options={attributeTypes} defaultValue="" />
              <Field label="Unit, for numbers (optional)" name="unit" required={false} placeholder="GB" />
              <Field label="Choices, separated by commas" name="options" required={false} placeholder="Black, White, Blue" />
              <label className={check}><input type="checkbox" name="is_required" className="accent-primary" /> Needed before a product can be visible</label>
              <label className={check}><input type="checkbox" name="is_filterable" className="accent-primary" /> Buyers can filter by it</label>
              <Button type="submit" variant="outline" disabled={pending} className="justify-self-start">Add detail</Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

import { Field, SelectField } from '@/components/shared/FormField'
import type { CategoryAttribute } from '@/types/category'
import type { ProductAttribute } from '@/types/product'
import { attributeField } from '../attributes'

/** A saved value as the matching field's default: an option becomes its id. */
function saved(value: ProductAttribute['value'] | undefined) {
  if (value == null) return { text: '', ids: [] }
  if (Array.isArray(value)) return { text: '', ids: value.map((option) => option.id) }
  if (typeof value === 'object') return { text: value.id, ids: [] }
  return { text: String(value), ids: [] }
}

interface Props {
  /** The attributes of the chosen category that can still be set. */
  attributes: CategoryAttribute[]
  /** The product's saved values, when editing. */
  values?: ProductAttribute[]
}

/** One field per attribute of the category, by its type. Starred ones are needed only to publish. */
export function AttributeFields({ attributes, values }: Props) {
  return attributes.map((attribute) => {
    const label = `${attribute.name}${attribute.unit ? ` (${attribute.unit})` : ''}${attribute.is_required ? ' *' : ''}`
    const { text, ids } = saved(values?.find((value) => value.code === attribute.code)?.value)
    const name = attributeField(attribute.code)
    // A retired option can no longer be chosen, but stays on a product that already has it.
    const offered = attribute.options.filter((option) => option.is_active || option.id === text || ids.includes(option.id))

    if (attribute.data_type === 'select') {
      return <SelectField key={attribute.id} label={label} name={name} options={Object.fromEntries(offered.map((option) => [option.id, option.value]))} defaultValue={text} required={false} />
    }
    if (attribute.data_type === 'boolean') {
      return <SelectField key={attribute.id} label={label} name={name} options={{ true: 'Yes', false: 'No' }} defaultValue={text} required={false} />
    }
    if (attribute.data_type === 'multi_select') {
      return (
        <fieldset key={attribute.id} className="grid gap-2 sm:col-span-2">
          <legend className="mb-2 text-sm leading-none font-medium">{label}</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {offered.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name={name} value={option.id} defaultChecked={ids.includes(option.id)} className="accent-primary" />
                {option.value}
              </label>
            ))}
          </div>
        </fieldset>
      )
    }
    return (
      <Field
        key={attribute.id}
        label={label}
        name={name}
        required={false}
        defaultValue={text}
        {...(attribute.data_type === 'number' ? { type: 'number', step: 'any' } : { maxLength: 500 })}
      />
    )
  })
}

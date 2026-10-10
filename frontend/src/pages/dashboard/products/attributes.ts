import type { CategoryAttribute } from '@/types/category'
import type { AttributeValues } from '@/types/product'

/** Each attribute is a form field named `attr.<code>`. */
export const attributeField = (code: string) => `attr.${code}`

/** What the seller entered, read back from the form in the shape the backend expects for each type. */
export function readAttributes(data: FormData, attributes: CategoryAttribute[]): AttributeValues {
  const values: AttributeValues = {}
  for (const { code, data_type } of attributes) {
    const raw = String(data.get(attributeField(code)) ?? '').trim()
    if (data_type === 'multi_select') {
      const chosen = data.getAll(attributeField(code)).map(String)
      values[code] = chosen.length ? chosen : null
    } else if (!raw) values[code] = null
    else if (data_type === 'number') values[code] = Number(raw)
    else if (data_type === 'boolean') values[code] = raw === 'true'
    else values[code] = raw
  }
  return values
}

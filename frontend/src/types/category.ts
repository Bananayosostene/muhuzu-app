/** Fixed when the attribute is created; it cannot be changed later. */
export const attributeTypes = {
  text: 'Text',
  number: 'Number',
  boolean: 'Yes / No',
  select: 'One choice',
  multi_select: 'Several choices',
}
export type AttributeType = keyof typeof attributeTypes

/** A detail a seller asks for on every product of a category, e.g. Storage (number, GB). */
export interface CategoryAttribute {
  id: string
  /** The stable key products use for this attribute; it never changes, even when renamed. */
  code: string
  name: string
  data_type: AttributeType
  unit: string | null
  /** A product cannot be published without it. */
  is_required: boolean
  is_active: boolean
  /** For `select` and `multi_select`. */
  options: { id: string; value: string; is_active: boolean }[]
}

/** A category belongs to one shop; there is no shared marketplace tree. */
export interface CategorySummary {
  id: string
  name: string
  description: string | null
  is_active: boolean
  /** Set when MUHUZE hid it; the seller cannot switch it back on. */
  hidden_by_staff_at: string | null
}

export interface Category extends CategorySummary {
  attributes: CategoryAttribute[]
}

export interface CategoryInput {
  name: string
  description: string | null
}

export interface AttributeInput {
  name: string
  data_type: AttributeType
  unit?: string
  is_required: boolean
  /** Offered to buyers as a filter. */
  is_filterable: boolean
  options?: string[]
}

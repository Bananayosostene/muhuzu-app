/** One row of a product list. Money is a decimal string, e.g. "850000.00". */
export interface ProductSummary {
  id: string
  name: string
  price: string
  main_image_url: string | null
}

interface Option {
  id: string
  value: string
}

/** A detail the seller filled in, e.g. Storage: 256 GB. Selects carry the chosen option(s). */
export interface ProductAttribute {
  code: string
  name: string
  unit: string | null
  value: string | number | boolean | Option | Option[] | null
}

interface ProductDetails {
  description: string | null
  /** In display order; the first is the main picture. */
  images: { id: string; url: string }[]
  attributes: ProductAttribute[]
}

/** A product on sale, as a buyer sees it. */
export interface Product extends ProductSummary, ProductDetails {
  shop: { id: string; name: string }
}

export interface ProductFilters {
  /** Searches the product name. */
  q?: string
  seller_id?: string
  category_id?: string
  /** Newest first when left out. */
  sort?: 'price' | '-price'
  page?: number
  page_size?: number
}

/** A draft is not on sale yet; an archived product was taken off sale by its seller. */
export type ProductStatus = 'draft' | 'published' | 'archived'

/** A list row as its seller, or staff, see it: in any status. */
export interface OwnProductSummary extends ProductSummary {
  seller_id: string
  category_id: string
  status: ProductStatus
  /** Set when MUHUZE hid it: buyers do not see it and its seller cannot publish it. */
  hidden_by_staff_at: string | null
}

export interface OwnProduct extends OwnProductSummary, ProductDetails {
  /** What still stops it being published; empty when it is ready. */
  publish_blockers: string[]
}

/**
 * Attribute values keyed by the attribute's `code`: text, a number, true/false, one option id,
 * or a list of option ids. `null` clears a value.
 */
export type AttributeValues = Record<string, string | number | boolean | string[] | null>

export interface ProductInput {
  name: string
  description: string | null
  /** Sent as a string so it never passes through a float. */
  price: string
  /** One of the seller's own categories. Changing it drops the attribute values. */
  category_id: string
  attributes: AttributeValues
}

// Used only by the dashboard pages that still run on demo data.
export const productTypes = ['sale', 'rental', 'service'] as const
export type ProductType = (typeof productTypes)[number]

export const isProductType = (value: unknown): value is ProductType =>
  productTypes.some((type) => type === value)

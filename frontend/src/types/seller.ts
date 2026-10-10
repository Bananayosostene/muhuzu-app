/** Only `active` may list products, sell or withdraw. `draft` and `rejected` are the only editable ones. */
export type SellerStatus = 'draft' | 'pending_review' | 'active' | 'rejected' | 'suspended' | 'deactivated'

export const identityTypes = { national_id: 'National ID', passport: 'Passport', driving_license: 'Driving licence' }
export type IdentityType = keyof typeof identityTypes

/** One file per type. The identity sides are required to submit (a passport has no back side). */
export const documentTypes = {
  identity_front: 'Identity document, front',
  identity_back: 'Identity document, back',
  business_registration: 'Business registration (optional)',
  tin_certificate: 'TIN certificate (optional)',
}
export type DocumentType = keyof typeof documentTypes

/** Coordinates are optional, but latitude, longitude and source always travel together. */
export interface Coordinates {
  latitude: number
  longitude: number
  accuracy_m?: number | null
  /** `device`: read from the phone or browser. `manual`: a pin the person placed. */
  source: 'device' | 'manual'
}

export interface SellerLocation extends Partial<Coordinates> {
  province: string
  district: string
  sector: string
  cell?: string | null
  village?: string | null
  street_address?: string | null
}

/** What a person sends to apply; an update takes the same fields. */
export interface SellerApplication {
  business_name: string
  business_description?: string | null
  /** E.164, e.g. +250788123456. */
  business_phone: string
  identity_document_type: IdentityType
  identity_document_number: string
  location: SellerLocation
}

/** The full application: returned to its owner and to staff with `seller.read`. */
export interface Seller extends SellerApplication {
  id: string
  status: SellerStatus
  /** Why it was rejected or suspended; shown to the seller. */
  status_reason: string | null
  /** Files carry no link: one is requested when the document is opened, and lasts five minutes. */
  documents: { document_type: DocumentType; original_filename: string | null }[]
  /** Required documents not uploaded yet; must be empty to submit. */
  missing_documents: DocumentType[]
}

/** One row of the staff list. No identity details. */
export interface SellerSummary {
  id: string
  business_name: string
  business_phone: string
  district: string
  status: SellerStatus
  submitted_at: string | null
}

import { LocateFixed } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Field, SelectField } from '@/components/shared/FormField'
import { RegionFields } from '@/components/shared/RegionFields'
import { Button } from '@/components/ui/button'
import { fromE164, phoneField, toE164 } from '@/lib/phone'
import { identityTypes, type Coordinates, type IdentityType, type SellerApplication } from '@/types/seller'

interface Props {
  /** The saved application when editing one. */
  defaults?: SellerApplication
  submit: string
  pending: boolean
  onSubmit: (application: SellerApplication) => void
}

const isIdentityType = (value: string): value is IdentityType => value in identityTypes

/** The seller application: the shop, who runs it, and where it is. */
export function ApplicationForm({ defaults, submit, pending, onSubmit }: Props) {
  const place = defaults?.location
  // Kept from the saved application until the person detects a new position.
  const [coordinates, setCoordinates] = useState<Coordinates | null>(
    place?.latitude != null && place.longitude != null && place.source
      ? { latitude: place.latitude, longitude: place.longitude, accuracy_m: place.accuracy_m, source: place.source }
      : null,
  )

  const detect = () => navigator.geolocation.getCurrentPosition(
    ({ coords }) => setCoordinates({
      latitude: coords.latitude, longitude: coords.longitude, accuracy_m: Math.round(coords.accuracy), source: 'device',
    }),
    () => toast.error('Your position could not be read. You can still apply with the address alone.'),
  )

  return (
    <form
      className="grid gap-8 rounded-2xl border bg-card p-6"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const text = (name: string) => String(data.get(name) ?? '').trim()
        const identity = text('identity_document_type')
        if (!isIdentityType(identity)) return
        onSubmit({
          business_name: text('business_name'),
          business_description: text('business_description') || null,
          business_phone: toE164(text('business_phone')),
          identity_document_type: identity,
          identity_document_number: text('identity_document_number'),
          // The location is replaced as a whole, so every part is sent each time.
          location: {
            province: text('province'), district: text('district'), sector: text('sector'),
            cell: text('cell') || null, village: text('village') || null, street_address: text('street_address') || null,
            ...coordinates,
          },
        })
      }}
    >
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 font-heading text-lg font-semibold">Your shop</legend>
        <Field label="Shop name" name="business_name" minLength={2} maxLength={150} defaultValue={defaults?.business_name} hint="Buyers see this name. It must be unique." />
        <Field label="Shop phone number" name="business_phone" autoComplete="tel" defaultValue={defaults && fromE164(defaults.business_phone)} {...phoneField} />
        <div className="sm:col-span-2">
          <Field label="What do you sell? (optional)" name="business_description" required={false} maxLength={2000} defaultValue={defaults?.business_description ?? ''} />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 font-heading text-lg font-semibold">Who you are</legend>
        <SelectField label="Identity document" name="identity_document_type" options={identityTypes} defaultValue={defaults?.identity_document_type ?? ''} />
        <Field label="ID number" name="identity_document_number" minLength={3} maxLength={50} defaultValue={defaults?.identity_document_number} hint="As printed on the document. Only you and Muhuze staff can see it." />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 font-heading text-lg font-semibold">Where the shop is</legend>
        <RegionFields defaults={place} />
        <Field label="Cell (optional)" name="cell" required={false} maxLength={100} defaultValue={place?.cell ?? ''} />
        <Field label="Village (optional)" name="village" required={false} maxLength={100} defaultValue={place?.village ?? ''} />
        <Field label="Street, building or landmark (optional)" name="street_address" required={false} maxLength={255} defaultValue={place?.street_address ?? ''} />
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="button" variant="outline" onClick={detect}><LocateFixed /> Use my current position</Button>
          <p className="text-sm text-muted-foreground">
            {coordinates ? `Position saved (${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}).` : 'Optional: helps buyers and couriers find you.'}
          </p>
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending} className="h-11 justify-self-start px-8 text-base">
        {pending ? 'Saving…' : submit}
      </Button>
    </form>
  )
}

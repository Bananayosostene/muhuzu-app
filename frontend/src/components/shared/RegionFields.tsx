import { useState } from 'react'
import { provinces } from '@/lib/rwanda'
import { Field, SelectField } from './FormField'

const same = (names: string[]) => Object.fromEntries(names.map((name) => [name, name]))

/** Province, district and sector fields (`province`, `district`, `sector`). The districts follow the province. */
export function RegionFields({ defaults }: { defaults?: { province: string; district: string; sector: string } }) {
  const [province, setProvince] = useState(defaults?.province ?? '')

  return (
    <>
      <SelectField label="Province" name="province" options={same(Object.keys(provinces))} value={province} onChange={(event) => setProvince(event.target.value)} />
      <SelectField
        key={province}
        label="District"
        name="district"
        options={same(provinces[province] ?? [])}
        defaultValue={province === defaults?.province ? defaults.district : ''}
        disabled={!province}
      />
      <Field label="Sector" name="sector" maxLength={100} defaultValue={defaults?.sector} />
    </>
  )
}

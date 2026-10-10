import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

/** A labelled input. Required unless `required={false}` is passed. */
export function Field({ label, hint, ...props }: ComponentProps<typeof Input> & { label: string; hint?: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={props.name}>{label}</Label>
      <Input id={props.name} required className="h-10" {...props} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

interface SelectProps extends ComponentProps<typeof NativeSelect> {
  label: string
  /** Value to label. */
  options: Record<string, string>
}

/** A labelled select that starts on an empty "Choose…" option. */
export function SelectField({ label, name, options, ...props }: SelectProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <NativeSelect id={name} name={name} required className="w-full [&_select]:h-10" {...props}>
        <NativeSelectOption value="">Choose…</NativeSelectOption>
        {Object.entries(options).map(([value, text]) => <NativeSelectOption key={value} value={value}>{text}</NativeSelectOption>)}
      </NativeSelect>
    </div>
  )
}

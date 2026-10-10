import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  title: string
  description: string
  submit: string
  pending: boolean
  onSubmit: (data: FormData) => void
  /** The fields. */
  children: ReactNode
  /** Links shown under the button. */
  footer?: ReactNode
}

/** The card every sign-in screen shares. Values stay in the fields when the request fails. */
export function AuthForm({ title, description, submit, pending, onSubmit, children, footer }: Props) {
  return (
    <main className="grid flex-1 place-items-center px-4 py-12">
      <form
        className="grid w-full max-w-md animate-rise gap-5 rounded-2xl border bg-card p-6 sm:p-8"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(new FormData(event.currentTarget))
        }}
      >
        <div>
          <h1 className="font-heading text-2xl font-medium">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
        <Button type="submit" size="lg" disabled={pending} className="h-11 text-base">
          {pending ? 'Please wait…' : submit}
        </Button>
        {footer && <div className="grid gap-2 text-center text-sm text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a:hover]:underline">{footer}</div>}
      </form>
    </main>
  )
}

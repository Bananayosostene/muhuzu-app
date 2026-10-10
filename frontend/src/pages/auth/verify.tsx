import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/shared/FormField'
import { confirmEmail, requestCode } from '@/services/auth'
import { AuthForm } from './_components/AuthForm'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''

  const confirm = useMutation({
    mutationFn: confirmEmail,
    onSuccess: (_, sent) => {
      toast.success('Email confirmed. You can sign in now.')
      void navigate(`/login?email=${encodeURIComponent(sent.email)}`)
    },
    onError: (error) => toast.error(error.message),
  })
  const resend = useMutation({
    mutationFn: requestCode,
    onSuccess: () => toast.success('If that email has an account waiting, a new code is on its way.'),
    onError: (error) => toast.error(error.message),
  })

  return (
    <AuthForm
      title="Confirm your email"
      description="We sent a six-digit code to your email. Enter it to finish creating your account."
      submit="Confirm"
      pending={confirm.isPending}
      onSubmit={(data) => confirm.mutate({ email: String(data.get('email')), code: String(data.get('code')) })}
      footer={
        <Button
          type="button"
          variant="link"
          disabled={resend.isPending}
          onClick={(event) => {
            const typed = new FormData(event.currentTarget.form ?? undefined).get('email')
            if (typed) resend.mutate(String(typed))
          }}
        >
          Send a new code
        </Button>
      }
    >
      <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={email} />
      <Field label="Code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} title="The six digits from the email" />
    </AuthForm>
  )
}

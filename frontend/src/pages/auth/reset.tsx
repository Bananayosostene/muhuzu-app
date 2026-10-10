import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { Field } from '@/components/shared/FormField'
import { resetPassword } from '@/services/auth'
import { AuthForm } from './_components/AuthForm'

/** Opened from the link in the reset email: `/reset-password?token=…`. */
export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const reset = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success('Password changed. Sign in with the new one.')
      void navigate('/login')
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <AuthForm
      title="Choose a new password"
      description="This signs you out everywhere else."
      submit="Save password"
      pending={reset.isPending}
      onSubmit={(data) => reset.mutate({ token: params.get('token') ?? '', new_password: String(data.get('new_password')) })}
      footer={<Link to="/forgot-password">Request a new link</Link>}
    >
      <Field label="New password" name="new_password" autoComplete="new-password" hint="At least 8 characters." type="password" minLength={8} maxLength={128} />
    </AuthForm>
  )
}

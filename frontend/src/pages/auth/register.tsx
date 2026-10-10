import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { phoneField, toE164 } from '@/lib/phone'
import { Field } from '@/components/shared/FormField'
import { register } from '@/services/auth'
import { AuthForm } from './_components/AuthForm'

export default function Register() {
  const navigate = useNavigate()
  const signUp = useMutation({
    mutationFn: register,
    // The backend emails a six-digit code; the account cannot sign in until it is confirmed.
    onSuccess: (_, { email }) => navigate(`/verify-email?email=${encodeURIComponent(email)}`),
    onError: (error) => toast.error(error.message),
  })

  return (
    <AuthForm
      title="Create your account"
      description="Buy from every shop on Muhuze with one account."
      submit="Create account"
      pending={signUp.isPending}
      onSubmit={(data) => {
        const phone = String(data.get('phone'))
        signUp.mutate({
          full_name: String(data.get('full_name')).trim(),
          email: String(data.get('email')),
          password: String(data.get('password')),
          ...(phone && { phone: toE164(phone) }),
        })
      }}
      footer={<p>Already have an account? <Link to="/login">Sign in</Link></p>}
    >
      <Field label="Full name" name="full_name" autoComplete="name" maxLength={150} />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Phone number (optional)" name="phone" autoComplete="tel" required={false} {...phoneField} />
      <Field label="Password" name="password" autoComplete="new-password" hint="At least 8 characters." type="password" minLength={8} maxLength={128} />
    </AuthForm>
  )
}

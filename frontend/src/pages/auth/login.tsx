import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { useSession } from '@/hooks/use-session'
import { ApiError } from '@/lib/api'
import { Field } from '@/components/shared/FormField'
import { login } from '@/services/auth'
import { AuthForm } from './_components/AuthForm'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user, reload } = useSession()
  // Where the visitor was heading before being asked to sign in; only paths inside the app.
  const next = params.get('next')?.startsWith('/') ? params.get('next') ?? '/' : '/'

  const signIn = useMutation({
    mutationFn: login,
    onSuccess: reload,
    onError: (error, { email }) => {
      // Until the backend sends error codes, an unverified account is recognised by its 403 message.
      if (error instanceof ApiError && error.status === 403 && error.message.includes('not verified')) {
        void navigate(`/verify-email?email=${encodeURIComponent(email)}`)
      }
      toast.error(error.message)
    },
  })

  if (user) return <Navigate to={next} replace />

  return (
    <AuthForm
      title="Sign in"
      description="Welcome back to Muhuze."
      submit="Sign in"
      pending={signIn.isPending}
      onSubmit={(data) => signIn.mutate({ email: String(data.get('email')), password: String(data.get('password')) })}
      footer={
        <>
          <Link to="/forgot-password">Forgot your password?</Link>
          <p>New to Muhuze? <Link to="/register">Create an account</Link></p>
        </>
      }
    >
      <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={params.get('email') ?? ''} />
      <Field label="Password" name="password" type="password" autoComplete="current-password" />
    </AuthForm>
  )
}

import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Field } from '@/components/shared/FormField'
import { forgotPassword } from '@/services/auth'
import { AuthForm } from './_components/AuthForm'

export default function ForgotPassword() {
  const send = useMutation({
    mutationFn: forgotPassword,
    // The backend answers the same way whether or not the email is registered.
    onSuccess: () => toast.success('If that email has an account, a reset link is on its way.'),
    onError: (error) => toast.error(error.message),
  })

  return (
    <AuthForm
      title="Reset your password"
      description="Enter your email and we will send you a link to choose a new password."
      submit="Send reset link"
      pending={send.isPending}
      onSubmit={(data) => send.mutate(String(data.get('email')))}
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <Field label="Email" name="email" type="email" autoComplete="email" />
    </AuthForm>
  )
}

import { useQuery } from '@tanstack/react-query'
import { Coins, Copy, Hourglass, Share2, UserPlus, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession } from '@/hooks/use-session'
import { formatPrice } from '@/lib/format'
import { getMyReferral } from '@/services/referrals'

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Share2, title: 'Share your link', text: 'Send your personal link to friends, family and customers.' },
  { icon: UserPlus, title: 'They join Muhuze', text: 'Anyone who signs up through your link is connected to you.' },
  { icon: Coins, title: 'You earn', text: 'You receive a commission on the deals they make.' },
]

/** Open to everyone: what the referral programme is, and the signed-in user's own link and results. */
export default function Referrals() {
  const { user } = useSession()
  const { data: referral } = useQuery({ queryKey: ['referral'], queryFn: getMyReferral, enabled: Boolean(user) })
  const link = referral && `${location.origin}/register?ref=${referral.code}`

  return (
    <main className="mx-auto grid w-full max-w-4xl flex-1 content-start gap-10 px-4 py-12">
      <div className="animate-rise text-center">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Referral programme</p>
        <h1 className="mt-4 font-heading text-4xl leading-tight font-light text-balance md:text-5xl">
          Invite friends and <strong className="font-medium">earn on every deal</strong> they make
        </h1>
      </div>

      <ol className="stagger grid gap-4 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="rounded-2xl border bg-card p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><Icon className="size-5" /></span>
            <h2 className="mt-4 font-heading font-semibold">{index + 1}. {title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </li>
        ))}
      </ol>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold">Your referral link</h2>
        {!user && (
          <>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to get your personal link.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/login?next=/referrals" className={buttonVariants()}>Sign in</Link>
              <Link to="/register" className={buttonVariants({ variant: 'outline' })}>Create an account</Link>
            </div>
          </>
        )}
        {user && !link && (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-highlight/50 bg-highlight/15 p-3 text-sm">
            <Hourglass className="mt-0.5 size-4 shrink-0" />
            Referral links are coming soon. Your link and your earnings will appear here as soon as the programme opens.
          </p>
        )}
        {link && referral && (
          <>
            <div className="mt-4 flex max-w-xl gap-2">
              <Input readOnly value={link} aria-label="Your referral link" />
              <Button
                onClick={async () => {
                  await navigator.clipboard.writeText(link)
                  toast.success('Link copied')
                }}
              >
                <Copy /> Copy
              </Button>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <dt className="text-sm text-muted-foreground">People who joined</dt>
                <dd className="font-heading text-2xl font-bold">{referral.invited}</dd>
              </div>
              <div className="rounded-xl border p-4">
                <dt className="text-sm text-muted-foreground">You earned</dt>
                <dd className="font-heading text-2xl font-bold text-primary">{formatPrice(referral.earned)}</dd>
              </div>
            </dl>
          </>
        )}
      </section>
    </main>
  )
}

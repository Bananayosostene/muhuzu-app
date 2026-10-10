import { useQuery } from '@tanstack/react-query'
import { Info, TriangleAlert } from 'lucide-react'
import { Link, Navigate, Outlet, useLocation } from 'react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useSession } from '@/hooks/use-session'
import { dashboardPermissions } from '@/lib/dashboard-access'
import { AppSidebar } from '@/pages/dashboard/_components/AppSidebar'
import { isOpenTo, navItems } from '@/pages/dashboard/_components/nav'
import { Topbar } from '@/pages/dashboard/_components/Topbar'
import { getDefaultRate } from '@/services/commission'
import { getDestinations } from '@/services/payments'

export default function DashboardLayout() {
  const { user, isPending, can, signOut } = useSession()
  const pathname = useLocation().pathname.replace(/\/$/, '')
  const page = navItems.find((item) => item.to === pathname)
  // Checkout fails until staff have set these two, so whoever can fix it is told on every page.
  const { data: rate } = useQuery({ queryKey: ['default-rate'], queryFn: getDefaultRate, enabled: can('default_commission_rate.manage') })
  const { data: accounts } = useQuery({ queryKey: ['destinations'], queryFn: getDestinations, enabled: can('payment_destination.manage') })
  const setup = [
    rate === null && { to: '/dashboard/commission', text: 'Buyers cannot place orders: the commission rate is not set.', action: 'Set the rate' },
    accounts && !accounts.items.some((account) => account.is_active) && { to: '/dashboard/payment-accounts', text: 'Buyers cannot pay: Muhuze has no visible payment account.', action: 'Add an account' },
  ].filter((notice) => notice !== false && notice !== undefined)

  if (isPending) return null
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />
  if (!dashboardPermissions.some(can)) return <Navigate to="/" replace />
  if (page && !isOpenTo(page, can)) return <Navigate to="/dashboard" replace />

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={signOut} />
      <SidebarInset className="min-w-0 bg-muted/40">
        <Topbar title={page?.label ?? 'Dashboard'} />
        <main key={pathname} className="flex flex-1 animate-rise flex-col gap-6 p-4 md:p-6">
          {setup.map((notice) => (
            <p key={notice.to} className="flex flex-wrap items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <TriangleAlert className="size-4 shrink-0 text-destructive" />
              {notice.text}
              <Link to={notice.to} className="font-medium text-primary hover:underline">{notice.action}</Link>
            </p>
          ))}
          {page?.demo && (
            <p className="flex items-start gap-2 rounded-xl border border-highlight/50 bg-highlight/15 p-3 text-sm">
              <Info className="mt-0.5 size-4 shrink-0" />
              This page still shows demo data. It is not connected to the backend yet, and nothing changed here is saved.
            </p>
          )}
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

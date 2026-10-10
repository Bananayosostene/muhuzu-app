import {
  BadgeCheck, Banknote, ClipboardList, CreditCard, Landmark, LayoutDashboard, Package, Percent, PiggyBank, Share2, ShieldCheck,
  Store, Tags, Users, Wallet, type LucideIcon,
} from 'lucide-react'
import { dashboardPermissions } from '@/lib/dashboard-access'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /** Backend permission codes: the link and its page are open to anyone holding at least one. */
  permissions: string[]
  /**
   * A shop's own page is left out for staff holding this platform-wide code: the admin role holds every
   * permission, the sellers' ones included, but an admin is not a shop and the backend would refuse the page.
   */
  staff?: string
  /** The page still shows demo data, not the backend's. */
  demo?: boolean
}

/** Whether the page is for this user, given what they may do. */
export const isOpenTo = (item: NavItem, can: (permission: string) => boolean) =>
  item.permissions.some(can) && !(item.staff && can(item.staff))

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [{ label: 'Overview', to: '/dashboard', icon: LayoutDashboard, permissions: dashboardPermissions, demo: true }],
  },
  {
    label: 'Marketplace',
    items: [
      { label: 'Products', to: '/dashboard/products', icon: Package, permissions: ['product.manage', 'product.moderate'] },
      { label: 'Categories', to: '/dashboard/categories', icon: Tags, permissions: ['category.manage'], staff: 'category.moderate' },
      { label: 'Orders', to: '/dashboard/orders', icon: ClipboardList, permissions: ['seller_order.manage', 'order.read'] },
      { label: 'Payments', to: '/dashboard/payments', icon: Banknote, permissions: ['payment.verify'] },
      { label: 'Payment accounts', to: '/dashboard/payment-accounts', icon: Landmark, permissions: ['payment_destination.manage'] },
      { label: 'Subscriptions', to: '/dashboard/subscriptions', icon: CreditCard, permissions: ['seller_plan.manage', 'seller_subscription.manage'] },
      { label: 'My subscription', to: '/dashboard/subscription', icon: BadgeCheck, permissions: ['seller_subscription.request'], staff: 'seller_subscription.manage' },
      { label: 'Referrals', to: '/dashboard/referrals', icon: Share2, permissions: dashboardPermissions, demo: true },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Commission', to: '/dashboard/commission', icon: Percent, permissions: ['default_commission_rate.manage'] },
      { label: 'Wallet', to: '/dashboard/wallet', icon: Wallet, permissions: ['revenue.read'] },
      { label: 'My wallet', to: '/dashboard/earnings', icon: PiggyBank, permissions: ['wallet.read_own'], staff: 'revenue.read' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Sellers', to: '/dashboard/sellers', icon: Store, permissions: ['seller.read'] },
      { label: 'Users', to: '/dashboard/users', icon: Users, permissions: ['account.read'] },
      { label: 'Roles & permissions', to: '/dashboard/roles', icon: ShieldCheck, permissions: ['role.read'] },
    ],
  },
]

export const navItems = navGroups.flatMap((group) => group.items)

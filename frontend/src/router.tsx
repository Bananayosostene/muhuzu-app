import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import RouteError from '@/pages/error'

// Every layout and page is its own chunk: buyers never download dashboard code.
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const router = createBrowserRouter([
  {
    ErrorBoundary: RouteError,
    lazy: page(() => import('@/layouts/PublicLayout')),
    children: [
      { index: true, lazy: page(() => import('@/pages/home')) },
      { path: 'products', lazy: page(() => import('@/pages/products')) },
      { path: 'products/:id', lazy: page(() => import('@/pages/products/detail')) },
      { path: 'wishlist', lazy: page(() => import('@/pages/wishlist')) },
      { path: 'cart', lazy: page(() => import('@/pages/cart')) },
      { path: 'referrals', lazy: page(() => import('@/pages/referrals')) },
      { path: 'login', lazy: page(() => import('@/pages/auth/login')) },
      { path: 'register', lazy: page(() => import('@/pages/auth/register')) },
      { path: 'verify-email', lazy: page(() => import('@/pages/auth/verify')) },
      { path: 'forgot-password', lazy: page(() => import('@/pages/auth/forgot')) },
      { path: 'reset-password', lazy: page(() => import('@/pages/auth/reset')) },
      {
        // These need an account: the backend ties every order and seller application to one.
        lazy: page(() => import('@/layouts/RequireAuth')),
        children: [
          { path: 'checkout', lazy: page(() => import('@/pages/checkout')) },
          { path: 'sell', lazy: page(() => import('@/pages/sell')) },
          { path: 'orders', lazy: page(() => import('@/pages/orders')) },
          { path: 'orders/:id', lazy: page(() => import('@/pages/orders/detail')) },
        ],
      },
      { path: '*', lazy: page(() => import('@/pages/not-found')) },
    ],
  },
  {
    path: 'dashboard',
    ErrorBoundary: RouteError,
    lazy: page(() => import('@/layouts/DashboardLayout')),
    children: [
      { index: true, lazy: page(() => import('@/pages/dashboard')) },
      { path: 'products', lazy: page(() => import('@/pages/dashboard/products')) },
      { path: 'categories', lazy: page(() => import('@/pages/dashboard/categories')) },
      { path: 'orders', lazy: page(() => import('@/pages/dashboard/orders')) },
      { path: 'payments', lazy: page(() => import('@/pages/dashboard/payments')) },
      { path: 'payment-accounts', lazy: page(() => import('@/pages/dashboard/payment-accounts')) },
      { path: 'commission', lazy: page(() => import('@/pages/dashboard/commission')) },
      { path: 'sellers', lazy: page(() => import('@/pages/dashboard/sellers')) },
      { path: 'subscriptions', lazy: page(() => import('@/pages/dashboard/subscriptions')) },
      { path: 'subscription', lazy: page(() => import('@/pages/dashboard/subscription')) },
      { path: 'referrals', lazy: page(() => import('@/pages/dashboard/referrals')) },
      { path: 'wallet', lazy: page(() => import('@/pages/dashboard/wallet')) },
      { path: 'earnings', lazy: page(() => import('@/pages/dashboard/earnings')) },
      { path: 'users', lazy: page(() => import('@/pages/dashboard/users')) },
      { path: 'roles', lazy: page(() => import('@/pages/dashboard/roles')) },
      { path: '*', lazy: page(() => import('@/pages/not-found')) },
    ],
  },
])

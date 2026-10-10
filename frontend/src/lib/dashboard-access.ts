/** Holding any one of these opens the dashboard (and its Overview page). Each is a backend permission code. */
export const dashboardPermissions = [
  'product.manage', 'product.moderate', 'seller_order.manage', 'payment.verify', 'seller_plan.manage',
  'seller_subscription.manage', 'seller_subscription.request', 'revenue.read', 'wallet.read_own',
  'role.read', 'account.read', 'seller.read', 'category.manage',
  'payment_destination.manage', 'default_commission_rate.manage', 'order.read',
]

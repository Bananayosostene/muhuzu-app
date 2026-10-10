import { BadgeCheck, ShieldCheck, Store, Truck, type LucideIcon } from 'lucide-react'

// Shared by the header and the footer.
export const links = [
  { to: '/products', label: 'All products' },
  { to: '/products?sort=price', label: 'Lowest price' },
  { to: '/products?sort=-price', label: 'Highest price' },
]

export const features: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: BadgeCheck, title: 'Verified sellers', text: 'Every shop is reviewed by Muhuze' },
  { icon: ShieldCheck, title: 'Pay through Muhuze', text: 'Your payment is confirmed before the seller ships' },
  { icon: Truck, title: 'Track your order', text: 'Follow each shop’s part until it arrives' },
  { icon: Store, title: 'Many shops, one order', text: 'Buy from several sellers at once' },
]

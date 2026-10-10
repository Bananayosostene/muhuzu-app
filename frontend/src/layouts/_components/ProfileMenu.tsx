import { LayoutDashboard, LogOut, Moon, ReceiptText, Store, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link } from 'react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@/types/user'

interface Props {
  user: User
  showDashboard: boolean
  onSignOut: () => void
}

export function ProfileMenu({ user, showDashboard, onSignOut }: Props) {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="My profile"
        className="ml-1 rounded-full outline-none transition hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary font-semibold text-primary-foreground">{user.full_name[0]}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-2">
            <span className="block truncate text-sm font-semibold text-foreground">{user.full_name}</span>
            <span className="block truncate">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {showDashboard && (
          <DropdownMenuItem render={<Link to="/dashboard" />} className="gap-2.5 px-2 py-2">
            <LayoutDashboard /> My dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuItem render={<Link to="/orders" />} className="gap-2.5 px-2 py-2">
          <ReceiptText /> My orders
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/sell" />} className="gap-2.5 px-2 py-2">
          <Store /> Sell on Muhuze
        </DropdownMenuItem>
        <DropdownMenuItem
          closeOnClick={false}
          className="gap-2.5 px-2 py-2"
          onClick={() => setTheme(dark ? 'light' : 'dark')}
        >
          {dark ? <Sun /> : <Moon />} {dark ? 'Light theme' : 'Dark theme'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="gap-2.5 px-2 py-2" onClick={onSignOut}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

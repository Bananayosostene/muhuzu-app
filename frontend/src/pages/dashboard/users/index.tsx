import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useSession } from '@/hooks/use-session'
import { formatDate } from '@/lib/format'
import { getAccounts, setAccountRoles, type Account } from '@/services/accounts'
import { getRoles } from '@/services/roles'
import { DataTable, type Column } from '../_components/DataTable'
import { PageHeader } from '../_components/PageHeader'
import { StatusBadge } from '../_components/StatusBadge'
import { UserRolesDialog } from './_components/UserRolesDialog'

const statuses = {
  active: { tone: 'success', label: 'Active' },
  suspended: { tone: 'danger', label: 'Suspended' },
  deactivated: { tone: 'neutral', label: 'Closed' },
} as const

const title = (role: string) => role.replaceAll('_', ' ')

export default function DashboardUsers() {
  const client = useQueryClient()
  const { can } = useSession()
  // Both filters are applied by the backend, so they work across every account, not just the loaded page.
  const [q, setQ] = useState('')
  const [role_id, setRoleId] = useState('')
  const [editing, setEditing] = useState<Account | null>(null)

  const { data, error } = useQuery({
    queryKey: ['accounts', q, role_id],
    queryFn: () => getAccounts({ q: q.trim(), role_id }),
    // Keeps the table in place while the next search loads.
    placeholderData: keepPreviousData,
  })
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: getRoles, enabled: can('role.read') })
  const save = useMutation({
    mutationFn: setAccountRoles,
    onSuccess: () => toast.success('Roles saved'),
    onError: (failure) => toast.error(failure.message),
    // Part of a change may have gone through, so always show what the backend now has.
    onSettled: () => client.invalidateQueries({ queryKey: ['accounts'] }),
  })
  const canAssign = can('role.assign') && roles !== undefined

  const columns: Column<Account>[] = [
    {
      header: 'User',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar><AvatarFallback className="bg-primary/10 text-primary">{row.full_name[0]}</AvatarFallback></Avatar>
          <div>
            <p className="font-medium">{row.full_name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-1">
          {row.roles.map((role) => <Badge key={role} variant="secondary" className="capitalize">{title(role)}</Badge>)}
          {!row.roles.length && <span className="text-muted-foreground">—</span>}
        </div>
      ),
    },
    { header: 'Status', cell: (row) => <StatusBadge tone={statuses[row.status].tone}>{statuses[row.status].label}</StatusBadge> },
    { header: 'Joined', cell: (row) => formatDate(row.created_at) },
    {
      header: '',
      className: 'text-right',
      cell: (row) => canAssign && <Button variant="outline" size="sm" onClick={() => setEditing(row)}>Change roles</Button>,
    },
  ]

  return (
    <>
      <PageHeader title="Users" description="Everyone on the platform, with the roles that decide what they can do." />
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      <DataTable
        rows={data?.items ?? []}
        columns={columns}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} maxLength={100} aria-label="Search by name or email" placeholder="Search name or email..." className="pl-8" onChange={(event) => setQ(event.target.value)} />
            </div>
            <NativeSelect aria-label="Role" value={role_id} onChange={(event) => setRoleId(event.target.value)}>
              <NativeSelectOption value="">All roles</NativeSelectOption>
              {roles?.items.map((role) => <NativeSelectOption key={role.id} value={role.id} className="capitalize">{title(role.name)}</NativeSelectOption>)}
            </NativeSelect>
          </div>
        }
      />
      <UserRolesDialog
        key={editing?.id}
        account={editing}
        roles={roles?.items ?? []}
        onClose={() => setEditing(null)}
        onSave={(changes) => editing && save.mutate({ accountId: editing.id, ...changes })}
      />
    </>
  )
}

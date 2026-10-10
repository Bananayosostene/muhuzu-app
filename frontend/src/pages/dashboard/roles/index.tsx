import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Plus, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/use-session'
import { deleteRole, getPermissions, getRolePermissions, getRoles, saveRole, type Role } from '@/services/roles'
import { PageHeader } from '../_components/PageHeader'
import { RowActions } from '../_components/RowActions'
import { RoleForm } from './_components/RoleForm'

export default function DashboardRoles() {
  const client = useQueryClient()
  const { can } = useSession()
  const [target, setTarget] = useState<Role | 'new' | null>(null)
  const role = target === 'new' || target === null ? undefined : target

  const { data: roles, error } = useQuery({ queryKey: ['roles'], queryFn: getRoles })
  const { data: catalog } = useQuery({ queryKey: ['permissions'], queryFn: getPermissions, enabled: can('permission.read') })
  // What each role holds: a handful of roles, so one small request per role.
  const held = useQueries({
    queries: (roles?.items ?? []).map((item) => ({ queryKey: ['roles', item.id, 'permissions'], queryFn: () => getRolePermissions(item.id) })),
  })
  const codes = (id: string) => held[roles?.items.findIndex((item) => item.id === id) ?? -1]?.data?.items.map((permission) => permission.code)

  const changed = (message: string) => ({
    onSuccess: () => {
      toast.success(message)
      return client.invalidateQueries({ queryKey: ['roles'] })
    },
    // Part of a save may have gone through, so show what the backend now has.
    onError: (failure: Error) => {
      toast.error(failure.message)
      return client.invalidateQueries({ queryKey: ['roles'] })
    },
  })
  const save = useMutation({ mutationFn: saveRole, ...changed('Role saved') })
  const remove = useMutation({ mutationFn: deleteRole, ...changed('Role deleted') })
  const editable = can('role.manage')

  return (
    <>
      <PageHeader title="Roles & permissions" description="Create roles and assign predefined permissions to them.">
        {editable && <Button onClick={() => setTarget('new')}><Plus /> New role</Button>}
      </PageHeader>
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      <div className="stagger grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles?.items.map((item) => (
          <article key={item.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-5 transition hover:shadow-lg hover:shadow-primary/10">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-2 font-heading font-semibold capitalize">
                  {item.name.replaceAll('_', ' ')} {item.is_system && <Badge variant="secondary">System</Badge>}
                </h2>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              {editable && (
                <RowActions name={item.name} onEdit={() => setTarget(item)} onDelete={item.is_system ? undefined : () => remove.mutate(item.id)} />
              )}
            </div>
            <div className="mt-auto flex gap-5 border-t pt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><KeyRound className="size-4" /> {codes(item.id)?.length ?? '…'} permissions</span>
            </div>
          </article>
        ))}
      </div>
      <RoleForm
        key={role?.id ?? 'new'}
        open={target !== null}
        role={role}
        held={(role && codes(role.id)) ?? []}
        permissions={catalog?.items ?? []}
        onClose={() => setTarget(null)}
        onSave={save.mutate}
      />
    </>
  )
}

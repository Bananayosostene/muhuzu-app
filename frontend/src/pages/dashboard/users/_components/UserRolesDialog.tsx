import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { Account } from '@/services/accounts'
import type { Role } from '@/services/roles'
import { FormDialog } from '../../_components/FormDialog'

interface Props {
  /** The account whose roles are being changed; null when closed. */
  account: Account | null
  /** Every role that exists, including ones admins created. */
  roles: Role[]
  onClose: () => void
  /** Role ids to give and to take away. */
  onSave: (changes: { add: string[]; remove: string[] }) => void
}

/** Tick the roles an account should hold. A person can hold several: a seller is also a buyer. */
export function UserRolesDialog({ account, roles, onClose, onSave }: Props) {
  const held = roles.filter((role) => account?.roles.includes(role.name)).map((role) => role.id)

  return (
    <FormDialog
      open={account !== null}
      onClose={onClose}
      title={`Roles of ${account?.full_name}`}
      description="The user receives the permissions of every role ticked here."
      onSubmit={(data) => {
        const chosen = data.getAll('roles').map(String)
        onSave({ add: chosen.filter((id) => !held.includes(id)), remove: held.filter((id) => !chosen.includes(id)) })
      }}
    >
      <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
        {roles.map((role) => (
          <Label key={role.id} className="items-start font-normal" title={role.description ?? undefined}>
            <Checkbox name="roles" value={role.id} defaultChecked={held.includes(role.id)} />
            <span className="capitalize">{role.name.replaceAll('_', ' ')}</span>
          </Label>
        ))}
      </div>
    </FormDialog>
  )
}

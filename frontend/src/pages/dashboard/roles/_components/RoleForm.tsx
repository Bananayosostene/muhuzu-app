import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { Permission, Role, RoleChanges } from '@/services/roles'
import { Field, FormDialog } from '../../_components/FormDialog'

interface Props {
  open: boolean
  /** The role being edited; undefined for a new one. */
  role?: Role
  /** The codes the role holds now. */
  held: string[]
  /** The whole catalog. */
  permissions: Permission[]
  onClose: () => void
  onSave: (changes: RoleChanges) => void
}

/** A role's name and what people holding it may do. */
export function RoleForm({ open, role, held, permissions, onClose, onSave }: Props) {
  // The admin role always holds every permission; the backend refuses any change to that.
  const fixed = role?.name === 'admin'
  const resources = [...new Set(permissions.map((permission) => permission.resource))]

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={role ? `Edit ${role.name}` : 'New role'}
      description={fixed ? 'The admin role always holds every permission.' : 'Choose what people with this role are allowed to do.'}
      onSubmit={(data) => {
        const chosen = data.getAll('permissions').map(String)
        onSave({
          id: role?.id,
          // A system role keeps its name.
          ...(!role?.is_system && { name: String(data.get('name')).trim().toLowerCase() }),
          description: String(data.get('description')).trim() || null,
          add: fixed ? [] : chosen.filter((code) => !held.includes(code)),
          remove: fixed ? [] : held.filter((code) => !chosen.includes(code)),
        })
      }}
    >
      <Field
        label="Role name"
        name="name"
        defaultValue={role?.name}
        disabled={role?.is_system}
        pattern="[A-Za-z][A-Za-z0-9_]{1,49}"
        title="2 to 50 letters, digits or underscores, starting with a letter"
        placeholder="support_agent"
        required
      />
      <Field label="Description" name="description" maxLength={255} defaultValue={role?.description ?? ''} />
      <div className="grid max-h-64 gap-4 overflow-y-auto rounded-xl border p-4 sm:grid-cols-2">
        {resources.map((resource) => (
          <fieldset key={resource} className="grid content-start gap-2">
            <legend className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{resource.replaceAll('_', ' ')}</legend>
            {permissions.filter((permission) => permission.resource === resource).map((item) => (
              <Label key={item.code} className="font-normal" title={item.description}>
                <Checkbox name="permissions" value={item.code} defaultChecked={fixed || held.includes(item.code)} disabled={fixed} />
                {item.name}
              </Label>
            ))}
          </fieldset>
        ))}
      </div>
    </FormDialog>
  )
}

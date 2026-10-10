import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  addAttribute, createCategory, deleteAttribute, deleteCategory, getCategory, getMyCategories, setAttributeActive,
  updateCategory,
} from '@/services/categories'
import type { CategorySummary } from '@/types/category'
import { DataTable, type Column } from '../_components/DataTable'
import { PageHeader } from '../_components/PageHeader'
import { RowActions } from '../_components/RowActions'
import { StatusBadge } from '../_components/StatusBadge'
import { CategoryDialog } from './_components/CategoryDialog'

/** The seller's own categories, and the details products in each can carry. */
export default function DashboardCategories() {
  const client = useQueryClient()
  /** The category open in the dialog: its id, 'new', or null when closed. */
  const [target, setTarget] = useState<string | null>(null)
  const editing = target !== null && target !== 'new' ? target : null
  const { data, error } = useQuery({ queryKey: ['my-categories'], queryFn: getMyCategories })
  const { data: category } = useQuery({ queryKey: ['category', editing], queryFn: () => getCategory(editing ?? ''), enabled: editing !== null })

  // Any change reloads the list and the open category.
  const changed = (message: string) => ({
    onSuccess: () => {
      toast.success(message)
      void client.invalidateQueries({ queryKey: ['my-categories'] })
      return client.invalidateQueries({ queryKey: ['category'] })
    },
    onError: (failure: Error) => toast.error(failure.message),
  })
  // Keep the dialog open on the new category so its details can be added.
  const create = useMutation({ mutationFn: createCategory, ...changed('Category created. Add its details below.'), onSettled: (created) => created && setTarget(created.id) })
  const update = useMutation({ mutationFn: updateCategory, ...changed('Category saved') })
  const remove = useMutation({ mutationFn: deleteCategory, ...changed('Category deleted') })
  const add = useMutation({ mutationFn: addAttribute, ...changed('Detail added') })
  const removeAttribute = useMutation({ mutationFn: deleteAttribute, ...changed('Detail deleted') })
  const toggleAttribute = useMutation({ mutationFn: setAttributeActive, ...changed('Saved') })

  const columns: Column<CategorySummary>[] = [
    {
      header: 'Category',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          {row.description && <p className="text-xs text-muted-foreground">{row.description}</p>}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => {
        if (row.hidden_by_staff_at) return <StatusBadge tone="danger">Hidden by Muhuze</StatusBadge>
        return <StatusBadge tone={row.is_active ? 'success' : 'neutral'}>{row.is_active ? 'In use' : 'Switched off'}</StatusBadge>
      },
    },
    {
      header: 'Visible',
      cell: (row) => (
        <Switch
          checked={row.is_active}
          // A category Muhuze hid cannot be switched back on by its seller.
          disabled={update.isPending || row.hidden_by_staff_at !== null}
          aria-label={`Show ${row.name} in the store`}
          onCheckedChange={(is_active) => update.mutate({ id: row.id, is_active })}
        />
      ),
    },
    { header: '', cell: (row) => <RowActions name={row.name} onEdit={() => setTarget(row.id)} onDelete={() => remove.mutate(row.id)} /> },
  ]

  return (
    <>
      <PageHeader title="Categories" description="How your shop's listings are grouped. A listing in a switched-off category is not shown to buyers.">
        <Button onClick={() => setTarget('new')}><Plus /> Add category</Button>
      </PageHeader>
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      <DataTable rows={data?.items ?? []} columns={columns} search={(row) => row.name} />
      <CategoryDialog
        key={`${target}-${category?.id}`}
        open={target !== null && (target === 'new' || category !== undefined)}
        category={editing ? category : undefined}
        pending={create.isPending || update.isPending || add.isPending}
        onClose={() => setTarget(null)}
        onSave={(input) => (editing ? update.mutate({ id: editing, ...input }) : create.mutate(input))}
        onAddAttribute={(input) => editing && add.mutate({ categoryId: editing, ...input })}
        onRemoveAttribute={(id) => editing && removeAttribute.mutate({ categoryId: editing, id })}
        onToggleAttribute={(id, is_active) => editing && toggleAttribute.mutate({ categoryId: editing, id, is_active })}
      />
    </>
  )
}

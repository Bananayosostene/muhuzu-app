import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatDate } from '@/lib/format'
import { getDefaultRate, getRateHistory, setDefaultRate, type DefaultRate } from '@/services/commission'
import { DataTable, type Column } from '../_components/DataTable'
import { PageHeader } from '../_components/PageHeader'
import { StatusBadge } from '../_components/StatusBadge'
import { CommissionCard } from './_components/CommissionCard'

const columns: Column<DefaultRate>[] = [
  { header: 'Rate', cell: (row) => <span className="font-medium">{Number(row.rate)}%</span> },
  { header: 'From', cell: (row) => formatDate(row.effective_from) },
  { header: 'Note', cell: (row) => <span className="text-muted-foreground">{row.note ?? '—'}</span> },
  { header: '', className: 'text-right', cell: (row) => row.is_current && <StatusBadge tone="success">In force</StatusBadge> },
]

/** Staff: the commission MUHUZE keeps from sales of sellers who have no plan. No order can be placed without it. */
export default function DashboardCommission() {
  const client = useQueryClient()
  const { data: rate, error } = useQuery({ queryKey: ['default-rate'], queryFn: getDefaultRate })
  const { data: history } = useQuery({ queryKey: ['default-rate', 'history'], queryFn: getRateHistory })
  const save = useMutation({
    mutationFn: setDefaultRate,
    onSuccess: () => {
      toast.success('Commission rate saved')
      return client.invalidateQueries({ queryKey: ['default-rate'] })
    },
    onError: (failure) => toast.error(failure.message),
  })

  return (
    <>
      <PageHeader title="Commission" description="Muhuze's share of each sale. A seller on a plan pays that plan's rate instead." />
      {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">{error.message}</p>}
      {rate !== undefined && <CommissionCard rate={rate?.rate ?? null} pending={save.isPending} onSave={save.mutate} />}
      <DataTable rows={history?.items ?? []} columns={columns} />
    </>
  )
}

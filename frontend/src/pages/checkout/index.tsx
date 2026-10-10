import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'
import { useProductsByIds } from '@/hooks/use-products'
import { useSession } from '@/hooks/use-session'
import { createOrder } from '@/services/orders'
import { DeliveryForm } from './_components/DeliveryForm'
import { OrderSummary } from './_components/OrderSummary'

export default function Checkout() {
  const navigate = useNavigate()
  const client = useQueryClient()
  const { ids, quantities, clear } = useCart()
  const { user } = useSession()
  const items = useProductsByIds(ids)
  const order = useMutation({
    mutationFn: createOrder,
    onSuccess: (created) => {
      // The order page shows the totals the backend worked out, and how to pay.
      client.setQueryData(['order', created.id], created)
      void navigate(`/orders/${created.id}`, { replace: true })
      clear()
    },
    onError: (error) => toast.error(error.message),
  })

  if (ids.length === 0 && order.isIdle) return <Navigate to="/cart" replace />

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <h1 className="animate-rise font-heading text-3xl font-bold">Checkout</h1>
      <p className="mb-6 text-muted-foreground">Tell us where to deliver. You pay on the next screen.</p>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <DeliveryForm
          defaultName={user?.full_name}
          pending={order.isPending}
          // Only ids and quantities are sent: the backend reads every price itself.
          onSubmit={(details) => order.mutate({ ...details, items: ids.map((product_id) => ({ product_id, quantity: quantities[product_id] })) })}
        />
        <OrderSummary items={items} quantities={quantities} />
      </div>
    </main>
  )
}

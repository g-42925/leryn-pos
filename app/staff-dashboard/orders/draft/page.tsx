import { cookies } from "next/headers"
import { getOrdersAction } from "@/app/actions/staff-orders"
import { OrderCard } from "../components/order-card"
import { ClipboardList } from "lucide-react"

export default async function DraftOrdersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("staff_session_token")?.value
  if (!token) return null

  const [, branchId, accountId] = token.split("|")
  if (!branchId || !accountId) return null

  const result = await getOrdersAction(accountId, branchId, "draft")
  const orders = result.data || []

  if (orders.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <ClipboardList size={40} className="text-gray-300" />
        </div>
        <p className="font-medium text-lg">Belum ada pesanan draft</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {orders.map((order: any) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  )
}

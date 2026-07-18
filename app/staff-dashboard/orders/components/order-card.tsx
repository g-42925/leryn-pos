"use client"

import { Clock, ReceiptText, MapPin, Hash } from "lucide-react"

export function OrderCard({ order }: { order: any }) {
  const statusColors = {
    draft: "bg-amber-500",
    active: "bg-blue-500",
    completed: "bg-emerald-500",
  }
  
  const statusColor = statusColors[order.status as keyof typeof statusColors] || "bg-gray-500"

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-lg transition-all flex flex-col gap-4 group">
      <div className="flex justify-between items-start border-b border-gray-100 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${statusColor} shadow-sm`} />
            <span className="font-bold text-gray-900 text-lg">
              {order.orderType === "dine-in" ? "Dine In" : "Take Away"}
            </span>
          </div>
          <div className="text-gray-500 text-sm font-medium flex items-center gap-1.5 flex-wrap">
            <Hash size={14} /> {order._id.slice(-6).toUpperCase()}
            <span className="text-gray-300">•</span>
            <Clock size={14} /> {formatDate(order.createdAt)}
          </div>
        </div>
        
        {order.orderType === "dine-in" && order.tableName && (
          <div className="bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100 flex items-center gap-1.5 shrink-0 text-teal-800">
            <MapPin size={14} />
            <span className="font-extrabold text-sm">{order.tableName}</span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-2">
          <ReceiptText size={16} /> <span className="uppercase tracking-wider text-xs">Pesanan</span>
        </div>
        <ul className="space-y-3">
          {order.items.slice(0, 3).map((item: any, idx: number) => (
            <li key={idx} className="flex justify-between items-start text-sm group-hover:text-gray-900">
              <div className="flex gap-2">
                <span className="font-bold text-teal-600 bg-teal-50 px-1.5 rounded-md h-fit">{item.quantity}x</span>
                <span className="font-medium text-gray-700 leading-tight">
                  {item.menuName}
                  {item.additionals?.length > 0 && (
                    <div className="text-xs text-gray-400 mt-0.5 font-normal">
                      + {item.additionals.map((a: any) => a.name).join(", ")}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-xs text-amber-600/80 mt-0.5 italic flex gap-1">
                      <span>Catatan:</span> {item.notes}
                    </div>
                  )}
                </span>
              </div>
            </li>
          ))}
          {order.items.length > 3 && (
            <li className="text-xs text-gray-400 font-medium italic mt-2">
              + {order.items.length - 3} pesanan lainnya
            </li>
          )}
        </ul>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
        <span className="text-sm font-bold text-gray-400">Total</span>
        <span className="text-xl font-black text-teal-600">{formatRupiah(order.totalAmount)}</span>
      </div>
    </div>
  )
}

import { OrdersNavigation } from "./navigation"

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full relative">
      <OrdersNavigation />
      <div className="flex-1 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

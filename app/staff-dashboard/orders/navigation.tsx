"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function OrdersNavigation() {
  const pathname = usePathname()

  const tabs = [
    { label: "Draft", path: "/staff-dashboard/orders/draft", color: "text-amber-600 bg-amber-50", activeColor: "bg-amber-100 text-amber-800 ring-amber-400" },
    { label: "Active", path: "/staff-dashboard/orders/active", color: "text-blue-600 bg-blue-50", activeColor: "bg-blue-100 text-blue-800 ring-blue-400" },
    { label: "Completed", path: "/staff-dashboard/orders/completed", color: "text-emerald-600 bg-emerald-50", activeColor: "bg-emerald-100 text-emerald-800 ring-emerald-400" },
  ]

  return (
    <div className="flex items-center gap-4 bg-white px-8 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <h2 className="text-xl font-extrabold text-gray-800 mr-4">Daftar Pesanan</h2>
      <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path
          return (
            <Link key={tab.path} href={tab.path}>
              <div
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                  isActive
                    ? `shadow-md ring-1 ${tab.activeColor} scale-105`
                    : `text-gray-500 hover:text-gray-900 hover:bg-gray-200`
                }`}
              >
                {tab.label}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

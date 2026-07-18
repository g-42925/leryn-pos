"use client"

import Link from "next/link"
import useGlobalState from "@/store/global"

import { usePathname } from "next/navigation"
import { LayoutDashboard, Store, LogOut, Clock, CookingPot, CheckCircle, Package } from "lucide-react"

export function StaffNavigation({ name, branchName }: { name: string, branchName: string }) {
  const staffLogout = useGlobalState((s) => s.staffLogout)
  const pathname = usePathname()

  const handleLogout = async () => {
    await staffLogout()
    window.location.href = "/home"
  }

  const tabs = [
    { label: "Orders", href: "/staff-dashboard/orders/draft", icon: Package, prefix: "/staff-dashboard/orders" },
    { label: "Tables", href: "/staff-dashboard/tables", icon: LayoutDashboard, prefix: "/staff-dashboard/tables" },
  ]

  return (
    <div className="w-64 bg-teal-900 border-r border-teal-800 flex flex-col h-screen text-white sticky top-0 shrink-0 shadow-2xl">
      <div className="p-6 border-b border-teal-800 bg-teal-950/50">
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <span>Leryn</span><span className="text-teal-400">POS</span>
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center font-bold text-teal-300 ring-1 ring-teal-400">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight text-white">{name}</p>
            <p className="text-teal-300/80 text-xs flex items-center gap-1 mt-0.5">
              <Store size={12} /> {branchName}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.prefix)
          return (
            <Link key={tab.href} href={tab.href} className="block">
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium ${isActive
                  ? "bg-teal-500 text-teal-950 shadow-lg shadow-teal-500/30 scale-100"
                  : "text-teal-200 hover:bg-teal-800/50 hover:text-white"
                  }`}
              >
                <tab.icon size={18} className={isActive ? "text-teal-950" : "text-teal-400"} />
                {tab.label}
              </div>
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-teal-800">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-red-300 hover:bg-red-500/20 transition-all font-medium ring-1 ring-red-400/20 hover:ring-red-400/50">
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </div>
  )
}

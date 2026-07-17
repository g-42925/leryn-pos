"use client"

import Link from "next/link"
import { Utensils, PlusSquare, Calculator, Settings, Grid, Users, PieChart, UserCircle, Store, Package, GitBranch, Shield, BookOpen, UserCog } from "lucide-react"
import useGlobalState from "@/store/global"

const allMenuItems = [
  { title: "Manage Menu", icon: Utensils, href: "/admin-dashboard/manage-menu", color: "from-emerald-500 to-teal-600" },
  { title: "Manage Inventory", icon: Package, href: "/admin-dashboard/manage-inventory", color: "from-orange-500 to-red-600" },
  { title: "Manage Branch", icon: GitBranch, href: "/admin-dashboard/manage-branch", color: "from-sky-500 to-cyan-600", superadminOnly: true },
  { title: "Manage Recipe", icon: BookOpen, href: "/admin-dashboard/manage-recipe", color: "from-amber-500 to-orange-600" },
  { title: "Manage Additional Menu", icon: PlusSquare, href: "/admin-dashboard/manage-additional-menu", color: "from-amber-500 to-orange-600" },
  { title: "Manage Tax", icon: Calculator, href: "/admin-dashboard/manage-tax", color: "from-purple-500 to-fuchsia-600", superadminOnly: true },
  { title: "Settings", icon: Settings, href: "/admin-dashboard/settings", color: "from-gray-500 to-slate-600" },
  { title: "Manage Table", icon: Grid, href: "/admin-dashboard/manage-table", color: "from-cyan-500 to-blue-600" },
  { title: "Manage Staff", icon: Users, href: "/admin-dashboard/manage-staff", color: "from-rose-500 to-pink-600" },
  { title: "Manage Admin", icon: UserCog, href: "/admin-dashboard/manage-admin", color: "from-amber-600 to-orange-500" },
  { title: "Manage Role", icon: Shield, href: "/admin-dashboard/manage-role", color: "from-amber-500 to-yellow-600", superadminOnly: true },
  { title: "Report", icon: PieChart, href: "/admin-dashboard/report", color: "from-indigo-500 to-violet-600" },
  { title: "Restaurant Profile", icon: Store, href: "/admin-dashboard/profile", color: "from-fuchsia-500 to-rose-600", superadminOnly: true },
]

export default function AdminMenuGrid() {
  const { role, hasHydrated } = useGlobalState()

  if (!hasHydrated) return null

  const isSuperadmin = role === "superadmin"

  const menuItems = allMenuItems.filter(item => isSuperadmin || !item.superadminOnly)

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {menuItems.map((item, index) => {
        const Icon = item.icon
        return (
          <Link
            key={index}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:-translate-y-1 flex flex-col p-6"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${item.color} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
            <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-white w-fit mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={28} />
            </div>
            <h3 className="text-lg font-bold mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex-grow">Manage {item.title.toLowerCase()} settings and data.</p>
            <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-4 group-[&:hover]:translate-x-0">
              Open Module &rarr;
            </div>
          </Link>
        )
      })}
    </section>
  )
}

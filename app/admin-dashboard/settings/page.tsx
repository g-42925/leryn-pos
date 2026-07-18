import Link from "next/link"
import { Settings, KeyRound, ChevronRight, UtensilsCrossed } from "lucide-react"

const settingsMenuItems = [
  {
    title: "Ganti Password Staff",
    description: "Ubah PIN/password akses POS untuk staff yang terdaftar.",
    icon: KeyRound,
    href: "/admin-dashboard/settings/change-password",
    color: "from-rose-500 to-pink-600",
  },
  {
    title: "Order Settings",
    description: "Kelola pengaturan order restoran Anda.",
    icon: UtensilsCrossed,
    href: "/admin-dashboard/settings/order-settings",
    color: "from-sky-500 to-cyan-600",
  },
]

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 sm:p-10 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/admin-dashboard"
                className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
              >
                &larr; Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Kelola konfigurasi dan pengaturan sistem restoran Anda.
            </p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-slate-600 to-gray-700 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform -rotate-3">
            <Settings size={28} />
          </div>
        </header>

        {/* SETTINGS MENU LIST */}
        <section className="space-y-3">
          {settingsMenuItems.map((item, index) => {
            const Icon = item.icon
            const cardContent = (
              <div
                className={`group flex items-center gap-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all duration-300 ${item.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-600 hover:-translate-y-0.5 cursor-pointer"
                  }`}
              >
                {/* Icon */}
                <div
                  className={`shrink-0 h-14 w-14 bg-gradient-to-br ${item.color} text-white rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 ${!item.disabled ? "group-hover:scale-110" : ""
                    }`}
                >
                  <Icon size={26} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h2>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.badge === "Soon"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                        }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {item.description}
                  </p>
                </div>

                {/* Arrow */}
                {!item.disabled && (
                  <ChevronRight
                    size={20}
                    className="shrink-0 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors -translate-x-1 group-hover:translate-x-0 duration-200"
                  />
                )}
              </div>
            )

            return item.disabled ? (
              <div key={index}>{cardContent}</div>
            ) : (
              <Link key={index} href={item.href}>
                {cardContent}
              </Link>
            )
          })}
        </section>

        {/* FOOTER NOTE */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-600 pt-4">
          Lebih banyak pengaturan akan segera hadir.
        </div>
      </div>
    </main>
  )
}

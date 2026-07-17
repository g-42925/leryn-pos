import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Store, LogOut } from "lucide-react"
import AdminMenuGrid from "./AdminMenuGrid"
import DashboardHeader from "./DashboardHeader"

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")
  const adminToken = cookieStore.get("admin_session_token")

  if (!token) redirect("/login")
  if (!adminToken) redirect("/home")

  async function logout() {
    "use server"
    const cookieStore = await cookies()
    cookieStore.delete("admin_session_token")
    redirect("/home")
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <DashboardHeader />
          <div className="flex items-center gap-4">
            <form action={logout}>
              <button
                type="submit"
                className="px-4 py-2 bg-white hover:bg-rose-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2 shadow-sm"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
            <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg shrink-0">
              <Store size={32} />
            </div>
          </div>
        </header>

        <AdminMenuGrid />
      </div>
    </main>
  )
}
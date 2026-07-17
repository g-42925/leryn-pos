"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Package, Plus, ArrowRight, Loader2, RefreshCw } from "lucide-react"
import useGlobalState from "@/store/global"
import { getInventoryTypesAction, addInventoryTypeAction } from "@/app/actions/manage-inventory"

export default function ManageInventoryPage() {
  const { accountId, role, hasHydrated } = useGlobalState()
  const isSuperadmin = role === 'superadmin'
  
  const [types, setTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const loadData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const data = await getInventoryTypesAction(accountId)
      setTypes(data || [])
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasHydrated && accountId) {
      loadData()
    } else if (hasHydrated && !accountId) {
      setLoading(false)
    }
  }, [accountId, hasHydrated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError("")
    
    const result = await addInventoryTypeAction(accountId, name)
    if (result.success) {
      setName("")
      loadData()
    } else {
      setError(result.message)
    }
    setSubmitting(false)
  }

  if (!hasHydrated || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
      </div>
    )
  }

  if (!accountId) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Error: Account ID tidak ditemukan. Harap login ulang.
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 sm:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin-dashboard" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                &larr; Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Manage Inventory</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Buat dan kelola jenis inventory Anda di sini.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform rotate-3">
            <Package size={28} />
          </div>
        </header>

        {isSuperadmin && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Tambah Jenis Inventory</h2>
            {error && <div className="mb-4 text-red-500 text-sm font-medium">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Contoh: Bahan Baku, Kemasan..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-grow px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
              <button 
                type="submit" 
                disabled={submitting}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>Tambah</span>
              </button>
            </form>
          </section>
        )}
        {!isSuperadmin && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-700 dark:text-amber-400 text-sm font-medium">
            <Package size={18} className="shrink-0" />
            Anda hanya dapat mengelola item inventory untuk cabang Anda. Silakan pilih jenis inventory di bawah.
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daftar Jenis Inventory</h2>
            <button onClick={loadData} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm font-medium transition-colors">
              <RefreshCw size={16} /> <span>Refresh</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {types.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Belum ada jenis inventory yang dibuat.
              </div>
            ) : (
              types.map((type) => (
                <Link 
                  key={type._id} 
                  href={`/admin-dashboard/manage-inventory/${type._id}`}
                  className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 hover:border-indigo-500"
                >
                  <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Package size={20} />
                  </div>
                  <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-600 transition-colors">{type.name}</h3>
                  <div className="mt-4 flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Kelola Item <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

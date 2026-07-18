"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GitBranch, Plus, ArrowRight, Loader2, RefreshCw, Store } from "lucide-react"
import useGlobalState from "@/store/global"
import { getInventoryTypesAction } from "@/app/actions/manage-inventory"
import { getBranchesAction, addBranchAction } from "@/app/actions/manage-branch"

export default function ManageBranchPage() {
  const { accountId, hasHydrated } = useGlobalState()
  
  const [branches, setBranches] = useState<any[]>([])
  const [inventoryTypes, setInventoryTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [inventoryId, setInventoryId] = useState("")
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const loadData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      // Load both branches and inventory types parallel
      const [invTypesData, branchesResult] = await Promise.all([
        getInventoryTypesAction(accountId),
        getBranchesAction(accountId)
      ])
      
      setInventoryTypes(invTypesData || [])
      
      if (branchesResult.success) {
        setBranches(branchesResult.data || [])
      } else {
        console.error(branchesResult.message)
      }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, hasHydrated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !inventoryId) {
      setError("Nama cabang dan Jenis Inventory wajib diisi!")
      return
    }
    setSubmitting(true)
    setError("")
    
    const result = await addBranchAction(accountId, name, address, inventoryId)
    if (result.success) {
      setName("")
      setAddress("")
      setInventoryId("")
      loadData()
    } else {
      setError(result.message)
    }
    setSubmitting(false)
  }

  if (!hasHydrated || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin w-10 h-10 text-sky-600" />
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
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin-dashboard" className="text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors">
                &larr; Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Manage Branch</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola daftar cabang dan tetapkan pengelola inventarisasinya.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform rotate-3">
            <GitBranch size={28} />
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Tambah Cabang Baru</h2>
          {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Cabang / Outlet</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Cabang Jakarta Pusat" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hubungkan ke Inventory</label>
                <select 
                  value={inventoryId}
                  onChange={(e) => setInventoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-sky-500 outline-none transition-all appearance-none"
                  required
                >
                  <option value="" disabled className="dark:bg-slate-900">Pilih Jenis Inventory</option>
                  {inventoryTypes.map((inv) => (
                    <option key={inv._id} value={inv._id} className="dark:bg-slate-900">
                      {inv.name}
                    </option>
                  ))}
                </select>
                {inventoryTypes.length === 0 && (
                  <p className="text-xs text-orange-500 mt-1">
                    Anda belum membuat Inventory. <Link href="/admin-dashboard/manage-inventory" className="underline font-bold">Buat sekarang</Link>.
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alamat Cabang (Opsional)</label>
              <textarea 
                placeholder="Detail alamat cabang..." 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={submitting || inventoryTypes.length === 0}
                className="px-8 py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>Buat Cabang</span>
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daftar Cabang Aktif</h2>
            <button onClick={loadData} className="text-sky-600 hover:text-sky-700 flex items-center gap-1 text-sm font-medium transition-colors">
              <RefreshCw size={16} /> <span>Refresh</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Belum ada cabang yang terdaftar.
              </div>
            ) : (
              branches.map((branch) => (
                <div 
                  key={branch._id} 
                  className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:border-sky-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-500 to-transparent opacity-10 group-hover:opacity-20 rounded-bl-full transition-opacity" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center">
                      <Store size={24} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">{branch.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[40px] mb-4">
                    {branch.address || "Tidak ada alamat lengkap"}
                  </p>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                      Inventory: {branch.inventoryName || "Unknown"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

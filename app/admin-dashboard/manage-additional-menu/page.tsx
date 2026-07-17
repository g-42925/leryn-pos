"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Coffee, Plus, Loader2, RefreshCw, Layers } from "lucide-react"
import useGlobalState from "@/store/global"
import { getBranchesAction } from "@/app/actions/manage-branch"
import { getAdditionalMenusAction, getBranchMenusAction, addAdditionalMenuAction } from "@/app/actions/manage-additional-menu"

export default function ManageAdditionalMenuPage() {
  const { accountId, role, branch: userBranch, hasHydrated } = useGlobalState()
  const isSuperadmin = role === 'superadmin'

  const [branches, setBranches] = useState<any[]>([])
  const [additionalMenus, setAdditionalMenus] = useState<any[]>([])
  const [menus, setMenus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [name, setName] = useState("")
  const [branchId, setBranchId] = useState("")
  const [menuId, setMenuId] = useState("")
  const [price, setPrice] = useState<number | "">("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [loadingMenus, setLoadingMenus] = useState(false)

  const loadData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const [branchesResult, additionalMenusResult] = await Promise.all([
        getBranchesAction(accountId),
        getAdditionalMenusAction(accountId)
      ])

      if (branchesResult.success) {
        setBranches(branchesResult.data || [])
      }
      if (additionalMenusResult.success) {
        setAdditionalMenus(additionalMenusResult.data || [])
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
      if (!isSuperadmin && userBranch) {
        setBranchId(userBranch)
      }
    } else if (hasHydrated && !accountId) {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, hasHydrated, isSuperadmin, userBranch])

  // Fetch parent menus when branchId changes
  useEffect(() => {
    const fetchMenus = async () => {
      if (!branchId || !accountId) {
        setMenus([])
        setMenuId("")
        return
      }
      setLoadingMenus(true)
      try {
        const menusResult = await getBranchMenusAction(branchId, accountId)
        if (menusResult.success) {
          setMenus(menusResult.data || [])
          setMenuId("")
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingMenus(false)
      }
    }

    fetchMenus()
  }, [branchId, accountId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !branchId || !menuId || price === "") {
      setError("Semua field wajib diisi!")
      return
    }

    if (Number(price) < 0) {
      setError("Harga tidak boleh negatif!")
      return
    }

    setSubmitting(true)
    setError("")

    const result = await addAdditionalMenuAction(accountId, branchId, menuId, name, Number(price))
    if (result.success) {
      setName("")
      setBranchId("")
      setMenuId("")
      setPrice("")
      setMenus([])
      loadData()
    } else {
      setError(result.message)
    }
    setSubmitting(false)
  }

  if (!hasHydrated || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin w-10 h-10 text-emerald-600" />
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
              <Link href="/admin-dashboard" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                &larr; Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Manage Additional Menu</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola topping/opsi tambahan yang terikat pada menu tertentu.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform rotate-3">
            <Layers size={28} />
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Tambah Menu Tambahan (Add-ons)</h2>
          {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {isSuperadmin && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Cabang</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="" disabled className="dark:bg-slate-900">Pilih Cabang</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id} className="dark:bg-slate-900">
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {branches.length === 0 && (
                    <p className="text-xs text-emerald-500 mt-1">
                      Anda belum membuat Cabang. <Link href="/admin-dashboard/manage-branch" className="underline font-bold">Buat sekarang</Link>.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Menu Induk</label>
                  {loadingMenus && <Loader2 className="animate-spin w-3 h-3 text-emerald-500" />}
                </div>
                <select
                  value={menuId}
                  onChange={(e) => setMenuId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none disabled:opacity-50"
                  required
                  disabled={!branchId || loadingMenus}
                >
                  <option value="" disabled className="dark:bg-slate-900">Pilih Menu</option>
                  {menus.map((m) => (
                    <option key={m._id} value={m._id} className="dark:bg-slate-900">
                      {m.name}
                    </option>
                  ))}
                </select>
                {branchId && menus.length === 0 && !loadingMenus && (
                  <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                    Cabang ini belum memiliki menu. 
                    <Link href="/admin-dashboard/manage-menu" className="underline font-bold text-emerald-600">Buat Menu</Link>.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Tambahan (Topping/Ekstra)</label>
                <input
                  type="text"
                  placeholder="Contoh: Ekstra Keju / Toping Boba"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Harga Jual (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 5000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting || !branchId || !menuId}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>Simpan Tambahan</span>
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daftar Menu Tambahan</h2>
            <button onClick={loadData} className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm font-medium transition-colors">
              <RefreshCw size={16} /> <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isSuperadmin ? additionalMenus : additionalMenus.filter(a => a.branchId?._id === userBranch || a.branchId === userBranch)).length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Belum ada menu tambahan yang terdaftar untuk cabang ini.
              </div>
            ) : (
              (isSuperadmin ? additionalMenus : additionalMenus.filter(a => a.branchId?._id === userBranch || a.branchId === userBranch)).map((addon) => (
                <div
                  key={addon._id}
                  className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:border-emerald-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500 to-transparent opacity-10 group-hover:opacity-20 rounded-bl-full transition-opacity" />

                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                      <Layers size={24} />
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                      + Rp {addon.price.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">{addon.name}</h3>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg mt-3">
                     <p className="flex items-center gap-2 mb-1">
                       <span className="font-semibold text-emerald-600 dark:text-emerald-400 w-16">Cabang:</span> 
                       <span className="truncate">{addon.branchId?.name || "Unknown"}</span>
                     </p>
                     <p className="flex items-center gap-2">
                       <span className="font-semibold text-emerald-600 dark:text-emerald-400 w-16">Menu:</span> 
                       <span className="truncate">{addon.menuId?.name || "Unknown"}</span>
                     </p>
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

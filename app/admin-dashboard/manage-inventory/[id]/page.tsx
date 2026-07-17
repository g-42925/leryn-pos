"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { PackageOpen, Plus, Loader2, ArrowLeft, RefreshCw, Hash, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import useGlobalState from "@/store/global"
import { getInventoryItemsAction, addInventoryItemAction, updateStockAction } from "@/app/actions/manage-inventory"
import { getBranchesAction } from "@/app/actions/manage-branch"

function StockManager({ item, accountId, onUpdate }: { item: any; accountId: string; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'in' | 'out' | null>(null)
  const [amount, setAmount] = useState("")

  const handleApply = async () => {
    const val = Number(amount)
    if (!mode || isNaN(val) || val <= 0) return
    setLoading(true)
    const result = await updateStockAction(item._id, accountId, mode, val)
    if (result.success) {
      setMode(null)
      setAmount("")
      onUpdate()
    } else {
      alert(result.message)
    }
    setLoading(false)
  }

  if (mode) {
    return (
      <div className="flex items-center gap-2">
        <input 
          type="number" 
          value={amount} 
          onChange={e => setAmount(e.target.value)}
          className="w-20 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          placeholder="Jml" 
          autoFocus
          disabled={loading}
        />
        <button onClick={handleApply} disabled={loading} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : "OK"}
        </button>
        <button onClick={() => setMode(null)} disabled={loading} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-md text-sm hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors shadow-sm">
          Batal
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-bold text-lg min-w-[2rem]">{item.stock || 0}</span>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setMode('in')}
          className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md transition-colors border border-emerald-200 dark:border-emerald-500/30 shadow-sm"
          title="Tambah Stock (IN)"
        >
          <ArrowUpCircle size={18} />
        </button>
        <button 
          onClick={() => setMode('out')}
          className="p-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-md transition-colors border border-rose-200 dark:border-rose-500/30 shadow-sm"
          title="Kurangi Stock (OUT)"
        >
          <ArrowDownCircle size={18} />
        </button>
      </div>
    </div>
  )
}

export default function ManageInventoryItemsPage() {
  const { accountId, role, branch: userBranch, hasHydrated } = useGlobalState()
  const isSuperadmin = role === 'superadmin'
  const params = useParams()
  const inventoryTypeId = params.id as string
  
  const [typeInfo, setTypeInfo] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("")
  const [branchId, setBranchId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const loadData = async () => {
    if (!accountId || !inventoryTypeId) return
    setLoading(true)
    setError("")
    try {
      const data = await getInventoryItemsAction(inventoryTypeId, accountId)
      if (data.success) {
        setTypeInfo(data.type)
        setItems(data.items || [])
      } else {
        setError(data.message || "Gagal memuat data")
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasHydrated && accountId && inventoryTypeId) {
      loadData()
      getBranchesAction(accountId).then(res => {
        if (res.success) setBranches(res.data || [])
      })
      if (!isSuperadmin && userBranch) {
        setBranchId(userBranch)
      }
    } else if (hasHydrated && (!accountId || !inventoryTypeId)) {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, inventoryTypeId, hasHydrated, isSuperadmin, userBranch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !unit.trim() || !branchId) {
      setError("Nama, satuan, dan cabang wajib diisi.")
      return
    }
    setSubmitting(true)
    setError("")
    
    const result = await addInventoryItemAction(inventoryTypeId, accountId, name, unit, branchId)
    if (result.success) {
      setName("")
      setUnit("")
      if (!(!isSuperadmin && userBranch)) setBranchId("")
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
              <Link href="/admin-dashboard/manage-inventory" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center">
                <ArrowLeft size={16} className="mr-1" /> Kembali ke Jenis Inventory
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              {typeInfo ? typeInfo.name : "Item Inventory"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola daftar barang, satuan, dan penyesuaian stock (in/out) di sini.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform -rotate-3">
            <PackageOpen size={28} />
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Tambah Item Baru</h2>
          {error && <div className="mb-4 text-red-500 text-sm font-medium">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1 lg:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Barang</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Daging Ayam" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Satuan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Kg, Ekor" 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
              {isSuperadmin ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cabang</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="" disabled className="dark:bg-slate-900">Pilih Cabang</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id} className="dark:bg-slate-900">{b.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-1 justify-end">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cabang</label>
                  <div className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-500">
                    {branches.find(b => b._id === branchId)?.name || 'Cabang Anda'}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={submitting}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>Tambah Item</span>
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daftar Item & Stock ({items.length})</h2>
            <button onClick={loadData} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm font-medium transition-colors">
              <RefreshCw size={16} /> <span>Refresh</span>
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {items.length === 0 ? (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400">
                Belum ada item yang ditambahkan ke kategori ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="pr-6 py-4 pl-6 font-semibold text-slate-500 dark:text-slate-400">Nama Barang</th>
                      {isSuperadmin && <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 w-1/6">Cabang</th>}
                      <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 w-1/6">Satuan</th>
                      <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 w-[200px]">Sisa Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(isSuperadmin ? items : items.filter(i => String(i.branchId) === userBranch)).map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="pr-6 py-4 pl-6 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <Hash size={16} />
                            </div>
                            {item.name}
                          </div>
                        </td>
                        {isSuperadmin && (
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {branches.find(b => b._id === String(item.branchId))?.name || 'N/A'}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            {item.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StockManager item={item} accountId={accountId} onUpdate={loadData} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calculator, Plus, Loader2, RefreshCw } from "lucide-react"
import useGlobalState from "@/store/global"
import { getTaxesAction, addTaxAction } from "@/app/actions/manage-tax"

export default function ManageTaxPage() {
  const { accountId, hasHydrated } = useGlobalState()

  const [taxes, setTaxes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [name, setName] = useState("")
  const [percentage, setPercentage] = useState<number | "">("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const loadData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const taxesResult = await getTaxesAction(accountId)
      if (taxesResult.success) {
        setTaxes(taxesResult.data || [])
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
    if (!name.trim() || percentage === "") {
      setError("Semua field wajib diisi!")
      setSuccessMsg("")
      return
    }

    if (Number(percentage) < 0) {
      setError("Persentase tidak boleh negatif!")
      setSuccessMsg("")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccessMsg("")

    const result = await addTaxAction(accountId, name, Number(percentage))
    if (result.success) {
      setName("")
      setPercentage("")
      setSuccessMsg("Pajak berhasil ditambahkan!")
      loadData()
    } else {
      setError(result.message)
    }
    setSubmitting(false)

    // Clear success message after 3 seconds
    if (result.success) {
      setTimeout(() => setSuccessMsg(""), 3000)
    }
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
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin-dashboard" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                &larr; Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Manage Tax</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola jenis pajak dan besaran persentasenya.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform rotate-3">
            <Calculator size={28} />
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Tambah Pajak Baru</h2>
          {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">{error}</div>}
          {successMsg && <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium border border-emerald-200 dark:border-emerald-800">{successMsg}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Pajak</label>
                <input
                  type="text"
                  placeholder="Contoh: PPN 11%"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Besaran Persentase (%)</label>
                <input
                  type="number"
                  placeholder="Contoh: 11"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value ? Number(e.target.value) : "")}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>Simpan Pajak</span>
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daftar Pajak Tersedia</h2>
            <button onClick={loadData} className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm font-medium transition-colors">
              <RefreshCw size={16} /> <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {taxes.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Belum ada pengaturan pajak.
              </div>
            ) : (
              taxes.map((tax) => (
                <div
                  key={tax._id}
                  className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:border-purple-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500 to-transparent opacity-10 group-hover:opacity-20 rounded-bl-full transition-opacity" />

                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                      <Calculator size={24} />
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                      {tax.percentage}%
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">{tax.name}</h3>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

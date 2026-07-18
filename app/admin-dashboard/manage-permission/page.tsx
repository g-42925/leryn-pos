"use client"

import Link from "next/link"
import useGlobalState from "@/store/global"

import { useState, useEffect } from "react"
import { Key, Plus, Loader2, RefreshCw, KeyRound, Trash2 } from "lucide-react"
import { getPermissionsAction, addPermissionAction, deletePermissionAction } from "@/app/actions/manage-permission"

export default function ManagePermissionPage() {
  const { accountId, hasHydrated } = useGlobalState()

  const [permissions, setPermissions] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const loadData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const result = await getPermissionsAction(accountId)
      if (result.success) {
        setPermissions(result.data || [])
      } else {
        console.error(result.message)
      }
    } catch (e) {
      const err = e as Error
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    if (hasHydrated && accountId) {
      loadData().then(() => {
        if (!active) return
      })
    } else if (hasHydrated && !accountId) {
      setLoading(false)
    }
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, hasHydrated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Nama Permission wajib diisi!")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccessMsg("")

    const result = await addPermissionAction(accountId, name, description)
    if (result.success) {
      setName("")
      setDescription("")
      setSuccessMsg("Permission berhasil ditambahkan!")
      setTimeout(() => setSuccessMsg(""), 3000)
      loadData()
    } else {
      setError(result.message || "Unknown error")
    }
    setSubmitting(false)
  }

  const handleDelete = async (permissionId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Permission ini? Tindakan ini tidak dapat dibatalkan, dan jika digunakan pada Role tertentu dapat menimbulkan masalah.")) return

    setDeleting(permissionId)
    const result = await deletePermissionAction(permissionId, accountId)
    if (result.success) {
      loadData()
    } else {
      alert(result.message)
    }
    setDeleting(null)
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
            <h1 className="text-4xl font-extrabold tracking-tight">Manage Permission</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Daftarkan hak akses spesifik sistem yang bisa diberikan ke Role / Pengguna.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform rotate-3">
            <Key size={28} />
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Tambah Permission Baru</h2>
          {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">{error}</div>}
          {successMsg && <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Permission</label>
                <input
                  type="text"
                  placeholder="Contoh: Akses POS"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Deskripsi (Opsional)</label>
                <input
                  type="text"
                  placeholder="Penjelasan ringkas dari izin ini"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>Tambah Permission</span>
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daftar Permission Aktif</h2>
            <button onClick={loadData} className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm font-medium transition-colors">
              <RefreshCw size={16} /> <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {permissions.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Belum ada permission yang terdaftar. Silakan tambahkan satu!
              </div>
            ) : (
              permissions.map((perm) => (
                <div
                  key={String(perm._id)}
                  className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:border-emerald-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500 to-teal-500 opacity-10 group-hover:opacity-20 rounded-bl-full transition-opacity" />

                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shadow-inner">
                      <KeyRound size={20} />
                    </div>
                    <button
                      onClick={() => handleDelete(String(perm._id))}
                      disabled={deleting === perm._id}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      title="Hapus Permission"
                    >
                      {deleting === perm._id ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 size={16} />}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white capitalize">{String(perm.name)}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {String(perm.description) || "Tidak ada deskripsi"}
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

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Plus, Loader2, RefreshCw, KeyRound, Trash2, UserCog, ShieldCheck } from "lucide-react"
import useGlobalState from "@/store/global"
import { getAdminsAction, addAdminAction, deleteAdminAction } from "@/app/actions/manage-admin"
import { getRolesAction } from "@/app/actions/manage-role"
import { getBranchesAction } from "@/app/actions/manage-branch"

export default function ManageAdminPage() {
  const { accountId, role, branch: userBranch, hasHydrated } = useGlobalState()
  const isSuperadmin = role === 'superadmin'

  const [admins, setAdmins] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const loadData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const [adminRes, roleRes, branchRes] = await Promise.all([
        getAdminsAction(accountId),
        getRolesAction(accountId),
        getBranchesAction(accountId)
      ])

      if (roleRes.success) {
        setRoles(roleRes.data || [])
      }

      if (adminRes.success) {
        setAdmins(adminRes.data || [])
      }

      if (branchRes.success) {
        setBranches(branchRes.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    if (hasHydrated && accountId) {
      loadData().then(() => {
        if (!active) return
        if (!isSuperadmin && userBranch) {
          setSelectedBranch(userBranch)
        }
      })
    } else if (hasHydrated && !accountId) {
      setLoading(false)
    }
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, hasHydrated, isSuperadmin, userBranch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !name.trim() || !password || !selectedRole) {
      setError("Semua field wajib diisi!")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccessMsg("")

    const result = await addAdminAction(
      accountId, username, name, password, selectedRole, selectedBranch)
    if (result.success) {
      setUsername("")
      setName("")
      setPassword("")
      setSelectedRole("")
      setSelectedBranch("")
      setSuccessMsg("Admin baru berhasil ditambahkan!")
      setTimeout(() => setSuccessMsg(""), 3000)
      loadData()
    } else {
      setError(result.message)
    }
    setSubmitting(false)
  }

  const handleDelete = async (adminId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Admin ini?")) return

    setDeleting(adminId)
    const result = await deleteAdminAction(adminId, accountId)
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
        <Loader2 className="animate-spin w-10 h-10 text-amber-600" />
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
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin-dashboard" className="text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors">
                &larr; Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Manage Admin</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola petugas admin yang memiliki akses ke dashboard ini.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-amber-600 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform -rotate-3">
            <UserCog size={28} />
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Tambah Admin Baru</h2>
          {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">{error}</div>}
          {successMsg && <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Username</label>
                <input
                  type="text"
                  placeholder="Username untuk login"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Nama Admin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  placeholder="Kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Role & Permission</label>
                {roles.length === 0 ? (
                  <div className="px-4 py-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400 text-sm">
                    Belum ada role. <Link href="/admin-dashboard/manage-role" className="underline font-bold">Buat Role di sini.</Link>
                  </div>
                ) : (
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="" disabled>-- Pilih Role --</option>
                    {roles.map(r => (
                      <option key={r._id} value={r._id}>{r.name} ({r.permissions?.length || 0} Permissions)</option>
                    ))}
                  </select>
                )}
                {selectedRole && (
                  <div className="text-xs text-slate-500 mt-1 pl-1">
                    Role menentukan hak akses admin ini pada sistem.
                  </div>
                )}
              </div>
            </div>

            {isSuperadmin && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cabang</label>
                {branches.length === 0 ? (
                  <div className="px-4 py-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400 text-sm">
                    Belum ada cabang. <Link href="/admin-dashboard/manage-branch" className="underline font-bold">Buat Cabang di sini.</Link>
                  </div>
                ) : (
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="" disabled>-- Pilih Cabang --</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                )}
                {selectedBranch && (
                  <div className="text-xs text-slate-500 mt-1 pl-1">
                    Cabang menentukan hak akses admin ini pada sistem.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={submitting || roles.length === 0}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>Simpan Admin</span>
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Daftar Admin Aktif</h2>
            <button onClick={loadData} className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 font-medium text-sm flex items-center gap-2 transition-colors">
              <RefreshCw size={16} /> <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isSuperadmin ? admins : admins.filter((a) => a.branch === userBranch)).length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                <Users size={48} className="mb-4 opacity-50 text-amber-500" />
                <p className="text-lg font-medium">Belum ada admin lain untuk cabang ini.</p>
                <p className="text-sm opacity-70">Tambahkan admin melalui form di atas.</p>
              </div>
            ) : (
              (isSuperadmin ? admins : admins.filter((a) => a.branch === userBranch)).map((admin) => (
                <div
                  key={admin._id}
                  className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all hover:border-amber-500 relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-bl from-amber-500 to-orange-500 opacity-10 group-hover:opacity-20 rounded-full blur-xl transition-opacity" />

                  <div className="flex justify-between items-start mb-5 relative">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl flex items-center justify-center shadow-inner border border-slate-200/50 dark:border-slate-600 text-xl font-bold">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight capitalize">{admin.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">@{admin.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(admin._id)}
                      disabled={deleting === admin._id}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      title="Hapus Admin"
                    >
                      {deleting === admin._id ? <Loader2 className="animate-spin w-5 h-5" /> : <Trash2 size={20} />}
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="w-5 h-5 text-amber-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {admin.role || "Unknown Role"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 ml-7">
                      {admin.permissions?.length || 0} permissions assigned
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

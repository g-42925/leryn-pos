"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Plus, Loader2, RefreshCw, UserCheck } from "lucide-react"
import useGlobalState from "@/store/global"
import { getBranchesAction } from "@/app/actions/manage-branch"
import { getStaffAction, addStaffAction } from "@/app/actions/manage-staff"
import { getRolesAction } from "@/app/actions/manage-role"

export default function ManageStaffPage() {
  const { accountId, role, branch: userBranch, hasHydrated } = useGlobalState()
  const isSuperadmin = role === 'superadmin'

  const [staffData, setStaffData] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [branchId, setBranchId] = useState("")
  const [xrole, setXRole] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const loadData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const [staffResult, branchesResult, rolesResult] = await Promise.all([
        getStaffAction(accountId),
        getBranchesAction(accountId),
        getRolesAction(accountId)
      ])

      if (rolesResult.success) {
        setRoles(rolesResult.data || [])
      }

      if (branchesResult.success) {
        setBranches(branchesResult.data || [])
      } else {
        console.error(branchesResult.message)
      }

      if (staffResult.success) {
        setStaffData(staffResult.data || [])
      } else {
        console.error(staffResult.message)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !pin.trim() || !branchId || !role) {
      setError("Nama staff, PIN, Role, dan Cabang wajib diisi!")
      return
    }
    if (pin.length < 4) {
      setError("PIN minimal 4 karakter.")
      return
    }

    setSubmitting(true)
    setError("")

    const result = await addStaffAction(accountId, branchId, name, pin, xrole)
    if (result.success) {
      setName("")
      setPin("")
      setBranchId("")
      setXRole("")
      loadData()
    }
    else {
      setError(result.message)
    }
    setSubmitting(false)
  }

  if (!hasHydrated || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin w-10 h-10 text-rose-600" />
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
              <Link href="/admin-dashboard" className="text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors">
                &larr; Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Manage Staff</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola daftar staff dan tetapkan di cabang mana staf tersebut akan bekerja.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform rotate-3">
            <Users size={28} />
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Tambah Staff Baru</h2>
          {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Staff</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">PIN Akses POS</label>
                <input
                  type="password"
                  placeholder="Masukkan PIN (minimal 4 digit)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                  required
                  minLength={4}
                />
              </div>
              {isSuperadmin && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Cabang</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-rose-500 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="" disabled className="dark:bg-slate-900">Pilih Cabang (Branch)</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id} className="dark:bg-slate-900">
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  {branches.length === 0 && (
                    <p className="text-xs text-orange-500 mt-1">
                      Anda belum membuat Cabang. <Link href="/admin-dashboard/manage-branch" className="underline font-bold">Buat cabang sekarang</Link>.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Role</label>
                <select
                  value={xrole}
                  onChange={(e) => setXRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-rose-500 outline-none transition-all appearance-none"
                  required
                >
                  <option value="" disabled className="dark:bg-slate-900">Pilih Role Akses</option>
                  {roles.length === 0 && (
                    <option value="cashier" className="dark:bg-slate-900">Cashier (Default)</option>
                  )}
                  {roles.map((r) => (
                    <option key={r._id} value={r.name} className="dark:bg-slate-900">
                      {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                    </option>
                  ))}
                </select>
                {roles.length === 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    Belum ada custom role. <Link href="/admin-dashboard/manage-role" className="underline font-bold text-rose-500">Buat role</Link>.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting || branches.length === 0}
                className="px-8 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>Tambah Staff</span>
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daftar Staff Aktif</h2>
            <button onClick={loadData} className="text-rose-600 hover:text-rose-700 flex items-center gap-1 text-sm font-medium transition-colors">
              <RefreshCw size={16} /> <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isSuperadmin ? staffData : staffData.filter(s => s.branchId === userBranch)).length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Belum ada staff yang terdaftar untuk cabang ini.
              </div>
            ) : (
              (isSuperadmin ? staffData : staffData.filter(s => s.branchId === userBranch)).map((staff) => (
                <div
                  key={staff._id}
                  className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:border-rose-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500 to-pink-500 opacity-10 group-hover:opacity-20 rounded-bl-full transition-opacity" />

                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
                      <UserCheck size={24} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white capitalize">{staff.name}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                    <span className="capitalize">{staff.role || "Cashier"}</span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                      Cabang: {staff.branchName || "Unknown Branch"}
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

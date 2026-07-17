"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { KeyRound, Loader2, CheckCircle2, AlertCircle, Search, UserCheck, Eye, EyeOff } from "lucide-react"
import useGlobalState from "@/store/global"
import { getBranchesAction } from "@/app/actions/manage-branch"
import { getStaffListAction, changeStaffPasswordAction } from "@/app/actions/settings"

export default function ChangePasswordPage() {
  const { accountId, hasHydrated, role, branch } = useGlobalState()

  const [staff, setStaff] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBranchId, setFilterBranchId] = useState("")

  // Selected staff & form
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)

  // State
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const loadData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const [staffRes, branchRes] = await Promise.all([
        getStaffListAction(accountId),
        getBranchesAction(accountId),
      ])
      if (staffRes.success) {
        let staffData = staffRes.data || []
        if (role !== "superadmin") {
          staffData = staffData.filter((s: any) => s.branchId === branch)
        }
        setStaff(staffData)
      }
      if (branchRes.success) {
        let branchData = branchRes.data || []
        if (role !== "superadmin") {
          branchData = branchData.filter((b: any) => b._id === branch)
          setFilterBranchId(branch)
        }
        setBranches(branchData)
      }
    } catch (e) {
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

  const handleSelectStaff = (s: any) => {
    setSelectedStaff(s)
    setNewPin("")
    setConfirmPin("")
    setSuccessMsg("")
    setErrorMsg("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaff) {
      setErrorMsg("Pilih staff terlebih dahulu!")
      return
    }
    if (newPin.length < 4) {
      setErrorMsg("PIN minimal 4 karakter.")
      return
    }
    if (newPin !== confirmPin) {
      setErrorMsg("Konfirmasi PIN tidak cocok.")
      return
    }

    setSubmitting(true)
    setErrorMsg("")
    setSuccessMsg("")

    const res = await changeStaffPasswordAction(accountId, selectedStaff._id, newPin)
    if (res.success) {
      setSuccessMsg(`PIN staff "${selectedStaff.name}" berhasil diperbarui!`)
      setNewPin("")
      setConfirmPin("")
      setSelectedStaff(null)
    } else {
      setErrorMsg(res.message)
    }
    setSubmitting(false)
  }

  const filteredStaff = staff.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchBranch = filterBranchId ? s.branchId === filterBranchId : true
    return matchSearch && matchBranch
  })

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
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/admin-dashboard/settings"
                className="text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors"
              >
                &larr; Back to Settings
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Ganti Password Staff</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Pilih staff, lalu masukkan PIN baru untuk memperbarui akses POS mereka.
            </p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform rotate-3">
            <KeyRound size={28} />
          </div>
        </header>

        {/* GLOBAL ALERTS */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-400 font-medium text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 size={20} className="shrink-0" />
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Staff List */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold">Pilih Staff</h2>

            {/* Search & Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm"
                />
              </div>
              <select
                value={filterBranchId}
                onChange={(e) => setFilterBranchId(e.target.value)}
                disabled={role !== "superadmin"}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-rose-500 outline-none transition-all appearance-none text-sm disabled:opacity-50"
              >
                <option value="">Semua Cabang</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id} className="dark:bg-slate-900">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Cards */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 -mr-1">
              {filteredStaff.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  Tidak ada staff ditemukan.
                </div>
              ) : (
                filteredStaff.map((s) => {
                  const isSelected = selectedStaff?._id === s._id
                  return (
                    <button
                      key={s._id}
                      onClick={() => handleSelectStaff(s)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-rose-500 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <UserCheck size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm capitalize leading-tight">{s.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                          {s.role || "Cashier"}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="shrink-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </section>

          {/* RIGHT: Change Password Form */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">PIN Baru</h2>

            {!selectedStaff ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-600 gap-3">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <KeyRound size={30} />
                </div>
                <p className="text-sm font-medium">Pilih staff dari daftar di sebelah kiri untuk mulai mengubah PIN.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Selected Staff Indicator */}
                <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
                  <div className="h-10 w-10 bg-rose-500 text-white rounded-lg flex items-center justify-center shrink-0">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wide">Staff Terpilih</p>
                    <p className="font-bold capitalize text-slate-800 dark:text-white">{selectedStaff.name}</p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2.5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                    <AlertCircle size={18} className="shrink-0" />
                    {errorMsg}
                  </div>
                )}

                {/* New PIN */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    PIN Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      placeholder="Masukkan PIN baru (minimal 4 digit)"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      minLength={4}
                      required
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm PIN */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Konfirmasi PIN Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? "text" : "password"}
                      placeholder="Ulangi PIN baru"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      minLength={4}
                      required
                      className={`w-full px-4 py-3 pr-12 rounded-xl border focus:ring-2 outline-none transition-all bg-transparent ${
                        confirmPin && newPin !== confirmPin
                          ? "border-red-400 focus:ring-red-500"
                          : "border-slate-300 dark:border-slate-700 focus:ring-rose-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPin && newPin !== confirmPin && (
                    <p className="text-xs text-red-500 font-medium mt-1">PIN tidak cocok.</p>
                  )}
                  {confirmPin && newPin === confirmPin && confirmPin.length >= 4 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> PIN cocok.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStaff(null)
                      setNewPin("")
                      setConfirmPin("")
                      setErrorMsg("")
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !newPin || newPin !== confirmPin}
                    className="px-7 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                    <span>Simpan PIN Baru</span>
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  UtensilsCrossed,
  ShoppingBag,
  Utensils,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Percent,
  Building2,
} from "lucide-react"
import useGlobalState from "@/store/global"
import { getBranchesAction } from "@/app/actions/manage-branch"
import {
  getOrderSettingsAction,
  toggleOrderTypeAction,
  addServiceChargeAction,
  deleteServiceChargeAction,
} from "@/app/actions/order-settings"

type ServiceCharge = { _id?: string; name: string; percentage: number }

type OrderTypeSettings = {
  enabled: boolean
  serviceCharges: ServiceCharge[]
}

type Settings = {
  takeAway: OrderTypeSettings
  dineIn: OrderTypeSettings
}

type OrderType = "takeAway" | "dineIn"

const orderTypeMeta: Record<
  OrderType,
  { label: string; icon: React.ElementType; color: string; accent: string }
> = {
  takeAway: {
    label: "Take Away",
    icon: ShoppingBag,
    color: "from-violet-500 to-purple-600",
    accent: "violet",
  },
  dineIn: {
    label: "Dine In",
    icon: Utensils,
    color: "from-amber-500 to-orange-600",
    accent: "amber",
  },
}

export default function OrderSettingsPage() {
  const { accountId, role, branch: userBranch, hasHydrated } = useGlobalState()
  const isSuperadmin = role === 'superadmin'

  const [branches, setBranches] = useState<any[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState("")
  const [settings, setSettings] = useState<Settings | null>(null)
  const [activeTab, setActiveTab] = useState<OrderType>("takeAway")

  const [loadingBranches, setLoadingBranches] = useState(true)
  const [loadingSettings, setLoadingSettings] = useState(false)

  // Service charge form
  const [newChargeName, setNewChargeName] = useState("")
  const [newChargePerc, setNewChargePerc] = useState("")
  const [addingCharge, setAddingCharge] = useState(false)

  // Feedback
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const flash = (type: "success" | "error", msg: string) => {
    setSuccessMsg("")
    setErrorMsg("")
    if (type === "success") setSuccessMsg(msg)
    else setErrorMsg(msg)
    setTimeout(() => {
      setSuccessMsg("")
      setErrorMsg("")
    }, 3500)
  }

  // ── Load branches ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasHydrated || !accountId) {
      if (hasHydrated) setLoadingBranches(false)
      return
    }
    getBranchesAction(accountId).then((res) => {
      if (res.success && res.data?.length) {
        setBranches(res.data)
        if (!isSuperadmin && userBranch) {
          setSelectedBranchId(userBranch)
        } else {
          setSelectedBranchId(res.data[0]._id)
        }
      }
      setLoadingBranches(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, accountId, isSuperadmin, userBranch])

  // ── Load settings when branch changes ────────────────────────────────────
  const loadSettings = useCallback(async () => {
    if (!accountId || !selectedBranchId) return
    setLoadingSettings(true)
    const res = await getOrderSettingsAction(accountId, selectedBranchId)
    if (res.success) setSettings(res.data)
    setLoadingSettings(false)
  }, [accountId, selectedBranchId])

  useEffect(() => {
    if (selectedBranchId) loadSettings()
  }, [selectedBranchId, loadSettings])

  // ── Toggle enable/disable ─────────────────────────────────────────────────
  const handleToggle = async (orderType: OrderType) => {
    if (!settings) return
    const current = settings[orderType].enabled
    // Optimistic update
    setSettings((prev) =>
      prev
        ? { ...prev, [orderType]: { ...prev[orderType], enabled: !current } }
        : prev
    )
    const res = await toggleOrderTypeAction(accountId, selectedBranchId, orderType, !current)
    if (!res.success) {
      // Revert
      setSettings((prev) =>
        prev
          ? { ...prev, [orderType]: { ...prev[orderType], enabled: current } }
          : prev
      )
      flash("error", res.message || "Gagal mengubah status.")
    } else {
      flash("success", `${orderTypeMeta[orderType].label} berhasil ${ !current ? "diaktifkan" : "dinonaktifkan"}.`)
    }
  }

  // ── Add service charge ───────────────────────────────────────────────────
  const handleAddCharge = async (e: React.FormEvent) => {
    e.preventDefault()
    const perc = parseFloat(newChargePerc)
    if (!newChargeName.trim()) return flash("error", "Nama service charge wajib diisi.")
    if (isNaN(perc) || perc < 0) return flash("error", "Persentase harus angka positif.")

    setAddingCharge(true)
    const res = await addServiceChargeAction(accountId, selectedBranchId, activeTab, newChargeName.trim(), perc)
    if (res.success) {
      setNewChargeName("")
      setNewChargePerc("")
      flash("success", "Service charge berhasil ditambahkan.")
      loadSettings()
    } else {
      flash("error", res.message || "Gagal menambahkan service charge.")
    }
    setAddingCharge(false)
  }

  // ── Delete service charge ─────────────────────────────────────────────────
  const handleDeleteCharge = async (chargeId: string) => {
    const res = await deleteServiceChargeAction(accountId, selectedBranchId, activeTab, chargeId)
    if (res.success) {
      flash("success", "Service charge berhasil dihapus.")
      loadSettings()
    } else {
      flash("error", res.message || "Gagal menghapus service charge.")
    }
  }

  // ─── RENDER STATES ────────────────────────────────────────────────────────

  if (!hasHydrated || loadingBranches) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin w-10 h-10 text-sky-500" />
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

  const meta = orderTypeMeta[activeTab]
  const Icon = meta.icon
  const currentSettings = settings?.[activeTab]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 sm:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/admin-dashboard/settings"
                className="text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors"
              >
                ← Back to Settings
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Order Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Kelola pengaturan order spesifik untuk setiap cabang restoran.
            </p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-sky-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform -rotate-3">
            <UtensilsCrossed size={28} />
          </div>
        </header>

        {/* ── BRANCH SELECTOR ─────────────────────────────────────────────── */}
        {isSuperadmin && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Building2 size={18} className="text-sky-500 shrink-0" />
              <span className="font-semibold text-sm">Pilih Cabang</span>
            </div>
            {branches.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tidak ada cabang. Tambahkan cabang terlebih dahulu.
              </p>
            ) : (
              <div className="relative">
                <select
                  id="branch-select"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none transition-all text-sm font-medium"
                >
                  {branches.map((b) => (
                    <option key={b._id} value={b._id} className="dark:bg-slate-900">
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            )}
          </section>
        )}

        {/* ── GLOBAL ALERTS ───────────────────────────────────────────────── */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-400 font-medium text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 size={18} className="shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 font-medium text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle size={18} className="shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
        {selectedBranchId && (
          <div className="space-y-5">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-3">
              {(["takeAway", "dineIn"] as OrderType[]).map((type) => {
                const m = orderTypeMeta[type]
                const TabIcon = m.icon
                const isActive = activeTab === type
                return (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 ${
                      isActive
                        ? `border-transparent bg-gradient-to-r ${m.color} text-white shadow-lg shadow-${m.accent}-500/30`
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <TabIcon size={20} />
                    {m.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Panel */}
            {loadingSettings ? (
              <div className="flex items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

                {/* Panel Header */}
                <div className={`bg-gradient-to-r ${meta.color} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Icon size={22} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">{meta.label}</h2>
                        <p className="text-white/75 text-sm">Pengaturan order {meta.label.toLowerCase()}</p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(activeTab)}
                      className="flex items-center gap-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border border-white/30"
                      id={`toggle-${activeTab}`}
                    >
                      {currentSettings?.enabled ? (
                        <>
                          <ToggleRight size={22} />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={22} />
                          <span>Nonaktif</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Status badge */}
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold border border-white/30">
                    <span className={`h-2 w-2 rounded-full ${currentSettings?.enabled ? "bg-emerald-300 animate-pulse" : "bg-white/50"}`} />
                    {currentSettings?.enabled
                      ? `Order ${meta.label} sedang AKTIF`
                      : `Order ${meta.label} sedang NONAKTIF`}
                  </div>
                </div>

                {/* Service Charges Section */}
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <Percent size={16} className="text-slate-500" />
                    <h3 className="font-bold text-base">Service Charges</h3>
                  </div>

                  {/* Existing Charges List */}
                  {currentSettings?.serviceCharges.length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400">
                      Belum ada service charge yang ditambahkan.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentSettings?.serviceCharges.map((charge) => (
                        <div
                          key={charge._id}
                          className="flex items-center justify-between gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`shrink-0 h-9 w-9 bg-gradient-to-br ${meta.color} text-white rounded-lg flex items-center justify-center`}>
                              <Percent size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{charge.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{charge.percentage}%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-sm font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r ${meta.color} text-white`}>
                              {charge.percentage}%
                            </span>
                            <button
                              onClick={() => charge._id && handleDeleteCharge(charge._id)}
                              className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                              title="Hapus service charge"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Service Charge Form */}
                  <form onSubmit={handleAddCharge} className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Tambah Service Charge
                    </p>
                    <div className="flex gap-3">
                      <input
                        id={`charge-name-${activeTab}`}
                        type="text"
                        placeholder="Nama (contoh: Packaging Fee)"
                        value={newChargeName}
                        onChange={(e) => setNewChargeName(e.target.value)}
                        className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none transition-all text-sm"
                      />
                      <div className="relative w-32 shrink-0">
                        <input
                          id={`charge-perc-${activeTab}`}
                          type="number"
                          placeholder="0"
                          min="0"
                          step="0.01"
                          value={newChargePerc}
                          onChange={(e) => setNewChargePerc(e.target.value)}
                          className="w-full pl-4 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none transition-all text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">%</span>
                      </div>
                      <button
                        type="submit"
                        disabled={addingCharge}
                        className={`shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${meta.color} text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60`}
                      >
                        {addingCharge ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        <span>Tambah</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedBranchId && !loadingBranches && branches.length === 0 && (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <Building2 size={40} className="mx-auto opacity-30" />
            <p className="text-sm font-medium">Tidak ada cabang tersedia. Tambahkan cabang terlebih dahulu.</p>
          </div>
        )}
      </div>
    </main>
  )
}

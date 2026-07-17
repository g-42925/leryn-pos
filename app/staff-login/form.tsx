"use client"

import useGlobalStore from "@/store/global"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { staffLoginAction, getStaffListAction, getBranchesForAccountAction, StaffLoginResponse, } from "@/app/actions/staff-login"
import { ChevronDown, Delete, User, Briefcase, ArrowLeft, Store } from "lucide-react"

interface StaffEntry { _id: string; name: string; role: string }
interface BranchEntry { _id: string; name: string }

type Step = "branch" | "staff" | "pin"

function StaffLoginForm() {
  const router = useRouter()
  const accountId = useGlobalStore((s) => s.accountId)

  const [step, setStep] = useState<Step>("branch")
  const [branchList, setBranchList] = useState<BranchEntry[]>([])
  const [selectedBranch, setSelectedBranch] = useState<BranchEntry | null>(null)
  const [staffList, setStaffList] = useState<StaffEntry[]>([])
  const [selectedStaff, setSelectedStaff] = useState<StaffEntry | null>(null)
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch branches automatically upon load
  useEffect(() => {
    if (!mounted) return
    if (!accountId) {
      setError("Data sesi tidak ditemukan, silakan login ulang dari dashboard admin.")
      setIsLoadingBranches(false)
      return
    }

    setIsLoadingBranches(true)
    getBranchesForAccountAction(accountId).then((res) => {
      if (res.success) {
        setBranchList(res.data as BranchEntry[])
      }
      else {
        setError(res.message ?? "Gagal memuat daftar branch.")
      }
      setIsLoadingBranches(false)
    })
  }, [accountId, mounted])

  function handleBranchSelect(branch: BranchEntry) {
    setSelectedBranch(branch)
    setError("")
    setStaffList([])
    setStep("staff")
    getStaffListAction(accountId, branch._id).then((res) => {
      if (res.success) {
        setStaffList(res.data as StaffEntry[])
      } else {
        setError(res.message ?? "Gagal memuat daftar staff.")
      }
    })
  }

  function handleStaffSelect(staff: StaffEntry) {
    setSelectedStaff(staff)
    setPin("")
    setError("")
    setStep("pin")
  }

  function handleNumpad(value: string) {
    if (pin.length < 6) setPin((p) => p + value)
  }

  function handleBackspace() {
    setPin((p) => p.slice(0, -1))
  }

  async function handleSubmit() {
    if (!selectedStaff) return
    if (pin.length < 4) {
      setError("PIN minimal 4 digit.")
      return
    }
    setError("")

    const formData = new FormData()
    formData.append("staffId", selectedStaff._id)
    formData.append("pin", pin)

    startTransition(async () => {
      const result = await staffLoginAction<StaffLoginResponse>(
        { success: false, message: "" },
        formData
      )
      if (result.success && result.result) {
        router.push("/staff-dashboard")
      } else {
        setError(result.message)
        setPin("")
      }
    })
  }

  const numpadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"]

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (pin.length === 6 && step === "pin") {
      handleSubmit()
    }
  }, [pin, step])

  // Keyboard support for PIN entry
  useEffect(() => {
    if (step !== "pin") return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is holding modifiers or we're somehow suspended
      if (e.ctrlKey || e.altKey || e.metaKey) return

      if (/^[0-9]$/.test(e.key)) {
        setPin((p) => (p.length < 6 ? p + e.key : p))
      } else if (e.key === "Backspace") {
        setPin((p) => p.slice(0, -1))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (pin.length >= 4 && !isPending) {
          handleSubmit()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [step, pin, isPending, selectedStaff])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl mb-4 ring-1 ring-white/20 shadow-2xl">
            <User size={38} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {step === "branch" && "Pilih Branch"}
            {step === "staff" && "Pilih Staff"}
            {step === "pin" && "Masukkan PIN"}
          </h1>
          <p className="text-teal-200 mt-1 text-sm">
            {step === "branch" && "Silakan pilih branch Anda bertugas"}
            {step === "staff" && "Silakan pilih nama Anda"}
            {step === "pin" && `Halo, ${selectedStaff?.name}!`}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-5">
          {(["branch", "staff", "pin"] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`rounded-full transition-all ${s === step
                ? "w-8 h-2 bg-teal-300"
                : i < ["branch", "staff", "pin"].indexOf(step)
                  ? "w-2 h-2 bg-teal-400/70"
                  : "w-2 h-2 bg-white/20"
                }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-white/20 p-5 space-y-4">

          {/* ── STEP: BRANCH ── */}
          {step === "branch" && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {isLoadingBranches ? (
                <div className="text-center text-teal-300 py-8 text-sm">
                  Memuat daftar branch...
                </div>
              ) : branchList.length === 0 ? (
                <div className="text-center text-teal-300 py-8 text-sm">
                  {error ? "Terjadi kesalahan memuat branch." : "Tidak ada data branch."}
                </div>
              ) : (
                branchList.map((b) => (
                  <button
                    key={b._id}
                    id={`branch-${b._id}`}
                    type="button"
                    onClick={() => handleBranchSelect(b)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 ring-1 ring-white/15 transition-all text-left group active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-400/20 flex items-center justify-center shrink-0 group-hover:bg-teal-400/30 transition-colors">
                      <Store size={18} className="text-teal-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{b.name}</div>
                    </div>
                    <ChevronDown size={16} className="ml-auto text-teal-400 -rotate-90" />
                  </button>
                ))
              )}
            </div>
          )}

          {/* ── STEP: STAFF ── */}
          {step === "staff" && (
            <>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {staffList.length === 0 ? (
                  <div className="text-center text-teal-300 py-8 text-sm">
                    {error ? "Terjadi kesalahan memuat staff." : "Memuat daftar staff..."}
                  </div>
                ) : (
                  staffList.map((s) => (
                    <button
                      key={s._id}
                      id={`staff-${s._id}`}
                      type="button"
                      onClick={() => handleStaffSelect(s)}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 ring-1 ring-white/15 transition-all text-left group active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 rounded-full bg-teal-400/20 flex items-center justify-center shrink-0 group-hover:bg-teal-400/30 transition-colors">
                        <User size={18} className="text-teal-300" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{s.name}</div>
                        <div className="text-teal-400 text-xs capitalize">{s.role}</div>
                      </div>
                      <ChevronDown size={16} className="ml-auto text-teal-400 -rotate-90" />
                    </button>
                  ))
                )}
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => { setStep("branch"); setStaffList([]); setError("") }}
                  className="flex items-center gap-1 text-teal-300 hover:text-white text-sm transition-colors"
                >
                  <ArrowLeft size={14} /> Ganti Branch
                </button>
              </div>
            </>
          )}

          {/* ── STEP: PIN ── */}
          {step === "pin" && (
            <>
              {/* PIN dots */}
              <div className="flex justify-center gap-3 py-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${i < pin.length
                      ? "bg-teal-400 border-teal-400 shadow-lg shadow-teal-400/50 scale-110"
                      : "border-white/30 bg-white/5"
                      }`}
                  >
                    {i < pin.length && <div className="w-3 h-3 rounded-full bg-white" />}
                  </div>
                ))}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2">
                {numpadKeys.map((key, idx) =>
                  key === "" ? (
                    <div key={idx} />
                  ) : key === "⌫" ? (
                    <button
                      key={idx}
                      type="button"
                      onClick={handleBackspace}
                      className="h-14 rounded-2xl bg-white/10 hover:bg-red-500/30 text-white font-bold text-lg flex items-center justify-center ring-1 ring-white/10 transition-all active:scale-95"
                    >
                      <Delete size={20} />
                    </button>
                  ) : (
                    <button
                      key={idx}
                      type="button"
                      id={`numpad-${key}`}
                      onClick={() => handleNumpad(key)}
                      className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xl ring-1 ring-white/10 transition-all active:scale-95"
                    >
                      {key}
                    </button>
                  )
                )}
              </div>

              {/* Submit button */}
              <button
                type="button"
                id="staff-login-submit"
                onClick={handleSubmit}
                disabled={isPending || pin.length < 4}
                className="w-full py-4 rounded-2xl bg-teal-400 hover:bg-teal-300 text-teal-900 font-extrabold text-sm transition-all shadow-xl shadow-teal-400/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-teal-900/30 border-t-teal-900 rounded-full animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <Briefcase size={16} />
                    Masuk ke Dashboard
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep("staff"); setPin(""); setError("") }}
                className="flex items-center gap-1 text-teal-300 hover:text-white text-sm transition-colors"
              >
                <ArrowLeft size={14} /> Ganti Staff
              </button>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 text-red-200 text-sm text-center rounded-xl py-2.5 px-4 ring-1 ring-red-400/30">
              {error}
            </div>
          )}

          {/* Back to home */}
          <div className="text-center pt-1">
            <a
              href="/home"
              className="text-teal-400 hover:text-white text-xs font-medium transition-colors"
            >
              ← Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export { StaffLoginForm }

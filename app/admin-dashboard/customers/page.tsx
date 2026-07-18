"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { UserCircle, Plus, Loader2, RefreshCw, Mail, Phone, MapPin } from "lucide-react"
import useGlobalState from "@/store/global"
import { getCustomersAction, addCustomerAction } from "@/app/actions/manage-customer"

export default function CustomerManagementPage() {
  const { accountId, hasHydrated } = useGlobalState()

  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const loadData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const customersResult = await getCustomersAction(accountId)
      if (customersResult.success) {
        setCustomers(customersResult.data || [])
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
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setError("Semua field wajib diisi!")
      setSuccessMsg("")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccessMsg("")

    const result = await addCustomerAction(accountId, name, email, phone, address)
    if (result.success) {
      setName("")
      setEmail("")
      setPhone("")
      setAddress("")
      setSuccessMsg("Customer berhasil ditambahkan!")
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
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin-dashboard" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                &larr; Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Customer Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola data customer, kontak, dan informasi lainnya.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-lime-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform rotate-3">
            <UserCircle size={28} />
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Tambah Customer Baru</h2>
          {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">{error}</div>}
          {successMsg && <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium border border-emerald-200 dark:border-emerald-800">{successMsg}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-lime-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Utama</label>
                <input
                  type="email"
                  placeholder="Contoh: john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-lime-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">No. Telepon</label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-lime-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alamat Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Sudirman No 10"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-lime-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-lime-600 hover:bg-lime-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>Simpan Customer</span>
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daftar Customer</h2>
            <button onClick={loadData} className="text-lime-600 hover:text-lime-700 flex items-center gap-1 text-sm font-medium transition-colors">
              <RefreshCw size={16} /> <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {customers.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Belum ada data customer.
              </div>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer._id}
                  className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:border-lime-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-lime-500 to-transparent opacity-5 group-hover:opacity-10 rounded-bl-full transition-opacity" />

                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 bg-lime-100 dark:bg-lime-900/50 text-lime-600 dark:text-lime-400 rounded-full flex items-center justify-center shrink-0">
                      <UserCircle size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{customer.name}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <Mail size={14} className="shrink-0" />
                        <span className="truncate max-w-[200px]">{customer.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Phone size={16} className="mt-0.5 text-slate-400 shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <MapPin size={16} className="mt-0.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-2">{customer.address}</span>
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

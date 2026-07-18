"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, Plus, Loader2, RefreshCw, KeyRound, Trash2 } from "lucide-react"
import useGlobalState from "@/store/global"
import { getRolesAction, addRoleAction, deleteRoleAction } from "@/app/actions/manage-role"
import { getPermissionsAction } from "@/app/actions/manage-permission"

export default function ManageRolePage() {
  const { accountId, hasHydrated } = useGlobalState()
  
  const [roles, setRoles] = useState<Record<string, unknown>[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [name, setName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const loadData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const [roleRes, permRes] = await Promise.all([
        getRolesAction(accountId),
        getPermissionsAction(accountId)
      ])
      
      if (permRes.success) {
        setAvailablePermissions(permRes.data || [])
      } else {
        console.error(permRes.message)
      }

      if (roleRes.success) {
        setRoles(roleRes.data || [])
      } else {
        console.error(roleRes.message)
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

  const handleTogglePermission = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Nama Role wajib diisi!")
      return
    }
    if (selectedPermissions.length === 0) {
      setError("Pilih setidaknya satu hak akses!")
      return
    }
    
    setSubmitting(true)
    setError("")
    setSuccessMsg("")
    
    const result = await addRoleAction(accountId, name, selectedPermissions)
    if (result.success) {
      setName("")
      setSelectedPermissions([])
      setSuccessMsg("Role berhasil ditambahkan!")
      setTimeout(() => setSuccessMsg(""), 3000)
      loadData()
    } else {
      setError(result.message)
    }
    setSubmitting(false)
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Role ini?")) return
    
    setDeleting(roleId)
    const result = await deleteRoleAction(roleId, accountId)
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
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin-dashboard" className="text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors">
                &larr; Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Manage Role</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola posisi dan hak akses sistem keamanan restoran Anda.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform rotate-3">
            <Shield size={28} />
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Tambah Role Baru</h2>
          {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">{error}</div>}
          {successMsg && <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800">{successMsg}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Posisi / Role</label>
              <input 
                type="text" 
                placeholder="Contoh: Manajer Operasional" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                required
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hak Akses (Permissions)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {availablePermissions.length === 0 ? (
                  <p className="text-sm text-slate-500 col-span-full">Belum ada permission terdaftar. <Link href="/admin-dashboard/manage-permission" className="text-amber-600 hover:underline">Tambah permission baru.</Link></p>
                ) : availablePermissions.map(permission => (
                  <label 
                    key={permission._id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPermissions.includes(permission._id) 
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10" 
                        : "border-slate-200 dark:border-slate-800 hover:border-amber-300"
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded border-slate-300"
                      checked={selectedPermissions.includes(permission._id)}
                      onChange={() => handleTogglePermission(permission._id)}
                    />
                    <span className="text-sm font-medium select-none">{permission.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={submitting || availablePermissions.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>Tambah Role</span>
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daftar Role Aktif</h2>
            <button onClick={loadData} className="text-amber-600 hover:text-amber-700 flex items-center gap-1 text-sm font-medium transition-colors">
              <RefreshCw size={16} /> <span>Refresh</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Belum ada role yang terdaftar. Silakan tambahkan role baru.
              </div>
            ) : (
              roles.map((role) => (
                <div 
                  key={role._id} 
                  className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:border-amber-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500 to-yellow-500 opacity-10 group-hover:opacity-20 rounded-bl-full transition-opacity" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shadow-inner">
                      <KeyRound size={24} />
                    </div>
                    <button 
                      onClick={() => handleDelete(role._id)}
                      disabled={deleting === role._id}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      title="Hapus Role"
                    >
                      {deleting === role._id ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 size={18} />}
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white capitalize">{role.name}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {role.permissions.length} Hak Akses Diberikan
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                    {role.permissions.slice(0, 3).map((perm: string) => {
                      const label = availablePermissions.find(p => p._id === perm)?.name || perm
                      return (
                        <div key={perm} className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                          {label}
                        </div>
                      )
                    })}
                    {role.permissions.length > 3 && (
                      <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                        +{role.permissions.length - 3} lainnya
                      </div>
                    )}
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
